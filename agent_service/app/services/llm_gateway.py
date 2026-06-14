"""LLM 网关薄抽象（任务 1.4 / 决议 §5）：统一的 ``complete`` 接口，换模型只改配置。

把「调一次模型」收敛成单一方法 ``LLMGateway.complete(messages, json_mode?)``，底层走
OpenAI 兼容的 ``/chat/completions``。模型名、网关地址、密钥、温度、超时全部取自
``Settings``（环境变量驱动），**换模型/换网关不改业务代码**（设计文档 §8 薄 Gateway 抽象）。

为便于单测，网关只依赖一个注入的 ``httpx.Client``：测试用 ``httpx.MockTransport`` 即可
脱离真实网络；生成服务依赖 ``SupportsComplete`` 协议，也可直接注入假网关。同步实现——
单次生成本就是「调用→校验→可能重试」的串行流程，FastAPI 端点（1.6）以同步路由或线程池
承接即可，无需引入异步与额外测试依赖。
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Protocol

import httpx

from app.config import Settings, get_settings

logger = logging.getLogger(__name__)


class LLMError(Exception):
    """LLM 网关调用失败的基类异常（区分超时与其他错误，便于上层映射错误码）。"""


class LLMTimeoutError(LLMError):
    """模型调用超时（映射到 ``ErrorCode.MODEL_TIMEOUT``）。"""


class LLMGatewayError(LLMError):
    """网关/模型返回异常（连接失败、非 2xx、响应体不可解析等，映射到 ``MODEL_ERROR``）。"""


@dataclass(frozen=True)
class LLMResponse:
    """一次模型调用的结果。

    Attributes:
        content: 模型输出的文本（即 ``choices[0].message.content``）。
        model: 实际应答的模型名。
        latency_s: 本次调用耗时（秒），供延迟监控（验收 §4.3.2 第 3 条）。
        prompt_tokens: 提示词 token 数；网关未返回 usage 时为 ``None``。
        completion_tokens: 生成 token 数；同上。
    """

    content: str
    model: str
    latency_s: float
    prompt_tokens: int | None = None
    completion_tokens: int | None = None


class SupportsComplete(Protocol):
    """「能调一次模型」的最小协议，供生成服务依赖（真网关与测试假网关都满足）。"""

    def complete(
        self, messages: list[dict[str, str]], *, json_mode: bool | None = None
    ) -> LLMResponse:
        """对一组对话消息发起补全。详见 ``LLMGateway.complete``。"""
        ...


class LLMGateway:
    """OpenAI 兼容网关的同步薄封装。

    大致逻辑：构造时从 ``Settings`` 取地址/密钥/模型/温度/超时，复用一个 ``httpx.Client``；
    ``complete`` 拼请求体 POST ``/chat/completions``，按超时与状态码分类抛 ``LLMTimeoutError``
    / ``LLMGatewayError``，成功则解析出文本与 usage 封成 ``LLMResponse``。

    Args:
        settings: 运行期配置；缺省取全局 ``get_settings()``。
        client: 注入的 httpx 客户端（测试可传 ``httpx.Client(transport=MockTransport(...))``）；
            缺省按 ``settings`` 自建（base_url、超时、Bearer 鉴权头）。
    """

    def __init__(self, settings: Settings | None = None, client: httpx.Client | None = None) -> None:
        self._settings = settings or get_settings()
        self._client = client or httpx.Client(
            base_url=self._settings.llm_base_url.rstrip("/"),
            timeout=self._settings.llm_timeout_s,
            headers={"Authorization": f"Bearer {self._settings.llm_api_key}"},
        )

    def complete(
        self, messages: list[dict[str, str]], *, json_mode: bool | None = None
    ) -> LLMResponse:
        """对一组对话消息发起一次补全调用。

        大致逻辑：组装 ``{model, messages, temperature[, response_format]}`` 请求体
        （``json_mode`` 缺省取配置 ``llm_json_mode``，开启时附 ``response_format=json_object``）
        → POST ``/chat/completions`` 计时 → 超时抛 ``LLMTimeoutError``、网络/非 2xx/解析失败抛
        ``LLMGatewayError`` → 取 ``choices[0].message.content`` 与 ``usage`` 封 ``LLMResponse``。

        Args:
            messages: OpenAI Chat 消息列表 ``[{"role", "content"}, ...]``。
            json_mode: 是否要求网关 JSON 模式；``None`` 时取配置项 ``llm_json_mode``。

        Returns:
            ``LLMResponse``：含模型文本、耗时与 token 用量。

        Raises:
            LLMTimeoutError: 调用超时。
            LLMGatewayError: 连接失败、非 2xx、响应体缺字段或不可解析。
        """
        use_json = self._settings.llm_json_mode if json_mode is None else json_mode
        payload: dict = {
            "model": self._settings.llm_model,
            "messages": messages,
            "temperature": self._settings.llm_temperature,
        }
        if use_json:
            payload["response_format"] = {"type": "json_object"}

        started = time.perf_counter()
        try:
            resp = self._client.post("/chat/completions", json=payload)
            resp.raise_for_status()
        except httpx.TimeoutException as exc:
            raise LLMTimeoutError(f"模型调用超时（>{self._settings.llm_timeout_s}s）") from exc
        except httpx.HTTPStatusError as exc:
            raise LLMGatewayError(
                f"网关返回 {exc.response.status_code}: {exc.response.text[:200]}"
            ) from exc
        except httpx.HTTPError as exc:
            raise LLMGatewayError(f"网关请求失败: {exc}") from exc

        latency_s = time.perf_counter() - started
        try:
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            raise LLMGatewayError(f"网关响应体无法解析: {exc}") from exc

        usage = data.get("usage") or {}
        return LLMResponse(
            content=content,
            model=data.get("model", self._settings.llm_model),
            latency_s=latency_s,
            prompt_tokens=usage.get("prompt_tokens"),
            completion_tokens=usage.get("completion_tokens"),
        )

    def close(self) -> None:
        """关闭内部 httpx 客户端，释放连接（进程退出或测试收尾时调用）。"""
        self._client.close()


__all__ = [
    "LLMGateway",
    "LLMResponse",
    "SupportsComplete",
    "LLMError",
    "LLMTimeoutError",
    "LLMGatewayError",
]
