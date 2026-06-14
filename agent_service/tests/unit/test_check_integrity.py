"""页面 JSON 第二层（引用完整性 + 图结构）校验单测。

验收技改 §4.4.2「设计方案 §4.5 列出的每条规则均有单元测试，且每条配至少 1 个反例」。
正例用附录 A 标准页面（配齐白名单 manifest 应零错误），反例逐条构造典型非法输出。
"""

import copy

from app.catalog import (
    check_integrity,
    load_example_page,
    prune_orphan_data_keys,
    validate_page,
)


def _appendix_a() -> dict:
    """取附录 A 标准页面的独立副本（单一真源 app/catalog/example_page.json）。

    Returns:
        附录 A 页面 JSON 的独立副本（dict，深拷贝，各用例互不污染）。
    """
    return load_example_page()


def _manifest_for(page: dict) -> list[dict]:
    """据页面 ``data.images`` 现有 url 造一份「全部命中」的白名单 manifest。

    Args:
        page: 页面 JSON。

    Returns:
        形如 ``[{"url": ..., "name": ...}]`` 的素材清单，覆盖页面用到的所有图片 url。
    """
    return [
        {"url": v["url"], "name": v.get("name", "")}
        for v in page["data"]["images"].values()
        if isinstance(v, dict) and v.get("url")
    ]


# ——————————————————— 正例 ———————————————————


def test_appendix_a_passes_layer1_and_layer2() -> None:
    """附录 A 同时通过第一层与第二层校验，且无告警、无孤儿 key（任务 1.2 验收正例）。"""
    page = _appendix_a()
    assert validate_page(page) == []  # 第一层先过，确认两层不打架
    report = check_integrity(page, _manifest_for(page))
    assert report.ok
    assert report.errors == []
    assert report.warnings == []
    assert report.orphan_data_keys == []


# ——————————————————— 规则 1：id 唯一 ———————————————————


def test_duplicate_id_rejected() -> None:
    """两个组件用同一 id 应报错。"""
    page = _appendix_a()
    page["components"].append({"id": "icon-1", "component": "TextCard", "content": {"path": "/texts/card3Text"}})
    report = check_integrity(page, _manifest_for(page))
    assert not report.ok
    assert any("重复的组件 id" in e for e in report.errors)


# ——————————————————— 规则 2：唯一 root(Page) ———————————————————


def test_missing_root_rejected() -> None:
    """没有 id=root 的根组件应报错。"""
    page = _appendix_a()
    page["components"][0]["id"] = "not-root"  # 把 root 改名
    report = check_integrity(page, _manifest_for(page))
    assert any("root" in e for e in report.errors)


def test_root_wrong_type_rejected() -> None:
    """id=root 但 component 不是 Page 应报错。"""
    page = _appendix_a()
    page["components"][0]["component"] = "Chapter"
    report = check_integrity(page, _manifest_for(page))
    assert any("root" in e for e in report.errors)


# ——————————————————— 规则 3：children 引用闭合 ———————————————————


def test_dangling_child_ref_rejected() -> None:
    """children 引用了不存在的 id 应报错。"""
    page = _appendix_a()
    page["components"][0]["children"].append("ghost-id")
    report = check_integrity(page, _manifest_for(page))
    assert any("不存在的 id: ghost-id" in e for e in report.errors)


# ——————————————————— 规则 4：叶子不得带 children ———————————————————


def test_leaf_with_children_rejected() -> None:
    """叶子组件（如 TextCard）带 children 应报错。"""
    page = _appendix_a()
    for c in page["components"]:
        if c["id"] == "card-text-1":
            c["children"] = []  # 叶子不该有此字段
    report = check_integrity(page, _manifest_for(page))
    assert any("不应有 children" in e for e in report.errors)


# ——————————————————— 规则 5：path 绑定 ———————————————————


def test_inline_bare_string_ref_rejected() -> None:
    """文案字段写裸字符串（非 path 引用）应报错。"""
    page = _appendix_a()
    for c in page["components"]:
        if c["id"] == "card-text-1":
            c["content"] = "直接写死的文案"
    report = check_integrity(page, _manifest_for(page))
    assert any("内联了裸字符串" in e for e in report.errors)


def test_unresolvable_text_path_rejected() -> None:
    """path 指向 data.texts 中不存在的 key 应报错。"""
    page = _appendix_a()
    for c in page["components"]:
        if c["id"] == "card-text-1":
            c["content"] = {"path": "/texts/doesNotExist"}
    report = check_integrity(page, _manifest_for(page))
    assert any("不存在的文案: /texts/doesNotExist" in e for e in report.errors)


def test_illegal_path_namespace_rejected() -> None:
    """path 命名空间既非 /texts/ 也非 /images/ 应报错。"""
    page = _appendix_a()
    for c in page["components"]:
        if c["id"] == "card-text-1":
            c["content"] = {"path": "/colors/red"}
    report = check_integrity(page, _manifest_for(page))
    assert any("非法 path" in e for e in report.errors)


# ——————————————————— 规则 6：URL 白名单（防编造）———————————————————


def test_image_missing_url_rejected() -> None:
    """data.images 某项缺 url 应报错。"""
    page = _appendix_a()
    page["data"]["images"]["badge"] = {"name": "no_url.png"}
    report = check_integrity(page, _manifest_for(page))
    assert any("data.images.badge 缺少 url" in e for e in report.errors)


