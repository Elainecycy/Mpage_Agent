"""组件 Catalog：页面 JSON 契约的机器可校验 Schema 与两层校验入口。

本模块承载页面 JSON 的**两层校验**（设计文档 §4.5）：
- 第一层 ``validate_page``（本文件）：JSON Schema，字段类型/必填/枚举，单一真源是
  ``page_schema.json``；
- 第二层 ``check_integrity`` / ``prune_orphan_data_keys``（见 ``integrity.py``）：引用闭合、
  id 唯一、URL 白名单等 Schema 查不出的图结构问题。

两者从本包统一导出，调用方 ``from app.catalog import validate_page, check_integrity``。
"""

from __future__ import annotations

import copy
import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from jsonschema.validators import Draft202012Validator

from app.catalog.integrity import (
    IntegrityReport,
    check_integrity,
    prune_orphan_data_keys,
)

_SCHEMA_PATH = Path(__file__).with_name("page_schema.json")
_EXAMPLE_PATH = Path(__file__).with_name("example_page.json")


@lru_cache(maxsize=1)
def load_page_schema() -> dict[str, Any]:
    """加载页面 JSON 契约的 JSON Schema（Draft 2020-12）。

    大致逻辑：从与本模块同目录的 ``page_schema.json`` 读取并解析；结果进程内缓存，
    避免每次校验都读盘。Schema 文件是格式契约的单一真源，修改格式只改该文件。

    Args:
        无。

    Returns:
        解析后的 JSON Schema 字典（顶层含 ``type`` / ``properties`` / ``$defs`` 等）。

    Raises:
        FileNotFoundError: ``page_schema.json`` 不存在时抛出。
        json.JSONDecodeError: Schema 文件本身不是合法 JSON 时抛出。
    """
    with _SCHEMA_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def get_validator() -> Draft202012Validator:
    """构造并缓存页面 JSON 的 Draft 2020-12 校验器。

    大致逻辑：取出 ``load_page_schema`` 的结果 → 先 ``check_schema`` 自检 Schema 合法
    （防止改坏 Schema 文件后静默失效）→ 构造可复用的 ``Draft202012Validator``。

    Args:
        无。

    Returns:
        已绑定页面 JSON Schema、可重复使用的 ``Draft202012Validator`` 实例。

    Raises:
        jsonschema.exceptions.SchemaError: Schema 文件本身不符合 Draft 2020-12 规范时抛出。
    """
    schema = load_page_schema()
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema)


@lru_cache(maxsize=1)
def _load_example_raw() -> dict[str, Any]:
    """读取并缓存附录 A 标准页面示例（MVP 唯一 few-shot 的原始 dict）。

    Returns:
        解析后的示例页面 JSON dict（缓存的共享实例，勿直接改动；外部请用
        ``load_example_page`` 取独立副本）。
    """
    with _EXAMPLE_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_example_page() -> dict[str, Any]:
    """返回附录 A 标准页面示例的独立副本（Prompt few-shot 与测试的单一真源）。

    大致逻辑：取缓存的原始 dict 做深拷贝返回，保证调用方随意改动不污染缓存、也不互相
    影响。该示例是无坐标版（MVP），既作 Prompt 组装的唯一 few-shot，也是校验测试的标准正例。

    Args:
        无。

    Returns:
        附录 A 页面 JSON 的深拷贝 dict（含 ``components`` + ``data.texts`` / ``data.images``）。
    """
    return copy.deepcopy(_load_example_raw())


def validate_page(page: dict[str, Any]) -> list[str]:
    """对页面 JSON 做第一层（JSON Schema）校验，返回人类/模型可读的错误列表。

    大致逻辑：用缓存的校验器收集全部错误（不止第一条）→ 按错误所在路径排序 →
    把每条错误格式化成「定位 + 原因」字符串，便于直接回灌模型自愈（设计文档 §4.3）。
    本函数只覆盖第一层，通过不代表整页合法，仍需第二层引用完整性校验兜底。

    Args:
        page: 待校验的页面 JSON（已解析为 dict）。

    Returns:
        错误描述字符串列表；**空列表表示通过第一层校验**。每条形如
        ``"components/3/content: 'path' is a required property"``。

    Example:
        >>> errs = validate_page({"components": [], "data": {"texts": {}, "images": {}}})
        >>> errs  # components 不满足 minItems=1
        ["components: [] is too short"]
    """
    validator = get_validator()
    errors: list[str] = []
    for err in sorted(validator.iter_errors(page), key=lambda e: list(e.path)):
        loc = "/".join(str(p) for p in err.path) or "<root>"
        errors.append(f"{loc}: {err.message}")
    return errors


__all__ = [
    "load_page_schema",
    "get_validator",
    "validate_page",
    "load_example_page",
    "IntegrityReport",
    "check_integrity",
    "prune_orphan_data_keys",
]
