"""FastAPI 入口：挂载路由与全局异常处理。

以应用工厂 ``create_app`` 构建实例，便于测试构造隔离的 app；模块级 ``app`` 供
``uvicorn app.main:app`` 直接拉起。本期为「可跑通的空服务」，仅含健康检查路由，
业务路由（生成接口 F5 等）在第 1 期后续任务挂入。
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.routes import api_router
from app.config import get_settings
from app.db import init_db
from app.errors import AppError


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时建表（幂等），便于 ``uvicorn`` 拉起即可用。

    大致逻辑：进入时调用 ``init_db()`` 按 ORM 元数据建表（已存在则跳过）→ ``yield`` 进入
    服务期 → 退出无额外清理。测试若以 ``TestClient(app)`` 非上下文方式使用则不触发本钩子，
    由测试自行用隔离库建表。

    Args:
        app: 当前 FastAPI 应用实例。

    Yields:
        控制权交还给服务运行期。
    """
    init_db()
    yield


def create_app() -> FastAPI:
    """构建并返回 FastAPI 应用实例（应用工厂）。

    大致逻辑：读配置并初始化日志 → 建带 ``lifespan`` 的 ``FastAPI`` → 注册
    ``AppError`` 处理器（结构化错误码 + 对应 HTTP 状态）与兜底异常处理器 → 挂载聚合路由
    ``api_router`` → 返回 app。

    Args:
        无。

    Returns:
        已完成日志、异常处理与路由注册、可直接交给 uvicorn 运行的 ``FastAPI`` 实例。
    """
    settings = get_settings()
    logging.basicConfig(level=settings.log_level)
    app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

    @app.exception_handler(AppError)
    async def on_app_error(request: Request, exc: AppError) -> JSONResponse:
        """把领域异常 ``AppError`` 转成结构化错误响应（决议 §6）。

        大致逻辑：按 ``exc.code`` 取 HTTP 状态码，响应体用 ``exc.to_error_body()``
        （``{"error": {code, message, details?}}``），前端据 code 区分提示。

        Args:
            request: 触发异常的请求（仅用于日志上下文）。
            exc: 抛出的 ``AppError``。

        Returns:
            状态码与错误码匹配的 ``JSONResponse``。
        """
        logging.info("app_error on %s: %s %s", request.url.path, exc.code.value, exc.message)
        return JSONResponse(status_code=exc.http_status, content=exc.to_error_body())

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
