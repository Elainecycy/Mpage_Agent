"""素材清单接入与校验（任务 1.5 / 技改 F1）。

Agent 是平台的下游服务：图片上传、存 OSS、生成可访问 URL 全在平台后端转换层完成，
流转到这里时图片已是一组 URL（assetManifest）。**本模块及整个服务不含任何上传/OSS/
文件流逻辑**（技改 §4.1.2 第 4 条职责边界）。

本模块只做一件事：在调用模型**之前**校验素材清单基本合法（是数组、非空、不超量、每项含
合法的 http(s) url、可选字段类型正确）。不合法立即抛 ``AppError(INVALID_MANIFEST)``，
不进入模型调用（技改 §4.1.2 第 2 条「不产生模型调用开销」）。清单注入 Prompt 见
``prompt_builder.build_user_message``，作为 URL 白名单拦截编造见 ``catalog.check_integrity``。
"""

from __future__ import annotations

from typing import Any
from urllib.parse import urlparse

from app.errors import AppError, ErrorCode

# 单次请求素材数量上限（技改 §4.1.2 第 1 条：合法 manifest 含 1~20 项）
MAX_ASSETS = 20


def _is_valid_http_url(url: str) -> bool:
    """判断字符串是否为合法的 http(s) 绝对 URL。

    大致逻辑：用 ``urlparse`` 解析，要求 scheme 为 http/https 且 netloc（域名）非空。
    白名单按 URL **精确匹配**（决议 §4），故此处只校验格式、不做任何归一化改写。

    Args:
        url: 待校验的地址字符串。

    Returns:
        是合法 http(s) 绝对地址返回 ``True``，否则 ``False``。
    """
    try:
        parsed = urlparse(url)
    except ValueError:
        return False
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def validate_manifest(asset_manifest: Any) -> list[dict[str, Any]]:
    """校验素材清单基本合法，不合法抛 ``AppError(INVALID_MANIFEST)``。

    大致逻辑：先挡致命形态（非数组 / 空 / 超量）→ 逐项收集问题（非对象、缺 url、url 格式
    非法、可选字段 name/note 非串或 width/height 非数）→ 有问题则带明细一次性抛错。
    **不改写 url**（白名单精确匹配），校验通过原样返回清单。

    Args:
        asset_manifest: 待校验的素材清单，期望为 ``[{"url", "name"?, "note"?, "width"?,
            "height"?}, ...]``。

    Returns:
        校验通过的素材清单（与入参同一对象，未做归一化）。

    Raises:
        AppError: 错误码 ``INVALID_MANIFEST``。致命形态错误的 message 直述原因；逐项问题
            汇总在 ``details["errors"]``，供前端定位与提示。

    Example:
        >>> validate_manifest([{"url": "https://cdn.example.com/bg.png", "note": "头图"}])
        [{'url': 'https://cdn.example.com/bg.png', 'note': '头图'}]
    """
    if not isinstance(asset_manifest, list):
        raise AppError(ErrorCode.INVALID_MANIFEST, "素材清单必须是数组")
    if not asset_manifest:
        raise AppError(ErrorCode.INVALID_MANIFEST, "素材清单不能为空")
    if len(asset_manifest) > MAX_ASSETS:
        raise AppError(
            ErrorCode.INVALID_MANIFEST,
            f"素材清单最多 {MAX_ASSETS} 项，当前 {len(asset_manifest)} 项",
        )

    errors: list[str] = []
    for i, item in enumerate(asset_manifest):
        if not isinstance(item, dict):
            errors.append(f"第 {i} 项不是对象")
            continue
        url = item.get("url")
        if not isinstance(url, str) or not url.strip():
            errors.append(f"第 {i} 项缺少 url")
        elif not _is_valid_http_url(url):
            errors.append(f"第 {i} 项 url 格式非法（须 http/https 绝对地址）: {url}")
        for f in ("name", "note"):
            if f in item and not isinstance(item[f], str):
                errors.append(f"第 {i} 项 {f} 必须是字符串")
        for f in ("width", "height"):
            if f in item and not isinstance(item[f], (int, float)):
                errors.append(f"第 {i} 项 {f} 必须是数字")

    if errors:
        raise AppError(
            ErrorCode.INVALID_MANIFEST,
            "素材清单校验未通过",
            details={"errors": errors},
        )
    return asset_manifest


__all__ = ["validate_manifest", "MAX_ASSETS"]
