"""页面 JSON 生成服务（任务 1.4 / 技改 F3）：组装→调模型→两层校验→自愈重试。

核心是 ``generate_page_json``：把 1.3 的 Prompt 喂给 LLM 网关，解析输出后过 1.1/1.2 两层
校验；不合格就把**具体错误回灌**给模型要求修正，最多重试 1 次（共 2 次调用，决议 §5）；
仍不合格则抛 ``AppError(GENERATION_FAILED)``，**绝不返回未通过校验的半成品**（技改 §4.3.2
第 4 条）。网关错误按超时/其他映射为 ``MODEL_TIMEOUT`` / ``MODEL_ERROR``。

全程按 traceId 记录调用元数据（延迟、token、重试次数、校验错误），供服务层落盘排查
（技改 §4.3.1 全量调用日志；脱敏落盘的落地在 API 层）。生成服务依赖 ``SupportsComplete``
协议而非具体网关，单测可注入假网关、不触真实网络。
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from uuid import uuid4

from app.catalog import check_integrity, prune_orphan_data_keys, validate_page
from app.config import get_settings
from app.errors import AppError, ErrorCode
from app.services.call_log import GenerationLog, write_generation_log
from app.services.llm_gateway import LLMGateway, LLMTimeoutError, LLMError, SupportsComplete
from app.services.manifest import validate_manifest
from app.services.prompt_builder import build_fix_feedback, build_messages

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class GenerationResult:
    """一次成功生成的结果。

    Attributes:
        page_json: 通过两层校验、已清理孤儿 data key 的最终页面 JSON。
        attempts: 实际调用模型次数（1 表示首次即过，2 表示自愈重试 1 次后过）。
        trace_id: 本次生成的追踪 id，与日志关联。
        pruned_keys: 被自动清理的孤儿 data key 路径列表（无则为空）。
        model: 实际应答的模型名。
        prompt_tokens: 成功那次调用的提示词 token 数（网关未给则 None）。
        completion_tokens: 成功那次调用的生成 token 数（同上）。
    """

    page_json: dict
    attempts: int
    trace_id: str
    pruned_keys: list[str] = field(default_factory=list)
    model: str = ""
    prompt_tokens: int | None = None
    completion_tokens: int | None = None


def _parse_page_json(raw: str) -> dict:
    """把模型原始输出解析为页面 JSON dict（容忍 Markdown 代码块包裹）。

    大致逻辑：去首尾空白 → 若被 ```/```json 围栏包住则剥掉围栏 → ``json.loads``。
    Prompt 已要求只输出裸 JSON，这里对偶发的围栏做兜底，避免因包裹直接判失败。

    Args:
        raw: 模型返回的文本。

    Returns:
        解析后的页面 JSON dict。

    Raises:
        ValueError: 文本不是合法 JSON、或顶层不是对象时抛出（作为可回灌的校验失败原因）。
    """
    text = raw.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lstrip().lower().startswith("json"):
            text = text.lstrip()[4:]
        text = text.strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"输出不是合法 JSON：{exc}") from exc
    if not isinstance(data, dict):
        raise ValueError("输出 JSON 顶层必须是对象（含 components 与 data）")
    return data


def _validate_page(page: dict, asset_manifest: list[dict]):
    """对页面跑两层校验，合并错误并返回 ``(errors, report)``。

    大致逻辑：先第一层 JSON Schema（``validate_page``）、再第二层引用完整性
    （``check_integrity``，以 ``asset_manifest`` 为 URL 白名单），把两层硬失败合到一张
    错误列表里，便于一次性回灌模型。

    Args:
        page: 已解析的页面 JSON。
        asset_manifest: 素材清单（URL 白名单来源）。

    Returns:
        ``(errors, report)``：``errors`` 为合并后的硬失败列表（空=通过）；``report`` 为
        第二层 ``IntegrityReport``（含待清理的孤儿 data key）。
    """
    errors = list(validate_page(page))
    report = check_integrity(page, asset_manifest)
    errors.extend(report.errors)
    return errors, report


def generate_page_json(
    user_prompt: str,
    asset_manifest: list[dict],
    *,
    gateway: SupportsComplete | None = None,
    trace_id: str | None = None,
    max_retries: int | None = None,
) -> GenerationResult:
    """据用户描述与素材清单生成合法的页面 JSON（带自愈重试）。

    大致逻辑：
        0. 先校验素材清单（F1）；不合格直接抛 ``INVALID_MANIFEST``，不调用模型；
        1. 用 ``build_messages`` 拼 system+user 消息；
        2. 循环最多 ``max_retries+1`` 次：调网关 → 解析 → 两层校验；
        3. 通过则清理孤儿 data key、记日志、返回 ``GenerationResult``；
        4. 未过且还有重试机会 → 追加「上次输出 + 错误清单」回灌，要求模型修正后重来；
        5. 重试耗尽仍未过 → 抛 ``AppError(GENERATION_FAILED)``，带最后一轮错误明细。
    网关超时/其他错误分别映射为 ``MODEL_TIMEOUT`` / ``MODEL_ERROR``。

    Args:
        user_prompt: 用户的页面需求描述（自然语言）。
        asset_manifest: 素材清单 ``[{"url", "name"?, "note"?, ...}]``，既注入 Prompt 也作
            第二层 URL 白名单。本函数假定其已通过 F1（1.5）基本校验。
        gateway: 实现 ``SupportsComplete`` 的 LLM 网关；缺省按配置新建 ``LLMGateway``。
        trace_id: 追踪 id；缺省自动生成（uuid hex）。
        max_retries: 自愈重试次数；缺省取配置 ``llm_max_retries``（决议 §5 默认 1）。

    Returns:
        ``GenerationResult``：含最终页面 JSON、实际调用次数、被清理的孤儿 key 与 token 用量。

    Raises:
        AppError: ``INVALID_MANIFEST``（素材清单非法，调用模型前即拒绝）/
            ``MODEL_TIMEOUT``（超时）/ ``MODEL_ERROR``（网关异常）/
            ``GENERATION_FAILED``（重试耗尽仍未过两层校验）。

    Example:
        >>> result = generate_page_json("做个新春活动页", manifest, gateway=fake)
        >>> result.page_json["components"][0]["component"]
        'Page'
    """
    # F1（1.5）：调用模型前先校验素材清单；不合法直接抛 INVALID_MANIFEST，不耗模型调用
    validate_manifest(asset_manifest)

    settings = get_settings()
    gateway = gateway or LLMGateway(settings)
    trace_id = trace_id or uuid4().hex
    retries = settings.llm_max_retries if max_retries is None else max_retries

    messages = build_messages(user_prompt, asset_manifest)
    last_errors: list[str] = []
    # 全量调用日志：贯穿首次调用与重试逐条累积，finally 里统一脱敏落盘一次
    call_log = GenerationLog(
        trace_id=trace_id, user_prompt=user_prompt, asset_count=len(asset_manifest)
    )

    try:
        for attempt in range(retries + 1):
            try:
                resp = gateway.complete(messages)
            except LLMTimeoutError as exc:
                logger.warning("generate trace=%s attempt=%d 模型超时", trace_id, attempt + 1)
                call_log.error_code = ErrorCode.MODEL_TIMEOUT.value
                call_log.add_attempt(
                    attempt=attempt + 1, messages=messages, raw_output="", latency_s=0.0,
                    prompt_tokens=None, completion_tokens=None, errors=[f"模型超时: {exc}"],
                )
                raise AppError(ErrorCode.MODEL_TIMEOUT, str(exc)) from exc
            except LLMError as exc:
                logger.warning("generate trace=%s attempt=%d 网关错误: %s", trace_id, attempt + 1, exc)
                call_log.error_code = ErrorCode.MODEL_ERROR.value
                call_log.add_attempt(
                    attempt=attempt + 1, messages=messages, raw_output="", latency_s=0.0,
                    prompt_tokens=None, completion_tokens=None, errors=[f"网关错误: {exc}"],
                )
                raise AppError(ErrorCode.MODEL_ERROR, str(exc)) from exc

            logger.info(
                "generate trace=%s attempt=%d latency=%.2fs tokens=%s/%s",
                trace_id, attempt + 1, resp.latency_s, resp.prompt_tokens, resp.completion_tokens,
            )

            try:
                page = _parse_page_json(resp.content)
                errors, report = _validate_page(page, asset_manifest)
            except ValueError as exc:
                errors, report, page = [str(exc)], None, None

            call_log.model = resp.model
            call_log.add_attempt(
                attempt=attempt + 1, messages=messages, raw_output=resp.content,
                latency_s=resp.latency_s, prompt_tokens=resp.prompt_tokens,
                completion_tokens=resp.completion_tokens, errors=errors,
            )

            if not errors:
                pruned = prune_orphan_data_keys(page, report.orphan_data_keys)
                if pruned:
                    logger.info("generate trace=%s 清理孤儿 data key: %s", trace_id, pruned)
                logger.info("generate trace=%s 成功 attempts=%d", trace_id, attempt + 1)
                call_log.status = "success"
                call_log.pruned_keys = pruned
                return GenerationResult(
                    page_json=page,
                    attempts=attempt + 1,
                    trace_id=trace_id,
                    pruned_keys=pruned,
                    model=resp.model,
                    prompt_tokens=resp.prompt_tokens,
                    completion_tokens=resp.completion_tokens,
                )

            last_errors = errors
            logger.warning(
                "generate trace=%s attempt=%d 校验未过(%d 条): %s",
                trace_id, attempt + 1, len(errors), "; ".join(errors[:5]),
            )
            if attempt < retries:
                messages = messages + [
                    {"role": "assistant", "content": resp.content},
                    {"role": "user", "content": build_fix_feedback(errors)},
                ]

        call_log.error_code = ErrorCode.GENERATION_FAILED.value
        raise AppError(
            ErrorCode.GENERATION_FAILED,
            "生成的页面 JSON 多次未通过校验，请调整描述或重试。",
            details={"errors": last_errors, "trace_id": trace_id, "attempts": retries + 1},
        )
    finally:
        write_generation_log(call_log)


__all__ = ["generate_page_json", "GenerationResult"]
