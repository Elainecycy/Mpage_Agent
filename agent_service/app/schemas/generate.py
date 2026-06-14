"""生成接口的请求/响应数据模型（任务 1.6 / 技改 §4.5）。

字段名按对前端的线上契约用 camelCase。按开工决议 ②，**响应只含 pageJson**——
platformConfig 与 previewUrl 由前端 Mapper 产出，Agent 不返回。
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """``POST /api/pages/{pageId}/generate`` 的请求体。

    Attributes:
        userPrompt: 页面需求描述（自然语言，非空）。
        assetManifest: 素材清单（一组 ``{url, name?, note?, width?, height?}``）；图片上传/存储
            已在平台后端完成，这里只是 URL 列表。基本合法性由生成服务的 F1 校验把关。
    """

    userPrompt: str = Field(min_length=1)
    assetManifest: list[dict[str, Any]] = Field(default_factory=list)


class GenerateResponse(BaseModel):
    """生成接口的成功响应体。

    Attributes:
        pageId: 平台页面 id（回显请求路径参数）。
        version: 本次落库的版本号（同 pageId 内自 1 递增）。
        pageJson: 通过两层校验、可交前端 Mapper 渲染的页面 JSON。
    """

    pageId: str
    version: int
    pageJson: dict[str, Any]


__all__ = ["GenerateRequest", "GenerateResponse"]
