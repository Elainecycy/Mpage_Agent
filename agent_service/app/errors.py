"""全局结构化错误码与领域异常（开工决议 §6 / 技改「结构化错误码」）。

服务内部一律抛 ``AppError`` 表达「可预期的业务失败」，由 API 层统一转成
``{"error": {"code", "message", "details?}}`` 响应体并附对应 HTTP 状态码（前端按 code
区分提示）。未列入的意外异常仍走 ``main.py`` 的兜底处理器（internal_error / 500）。
"""

from __future__ import annotations

from enum import Enum
from typing import Any


class ErrorCode(str, Enum):
    """生成链路对外暴露的错误码枚举（决议 §6，前后端共享契约）。

    取值即响应体里的 ``error.code``；HTTP 状态码见 ``_HTTP_STATUS``。

    Attributes:
        INVALID_MANIFEST: 素材清单非法（空 / 缺 url / url 格式错），调用模型前即拒绝。
        GENERATION_FAILED: 自愈重试耗尽仍未过两层校验，不返回半成品 JSON。
        MODEL_TIMEOUT: 模型调用超时。
        MODEL_ERROR: 网关 / 模型返回异常（非超时）。
        CONCURRENT_GENERATION: 同一 pageId 生成进行中，重复提交被拦下。
        INTERNAL_ERROR: 兜底未预期异常。
    """

    INVALID_MANIFEST = "invalid_manifest"
    GENERATION_FAILED = "generation_failed"
    MODEL_TIMEOUT = "model_timeout"
    MODEL_ERROR = "model_error"
    CONCURRENT_GENERATION = "concurrent_generation"
    INTERNAL_ERROR = "internal_error"


# 错误码 → HTTP 状态码（决议 §6 表）
_HTTP_STATUS: dict[ErrorCode, int] = {
    ErrorCode.INVALID_MANIFEST: 400,
    ErrorCode.GENERATION_FAILED: 422,
    ErrorCode.MODEL_TIMEOUT: 504,
    ErrorCode.MODEL_ERROR: 502,
    ErrorCode.CONCURRENT_GENERATION: 409,
    ErrorCode.INTERNAL_ERROR: 500,
}


class AppError(Exception):
    """可预期的业务失败异常，携带结构化错误码、可读消息与可选细节。

    大致逻辑：构造时绑定 ``ErrorCode``，由 ``http_status`` 推出状态码、``to_error_body``
    产出统一响应体。服务层抛出，API 层捕获后转 HTTP 响应。

    Args:
        code: 错误码枚举。
        message: 面向前端/用户的可读失败原因（不含堆栈、不泄露内部细节）。
        details: 可选附加信息（如校验错误列表），放进响应体 ``error.details`` 便于排查。

    Example:
        >>> raise AppError(ErrorCode.GENERATION_FAILED, "生成失败", details={"errors": ["..."]})
    """

    def __init__(self, code: ErrorCode, message: str, details: Any | None = None) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = details

    @property
    def http_status(self) -> int:
        """该错误对应的 HTTP 状态码。

        Returns:
            决议 §6 表里 ``code`` 对应的状态码；未登记的码回落 500。
        """
        return _HTTP_STATUS.get(self.code, 500)

    def to_error_body(self) -> dict[str, Any]:
        """转成统一错误响应体。

        Returns:
            形如 ``{"error": {"code": ..., "message": ...[, "details": ...]}}``；
            ``details`` 为 ``None`` 时不带该键。
        """
        body: dict[str, Any] = {"code": self.code.value, "message": self.message}
        if self.details is not None:
            body["details"] = self.details
        return {"error": body}


__all__ = ["ErrorCode", "AppError"]
