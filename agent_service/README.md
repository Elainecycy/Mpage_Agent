# Agent 服务（第 1 期 · 文字生成页面）

AI 页面生成 Agent 的服务端。上游文档见 [设计方案](../docs/ai-page-builder-agent.md)、
[迭代计划](../docs/development-iteration-plan.md)、[服务端技改](../docs/tech-spec-phase1-agent.md)。

当前进度：**第 1 期服务端整体贯通（任务 0.2 / 1.1~1.6 + 1.11 测试题库）**——页面 JSON 两层校验、
Prompt 组装、LLM 网关薄抽象、「调模型→校验→自愈重试」的生成服务、素材清单接入（F1）、
对外生成接口（F5：HTTP 端点 + 并发锁 + 落库）均已就绪并有单测；并建好 24 题测试题库,
**联真模型(qwen-plus)实测合格率/卡片选对/素材命中三项 100%**（见 `eval/README.md`）。前端可直接调用。

## 目录

```
app/
  config.py            运行期配置（环境变量驱动的 Settings）
  main.py              FastAPI 应用工厂 + lifespan 建表 + AppError/兜底异常处理
  errors.py            结构化错误码 ErrorCode + 领域异常 AppError（决议 §6）
  db.py                DB 装配（F5）：引擎/会话/建表/get_session 依赖（决议 §3）
  api/
    deps.py              依赖提供者：get_gateway（可被测试覆盖）
    routes/              路由：health + pages（生成接口 F5）
      pages.py             POST /{id}/generate + GET /{id}
  catalog/             页面 JSON 契约 + 两层校验 + few-shot 单一真源
    page_schema.json     格式契约（第一层 JSON Schema）
    integrity.py         第二层引用完整性校验（check_integrity）
    example_page.json    附录 A 标准示例（Prompt few-shot 与测试共用）
    __init__.py          校验/示例加载入口（validate_page / check_integrity / load_example_page）
  models/
    page.py              ORM：pages（当前态）+ page_revisions（版本快照，决议 §3）
  schemas/
    generate.py          生成接口请求/响应体（GenerateRequest / GenerateResponse）
  services/            生成链路服务
    prompt_builder.py    Prompt 组装（F2）：system prompt + user message + 自愈反馈
    prompts/             prompt 文案模板（system_prompt.md）
    llm_gateway.py       LLM 网关薄抽象（F3）：统一 complete，换模型只改配置
    manifest.py          素材清单校验（F1）：调模型前挡掉非法 manifest
    generator.py         页面生成服务（F3）：素材校验→组装→调模型→两层校验→自愈重试
    page_store.py        落库（F5）：save_generation / get_current_page
    page_locks.py        同 pageId 生成串行化锁（决议 §9）
  utils/               预留模块（后续填充）
eval/                  测试题库 v0（1.11）：cases.json + 纯函数判分器 + 跑批脚本（详见 eval/README.md）
tests/
  unit/                单元测试（校验、Prompt、网关、生成、素材、落库、并发锁、生成接口、判分器、启动）
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

启动时自动建表（`lifespan` 调 `init_db`）。数据库由 `MPAGE_DATABASE_URL` 决定，缺省为本地
SQLite（`sqlite:///./mpage_agent.db`），改环境变量即可切 MySQL/PG，业务代码不动（决议 §3）。

## API（生成接口 F5）

**生成页面**：`POST /api/pages/{pageId}/generate`

```jsonc
// 请求体
{ "userPrompt": "做一个新春活动页……", "assetManifest": [ { "url": "https://cdn/.../bg.png", "name": "bg.png", "note": "头图" } ] }
// 成功 200（按决议 ② 只返回 pageJson，platformConfig/previewUrl 由前端 Mapper 产）
{ "pageId": "page_1", "version": 1, "pageJson": { "components": [...], "data": {...} } }
```

- 串联：同 pageId 并发锁 → 素材校验(F1) → 组装 → 调模型 → 两层校验 → 自愈重试 → 落库 → 返回。
- 落库：写 `pages`（当前态）+ 追加 `page_revisions`（版本快照，本期只写不读），返回的 `version` 自 1 递增。
- 失败一律结构化错误体 `{"error":{code,message,details?}}`：`invalid_manifest`(400) / `model_timeout`(504)
  / `model_error`(502) / `generation_failed`(422) / `concurrent_generation`(409)。

**查当前页面**：`GET /api/pages/{pageId}` → `{ "pageId", "pageJson" }`，无记录返回 404。

## 测试

```bash
uv run pytest -q
```

