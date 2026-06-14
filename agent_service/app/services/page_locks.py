"""同一 pageId 的生成串行化（任务 1.6 / 决议 §9）。

MVP 单实例部署：用「进程内、按 pageId 的非阻塞锁」保证同一页面的生成请求串行——某页面
生成进行中时，后到的重复提交**立即**抛 ``CONCURRENT_GENERATION``(409)，不排队、不阻塞。
多实例上线时只需把这里换成 DB 行锁 / Redis 锁，接口契约不变。
"""

from __future__ import annotations

import threading
from collections.abc import Iterator
from contextlib import contextmanager

from app.errors import AppError, ErrorCode

# 全局锁表的保护锁 + 每个 pageId 一把生成锁（线程安全的惰性建表）
_table_guard = threading.Lock()
_page_locks: dict[str, threading.Lock] = {}


@contextmanager
def page_generation_lock(page_id: str) -> Iterator[None]:
    """获取某 pageId 的生成锁；已被占用则立刻抛 409，不阻塞等待。

    大致逻辑：在表保护锁下取/建该 pageId 的锁 → 非阻塞 ``acquire``：拿不到说明同页面正在
    生成，抛 ``AppError(CONCURRENT_GENERATION)`` → 拿到则进入临界区，``with`` 退出时释放。

    Args:
        page_id: 平台页面 id。

    Yields:
        进入临界区（无返回值）；期间该 pageId 独占生成权。

    Raises:
        AppError: 错误码 ``CONCURRENT_GENERATION``(409)——同 pageId 已有生成在进行。

    Example:
        >>> with page_generation_lock("page_1"):
        ...     ...  # 此处独占，重复提交会被 409 拦下
    """
    with _table_guard:
        lock = _page_locks.setdefault(page_id, threading.Lock())

    if not lock.acquire(blocking=False):
        raise AppError(
            ErrorCode.CONCURRENT_GENERATION,
            f"页面 {page_id} 正在生成中，请稍候重试。",
        )
    try:
        yield
    finally:
        lock.release()


__all__ = ["page_generation_lock"]