def test_fabricated_url_rejected() -> None:
    """编造的图片 url（不在素材清单内）必须 100% 被拦下（对应冒烟 case4）。"""
    page = _appendix_a()
    manifest = _manifest_for(page)  # 先按原图建白名单
    page["data"]["images"]["badge"]["url"] = "https://evil.example.com/fake.png"
    report = check_integrity(page, manifest)
    assert not report.ok
    assert any("疑似编造" in e and "fake.png" in e for e in report.errors)


def test_empty_manifest_flags_all_images() -> None:
    """素材清单为空时，任何图片 url 都判为编造（白名单口径自检）。"""
    page = _appendix_a()
    report = check_integrity(page, [])
    fabricated = [e for e in report.errors if "疑似编造" in e]
    assert len(fabricated) == len(page["data"]["images"])


# ——————————————————— 规则 7：孤儿组件 ———————————————————


def test_orphan_component_rejected() -> None:
    """未被任何 children 引用的组件（root 除外）应报错。"""
    page = _appendix_a()
    page["components"].append(
        {"id": "floating", "component": "TextCard", "content": {"path": "/texts/card3Text"}}
    )
    report = check_integrity(page, _manifest_for(page))
    assert any("孤儿组件" in e and "floating" in e for e in report.errors)


# ——————————————————— 规则 8：children 成环 ———————————————————


def test_cycle_detected() -> None:
    """children 形成环（从 root 可回到自身）应报错，避免 Mapper 还原树死循环。"""
    page = {
        "components": [
            {"id": "root", "component": "Page", "children": ["loop"]},
            {"id": "loop", "component": "Chapter", "children": ["loop"]},  # 自环
        ],
        "data": {"texts": {}, "images": {}},
    }
    report = check_integrity(page, [])
    assert any("环" in e for e in report.errors)


# ——————————————————— 规则 9：父子类型约束 ———————————————————


def test_icon_outside_header_rejected() -> None:
    """Icon 出现在 Chapter 内（应只在 Header）应报错。"""
    page = _appendix_a()
    page["components"].append(
        {"id": "stray-icon", "component": "Icon", "src": {"path": "/images/cardIcon1"}}
    )
    for c in page["components"]:
        if c["id"] == "chapter-2":
            c["children"].append("stray-icon")
    report = check_integrity(page, _manifest_for(page))
    assert any("不应出现在此容器" in e and "stray-icon" in e for e in report.errors)


def test_card_outside_chapter_rejected() -> None:
    """卡片出现在 Header 内（应只在 Chapter）应报错。"""
    page = _appendix_a()
    page["components"].append(
        {"id": "stray-card", "component": "TextCard", "content": {"path": "/texts/card3Text"}}
    )
    for c in page["components"]:
        if c["id"] == "header-1":
            c["children"].append("stray-card")
    report = check_integrity(page, _manifest_for(page))
    assert any("不应出现在此容器" in e and "stray-card" in e for e in report.errors)


# ——————————————————— 规则 10：孤儿 data key（软问题）———————————————————


def test_orphan_data_key_is_warning_not_error() -> None:
    """未被引用的 data key 只记告警、不报错，且列入 orphan_data_keys。"""
    page = _appendix_a()
    page["data"]["texts"]["unusedNote"] = "没人引用的文案"
    # 复用已在白名单内的 url，避免触发编造判定，单独隔离「孤儿图片 key」
    page["data"]["images"]["unusedImg"] = {"url": page["data"]["images"]["badge"]["url"]}
    report = check_integrity(page, _manifest_for(page))
    assert report.ok  # 软问题不影响通过
    assert report.errors == []
    assert "/texts/unusedNote" in report.orphan_data_keys
    assert "/images/unusedImg" in report.orphan_data_keys
    assert report.warnings  # 有可读告警


def test_prune_orphan_data_keys_removes_them() -> None:
    """prune_orphan_data_keys 按报告清掉孤儿 key 并返回实际删除项。"""
    page = _appendix_a()
    page["data"]["texts"]["unusedNote"] = "x"
    page["data"]["images"]["unusedImg"] = {"url": page["data"]["images"]["badge"]["url"]}
    report = check_integrity(page, _manifest_for(page))

    removed = prune_orphan_data_keys(page, report.orphan_data_keys)

    assert set(removed) == {"/texts/unusedNote", "/images/unusedImg"}
    assert "unusedNote" not in page["data"]["texts"]
    assert "unusedImg" not in page["data"]["images"]
    # 清理后再校验应彻底干净
    assert check_integrity(page, _manifest_for(page)).orphan_data_keys == []


def test_prune_is_noop_for_missing_keys() -> None:
    """传入不存在的孤儿 key 时 prune 安全跳过，返回空列表。"""
    page = _appendix_a()
    assert prune_orphan_data_keys(page, ["/texts/nope", "/images/nope", "/bad/path"]) == []


# ——————————————————— 综合：纯函数、不改入参 ———————————————————


def test_check_integrity_does_not_mutate_input() -> None:
    """check_integrity 是纯函数：即使发现孤儿 key 也不改动入参 page。"""
    page = _appendix_a()
    page["data"]["texts"]["unusedNote"] = "x"
    before = copy.deepcopy(page)
    check_integrity(page, _manifest_for(page))
    assert page == before
