"""判分器单测（任务 1.11）：用假数据验证打分逻辑，不依赖真模型。"""

from eval.scorer import aggregate, score_case

# 标准题：2 章节；第0章第0卡应为背景文字卡，第1章两卡分别为图标卡、文字卡
_CASE = {
    "id": "t",
    "expect": {
        "min_chapters": 2, "max_chapters": 2,
        "card_slots": [
            {"chapter": 0, "card": 0, "accept": ["BackgroundTextCard"]},
            {"chapter": 1, "card": 0, "accept": ["IconCard"]},
            {"chapter": 1, "card": 1, "accept": ["TextCard"]},
        ],
        "expected_assets": ["https://x/a.png"],
        "must_contain_texts": ["你好世界"],
    },
}


def _page(chapters: list[list[str]], images: dict | None = None, texts: dict | None = None) -> dict:
    """据「每章卡片类型列表」拼一个最小页面（仅供判分读取结构，不必通过校验）。

    Args:
        chapters: 外层每项是一个章节，内层是该章节卡片的 component 类型列表。
        images: data.images（key→{url}）。
        texts: data.texts（key→文案）。

    Returns:
        最小页面 JSON dict。
    """
    comps: list[dict] = [{"id": "root", "component": "Page", "children": []}]
    chapter_ids: list[str] = []
    for ci, cards in enumerate(chapters):
        chid = f"ch{ci}"
        chapter_ids.append(chid)
        kids: list[str] = []
        for ki, ctype in enumerate(cards):
            cid = f"c{ci}_{ki}"
            kids.append(cid)
            comps.append({"id": cid, "component": ctype})
        comps.append({"id": chid, "component": "Chapter", "children": kids})
    comps[0]["children"] = chapter_ids
    return {"components": comps, "data": {"texts": texts or {}, "images": images or {}}}


_PERFECT = _page(
    [["BackgroundTextCard"], ["IconCard", "TextCard"]],
    images={"k": {"url": "https://x/a.png"}},
    texts={"t": "你好世界，欢迎光临"},
)


def test_perfect_full_marks() -> None:
    """完全匹配：卡片/素材/文案全中，章节数达标。"""
    sc = score_case(_CASE, _PERFECT, attempts=1)
    assert sc.passed
    assert (sc.card_correct, sc.card_total) == (3, 3)
    assert (sc.asset_hits, sc.asset_total) == (1, 1)
    assert (sc.text_hits, sc.text_total) == (1, 1)
    assert sc.chapter_ok


def test_wrong_card_type_counts_as_miss() -> None:
    """第0章卡片类型不在可接受集合 → 该槽不计分。"""
    page = _page([["TextCard"], ["IconCard", "TextCard"]], images={"k": {"url": "https://x/a.png"}})
    sc = score_case(_CASE, page)
    assert sc.card_correct == 2


def test_missing_slot_counts_as_miss() -> None:
    """第1章只生成 1 张卡，缺的第 2 张槽位算未命中。"""
    page = _page([["BackgroundTextCard"], ["IconCard"]], images={"k": {"url": "https://x/a.png"}})
    sc = score_case(_CASE, page)
    assert sc.card_correct == 2


def test_asset_and_text_miss() -> None:
    """素材没用上、文案被改写 → 各记 0 命中。"""
    page = _page([["BackgroundTextCard"], ["IconCard", "TextCard"]], images={}, texts={"t": "别的内容"})
    sc = score_case(_CASE, page)
    assert sc.asset_hits == 0
    assert sc.text_hits == 0


def test_chapter_count_out_of_range() -> None:
    """章节数不在 [min,max] → chapter_ok 为 False。"""
    page = _page([["BackgroundTextCard"]], images={"k": {"url": "https://x/a.png"}}, texts={"t": "你好世界"})
    sc = score_case(_CASE, page)
    assert sc.chapter_ok is False


def test_failed_case_records_totals_no_hits() -> None:
    """生成失败：passed=False，标注总数照计、命中为 0。"""
    sc = score_case(_CASE, None, error_code="generation_failed")
    assert sc.passed is False
    assert sc.error_code == "generation_failed"
    assert (sc.card_correct, sc.card_total) == (0, 3)


def test_aggregate_only_counts_passed_for_content() -> None:
    """汇总：合格率含全部题；卡片/素材/文案分母只算合格题。"""
    summary = aggregate(
        [score_case(_CASE, _PERFECT, attempts=1), score_case(_CASE, None, error_code="x")]
    )
    assert summary.total == 2
    assert summary.passed == 1
    assert summary.pass_rate == 0.5
    # 内容指标只统计 passed 的那题
    assert (summary.card_correct, summary.card_total) == (3, 3)
    assert summary.card_rate == 1.0
    assert summary.asset_rate == 1.0
