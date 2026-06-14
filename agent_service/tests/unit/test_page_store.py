"""页面落库与查询单测（任务 1.6 / 决议 §3）。

用隔离的内存 SQLite 验证：首次生成版本号 1、再次生成版本递增且当前态更新、不同 pageId
版本独立、查询缺失返回 None、生成场景 instruction 为空。
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.db import Base
from app.models.page import Page, PageRevision
from app.services.page_store import get_current_page, save_generation


@pytest.fixture
def session() -> Session:
    """提供一个建好表的内存 SQLite 会话。

    Yields:
        绑定到独立内存库、已建表的 ``Session``。
    """
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    maker = sessionmaker(bind=engine, expire_on_commit=False, class_=Session)
    with maker() as s:
        yield s


def test_first_generation_is_version_1(session: Session) -> None:
    """首次落库版本号为 1，当前态写入，ai_editable 为 True。"""
    assert save_generation(session, "p1", {"a": 1}) == 1
    assert get_current_page(session, "p1") == {"a": 1}
    assert session.get(Page, "p1").ai_editable is True


def test_second_generation_increments_and_updates_current(session: Session) -> None:
    """同 pageId 再次生成：版本号 +1、当前态更新、版本表两条快照齐全。"""
    save_generation(session, "p1", {"v": 1})
    assert save_generation(session, "p1", {"v": 2}) == 2
    assert get_current_page(session, "p1") == {"v": 2}
    revs = (
        session.query(PageRevision)
        .filter_by(page_id="p1")
        .order_by(PageRevision.version_no)
        .all()
    )
    assert [r.version_no for r in revs] == [1, 2]
    assert revs[0].page_json == {"v": 1}


def test_distinct_pages_have_independent_versions(session: Session) -> None:
    """不同 pageId 各自从 1 计数。"""
    assert save_generation(session, "a", {}) == 1
    assert save_generation(session, "b", {}) == 1


def test_get_missing_page_returns_none(session: Session) -> None:
    """查询没有记录的 pageId 返回 None。"""
    assert get_current_page(session, "nope") is None


def test_instruction_is_null_for_generation(session: Session) -> None:
    """第 1 期生成场景 instruction 恒为 None（为第 3 期修改预留）。"""
    save_generation(session, "p1", {})
    assert session.query(PageRevision).filter_by(page_id="p1").one().instruction is None