- `tests/unit/test_page_schema.py`：第一层 Schema，附录 A 通过 + 多条反例（任务 1.1 验收）。
- `tests/unit/test_check_integrity.py`：第二层引用完整性，每条规则配反例（任务 1.2 验收）。
- `tests/unit/test_prompt_builder.py`：Prompt 五段结构 + few-shot 合法 + 确定性（任务 1.3 验收）。
- `tests/unit/test_llm_gateway.py`：网关解析/JSON mode/超时与错误映射，MockTransport 脱网（任务 1.4）。
- `tests/unit/test_generator.py`：首过/围栏容错/自愈重试/失败/防编造/孤儿清理/错误映射/素材接入（任务 1.4 + 1.5 验收）。
- `tests/unit/test_manifest.py`：素材清单合法/空/缺url/格式错/超量/字段类型（任务 1.5 验收）。
- `tests/unit/test_page_store.py`：落库版本递增/当前态更新/版本快照/查询缺失（任务 1.6 验收）。
- `tests/unit/test_page_locks.py`：同 pageId 串行化、撞车 409、不同页互不影响（任务 1.6 / 决议 §9）。
- `tests/unit/test_generate_api.py`：端到端——成功生成+落库+查回/版本递增/并发409/素材400/失败422/超时504/缺记录404（任务 1.6 验收）。
- `tests/unit/test_eval_scorer.py`：测试题库判分逻辑（卡片/素材/文案命中、汇总），不依赖真模型（任务 1.11）。
- `tests/unit/test_app_boots.py`：应用可构建、/health 正常（任务 0.2 验收）。

> 注：`uv run pytest` 偶发 spawn 抖动时，可直接用 `.venv/bin/pytest -q` 跑（等价）。

**质量评测**（任务 1.11）：`.venv/bin/python -m eval.run_eval` 跑 24 题测试题库,量化合格率/
卡片选对/素材命中。需 `.env` 配好模型网关密钥。详见 [eval/README.md](eval/README.md)。

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

## 生成链路（任务 1.3 + 1.4）

入口 `app.services.generator.generate_page_json(user_prompt, asset_manifest, *, gateway?, trace_id?, max_retries?)`：

```
validate_manifest(素材清单)                 # 1.5/F1 调模型前先挡非法清单 → INVALID_MANIFEST
      │
      ▼  build_messages(描述+素材清单)        # 1.3 Prompt 组装
      │
      ▼  LLMGateway.complete(messages)        # 1.4 网关薄抽象（OpenAI 兼容）
解析输出（容忍 ```json 围栏）
      │
      ▼  validate_page + check_integrity      # 1.1 + 1.2 两层校验
   ┌── 通过 ──► 清理孤儿 key ──► GenerationResult{page_json, attempts, pruned_keys, tokens}
   └── 不过 ──► 把错误回灌模型(build_fix_feedback)重试，最多 1 次 ──► 仍不过 ──► 抛 AppError
```

- **素材清单接入（F1）**：`app.services.manifest.validate_manifest` 在调用模型**之前**校验
  清单（是数组、非空、≤20 项、每项含合法 http(s) url、可选字段类型正确），不合法即抛
  `INVALID_MANIFEST`、不耗模型调用。清单同时注入 Prompt（选图）与作为 URL 白名单（防编造）。
  **图片上传/存 OSS 在平台后端转换层完成，本服务不含任何上传/OSS/文件流逻辑**（职责边界）。

- **换模型只改配置**：网关地址/密钥/模型名/温度/超时/JSON mode 全在 `MPAGE_LLM_*`
  环境变量（见 `.env.example`），`generate_page_json` / `LLMGateway` 代码不动。
- **自愈重试**：校验失败把**具体错误列表**回灌模型，默认重试 1 次（`MPAGE_LLM_MAX_RETRIES`）；
  耗尽仍不合格抛 `GENERATION_FAILED`，**绝不返回未过校验的半成品**。
- **错误码**（`app.errors.ErrorCode`，决议 §6）：`model_timeout`(504) / `model_error`(502) /
  `generation_failed`(422) / `invalid_manifest`(400) / `concurrent_generation`(409) /
  `internal_error`(500)。服务层抛 `AppError`，API 层（1.6）统一转 `{"error":{code,message,details?}}`。
- **同步实现**：单次生成是「调用→校验→可能重试」的串行流程，网关用 `httpx.Client` 同步调用；
  FastAPI 端点（1.6）以同步路由 / 线程池承接即可。生成服务依赖 `SupportsComplete` 协议，
  单测注入假网关、不触真实网络。
