"""API 路由聚合：把各子路由挂到统一的 ``api_router`` 上。

新增业务路由（如第 1 期的生成接口）时，在此 ``include_router`` 即可，``main.create_app``
只挂这一个聚合路由、无需改动。
"""

from fastapi import APIRouter

from app.api.routes import health, pages

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(pages.router)

__all__ = ["api_router"]
