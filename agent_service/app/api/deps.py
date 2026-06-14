"""API 依赖注入提供者（任务 1.6）。

集中放路由用到的可注入依赖（数据库会话从 ``app.db.get_session`` 直接取）。这里提供 LLM
网关单例——测试可用 ``app.dependency_overrides[get_gateway]`` 换成假网关，脱离真实网络。
"""

from __future__ import annotations

from functools import lru_cache

from app.services.llm_gateway import LLMGateway, SupportsComplete


@lru_cache(maxsize=1)
def get_gateway() -> SupportsComplete:
    """返回进程内复用的 LLM 网关实例（按配置构建）。

    大致逻辑：首次调用按 ``Settings`` 建 ``LLMGateway``（内部复用一个 httpx 客户端），
    之后缓存复用；换模型只改 ``MPAGE_LLM_*`` 环境变量、不动此处。

    Returns:
        实现 ``SupportsComplete`` 协议的网关实例。
    """
    return LLMGateway()


__all__ = ["get_gateway"]
