"""同 pageId 生成串行化锁单测（任务 1.6 / 决议 §9）。"""

import pytest

from app.errors import AppError, ErrorCode
from app.services.page_locks import page_generation_lock


def test_same_page_busy_raises_409() -> None:
    """同一 pageId 已在生成中时再次进入立即抛 CONCURRENT_GENERATION(409)。"""
    with page_generation_lock("p1"):
        with pytest.raises(AppError) as ei:
            with page_generation_lock("p1"):
                pass
        assert ei.value.code is ErrorCode.CONCURRENT_GENERATION
        assert ei.value.http_status == 409


def test_different_pages_do_not_conflict() -> None:
    """不同 pageId 的生成互不影响，可同时持有。"""
    with page_generation_lock("a"):
        with page_generation_lock("b"):
            pass


def test_lock_released_after_exit() -> None:
    """退出临界区后锁被释放，同一 pageId 可再次获取。"""
    with page_generation_lock("p2"):
        pass
    with page_generation_lock("p2"):
        pass
