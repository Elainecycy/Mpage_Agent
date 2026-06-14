"""LLM 网关薄抽象单测（任务 1.4）。

用 httpx.MockTransport 模拟 OpenAI 兼容网关，脱离真实网络验证：正常解析、JSON mode
请求体、超时与网关错误的异常映射。
"""

import httpx
import pytest

from app.config import Settings
from app.services.llm_gateway import (
    LLMGateway,
    LLMGatewayError,
    LLMTimeoutError,
)

_CHAT_OK = {
    "model": "qwen-plus",
    "choices": [{"message": {"role": "assistant", "content": "hello"}}],
    "usage": {"prompt_tokens": 11, "completion_tokens": 22},
}


def _settings() -> Settings:
    """构造一份不读 .env 的纯默认配置，保证测试可复现。

    Returns:
        使用代码内默认值的 ``Settings``（qwen-plus、温度 0.2、json_mode 关）。
    """
    return Settings(_env_file=None)


def _gateway(handler) -> LLMGateway:
    """用给定 MockTransport 处理函数装配一个网关。

    Args:
        handler: 形如 ``(httpx.Request) -> httpx.Response`` 的处理函数，可抛异常模拟故障。

    Returns:
        注入了 Mock 客户端的 ``LLMGateway``。
    """
    client = httpx.Client(transport=httpx.MockTransport(handler), base_url="http://test")
    return LLMGateway(settings=_settings(), client=client)


def test_complete_parses_content_and_usage() -> None:
    """正常应答时正确取出文本、模型名与 token 用量。"""
    gw = _gateway(lambda req: httpx.Response(200, json=_CHAT_OK))
    resp = gw.complete([{"role": "user", "content": "hi"}])
    assert resp.content == "hello"
    assert resp.model == "qwen-plus"
    assert (resp.prompt_tokens, resp.completion_tokens) == (11, 22)
    assert resp.latency_s >= 0


def test_complete_json_mode_sets_response_format() -> None:
    """json_mode=True 时请求体带 response_format=json_object。"""
    seen: dict = {}

    def handler(req: httpx.Request) -> httpx.Response:
        import json as _json

        seen.update(_json.loads(req.content))
        return httpx.Response(200, json=_CHAT_OK)

    _gateway(handler).complete([{"role": "user", "content": "hi"}], json_mode=True)
    assert seen.get("response_format") == {"type": "json_object"}
    assert seen.get("temperature") == 0.2  # 取自默认配置


def test_complete_default_json_mode_off() -> None:
    """缺省（配置 json_mode 关）时不带 response_format。"""
    seen: dict = {}

    def handler(req: httpx.Request) -> httpx.Response:
        import json as _json

        seen.update(_json.loads(req.content))
        return httpx.Response(200, json=_CHAT_OK)

    _gateway(handler).complete([{"role": "user", "content": "hi"}])
    assert "response_format" not in seen


def test_complete_timeout_maps_to_timeout_error() -> None:
    """请求超时抛 LLMTimeoutError。"""

    def handler(req: httpx.Request) -> httpx.Response:
        raise httpx.TimeoutException("timed out", request=req)

    with pytest.raises(LLMTimeoutError):
        _gateway(handler).complete([{"role": "user", "content": "hi"}])


def test_complete_http_500_maps_to_gateway_error() -> None:
    """网关返回非 2xx 抛 LLMGatewayError。"""
    gw = _gateway(lambda req: httpx.Response(500, text="boom"))
    with pytest.raises(LLMGatewayError):
        gw.complete([{"role": "user", "content": "hi"}])


def test_complete_unparseable_body_maps_to_gateway_error() -> None:
    """应答体缺字段/不可解析抛 LLMGatewayError。"""
    gw = _gateway(lambda req: httpx.Response(200, json={"no_choices": True}))
    with pytest.raises(LLMGatewayError):
        gw.complete([{"role": "user", "content": "hi"}])
