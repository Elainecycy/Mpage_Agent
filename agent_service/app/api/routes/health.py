"""健康检查路由：探活与冒烟用。"""

from __future__ import annotations

from fastapi import APIRouter

from app.config import get_settings

router = APIRouter()


@router.get("/health")
async def health() -> dict:
    """返回服务存活状态与基础信息，用于探活与部署冒烟。

    大致逻辑：读配置取服务名与当前默认模型 → 返回固定结构；不触达 LLM 网关 /
    数据库，保证「空服务」无外部依赖即可应答。

    Args:
        无。

    Returns:
        形如 ``{"status": "ok", "service": "mpage-agent", "model": "qwen-plus"}`` 的字典。
    """
    settings = get_settings()
    return {"status": "ok", "service": settings.app_name, "model": settings.llm_model}
