"""页面落库与查询（任务 1.6 / 决议 §3）：把生成结果写进 pages + page_revisions。

只负责持久化，不含生成/校验逻辑。``save_generation`` 在一个事务里 upsert 当前态并追加一条
版本快照；``get_current_page`` 按 pageId 读最近一次的页面 JSON（验收 §4.5.2-3）。
"""

from __future__ import annotations

from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.page import Page, PageRevision


def save_generation(session: Session, page_id: str, page_json: dict[str, Any]) -> int:
    """落库一次生成结果：upsert 当前态 + 追加版本快照，返回本次版本号。

    大致逻辑：查该 pageId 现有最大 version_no → 新版本号 = 最大值 + 1（首次为 1）→
    页面不存在则插入 ``pages``、存在则更新 ``current_json`` 并把 ``ai_editable`` 重置为 True
    （新一次 AI 生成的结果重新可被 AI 修改）→ 追加一条 ``page_revisions`` → 提交。

    Args:
        session: 数据库会话（由调用方管理生命周期）。
        page_id: 平台页面 id。
        page_json: 已通过两层校验的页面 JSON。

    Returns:
        本次写入的版本号（``version_no``，从 1 起递增）。
    """
    last = session.scalar(
        select(func.max(PageRevision.version_no)).where(PageRevision.page_id == page_id)
    )
    version_no = (last or 0) + 1

    page = session.get(Page, page_id)
    if page is None:
        session.add(Page(page_id=page_id, current_json=page_json, ai_editable=True))
    else:
        page.current_json = page_json
        page.ai_editable = True

    session.add(PageRevision(page_id=page_id, version_no=version_no, page_json=page_json))
    session.commit()
    return version_no


def get_current_page(session: Session, page_id: str) -> dict[str, Any] | None:
    """读取某页面最近一次生成的页面 JSON。

    Args:
        session: 数据库会话。
        page_id: 平台页面 id。

    Returns:
        最近一次的页面 JSON；该 pageId 尚无记录时返回 ``None``。
    """
    page = session.get(Page, page_id)
    return page.current_json if page is not None else None


__all__ = ["save_generation", "get_current_page"]
