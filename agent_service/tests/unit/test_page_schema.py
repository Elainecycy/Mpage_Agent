"""页面 JSON 第一层（JSON Schema）校验单测。

验收任务 1.1「附录 A 标准示例能通过校验」，并对每类结构性约束配反例，
确保 Schema 既不误杀合法示例、也能拦住典型非法输出。
"""

import json
from pathlib import Path

import pytest

from app.catalog import get_validator, load_page_schema, validate_page

_FIXTURE = Path(__file__).parents[1] / "fixtures" / "appendix_a_page.json"


def _load_appendix_a() -> dict:
    """读取附录 A 标准页面示例 fixture。

    Returns:
        附录 A 的页面 JSON（dict）。
    """
    with _FIXTURE.open("r", encoding="utf-8") as f:
        return json.load(f)


def test_schema_self_valid() -> None:
    """Schema 文件本身符合 Draft 2020-12（get_validator 内含 check_schema）。"""
    assert get_validator() is not None
    assert load_page_schema()["title"].startswith("Mpage")


def test_appendix_a_passes() -> None:
    """附录 A 标准示例通过第一层校验（任务 1.1 验收）。"""
    assert validate_page(_load_appendix_a()) == []


def test_missing_top_level_keys() -> None:
    """缺 components / data 顶层字段应报错。"""
    assert validate_page({"data": {"texts": {}, "images": {}}})  # 缺 components
    assert validate_page({"components": [{"id": "root", "component": "Page", "children": ["x"]}]})  # 缺 data


def test_empty_components_rejected() -> None:
    """components 为空数组违反 minItems=1。"""
    assert validate_page({"components": [], "data": {"texts": {}, "images": {}}})


def test_unknown_component_type_rejected() -> None:
    """未在枚举内的 component 类型应报错。"""
    page = _load_appendix_a()
    page["components"].append({"id": "weird", "component": "Carousel"})
    assert any("Carousel" in e or "component" in e for e in validate_page(page))


def test_container_requires_children() -> None:
    """容器组件（Page/Header/Chapter）缺 children 应报错。"""
    page = {
        "components": [{"id": "root", "component": "Page"}],
        "data": {"texts": {}, "images": {}},
    }
    assert any("children" in e for e in validate_page(page))


def test_text_requires_content_ref() -> None:
    """Text 缺 content 应报错。"""
    page = _load_appendix_a()
    page["components"].append({"id": "t-bad", "component": "Text", "style": {"fontSize": 12}})
    assert any("content" in e for e in validate_page(page))


def test_inline_string_ref_rejected() -> None:
    """文案字段写裸字符串（非 path 引用对象）应被 Schema 拦下。"""
    page = _load_appendix_a()
    page["components"].append({"id": "t-inline", "component": "TextCard", "content": "直接写文案"})
    assert validate_page(page)


def test_image_ref_namespace_mismatch_rejected() -> None:
    """图片字段 path 指向 /texts/ 命名空间（应为 /images/）被 pattern 拦下。"""
    page = _load_appendix_a()
    page["components"].append(
        {"id": "bg-bad", "component": "BackgroundImage", "src": {"path": "/texts/headerBg"}}
    )
    assert validate_page(page)


def test_image_asset_requires_url() -> None:
    """data.images 某项缺 url 应报错。"""
    page = _load_appendix_a()
    page["data"]["images"]["broken"] = {"name": "no_url.png"}
    assert any("url" in e for e in validate_page(page))


def test_invalid_style_enum_rejected() -> None:
    """style.fontWeight 取非枚举值应报错。"""
    page = _load_appendix_a()
    page["components"][3]["style"]["fontWeight"] = "heavy"
    assert validate_page(page)


@pytest.mark.parametrize("ok_value", ["normal", "bold"])
def test_valid_style_enum_passes(ok_value: str) -> None:
    """style.fontWeight 合法枚举值不应误杀。"""
    page = _load_appendix_a()
    page["components"][3]["style"]["fontWeight"] = ok_value
    assert validate_page(page) == []
