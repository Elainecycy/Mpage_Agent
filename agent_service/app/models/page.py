"""页面与版本记录的 ORM 模型（任务 1.6 / 决议 §3）。

两张表：``pages`` 存每个 pageId 的当前页面 JSON 与「是否仍可被 AI 修改」标记；
``page_revisions`` 每次生成追加一条版本快照（第 1 期只写不读，为第 3 期回滚预留）。
``page_json`` 用通用 ``JSON`` 类型存储，SQLite 落为 TEXT、MySQL/PG 用原生 JSON。
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy import JSON as SAJSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _utcnow() -> datetime:
    """返回当前 UTC 时间（带时区），用作建/改时间默认值。

    Returns:
        当前 UTC ``datetime``。
    """
    return datetime.now(timezone.utc)


class Page(Base):
    """页面当前态：每个 pageId 一行，保存最近一次生成的页面 JSON。

    Attributes:
        page_id: 平台传入的页面 id（主键）。
        current_json: 最近一次通过校验的页面 JSON。
        ai_editable: 是否仍可被 AI 修改；AI 生成后为 True，前端手动改后置 False（前端 F4）。
        created_at / updated_at: 建/改时间（UTC）。
    """

    __tablename__ = "pages"

    page_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    current_json: Mapped[dict] = mapped_column(SAJSON, nullable=False)
    ai_editable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )


class PageRevision(Base):
    """页面版本快照：同一 pageId 每次生成追加一条，version_no 自 1 起递增。

    Attributes:
        id: 自增主键。
        page_id: 所属页面 id（外键指向 ``pages.page_id``）。
        version_no: 同一页面内的版本号（从 1 开始）。
        page_json: 该版本的页面 JSON 全文。
        instruction: 修改指令；第 1 期生成场景恒为 None，第 3 期对话修改时填写。
        created_at: 落库时间（UTC）。
    """

    __tablename__ = "page_revisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    page_id: Mapped[str] = mapped_column(
        String(128), ForeignKey("pages.page_id"), nullable=False, index=True
    )
    version_no: Mapped[int] = mapped_column(Integer, nullable=False)
    page_json: Mapped[dict] = mapped_column(SAJSON, nullable=False)
    instruction: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


__all__ = ["Page", "PageRevision"]
