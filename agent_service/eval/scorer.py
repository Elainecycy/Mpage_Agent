"""测试题库判分器（任务 1.11 / 决议 §8）：把一份生成结果按标注打分，并汇总指标。

纯函数、不调模型、不依赖网络——喂进「生成出来的页面 + 该题标注」即算出分数，因此可独立单测。
判分口径（决议 §8）：
- **Schema 合格率**：该题是否产出了通过两层校验的页面（由跑批脚本判定 passed 传入）。
- **卡片选对率**：每题按「第几章第几张卡」标注一组「可接受卡片类型集合」，命中即对；
  比例 = 对的槽位 / 标注槽位（仅在 passed 的题上统计）。
- **素材命中率**：每题标注「哪些素材 url 应被用上」，出现在最终页面即命中。
- **文案保真率**（附加）：标注「必须原样出现」的文案是否进了 data.texts。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

CARD_TYPES = {"TextCard", "IconCard", "BackgroundTextCard"}


@dataclass
class CaseScore:
    """单题得分明细。

    Attributes:
        case_id: 题目 id。
        passed: 是否产出了通过两层校验的页面。
        error_code: 失败时的错误码（成功为 None）。
        attempts: 实际调用模型次数（失败记 0 或重试次数）。
        card_correct / card_total: 卡片槽位命中数 / 标注总数。
        asset_hits / asset_total: 素材命中数 / 应命中总数。
        text_hits / text_total: 文案保真命中数 / 标注总数。
        chapter_count: 实际生成的章节数。
        chapter_ok: 章节数是否落在标注的区间内。
        notes: 人读备注（如某槽位缺失、某素材未用）。
    """

    case_id: str
    passed: bool
    error_code: str | None = None
    attempts: int = 0
    card_correct: int = 0
    card_total: int = 0
    asset_hits: int = 0
    asset_total: int = 0
    text_hits: int = 0
    text_total: int = 0
    chapter_count: int = 0
    chapter_ok: bool = True
    notes: list[str] = field(default_factory=list)


def _by_id(page: dict[str, Any]) -> dict[str, dict]:
    """把 components 列表建成 id→组件 的字典。"""
    return {c.get("id"): c for c in page.get("components", []) if isinstance(c, dict)}


def _chapters(page: dict[str, Any]) -> list[dict]:
    """按 root.children 顺序取出所有 Chapter 组件。

    Args:
        page: 页面 JSON。

    Returns:
        Chapter 组件列表（顺序即页面自上而下的章节顺序）。
    """
    by_id = _by_id(page)
    root = by_id.get("root", {})
    return [
        by_id[cid]
        for cid in root.get("children", [])
        if cid in by_id and by_id[cid].get("component") == "Chapter"
    ]


def _cards_of(chapter: dict[str, Any], by_id: dict[str, dict]) -> list[dict]:
    """按 children 顺序取出某章节内的卡片组件（跳过背景图/标题）。

    Args:
        chapter: Chapter 组件。
        by_id: id→组件 字典。

    Returns:
        该章节内的卡片组件列表（顺序即排版顺序）。
    """
    return [
        by_id[cid]
        for cid in chapter.get("children", [])
        if cid in by_id and by_id[cid].get("component") in CARD_TYPES
    ]


def _used_image_urls(page: dict[str, Any]) -> set[str]:
    """收集页面实际用到的图片 url 集合。

    大致逻辑：通过校验的页面已清理孤儿，``data.images`` 里都是被引用的，故直接取其 url 即可。

    Args:
        page: 页面 JSON。

    Returns:
        被用到的图片 url 集合。
    """
    images = page.get("data", {}).get("images", {})
    return {v["url"] for v in images.values() if isinstance(v, dict) and v.get("url")}


def _text_values(page: dict[str, Any]) -> list[str]:
    """取页面所有文案值（用于文案保真匹配）。"""
    return [v for v in page.get("data", {}).get("texts", {}).values() if isinstance(v, str)]


def score_case(
    case: dict[str, Any],
    page: dict[str, Any] | None,
    *,
    error_code: str | None = None,
    attempts: int = 0,
) -> CaseScore:
    """对一题打分：拿生成结果与该题标注比对，产出 ``CaseScore``。

    大致逻辑：失败（page 为 None）则只记 passed=False 与错误码、标注总数照常计入（命中为 0）；
    成功则按标注逐项核对——卡片槽位定位到「第 c 章第 k 张卡」比对类型是否在可接受集合、
    应命中素材是否出现在页面、必含文案是否进 data.texts、章节数是否在区间内。

    Args:
        case: 题目（含 ``user_prompt`` / ``asset_manifest`` / ``expect`` 标注）。
        page: 生成出的页面 JSON；失败时为 None。
        error_code: 失败时的错误码。
        attempts: 实际调用模型次数。

    Returns:
        该题的 ``CaseScore``。
    """
    expect = case.get("expect", {})
    slots = expect.get("card_slots", [])
    expected_assets = expect.get("expected_assets", [])
    must_texts = expect.get("must_contain_texts", [])
    score = CaseScore(
        case_id=case["id"],
        passed=page is not None,
        error_code=error_code,
        attempts=attempts,
        card_total=len(slots),
        asset_total=len(expected_assets),
        text_total=len(must_texts),
    )

    if page is None:
        score.notes.append(f"生成失败：{error_code}")
        return score

    # —— 卡片选对：按 (章节序, 卡片序) 定位，比对类型是否在可接受集合 ——
    by_id = _by_id(page)
    chapters = _chapters(page)
    score.chapter_count = len(chapters)
    for slot in slots:
        ci, ki = slot.get("chapter", 0), slot.get("card", 0)
        accept = set(slot.get("accept", []))
        if ci < len(chapters):
            cards = _cards_of(chapters[ci], by_id)
            if ki < len(cards):
                got = cards[ki].get("component")
                if got in accept:
                    score.card_correct += 1
                else:
                    score.notes.append(f"第{ci}章第{ki}卡 期望{sorted(accept)} 实得 {got}")
                continue
        score.notes.append(f"第{ci}章第{ki}卡 缺失")

    # —— 素材命中：应命中的 url 是否出现在页面 ——
    used = _used_image_urls(page)
    for url in expected_assets:
        if url in used:
            score.asset_hits += 1
        else:
            score.notes.append(f"素材未用: {url}")

    # —— 文案保真：必含文案是否原样出现在 data.texts ——
    texts = _text_values(page)
    for expected in must_texts:
        if any(expected in v for v in texts):
            score.text_hits += 1
        else:
            score.notes.append(f"文案缺失/被改写: {expected[:24]}…")

    # —— 章节数区间 ——
    lo = expect.get("min_chapters")
    hi = expect.get("max_chapters")
    if lo is not None and score.chapter_count < lo:
        score.chapter_ok = False
        score.notes.append(f"章节数 {score.chapter_count} < 期望最少 {lo}")
    if hi is not None and score.chapter_count > hi:
        score.chapter_ok = False
        score.notes.append(f"章节数 {score.chapter_count} > 期望最多 {hi}")

    return score


@dataclass
class EvalSummary:
    """全题库汇总指标。

    Attributes:
        total: 总题数。
        passed: 产出合法页面的题数。
        card_correct / card_total: 卡片槽位命中 / 标注总数（仅 passed 题）。
        asset_hits / asset_total: 素材命中 / 应命中总数（仅 passed 题）。
        text_hits / text_total: 文案保真命中 / 标注总数（仅 passed 题）。
        chapter_ok: 章节数达标的题数（仅 passed 题）。
        total_attempts: 累计模型调用次数（含重试），用于算平均。
    """

    total: int = 0
    passed: int = 0
    card_correct: int = 0
    card_total: int = 0
    asset_hits: int = 0
    asset_total: int = 0
    text_hits: int = 0
    text_total: int = 0
    chapter_ok: int = 0
    total_attempts: int = 0

    @property
    def pass_rate(self) -> float:
        """Schema 合格率 = 产出合法页面题数 / 总题数。"""
        return self.passed / self.total if self.total else 0.0

    @property
    def card_rate(self) -> float:
        """卡片选对率 = 命中槽位 / 标注槽位（无标注记 1.0）。"""
        return self.card_correct / self.card_total if self.card_total else 1.0

    @property
    def asset_rate(self) -> float:
        """素材命中率 = 命中素材 / 应命中素材（无标注记 1.0）。"""
        return self.asset_hits / self.asset_total if self.asset_total else 1.0

    @property
    def text_rate(self) -> float:
        """文案保真率 = 命中文案 / 标注文案（无标注记 1.0）。"""
        return self.text_hits / self.text_total if self.text_total else 1.0


def aggregate(scores: list[CaseScore]) -> EvalSummary:
    """把多题 ``CaseScore`` 汇总成 ``EvalSummary``。

    大致逻辑：合格率按全部题统计；卡片/素材/文案三项**只在 passed 题上**累加分子分母
    （无效页面无法评判内容质量），避免失败题污染内容指标。

    Args:
        scores: 各题得分列表。

    Returns:
        汇总指标 ``EvalSummary``。
    """
    s = EvalSummary(total=len(scores))
    for sc in scores:
        s.total_attempts += sc.attempts
        if not sc.passed:
            continue
        s.passed += 1
        s.card_correct += sc.card_correct
        s.card_total += sc.card_total
        s.asset_hits += sc.asset_hits
        s.asset_total += sc.asset_total
        s.text_hits += sc.text_hits
        s.text_total += sc.text_total
        s.chapter_ok += int(sc.chapter_ok)
    return s


__all__ = ["CaseScore", "EvalSummary", "score_case", "aggregate", "CARD_TYPES"]
