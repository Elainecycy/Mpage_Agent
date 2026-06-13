# 模型冒烟判分：对单次输出做轻量校验（设计文档 §4.5 check_integrity 的简化版）
# FATAL = 完全不可用；ERROR = 校验不过；WARN = 不影响判定但要记录

import json

# 组件上可能出现 path 引用的字段
REF_FIELDS = ("content", "src", "backgroundImage", "title", "description")
CONTAINERS = {"Page", "Header", "Chapter"}
CARDS = {"TextCard", "IconCard", "BackgroundTextCard"}
LEAVES = {"BackgroundImage", "Text", "Icon"} | CARDS
KNOWN = CONTAINERS | LEAVES


def parse_output(raw: str):
    """剥离 markdown 包裹后解析 JSON。返回 (page或None, 问题列表)。"""
    issues = []
    text = raw.strip()
    if text.startswith("```"):
        issues.append("WARN: 输出带了 markdown 代码块包裹")
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
    try:
        return json.loads(text), issues
    except json.JSONDecodeError as e:
        issues.append(f"FATAL: JSON 解析失败: {e}")
        return None, issues


def smoke_check(raw: str, manifest_urls: set) -> list:
    """返回问题列表（带 FATAL/ERROR/WARN 前缀），空列表 = 完全通过。"""
    page, issues = parse_output(raw)
    if page is None:
        return issues

    comps = page.get("components")
    if not isinstance(comps, list) or not comps:
        return issues + ["FATAL: 缺少 components 数组"]

    ids = [c.get("id") for c in comps]
    id_set = set(ids)
    texts = page.get("data", {}).get("texts", {})
    images = page.get("data", {}).get("images", {})

    # id 唯一 + 必须有 root Page
    if len(ids) != len(id_set):
        dup = sorted({i for i in ids if ids.count(i) > 1})
        issues.append(f"ERROR: 组件 id 重复: {dup}")
    roots = [c for c in comps if c.get("id") == "root"]
    if len(roots) != 1 or roots[0].get("component") != "Page":
        issues.append("ERROR: 必须存在唯一 id=root 且 component=Page 的根组件")

    for c in comps:
        cid = c.get("id", "<无id>")
        ctype = c.get("component")
        if ctype not in KNOWN:
            issues.append(f"ERROR: {cid} 使用了未定义的组件类型: {ctype}")

        # children 引用闭合；叶子组件不应有 children
        children = c.get("children")
        if children is not None:
            if ctype in LEAVES:
                issues.append(f"ERROR: 叶子组件 {cid}({ctype}) 不应有 children")
            for ch in children:
                if ch not in id_set:
                    issues.append(f"ERROR: {cid}.children 引用了不存在的 id: {ch}")

        # path 引用可解析；文案/图片字段禁止内联裸字符串
        for field in REF_FIELDS:
            ref = c.get(field)
            if ref is None:
                continue
            if isinstance(ref, str):
                issues.append(f"ERROR: {cid}.{field} 内联了裸字符串，应写 path 引用")
                continue
            if isinstance(ref, dict) and "path" in ref:
                ns, _, key = ref["path"].lstrip("/").partition("/")
                pool = {"texts": texts, "images": images}.get(ns)
                if pool is None or key not in pool:
                    issues.append(f"ERROR: {cid}.{field} 的 path 无法解析: {ref['path']}")

        # MVP 不要求坐标，输出了也不算错，但要记录（说明没听话）
        if "position" in c or "size" in c:
            issues.append(f"WARN: {cid} 输出了 position/size（MVP 不要求）")

    # URL 白名单——最关键的一条：编造图片地址直接判 ERROR
    for k, v in images.items():
        if not isinstance(v, dict) or not v.get("url"):
            issues.append(f"ERROR: data.images.{k} 缺少 url")
        elif v["url"] not in manifest_urls:
            issues.append(f"ERROR: data.images.{k}.url 不在素材清单内（编造）: {v['url']}")

    return issues


def case_checks(raw: str, case: dict) -> list:
    """用例级的额外期望（可选字段：must_contain_texts / min_chapters）。"""
    page, _ = parse_output(raw)
    if page is None:
        return []
    issues = []
    text_values = list(page.get("data", {}).get("texts", {}).values())
    for expected in case.get("must_contain_texts", []):
        if not any(expected in v for v in text_values if isinstance(v, str)):
            issues.append(f"ERROR: 期望文案未原样出现在 data.texts: {expected[:30]}…")
    min_ch = case.get("min_chapters")
    if min_ch is not None:
        n = sum(1 for c in page.get("components", []) if c.get("component") == "Chapter")
        if n < min_ch:
            issues.append(f"ERROR: 期望至少 {min_ch} 个 Chapter，实际 {n} 个")
    return issues


def is_pass(issues: list) -> bool:
    """无 FATAL 且无 ERROR 即为一次通过（WARN 不影响）。"""
    return not any(i.startswith(("FATAL", "ERROR")) for i in issues)


def fabricated_url_count(issues: list) -> int:
    return sum(1 for i in issues if "编造" in i)
