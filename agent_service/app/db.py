"""数据库装配（任务 1.6 / 决议 §3）：引擎、会话、建表与依赖注入入口。

MVP 默认 SQLite（``MPAGE_DATABASE_URL`` 缺省 ``sqlite:///./mpage_agent.db``），改环境变量即可
切到 MySQL/PG，业务代码不动。引擎与 sessionmaker 惰性构建并进程内缓存，便于测试用
``reset_engine`` 重置后指向隔离库。
"""

from __future__ import annotations

from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    """所有 ORM 模型的声明式基类（``Base.metadata`` 汇总建表信息）。"""


@lru_cache(maxsize=1)
def get_engine() -> Engine:
    """构建并缓存数据库引擎（按配置 ``database_url``）。

    大致逻辑：读 ``Settings.database_url`` 建 ``Engine``；SQLite 追加
    ``check_same_thread=False``，以便 FastAPI 把同步路由放到线程池执行时跨线程复用连接。

    Returns:
        进程内缓存的 ``Engine``；测试可先 ``reset_engine()`` 再取，指向隔离库。
    """
    url = get_settings().database_url
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=connect_args, future=True)


@lru_cache(maxsize=1)
def get_sessionmaker() -> sessionmaker[Session]:
    """构建并缓存绑定到引擎的 ``sessionmaker``。

    Returns:
        ``sessionmaker``（``expire_on_commit=False``，提交后仍可读取对象属性）。
    """
    return sessionmaker(bind=get_engine(), expire_on_commit=False, class_=Session)


def reset_engine() -> None:
    """清掉引擎/会话缓存（仅供测试在切换 ``database_url`` 后重建用）。"""
    get_engine.cache_clear()
    get_sessionmaker.cache_clear()


def init_db() -> None:
    """按 ORM 元数据建表（幂等：已存在则跳过）。

    大致逻辑：导入 ``app.models.page`` 触发模型注册到 ``Base.metadata`` → 在当前引擎上
    ``create_all``。应用启动（``main`` 的 lifespan）时调用一次。

    Args:
        无。

    Returns:
        无。
    """
    from app.models import page  # noqa: F401  导入以注册表结构

    Base.metadata.create_all(get_engine())


def get_session():
    """FastAPI 依赖：产出一个数据库会话，请求结束自动关闭。

    大致逻辑：从缓存的 ``sessionmaker`` 开一个 ``Session`` 并 ``yield``，``with`` 退出时
    自动关闭（异常时回滚）。路由用 ``session: Session = Depends(get_session)`` 注入；测试可用
    ``app.dependency_overrides`` 覆盖为指向隔离库的会话。

    Yields:
        一个可用的 SQLAlchemy ``Session``。
    """
    with get_sessionmaker()() as session:
        yield session


__all__ = ["Base", "get_engine", "get_sessionmaker", "reset_engine", "init_db", "get_session"]
