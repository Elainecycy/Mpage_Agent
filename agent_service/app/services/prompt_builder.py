"""Prompt 组装器（任务 1.3 / 技改 F2）：拼出给模型的 system prompt 与 user message。

按设计文档 §4.3 的五段结构产出 system prompt：角色 → 工作步骤 → 规则 → 组件字段速查
→ 完整 few-shot 示例。组装代码与「Catalog 定义」分离——五段静态文案与字段表放在模板
``prompts/system_prompt.md``，few-shot 输出 JSON 从 ``app.catalog.load_example_page`` 注入；
**新增一种卡片类型只需改模板字段表与示例 JSON，本文件零改动**（技改 §4.2.2 第 2 条）。

few-shot 示例在组装时会跑一遍两层校验（示例自身必须合法，技改 §4.2.2 第 1 条），不合法
直接抛错、不带病上线。生成请求的完整 prompt 由本模块产出确定性字符串，便于服务层按
traceId 脱敏落盘（技改 §4.2.2 第 3 条，落盘动作属服务层）。
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.catalog import check_integrity, load_example_page, validate_page

# 模板里 few-shot「输出」JSON 的占位符；组装时替换为校验过的标准示例
_EXAMPLE_PLACEHOLDER = "{{EXAMPLE_OUTPUT_JSON}}"
_TEMPLATE_PATH = Path(__file__).with_name("prompts") / "system_prompt.md"


def _manifest_from_example(example: dict[str, Any]) -> list[dict[str, str]]:
    """据 few-shot 示例自身的 data.images 反推一份「全命中」白名单 manifest。

    大致逻辑：示例里所有图片 url 即视为其素材清单——这样用示例自校验时，第二层 URL
    白名单不会把示例自带的图片误判为编造。

    Args:
        example: 标准 few-shot 页面 JSON。

    Returns:
        形如 ``[{"url": ..., "name": ...}]`` 的素材清单。
    """
    return [
        {"url": v["url"], "name": v.get("name", "")}
        for v in example.get("data", {}).get("images", {}).values()
        if isinstance(v, dict) and v.get("url")
    ]


@lru_cache(maxsize=1)
def build_system_prompt() -> str:
    """组装并缓存 system prompt（注入校验通过的 few-shot 示例）。

    大致逻辑：读模板 md → 加载标准示例并对其连跑两层校验（``validate_page`` +
    ``check_integrity``，以示例自身图片为白名单）→ 不合法立即抛错（few-shot 必须自洽）
    → 把示例按 ``indent=2`` 美化为 JSON 文本替换模板占位符 → 返回完整 system prompt。
    结果进程内缓存（模板与示例均为静态资源，组装一次即可复用）。

    Args:
        无。

    Returns:
        完整 system prompt 字符串（五段结构 + 合法 few-shot）。

    Raises:
        FileNotFoundError: 模板文件缺失时抛出。
        ValueError: 模板缺占位符，或 few-shot 示例未通过两层校验时抛出（带具体错误）。
    """
    template = _TEMPLATE_PATH.read_text(encoding="utf-8")
    if _EXAMPLE_PLACEHOLDER not in template:
        raise ValueError(f"system prompt 模板缺少占位符 {_EXAMPLE_PLACEHOLDER}")

    example = load_example_page()
    schema_errors = validate_page(example)
    report = check_integrity(example, _manifest_from_example(example))
    if schema_errors or not report.ok:
        problems = "; ".join(schema_errors + report.errors)
        raise ValueError(f"few-shot 示例未通过校验，禁止注入 Prompt：{problems}")

    example_json = json.dumps(example, ensure_ascii=False, indent=2)
    return template.replace(_EXAMPLE_PLACEHOLDER, example_json)


def build_user_message(user_prompt: str, asset_manifest: list[dict[str, Any]]) -> str:
    """组装 user message：页面需求描述 + 素材清单 JSON。

    大致逻辑：把用户的自然语言需求与 assetManifest 拼成一段文本，并再次申明「图片只能
    从清单里选、禁止编造」，与 system prompt 规则呼应、强化约束。

    Args:
        user_prompt: 用户的页面需求描述（自然语言）。前后空白会被裁掉。
        asset_manifest: 素材清单，形如 ``[{"url": ..., "name"?: ..., "note"?: ...}]``，
            模型只能从中选图。

    Returns:
        拼好的 user message 字符串。
    """
    manifest_json = json.dumps(asset_manifest, ensure_ascii=False, indent=2)
    return (
        "页面需求：\n"
        f"{user_prompt.strip()}\n\n"
        "素材清单（assetManifest，图片 url 只能从这里选，禁止编造）：\n"
        f"{manifest_json}"
    )


def build_messages(user_prompt: str, asset_manifest: list[dict[str, Any]]) -> list[dict[str, str]]:
    """组装可直接交给 LLM 网关的消息列表（OpenAI Chat 格式）。

    大致逻辑：system 段取 ``build_system_prompt`` 的缓存结果，user 段由
    ``build_user_message`` 据本次请求拼装，返回 ``[{system}, {user}]``。供 1.4 生成服务
    与 1.4 自愈重试复用（自愈时在此基础上追加错误反馈消息，由生成服务负责）。

    Args:
        user_prompt: 用户的页面需求描述。
        asset_manifest: 本次请求的素材清单。

    Returns:
        形如 ``[{"role": "system", "content": ...}, {"role": "user", "content": ...}]``
        的消息列表。
    """
    return [
        {"role": "system", "content": build_system_prompt()},
        {"role": "user", "content": build_user_message(user_prompt, asset_manifest)},
    ]


__all__ = ["build_system_prompt", "build_user_message", "build_messages"]
