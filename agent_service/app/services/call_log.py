"""全量调用日志（任务收尾 / 技改 §4.3.1）：把每次生成的完整过程脱敏后按 traceId 落盘。

记录内容：每次模型调用的**完整 prompt（messages）**、模型**原始输出**、该轮**校验错误**、
延迟、token，加上整体的重试次数、最终状态/错误码、被清理的孤儿 key。按天写成一行一条的
JSONL（``generation-YYYYMMDD.jsonl``），可按 traceId 还原任意一次请求（技改 §4.2.2-3）。

**脱敏**：落盘前对所有自由文本跑 ``redact``，抹掉形如 ``sk-...`` 的密钥串与配置里的真实
网关密钥——prompt/输出本不该含密钥，这里是兜底防线。日志写失败只告警、绝不影响生成。
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.config import get_settings

logger = logging.getLogger(__name__)

# 形如 sk-xxxx 的密钥串（OpenAI/dashscope 等常见前缀），落盘前一律抹掉
_SECRET_RE = re.compile(r"sk-[A-Za-z0-9._\-]{6,}")
_REDACTED = "***REDACTED***"


def redact(text: str | None, secrets: tuple[str, ...] = ()) -> str:
    """抹掉文本中的密钥：通用 ``sk-...`` 串 + 调用方显式给出的真实密钥。

    Args:
        text: 待脱敏文本；``None`` 原样返回空串。
        secrets: 需精确替换掉的敏感串（如配置里的真实 api_key），空串会被跳过。

    Returns:
        脱敏后的文本（命中处替换为 ``***REDACTED***``）。
    """
    if not text:
        return ""
    out = _SECRET_RE.sub(_REDACTED, text)
    for s in secrets:
        if s:
            out = out.replace(s, _REDACTED)
    return out


@dataclass
class AttemptLog:
    """单次模型调用的记录。

    Attributes:
        attempt: 第几次调用（从 1 起）。
        latency_s: 本次调用耗时（秒）；网关报错时为 0。
        prompt_tokens / completion_tokens: token 用量；缺省 None。
        messages: 本次发送的完整消息列表（落盘时逐条脱敏）。
        raw_output: 模型原始输出文本（落盘时脱敏）；网关报错时为空。
        errors: 本轮两层校验的错误（通过则空；网关报错时记错误描述）。
    """

    attempt: int
    latency_s: float
    prompt_tokens: int | None
    completion_tokens: int | None
    messages: list[dict[str, str]]
    raw_output: str
    errors: list[str]


@dataclass
class GenerationLog:
    """一次生成请求的全量记录（贯穿首次调用与自愈重试）。

    Attributes:
        trace_id: 追踪 id，与服务日志关联。
        user_prompt: 用户描述原文。
        asset_count: 素材清单条数。
        started_at: 起始时间（ISO8601 UTC）。
        model: 实际应答模型名。
        status: ``success`` 或 ``failed``。
        error_code: 失败时的错误码。
        pruned_keys: 成功时被清理的孤儿 data key。
        attempts_detail: 各次调用明细。
    """

    trace_id: str
    user_prompt: str
    asset_count: int
    started_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    model: str = ""
    status: str = "failed"
    error_code: str | None = None
    pruned_keys: list[str] = field(default_factory=list)
    attempts_detail: list[AttemptLog] = field(default_factory=list)

    def add_attempt(
        self,
        *,
        attempt: int,
        messages: list[dict[str, str]],
        raw_output: str,
        latency_s: float,
        prompt_tokens: int | None,
        completion_tokens: int | None,
        errors: list[str],
    ) -> None:
        """追加一条调用明细（messages 做浅拷贝快照，避免后续重试改动它）。

        Args:
            attempt: 第几次调用（从 1 起）。
            messages: 本次发送的消息列表。
            raw_output: 模型原始输出（网关报错传空串）。
            latency_s: 本次耗时秒。
            prompt_tokens / completion_tokens: token 用量。
            errors: 本轮校验错误或网关错误描述。
        """
        self.attempts_detail.append(
            AttemptLog(
                attempt=attempt,
                latency_s=latency_s,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                messages=[dict(m) for m in messages],
                raw_output=raw_output,
                errors=list(errors),
            )
        )


def serialize_log(log: GenerationLog, secrets: tuple[str, ...] = ()) -> dict[str, Any]:
    """把 ``GenerationLog`` 转成**脱敏后**的可 JSON 序列化字典（纯函数，便于单测）。

    大致逻辑：对 user_prompt、每条 message 的 content、raw_output、errors 逐一 ``redact``；
    汇总 token；attempts 由明细条数推出。

    Args:
        log: 待序列化的生成记录。
        secrets: 需精确抹掉的敏感串（如真实 api_key）。

    Returns:
        脱敏后的字典，含 ``trace_id`` / ``status`` / ``attempts`` / ``attempts_detail`` 等。
    """
    def rd(t: str) -> str:
        return redact(t, secrets)

    return {
        "trace_id": log.trace_id,
        "started_at": log.started_at,
        "status": log.status,
        "error_code": log.error_code,
        "model": log.model,
        "attempts": len(log.attempts_detail),
        "asset_count": log.asset_count,
        "user_prompt": rd(log.user_prompt),
        "pruned_keys": log.pruned_keys,
        "total_prompt_tokens": sum(a.prompt_tokens or 0 for a in log.attempts_detail) or None,
        "total_completion_tokens": sum(a.completion_tokens or 0 for a in log.attempts_detail) or None,
        "attempts_detail": [
            {
                "attempt": a.attempt,
                "latency_s": round(a.latency_s, 3),
                "prompt_tokens": a.prompt_tokens,
                "completion_tokens": a.completion_tokens,
                "messages": [{"role": m.get("role", ""), "content": rd(m.get("content", ""))} for m in a.messages],
                "raw_output": rd(a.raw_output),
                "errors": [rd(e) for e in a.errors],
            }
            for a in log.attempts_detail
        ],
    }


def write_generation_log(
    log: GenerationLog, *, log_dir: str | None = None, enabled: bool | None = None
) -> Path | None:
    """把一次生成记录脱敏后追加到当天的 JSONL 文件。

    大致逻辑：读配置决定是否启用与落盘目录（参数可覆盖，便于测试）→ 建目录 → 用配置里的
    真实 api_key 作脱敏密钥 → 追加一行 JSON。**任何 IO 异常只告警、返回 None,绝不让日志
    失败拖垮生成**。

    Args:
        log: 生成记录。
        log_dir: 落盘目录；None 时取配置 ``call_log_dir``。
        enabled: 是否启用；None 时取配置 ``call_log_enabled``。

    Returns:
        写入的文件路径；未启用或写失败时返回 None。
    """
    settings = get_settings()
    if enabled is None:
        enabled = settings.call_log_enabled
    if not enabled:
        return None
    directory = Path(log_dir if log_dir is not None else settings.call_log_dir)
    try:
        directory.mkdir(parents=True, exist_ok=True)
        path = directory / f"generation-{datetime.now(timezone.utc):%Y%m%d}.jsonl"
        record = serialize_log(log, secrets=(settings.llm_api_key,))
        with path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
        return path
    except OSError as exc:
        logger.warning("写调用日志失败(忽略): %s", exc)
        return None


__all__ = ["redact", "AttemptLog", "GenerationLog", "serialize_log", "write_generation_log"]
