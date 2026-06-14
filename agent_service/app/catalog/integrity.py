"""页面 JSON「第二层校验」：引用完整性与图结构检查（设计文档 §4.5 第二层）。

第一层（``validate_page``，JSON Schema）只能查字段类型/必填/枚举；本模块负责 Schema
查不出的**图结构问题**：id 唯一、root 唯一、children 引用闭合、叶子不得带 children、
path 绑定可解析、``data.images`` 的 url 必须落在素材清单白名单内（防编造外链）、
孤儿组件、父子类型约束、children 成环等。

设计取舍：本模块为**纯函数**，``check_integrity`` 只产出报告、不改入参；孤儿 data key
属于「软问题」，只在报告里列出（``orphan_data_keys``），由服务端调用 ``prune_orphan_data_keys``
显式清理并落日志（对应技改 §4.4「降级为警告并由服务端自动清理，不触发重试」）。这样
「检查」与「清理」职责分离，二者都能单独单测，比设计文档示例里「边检边改」更清晰。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

# —— 组件类型分组（与设计文档 §3.3 Catalog 对齐）——
CONTAINER_TYPES: frozenset[str] = frozenset({"Page", "Header", "Chapter"})
CARD_TYPES: frozenset[str] = frozenset({"TextCard", "IconCard", "BackgroundTextCard"})
LEAF_TYPES: frozenset[str] = frozenset({"BackgroundImage", "Text", "Icon"}) | CARD_TYPES
KNOWN_TYPES: frozenset[str] = CONTAINER_TYPES | LEAF_TYPES

# 组件上可能承载 path 绑定的字段（文案 / 图片引用都在此列）
REF_FIELDS: tuple[str, ...] = ("content", "src", "backgroundImage", "title", "description")

# 各容器允许的直接子节点类型（设计文档 §3.3 / §3.4）。
# 用「白名单」一并表达两条规则：Icon 只能在 Header、卡片只能在 Chapter——
# 因为它们各自只出现在对应容器的允许集合里。
ALLOWED_CHILDREN: dict[str, frozenset[str]] = {
    "Page": frozenset({"Header", "Chapter"}),
    "Header": frozenset({"BackgroundImage", "Text", "Icon"}),
    "Chapter": frozenset({"BackgroundImage", "Text"}) | CARD_TYPES,
}


@dataclass(frozen=True)
class IntegrityReport:
    """第二层校验报告。

    Attributes:
        errors: **硬失败**问题列表（人类/模型可读）。非空即未通过，应回灌模型自愈重试
            （设计文档 §4.3）。每条形如 ``"chapter-1.children 引用了不存在的 id: ghost"``。
        warnings: **软问题**列表，仅供记录、不触发重试（如发现孤儿 data key）。
        orphan_data_keys: 未被任何组件引用的 data key（形如 ``/texts/foo``、``/images/bar``），
            供服务端调用 ``prune_orphan_data_keys`` 清理；与 ``warnings`` 里的描述对应。
    """

    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    orphan_data_keys: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        """是否通过第二层校验（无硬失败）。

        Returns:
            ``errors`` 为空时返回 ``True``；``warnings`` / ``orphan_data_keys`` 不影响判定。
        """
        return not self.errors


def _collect_path_refs(component: dict[str, Any]) -> list[tuple[str, Any]]:
    """收集单个组件上所有「文案/图片引用」字段的原始值。

    大致逻辑：遍历 ``REF_FIELDS``（content/src/backgroundImage/title/description），
    把存在的字段连同其原始值取出（值可能是合法的 ``{"path": ...}``、也可能是模型误写的
    裸字符串或畸形对象，交由调用方判定），不在此处做合法性裁决。

    Args:
        component: 单个组件节点 dict。

    Returns:
        ``(字段名, 字段原始值)`` 列表；组件不含任何引用字段时返回空列表。
    """
    return [(f, component[f]) for f in REF_FIELDS if f in component]


def check_integrity(page: dict[str, Any], asset_manifest: list[dict[str, Any]]) -> IntegrityReport:
    """对页面 JSON 做第二层（引用完整性 + 图结构）校验，产出报告。

    大致逻辑（不修改入参 ``page``）：
        1. 建 id 列表/集合 → 查重复 id、查唯一 root(Page)；
        2. 逐组件：未知类型跳过类型相关检查；叶子不得带 children；
           容器 children 逐个校验「引用闭合 + 父子类型约束」；
        3. 逐组件收集 path 引用：裸字符串报错、path 可解析到 ``data.texts`` /
           ``data.images`` 否则报错，并登记被用到的 data key；
        4. ``data.images`` 每项必须含 url，且 url 必须在素材清单白名单内（防编造，硬失败）；
        5. 孤儿组件（未被任何 children 引用，root 除外）报错；
        6. 从 root 做 DFS 检测 children 成环（会让 Mapper 递归还原树时死循环）；
        7. 未被引用的 data key 记为孤儿（软问题），列入 ``orphan_data_keys`` + ``warnings``，
           不报错、不在此处删除（清理交 ``prune_orphan_data_keys``）。

    本函数只负责第二层；调用前应已过第一层 ``validate_page``（真实管线中两层串联，
    第一层已挡住类型/必填问题，故本层主要兜图结构）。可独立单测。

    Args:
        page: 待校验的页面 JSON（dict，已解析）。约定含 ``components`` 列表与
            ``data.texts`` / ``data.images``；缺字段时按空处理、不抛错。
        asset_manifest: 素材清单，形如 ``[{"url": "...", "name": "..."}, ...]``。
            其 url 集合即图片白名单；空清单意味着任何图片 url 都会被判为编造。

    Returns:
        ``IntegrityReport``：``errors`` 非空表示未通过（应回灌重试）；``warnings`` /
        ``orphan_data_keys`` 描述可自动清理的孤儿 data key。

    Example:
        >>> manifest = [{"url": "https://cdn.example.com/bg.png"}]
        >>> page = {
        ...     "components": [
        ...         {"id": "root", "component": "Page", "children": ["bg"]},
        ...         {"id": "bg", "component": "BackgroundImage", "src": {"path": "/images/bg"}},
        ...     ],
        ...     "data": {"texts": {}, "images": {"bg": {"url": "https://cdn.example.com/bg.png"}}},
        ... }
        >>> check_integrity(page, manifest).ok
        True
    """
    errors: list[str] = []
    warnings: list[str] = []

    comps: list[dict[str, Any]] = page.get("components") or []
    data = page.get("data") or {}
    texts: dict[str, Any] = data.get("texts") or {}
    images: dict[str, Any] = data.get("images") or {}

    ids = [c.get("id") for c in comps]
    id_set = {i for i in ids if i is not None}
    comp_by_id = {c.get("id"): c for c in comps}

    # —— 规则 1：id 唯一 ——
    if len(ids) != len(set(ids)):
        dup = sorted({i for i in ids if ids.count(i) > 1}, key=lambda x: str(x))
        errors.append(f"存在重复的组件 id: {dup}")

    # —— 规则 2：有且仅有一个 id=root 且 component=Page 的根 ——
    roots = [c for c in comps if c.get("id") == "root"]
    if len(roots) != 1 or roots[0].get("component") != "Page":
        errors.append("必须存在唯一 id=root 且 component=Page 的根组件")

    # —— 规则 3/4/9：children 引用闭合、叶子不得带 children、父子类型约束 ——
    for c in comps:
        cid = c.get("id", "<无id>")
        ctype = c.get("component")
        children = c.get("children")

        if children is None:
            continue
        if ctype in LEAF_TYPES:
            errors.append(f"叶子组件 {cid}({ctype}) 不应有 children")
            # 叶子带 children 已是结构错误，但其引用仍逐个查闭合，便于一次性报全
        allowed = ALLOWED_CHILDREN.get(ctype) if ctype in CONTAINER_TYPES else None
        for ch in children:
            if ch not in id_set:
                errors.append(f"{cid}.children 引用了不存在的 id: {ch}")
                continue
            child_type = comp_by_id[ch].get("component")
            # 仅对已知子类型做父子约束，未知类型留给第一层枚举校验，避免重复报错
            if allowed is not None and child_type in KNOWN_TYPES and child_type not in allowed:
                errors.append(
                    f"{cid}({ctype}).children 含不应出现在此容器的子组件: {ch}({child_type})"
                )

    # —— 规则 5：path 绑定可解析；文案/图片字段禁止内联裸字符串 ——
    used_text_keys: set[str] = set()
    used_image_keys: set[str] = set()
    for c in comps:
        cid = c.get("id", "<无id>")
        for fname, ref in _collect_path_refs(c):
            if isinstance(ref, str):
                errors.append(f"{cid}.{fname} 内联了裸字符串，文案/图片字段必须写 path 引用")
                continue
            if not isinstance(ref, dict) or "path" not in ref:
                errors.append(f"{cid}.{fname} 引用格式非法（应为 {{\"path\": ...}}）")
                continue
            path = ref["path"]
            if not isinstance(path, str):
                errors.append(f"{cid}.{fname} 的 path 不是字符串: {path!r}")
                continue
            namespace, _, key = path.lstrip("/").partition("/")
            if namespace == "texts":
                used_text_keys.add(key)
                if key not in texts:
                    errors.append(f"{cid}.{fname} 绑定了不存在的文案: {path}")
            elif namespace == "images":
                used_image_keys.add(key)
                if key not in images:
                    errors.append(f"{cid}.{fname} 绑定了不存在的图片: {path}")
            else:
                errors.append(f"{cid}.{fname} 含非法 path（须以 /texts/ 或 /images/ 开头）: {path}")

    # —— 规则 6：data.images 每项含 url 且 url 必须在素材清单白名单内（防编造，硬失败）——
    manifest_urls = {
        a["url"] for a in asset_manifest if isinstance(a, dict) and isinstance(a.get("url"), str)
    }
    for k, v in images.items():
        if not isinstance(v, dict) or not v.get("url"):
            errors.append(f"data.images.{k} 缺少 url")
        elif v["url"] not in manifest_urls:
            errors.append(f"data.images.{k}.url 不在素材清单内（疑似编造）: {v['url']}")

    # —— 规则 7：孤儿组件（未被任何 children 引用，root 除外）——
    referenced = {ch for c in comps for ch in (c.get("children") or [])}
    for cid in sorted(id_set - referenced - {"root"}, key=lambda x: str(x)):
        errors.append(f"孤儿组件（未被任何 children 引用）: {cid}")

    # —— 规则 8：children 成环检测（从 root 出发 DFS，防 Mapper 还原树时死循环）——
    if "root" in comp_by_id:
        on_stack: set[str] = set()
        done: set[str] = set()
        reported_cycle = False

        def _walk(node_id: str) -> None:
            nonlocal reported_cycle
            if node_id in done or node_id not in comp_by_id:
                return
            if node_id in on_stack:
                if not reported_cycle:
                    errors.append(f"children 形成环（从 {node_id} 可回到自身），无法还原页面树")
                    reported_cycle = True
                return
            on_stack.add(node_id)
            for ch in comp_by_id[node_id].get("children") or []:
                _walk(ch)
            on_stack.discard(node_id)
            done.add(node_id)

        _walk("root")

    # —— 规则 10：孤儿 data key（软问题）——只登记不删除，交服务端清理 ——
    orphan_data_keys: list[str] = [f"/texts/{k}" for k in sorted(set(texts) - used_text_keys)]
    orphan_data_keys += [f"/images/{k}" for k in sorted(set(images) - used_image_keys)]
    if orphan_data_keys:
        warnings.append(f"孤儿 data key（未被引用，将自动清理）: {', '.join(orphan_data_keys)}")

    return IntegrityReport(errors=errors, warnings=warnings, orphan_data_keys=orphan_data_keys)


def prune_orphan_data_keys(page: dict[str, Any], orphan_data_keys: list[str]) -> list[str]:
    """从页面 JSON 中删除孤儿 data key（原地修改 ``page``）。

    大致逻辑：逐个解析形如 ``/texts/<key>`` / ``/images/<key>`` 的路径，命中则从
    ``page.data.texts`` / ``page.data.images`` 删除；不存在或路径非法则跳过。配合
    ``check_integrity`` 返回的 ``orphan_data_keys`` 使用——「检查」与「清理」分离，
    服务端清理后自行落日志（技改 §4.4「孤儿 data key 清理后日志留痕」）。

    Args:
        page: 页面 JSON（dict），将被**原地修改**。
        orphan_data_keys: 待删除的孤儿 key 路径列表（来自 ``IntegrityReport.orphan_data_keys``）。

    Returns:
        实际删除成功的 key 路径列表（便于调用方精确记录日志）；传入空列表或无命中时返回空列表。
    """
    data = page.get("data") or {}
    pools = {"texts": data.get("texts") or {}, "images": data.get("images") or {}}
    removed: list[str] = []
    for path in orphan_data_keys:
        namespace, _, key = path.lstrip("/").partition("/")
        pool = pools.get(namespace)
        if pool is not None and key in pool:
            del pool[key]
            removed.append(path)
    return removed


__all__ = [
    "IntegrityReport",
    "check_integrity",
    "prune_orphan_data_keys",
    "CONTAINER_TYPES",
    "CARD_TYPES",
    "LEAF_TYPES",
    "KNOWN_TYPES",
    "ALLOWED_CHILDREN",
]
