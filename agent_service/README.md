# Agent 服务（第 1 期 · 文字生成页面）

AI 页面生成 Agent 的服务端。上游文档见 [设计方案](../docs/ai-page-builder-agent.md)、
[迭代计划](../docs/development-iteration-plan.md)、[服务端技改](../docs/tech-spec-phase1-agent.md)。

当前进度：**准备期骨架（任务 0.2）+ 页面 JSON 契约 Schema（任务 1.1）已落地**——
服务可启动、健康检查可用、附录 A 标准示例可通过第一层校验。生成接口 F1~F5 为第 1 期后续任务。

## 目录

```
app/
  config.py            运行期配置（环境变量驱动的 Settings）
  main.py              FastAPI 应用工厂 + 全局异常处理
  api/routes/          路由：health（业务路由后续挂入）
  catalog/             页面 JSON 契约 + 两层校验 + few-shot 单一真源
    page_schema.json     格式契约（第一层 JSON Schema）
    integrity.py         第二层引用完整性校验（check_integrity）
    example_page.json    附录 A 标准示例（Prompt few-shot 与测试共用）
    __init__.py          校验/示例加载入口（validate_page / check_integrity / load_example_page）
  services/            生成链路服务
    prompt_builder.py    Prompt 组装（F2）：system prompt + user message
    prompts/             prompt 文案模板（system_prompt.md）
  models/ schemas/ utils/   预留模块（后续填充）
tests/
  unit/                单元测试（Schema 校验、引用完整性、Prompt 组装、空服务启动）
```

## 环境准备

需要 [uv](https://docs.astral.sh/uv/)（已在本机）。在本目录执行：

```bash
cd agent_service
uv sync                       # 创建 .venv（Python 3.12，由 .python-version 锁定）并装好依赖（含 dev）
cp .env.example .env          # 按需填写网关密钥等；.env 不入库
```

## 运行

```bash
uv run uvicorn app.main:app --reload --port 8000
curl http://127.0.0.1:8000/health
# -> {"status":"ok","service":"mpage-agent","model":"qwen-plus"}
```

## 测试

```bash
uv run pytest -q
```

- `tests/unit/test_page_schema.py`：第一层 Schema，附录 A 通过 + 多条反例（任务 1.1 验收）。
- `tests/unit/test_check_integrity.py`：第二层引用完整性，每条规则配反例（任务 1.2 验收）。
- `tests/unit/test_prompt_builder.py`：Prompt 五段结构 + few-shot 合法 + 确定性（任务 1.3 验收）。
- `tests/unit/test_app_boots.py`：应用可构建、/health 正常（任务 0.2 验收）。

## 校验分层（设计文档 §4.5）

- **第一层（已实现）**：JSON Schema，字段类型/必填/枚举。入口
  `app.catalog.validate_page(page) -> list[str]`，空列表即通过；单一真源是
  `app/catalog/page_schema.json`，改格式只改该文件。
- **第二层（任务 1.2，已实现）**：`app.catalog.check_integrity(page, asset_manifest) -> IntegrityReport`，
  纯函数、不改入参。覆盖 id 唯一、唯一 root(Page)、children 引用闭合、叶子不得带 children、
  path 绑定可解析、`data.images` 的 url 必须在 assetManifest 白名单内（防编造，硬失败）、
  孤儿组件、父子类型约束、children 成环。报告分 `errors`（硬失败→回灌重试）与
  `warnings` / `orphan_data_keys`（孤儿 data key 软问题）；孤儿 key 由服务端调
  `prune_orphan_data_keys(page, keys)` 清理并落日志。单测见 `tests/unit/test_check_integrity.py`。
