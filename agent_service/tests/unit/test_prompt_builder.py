"""Prompt 组装器单测（任务 1.3 / 技改 F2）。

验收技改 §4.2.2：
1. 产物与设计 §4.3 五段结构一致，注入的 few-shot 自身能过两层校验；
2. 模板与 Catalog 分离——few-shot 取自 app.catalog 的单一真源，而非组装代码里写死；
3. 完整 prompt 可复现（确定性），便于服务层按 traceId 落盘。
"""

import json

import pytest

from app.catalog import check_integrity, load_example_page, validate_page
from app.services import prompt_builder
from app.services.prompt_builder import (
    build_messages,
    build_system_prompt,
    build_user_message,
)

_MANIFEST = [
    {"url": "https://cdn.example.com/a.png", "name": "a.png", "note": "头图"},
    {"url": "https://cdn.example.com/b.png", "name": "b.png"},
]


def _extract_injected_example(system_prompt: str) -> dict:
    """从 system prompt 的「输出：」之后切出 few-shot JSON 并解析。

    Args:
        system_prompt: 组装好的完整 system prompt。

    Returns:
        few-shot 示例解析后的 dict。
    """
    _, sep, after = system_prompt.partition("输出：")
    assert sep, "system prompt 缺少示例『输出：』段"
    return json.loads(after.strip())


# ——————————————————— 验收 1：五段结构 + few-shot 合法 ———————————————————


def test_system_prompt_has_five_sections() -> None:
    """system prompt 含设计 §4.3 五段结构。"""
    sp = build_system_prompt()
    for section in ("## 角色", "## 工作步骤", "## 规则", "## 组件字段速查", "## 完整示例"):
        assert section in sp


def test_placeholder_is_substituted() -> None:
    """模板占位符已被替换，不残留在产物里。"""
    assert "{{EXAMPLE_OUTPUT_JSON}}" not in build_system_prompt()


def test_injected_example_passes_both_validators() -> None:
    """注入的 few-shot 示例自身合法（过第一层 + 第二层）。"""
    example = _extract_injected_example(build_system_prompt())
    assert validate_page(example) == []
    manifest = [{"url": v["url"]} for v in example["data"]["images"].values()]
    assert check_integrity(example, manifest).ok


def test_key_ui_rules_present() -> None:
    """UI 规则三要素必须在 prompt 里出现：禁编造 URL、禁 Text/Icon 坐标、path 引用。"""
    sp = build_system_prompt()
    assert "禁止编造" in sp
    assert "不要为 Text / Icon 输出 position / size" in sp
    assert "path 引用" in sp


# ——————————————————— 验收 2：模板与 Catalog 分离 ———————————————————


def test_few_shot_sourced_from_catalog_single_truth() -> None:
    """注入的 few-shot 与 app.catalog.load_example_page 完全一致（示例非写死在组装代码）。"""
    injected = _extract_injected_example(build_system_prompt())
    assert injected == load_example_page()


def test_build_system_prompt_rejects_invalid_example(monkeypatch: pytest.MonkeyPatch) -> None:
    """few-shot 示例不合法时组装应直接抛错、不带病注入（fail fast）。"""
    monkeypatch.setattr(prompt_builder, "validate_page", lambda _page: ["伪造的格式错误"])
    build_system_prompt.cache_clear()
    with pytest.raises(ValueError, match="few-shot 示例未通过校验"):
        build_system_prompt()
    build_system_prompt.cache_clear()  # 还原缓存，避免污染其他用例


# ——————————————————— user message / messages ———————————————————


def test_user_message_contains_prompt_and_manifest() -> None:
    """user message 含需求描述原文与素材清单每个 url。"""
    msg = build_user_message("做一个新春活动页", _MANIFEST)
    assert "做一个新春活动页" in msg
    for item in _MANIFEST:
        assert item["url"] in msg


def test_user_message_strips_prompt_whitespace() -> None:
    """需求描述前后空白被裁掉。"""
    assert "  乱填的空白  " not in build_user_message("  乱填的空白  ", [])


def test_build_messages_shape() -> None:
    """build_messages 返回 [system, user] 两段、角色正确、内容非空。"""
    msgs = build_messages("描述", _MANIFEST)
    assert [m["role"] for m in msgs] == ["system", "user"]
    assert all(m["content"] for m in msgs)
    assert msgs[0]["content"] == build_system_prompt()


# ——————————————————— 验收 3：确定性 ———————————————————


def test_determinism() -> None:
    """相同入参多次组装产物完全一致（可按 traceId 复现落盘）。"""
    assert build_system_prompt() == build_system_prompt()
    assert build_user_message("x", _MANIFEST) == build_user_message("x", _MANIFEST)
