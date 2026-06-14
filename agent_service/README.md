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
  catalog/             页面 JSON 契约：page_schema.json + 校验入口（第一层）
  models/ schemas/ services/ utils/   预留模块（后续填充）
tests/
  unit/                单元测试（Schema 校验、空服务启动）
  fixtures/            测试数据（附录 A 标准页面）
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

- `tests/unit/test_page_schema.py`：附录 A 通过 + 多条反例（任务 1.1 验收）。
- `tests/unit/test_app_boots.py`：应用可构建、/health 正常（任务 0.2 验收）。

## 校验分层（设计文档 §4.5）

- **第一层（已实现）**：JSON Schema，字段类型/必填/枚举。入口
  `app.catalog.validate_page(page) -> list[str]`，空列表即通过；单一真源是
  `app/catalog/page_schema.json`，改格式只改该文件。
- **第二层（任务 1.2，待实现）**：`check_integrity` —— id 唯一、children 引用闭合、
  path 可解析、`data.images` URL 必须在 assetManifest 白名单内、孤儿检测等。
