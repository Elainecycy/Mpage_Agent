"""FastAPI 入口：挂载路由与全局异常处理。

以应用工厂 ``create_app`` 构建实例，便于测试构造隔离的 app；模块级 ``app`` 供
``uvicorn app.main:app`` 直接拉起。本期为「可跑通的空服务」，仅含健康检查路由，
业务路由（生成接口 F5 等）在第 1 期后续任务挂入。
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.routes import api_router
from app.config import get_settings


def create_app() -> FastAPI:
    """构建并返回 FastAPI 应用实例（应用工厂）。

    大致逻辑：读配置并初始化日志 → 建 ``FastAPI`` → 注册兜底异常处理器（统一结构化
    错误体，前端可按 code 区分）→ 挂载聚合路由 ``api_router`` → 返回 app。

    Args:
        无。

    Returns:
        已完成日志、异常处理与路由注册、可直接交给 uvicorn 运行的 ``FastAPI`` 实例。
    """
    settings = get_settings()
    logging.basicConfig(level=settings.log_level)
    app = FastAPI(title=settings.app_name, version="0.1.0")

    @app.exception_handler(Exception)
    async def on_unhandled(request: Request, exc: Exception) -> JSONResponse:
        """兜底异常处理：把未捕获异常转成结构化 500 错误体并落日志。

        大致逻辑：记录带栈日志 → 返回 ``{"error": {"code, message}}`` 统一结构，
        避免向前端泄漏堆栈、也让上游能按 code 归类。

        Args:
            request: 触发异常的请求对象（仅用于日志上下文）。
            exc: 被捕获的异常实例。

        Returns:
            HTTP 500 的 ``JSONResponse``，体为统一错误结构。
        """
        logging.exception("unhandled error on %s: %s", request.url.path, exc)
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "internal_error", "message": str(exc)}},
        )

    app.include_router(api_router)
    return app


app = create_app()
