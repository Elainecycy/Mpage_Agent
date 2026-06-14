"""素材清单校验单测（任务 1.5 / 技改 F1）。

覆盖验收 §4.1.2：合法清单（1~20 项、含 url、可选字段）通过；非法清单（空、缺 url、
url 格式错、超量、字段类型错）在调用模型前即抛结构化 INVALID_MANIFEST。
"""

import pytest

from app.errors import AppError, ErrorCode
from app.services.manifest import MAX_ASSETS, validate_manifest


def _err(manifest) -> AppError:
    """断言校验抛 INVALID_MANIFEST 并返回该异常，便于进一步查 details。

    Args:
        manifest: 期望非法的素材清单。

    Returns:
        捕获到的 ``AppError``（已断言 code 为 INVALID_MANIFEST、状态码 400）。
    """
    with pytest.raises(AppError) as ei:
        validate_manifest(manifest)
    assert ei.value.code is ErrorCode.INVALID_MANIFEST
    assert ei.value.http_status == 400
    return ei.value


# ——————————————————— 合法 ———————————————————


def test_valid_manifest_passes_and_returns_unchanged() -> None:
    """合法清单（含可选 name/note/width/height）通过且原样返回（不改写 url）。"""
    manifest = [
        {"url": "https://cdn.example.com/a.png", "name": "a.png", "note": "头图", "width": 750, "height": 400},
        {"url": "http://intranet.local/b.png"},
    ]
    assert validate_manifest(manifest) is manifest


def test_max_assets_boundary_ok() -> None:
    """恰好 20 项（上限）通过。"""
    manifest = [{"url": f"https://cdn.example.com/{i}.png"} for i in range(MAX_ASSETS)]
    assert validate_manifest(manifest) is manifest


# ——————————————————— 致命形态 ———————————————————


def test_not_a_list_rejected() -> None:
    """非数组直接拒绝。"""
    _err({"url": "https://x"})


def test_empty_rejected() -> None:
    """空数组直接拒绝。"""
    _err([])


def test_over_limit_rejected() -> None:
    """超过 20 项被拒绝。"""
    manifest = [{"url": f"https://cdn.example.com/{i}.png"} for i in range(MAX_ASSETS + 1)]
    assert "最多" in _err(manifest).message


# ——————————————————— 逐项问题 ———————————————————


def test_missing_url_rejected() -> None:
    """某项缺 url，错误进 details。"""
    err = _err([{"name": "no_url.png"}])
    assert any("缺少 url" in e for e in err.details["errors"])


def test_empty_url_rejected() -> None:
    """url 为空串被拒绝。"""
    assert any("缺少 url" in e for e in _err([{"url": "   "}]).details["errors"])


@pytest.mark.parametrize("bad_url", ["not a url", "ftp://x/y.png", "/relative/path.png", "example.com/a.png"])
def test_bad_url_format_rejected(bad_url: str) -> None:
    """非 http(s) 绝对地址被判格式非法。"""
    assert any("格式非法" in e for e in _err([{"url": bad_url}]).details["errors"])


def test_wrong_optional_field_types_rejected() -> None:
    """可选字段类型错（name 非串、width 非数）被收集。"""
    err = _err([{"url": "https://cdn.example.com/a.png", "name": 123, "width": "big"}])
    msgs = err.details["errors"]
    assert any("name 必须是字符串" in e for e in msgs)
    assert any("width 必须是数字" in e for e in msgs)


def test_multiple_problems_collected() -> None:
    """多项问题一次性汇总在 details，便于前端一并提示。"""
    err = _err([{"name": "x"}, {"url": "bad"}, {"url": "https://ok.com/a.png"}])
    assert len(err.details["errors"]) >= 2
