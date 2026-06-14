"""页面生成服务单测（任务 1.4 / 技改 F3）。

注入「假网关」按脚本返回模型输出，覆盖：首次即过、Markdown 围栏容错、自愈重试一次后过、
重试耗尽失败、编造 URL 被拦、孤儿 key 自动清理、超时/网关错误映射。不触真实网络。
"""

import copy
import json

import pytest

from app.catalog import load_example_page
from app.errors import AppError, ErrorCode
from app.services.generator import generate_page_json
from app.services.llm_gateway import LLMGatewayError, LLMResponse, LLMTimeoutError


class FakeGateway:
    """假 LLM 网关：按脚本逐次返回内容或抛异常，并记录每次调用的 messages。

    Args:
        outputs: 每次 ``complete`` 的脚本项——``str`` 作为模型文本返回，``Exception``
            实例则被抛出（模拟超时/网关错误）。
    """

    def __init__(self, outputs: list) -> None:
        self.outputs = outputs
        self.calls: list[list[dict]] = []

    def complete(self, messages: list[dict], *, json_mode: bool | None = None) -> LLMResponse:
        """返回脚本中的第 N 次输出（N=已调用次数）。"""
        self.calls.append(messages)
        item = self.outputs[len(self.calls) - 1]
        if isinstance(item, Exception):
            raise item
        return LLMResponse(content=item, model="fake", latency_s=0.01, prompt_tokens=10, completion_tokens=20)


def _example_and_manifest() -> tuple[dict, list[dict]]:
    """取标准示例及其「全命中」白名单 manifest。

    Returns:
        ``(example_page, manifest)``。
    """
    example = load_example_page()
    manifest = [{"url": v["url"], "name": v.get("name", "")} for v in example["data"]["images"].values()]
    return example, manifest


_INVALID_NO_ROOT = json.dumps(
    {
        "components": [{"id": "x", "component": "Text", "content": {"path": "/texts/a"}}],
        "data": {"texts": {"a": "hi"}, "images": {}},
    }
)


# ——————————————————— 正常路径 ———————————————————


def test_first_try_success() -> None:
    """首次输出即合法：attempts=1，仅调用一次模型。"""
    example, manifest = _example_and_manifest()
    gw = FakeGateway([json.dumps(example)])
    result = generate_page_json("做个新春活动页", manifest, gateway=gw, max_retries=1)
    assert result.attempts == 1
    assert len(gw.calls) == 1
    assert result.page_json["components"][0]["component"] == "Page"
    assert result.model == "fake"
    assert result.pruned_keys == []


def test_markdown_fence_tolerated() -> None:
    """模型误用 ```json 围栏包裹时仍能解析成功。"""
    example, manifest = _example_and_manifest()
    fenced = "```json\n" + json.dumps(example) + "\n```"
    result = generate_page_json("x", manifest, gateway=FakeGateway([fenced]), max_retries=1)
    assert result.attempts == 1


# ——————————————————— 自愈重试 ———————————————————


def test_self_heal_retry_then_success() -> None:
    """首次不合格、回灌错误后第二次合格：attempts=2，且第二次带错误反馈消息。"""
    example, manifest = _example_and_manifest()
    gw = FakeGateway([_INVALID_NO_ROOT, json.dumps(example)])
    result = generate_page_json("x", manifest, gateway=gw, max_retries=1)
    assert result.attempts == 2
    assert len(gw.calls) == 2
    # 第二次调用应在原 messages 后追加 assistant 上次输出 + user 修正反馈
    second_call = gw.calls[1]
    assert second_call[-1]["role"] == "user"
    assert "请逐条修正" in second_call[-1]["content"]
    assert second_call[-2]["role"] == "assistant"


def test_retry_exhausted_raises_generation_failed() -> None:
    """重试耗尽仍不合格：抛 GENERATION_FAILED，且不返回半成品。"""
    _, manifest = _example_and_manifest()
    gw = FakeGateway([_INVALID_NO_ROOT, _INVALID_NO_ROOT])
    with pytest.raises(AppError) as ei:
        generate_page_json("x", manifest, gateway=gw, max_retries=1)
    assert ei.value.code is ErrorCode.GENERATION_FAILED
    assert ei.value.http_status == 422
    assert ei.value.details["attempts"] == 2
    assert ei.value.details["errors"]  # 含可读错误明细
    assert len(gw.calls) == 2


def test_non_json_output_is_retryable() -> None:
    """非 JSON 输出算可回灌的失败原因，下一轮修正后可成功。"""
    example, manifest = _example_and_manifest()
    gw = FakeGateway(["这不是 JSON，我先解释一下……", json.dumps(example)])
    result = generate_page_json("x", manifest, gateway=gw, max_retries=1)
    assert result.attempts == 2


def test_max_retries_zero_single_shot() -> None:
    """max_retries=0 时只调用一次，不合格立即失败。"""
    _, manifest = _example_and_manifest()
    gw = FakeGateway([_INVALID_NO_ROOT])
    with pytest.raises(AppError):
        generate_page_json("x", manifest, gateway=gw, max_retries=0)
    assert len(gw.calls) == 1


# ——————————————————— 防编造 URL ———————————————————


def test_fabricated_url_blocked() -> None:
    """编造图片 url（不在素材清单内）被第二层拦下并最终失败。"""
    example, manifest = _example_and_manifest()
    bad = copy.deepcopy(example)
    bad["data"]["images"]["badge"]["url"] = "https://evil.example.com/fake.png"
    gw = FakeGateway([json.dumps(bad)])
    with pytest.raises(AppError) as ei:
        generate_page_json("x", manifest, gateway=gw, max_retries=0)
    assert ei.value.code is ErrorCode.GENERATION_FAILED
    assert any("疑似编造" in e for e in ei.value.details["errors"])


# ——————————————————— 孤儿 key 自动清理 ———————————————————


def test_orphan_data_key_pruned_on_success() -> None:
    """合法输出里夹带未引用的 data key：判通过、自动清理并在结果里登记。"""
    example, manifest = _example_and_manifest()
    example["data"]["texts"]["unusedNote"] = "没人引用"
    gw = FakeGateway([json.dumps(example)])
    result = generate_page_json("x", manifest, gateway=gw, max_retries=1)
    assert result.attempts == 1
    assert "/texts/unusedNote" in result.pruned_keys
    assert "unusedNote" not in result.page_json["data"]["texts"]


# ——————————————————— 网关错误映射 ———————————————————


def test_timeout_maps_to_model_timeout() -> None:
    """网关超时映射为 MODEL_TIMEOUT(504)。"""
    _, manifest = _example_and_manifest()
    gw = FakeGateway([LLMTimeoutError("超时")])
    with pytest.raises(AppError) as ei:
        generate_page_json("x", manifest, gateway=gw)
    assert ei.value.code is ErrorCode.MODEL_TIMEOUT
    assert ei.value.http_status == 504


def test_gateway_error_maps_to_model_error() -> None:
    """网关其他错误映射为 MODEL_ERROR(502)。"""
    _, manifest = _example_and_manifest()
    gw = FakeGateway([LLMGatewayError("502 boom")])
    with pytest.raises(AppError) as ei:
        generate_page_json("x", manifest, gateway=gw)
    assert ei.value.code is ErrorCode.MODEL_ERROR
    assert ei.value.http_status == 502
