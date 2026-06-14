# Agent 服务端 · 零基础上手指南

> 面向**第一次接触这个项目、甚至第一次接触 Python Web 后端**的同学。
> 读完你能回答三个问题:这个服务是干什么的、一个请求进来后代码是怎么一步步处理的、想改某个功能该去翻哪个文件。
> 配套文档:[设计方案](./ai-page-builder-agent.md) · [迭代计划](./development-iteration-plan.md) · [服务端技改](./tech-spec-phase1-agent.md) · [开工决议](./phase1-kickoff-decisions.md) · 代码 README:[agent_service/README.md](../agent_service/README.md)

---

## 1. 一句话:这个服务是干什么的

> **用户打几句话(「做个新春活动页,头图用 bg.png,下面放两个章节…」)+ 勾几张图,这个服务调用 AI 生成一份"页面的结构描述"(一段 JSON),前端再把它渲染成可编辑的页面。**

把它想成一个**翻译官 + 质检员**:
- 你说人话(自然语言描述)→ 它让 AI 翻译成机器能渲染的 JSON;
- AI 是会"瞎编"的(比如编造一个根本不存在的图片网址),所以它还当**质检员**:AI 每次产出都要过两道检查,不合格就打回去让 AI 重做。

它**不是**:不做图片上传、不存图片、不画页面、不管登录。它只负责"描述 → JSON"这一段,是大平台里的一个**下游小服务**。

---

## 2. 先建立 5 个核心概念(不懂这几个,代码看不进去)

### 2.1 "页面 JSON"——本项目的"普通话"

整个项目所有人(AI、后端、前端)靠一种约定好的 JSON 格式沟通,叫**页面 JSON**。它长这样(简化):

```jsonc
{
  "components": [                    // ① 结构:有哪些组件、谁套谁
    { "id": "root", "component": "Page",   "children": ["header-1", "chapter-1"] },
    { "id": "header-1", "component": "Header", "children": ["bg", "title"] },
    { "id": "bg",    "component": "BackgroundImage", "src":     { "path": "/images/headerBg" } },
    { "id": "title", "component": "Text",            "content": { "path": "/texts/mainTitle" } }
  ],
  "data": {                         // ② 数据:真正的文字和图片地址
    "texts":  { "mainTitle": "新春理财季" },
    "images": { "headerBg": { "url": "https://cdn/.../bg.png", "name": "bg.png" } }
  }
}
```

三个要点,记牢:

1. **扁平 + 用 id 拼树**:所有组件平铺在 `components` 数组里,不是层层嵌套。谁是谁的孩子,靠 `children: ["子id", ...]` 指过去。`id` 为 `root` 的是树根。
   *为什么这样设计?* —— 这种"邻接表"格式对 AI 更友好(改一个组件只动一项,不会因为嵌套漏括号),也方便按 id 精确定位。
2. **结构和数据分家**:`components` 只写"结构",真正的文字/图片不直接写在里面,而是写一个"引用"`{ "path": "/texts/mainTitle" }`,真值放在 `data.texts` / `data.images`。
   *为什么?* —— "把所有文案改成英文"只动 `data.texts`;"换一套素材图"只动 `data.images`;结构纹丝不动。
3. **9 种组件是给 AI 用的"描述词汇",不是前端组件**:`Page/Header/Chapter`(容器)+ `BackgroundImage/Text/Icon`(基础叶子)+ `TextCard/IconCard/BackgroundTextCard`(三种卡片)。前端真正用的是"文字组件/背景图组件/图标组件",由前端的**转换器(Mapper)** 把这 9 种翻译过去(例:`IconCard` → 图标组件 + 文字组件)。**转换器是前端的活,不在本服务**。

> 完整带注释的标准例子见 [app/catalog/example_page.json](../agent_service/app/catalog/example_page.json),它同时是"教 AI 的范例"和"测试的标准答案"。

### 2.2 LLM / 大模型 / 网关

- **LLM(大语言模型)**:就是会聊天、会生成文字的 AI(本项目默认用 `qwen-plus`)。我们给它一段指令(prompt),它回一段文字(我们要求它回 JSON)。
- **网关(Gateway)**:公司不会让你直连各家 AI,而是统一走一个"网关"地址。我们封装了一个**薄薄的转接层** `LLMGateway`,对外只暴露一个方法 `complete(消息) → 回复`。好处:**换模型只改配置(环境变量),代码一行不动**。

### 2.3 两层校验(质检员的两道关)

AI 的输出要过两关才算合格:
- **第一层**:格式对不对(字段类型、必填、枚举)。用 **JSON Schema** 这种"格式规则文件"自动检查。→ [page_schema.json](../agent_service/app/catalog/page_schema.json)
- **第二层**:逻辑对不对(JSON Schema 查不出来的)。比如 id 有没有重复、`children` 指向的组件存不存在、**图片网址是不是 AI 编造的**(必须在用户给的素材清单里)。→ [integrity.py](../agent_service/app/catalog/integrity.py)

### 2.4 自愈重试

AI 第一次没做对怎么办?**不直接报错**,而是把"你哪里错了"的具体清单**回灌**给 AI,让它改一次(默认重试 1 次)。还不行才报错。这就是"自愈"。

### 2.5 FastAPI / 接口 / 落库

- **FastAPI**:一个 Python 的 Web 框架,用来把函数变成"网址接口"。在函数上面写 `@router.post("/api/pages/{id}/generate")`,别人就能用 HTTP 调它。
- **落库**:生成结果存进数据库(本项目用 SQLite 文件,一行配置可换 MySQL)。存两张表:当前页面 + 历史版本。

---

## 3. 全景:一个请求进来,代码怎么跑

这是**最重要的一张图**。前端发一个 HTTP 请求,代码依次经过这些地方:

```
前端 POST /api/pages/{pageId}/generate   body: { userPrompt, assetManifest }
   │
   ▼  ① 路由层  app/api/routes/pages.py :: generate()
   │       加"同一页面并发锁"(同页面正在生成→直接 409,不排队)
   │
   ▼  ② 生成服务  app/services/generator.py :: generate_page_json()
   │   0. 校验素材清单        manifest.py        (不合法→400,根本不调 AI,不浪费钱)
   │   1. 拼指令              prompt_builder.py  (角色+规则+范例+你的描述+素材清单)
   │   2. 调 AI               llm_gateway.py     (complete → 一段文本)
   │   3. 解析+两层校验        catalog/           (validate_page + check_integrity)
   │        ├─ 合格 → 清掉没用到的数据 → 出结果
   │        └─ 不合格 → 把错误清单回灌给 AI,重试(默认 1 次)→ 仍不合格 → 422
   │
   ▼  ③ 落库  app/services/page_store.py :: save_generation()
   │       写"当前态"表 + 追加一条"版本快照"(版本号自动 +1)
   │
   ▼  ④ 返回  { pageId, version, pageJson }
```

**记住这条主线,再去看每个文件,就不会迷路。** 任何失败都不会返回半成品,而是返回一个带"错误码"的结构化错误(见 §5)。

---

## 4. 代码地图:每个文件干什么(按上面主线的顺序读)

> 建议**照这个顺序**读源码。每个文件都有详细的中文 docstring,看注释就能懂。

| 顺序 | 文件 | 一句话职责 | 难度 |
|------|------|-----------|------|
| 0 | [app/config.py](../agent_service/app/config.py) | 所有可调项(模型、密钥、超时、数据库)从环境变量读 | 易 |
| 0 | [app/main.py](../agent_service/app/main.py) | 组装整个 App:挂路由、注册错误处理、启动建表 | 易 |
| 1 | [app/catalog/page_schema.json](../agent_service/app/catalog/page_schema.json) | **格式契约**:页面 JSON 长什么样(第一层校验规则) | 中 |
| 1 | [app/catalog/example_page.json](../agent_service/app/catalog/example_page.json) | 标准范例(教 AI + 当测试标准答案) | 易 |
| 2 | [app/catalog/integrity.py](../agent_service/app/catalog/integrity.py) | **第二层校验**:引用闭合、防编造 URL、孤儿、成环… | 中 |
| 3 | [app/services/manifest.py](../agent_service/app/services/manifest.py) | 素材清单校验(F1):调 AI 前先挡非法清单 | 易 |
| 4 | [app/services/prompt_builder.py](../agent_service/app/services/prompt_builder.py) | 拼给 AI 的完整指令(F2) | 中 |
| 4 | [app/services/prompts/system_prompt.md](../agent_service/app/services/prompts/system_prompt.md) | 指令模板正文(可改文案不改代码) | 易 |
| 5 | [app/services/llm_gateway.py](../agent_service/app/services/llm_gateway.py) | 调 AI 的转接层(F3),换模型只改配置 | 中 |
| 6 | [app/services/generator.py](../agent_service/app/services/generator.py) | **核心**:把上面全串起来 + 自愈重试(F3) | 中高 |
| 7 | [app/errors.py](../agent_service/app/errors.py) | 6 个错误码 + 统一错误体 | 易 |
| 8 | [app/db.py](../agent_service/app/db.py) + [app/models/page.py](../agent_service/app/models/page.py) | 数据库装配 + 两张表的定义 | 中 |
| 8 | [app/services/page_store.py](../agent_service/app/services/page_store.py) | 落库:存当前态 + 版本快照 | 易 |
| 9 | [app/services/page_locks.py](../agent_service/app/services/page_locks.py) | 同页面并发锁(撞车 409) | 易 |
| 10 | [app/api/routes/pages.py](../agent_service/app/api/routes/pages.py) | **对外接口**:把主线包成 HTTP 端点 | 中 |

辅助:[app/api/deps.py](../agent_service/app/api/deps.py)(依赖注入,测试时用来替换成假 AI)、[app/schemas/generate.py](../agent_service/app/schemas/generate.py)(请求/响应的字段定义)。

---

## 5. 失败了会返回什么?(错误码表)

任何失败都返回统一格式 `{ "error": { "code", "message", "details?" } }`,前端按 `code` 区分提示:

| code | HTTP | 什么时候 |
|------|------|---------|
| `invalid_manifest` | 400 | 素材清单非法(空/缺 url/格式错)——调 AI 前就拦下 |
| `generation_failed` | 422 | AI 重试后仍不合格,绝不返回半成品 |
| `model_timeout` | 504 | 调 AI 超时 |
| `model_error` | 502 | 网关/模型报错 |
| `concurrent_generation` | 409 | 同一页面正在生成,重复提交被拦 |
| `internal_error` | 500 | 没预料到的异常(兜底) |

定义见 [app/errors.py](../agent_service/app/errors.py)。

---

## 6. 动手:把它跑起来

```bash
cd agent_service
uv sync                       # 装依赖(uv 是 Python 的包管理器,类似 npm)
cp .env.example .env          # 配置文件;真要调 AI 需填 MPAGE_LLM_API_KEY,只跑测试不用填

# 跑测试(强烈建议从这开始——91 个测试全绿说明环境 OK)
.venv/bin/pytest -q

# 启动服务
.venv/bin/uvicorn app.main:app --reload --port 8000
curl http://127.0.0.1:8000/health        # 探活
# 浏览器打开 http://127.0.0.1:8000/docs   ← FastAPI 自动生成的接口文档,可在线试调
```

> 想看 AI 实际生成?需要在 `.env` 里填好公司网关地址和密钥,然后用 `/docs` 页面调 `POST /api/pages/{pageId}/generate`。

---

## 7. 推荐学习路线(由浅入深)

1. **先看测试,再看实现**。测试文件就是"这个功能该有什么行为"的活文档,而且不依赖真实 AI(用假网关),最容易跑通。从 [test_generate_api.py](../agent_service/tests/unit/test_generate_api.py)(端到端)入手,看一个请求的成功/各种失败长什么样。
2. **照 §3 的主线走一遍 §4 的文件**,每个文件先读模块顶部的 docstring(说清了它是干嘛的),再读函数。
3. **改一个小东西验证理解**:比如把 [system_prompt.md](../agent_service/app/services/prompts/system_prompt.md) 里某条规则措辞改一下,跑 `pytest` 看 [test_prompt_builder.py](../agent_service/tests/unit/test_prompt_builder.py) 是否还过;或给 `check_integrity` 加一条新规则 + 一个反例测试。
4. **读两份设计文档**理解"为什么这么设计":[设计方案 §3](./ai-page-builder-agent.md)(页面 JSON 为什么长这样)和[开工决议](./phase1-kickoff-decisions.md)(那些边界为什么这么定)。

---

## 8. 名词小抄

| 词 | 大白话 |
|----|--------|
| 页面 JSON | 全项目通用的"页面结构描述",见 §2.1 |
| Catalog | 9 种"描述组件"的定义 + 校验规则,在 `app/catalog/` |
| Mapper / 转换器 | 把页面 JSON 翻译成前端真实组件——**前端的活,不在本服务** |
| assetManifest | 素材清单:一组图片 url(+名字/用途),用户传进来的 |
| 白名单 | AI 只能用清单里的图片 url,编造的一律拦下 |
| 两层校验 | 第一层管格式(Schema),第二层管逻辑(integrity) |
| 自愈重试 | 校验失败把错误回灌给 AI 让它改,默认改 1 次 |
| 网关(Gateway) | 调 AI 的统一转接层,换模型只改配置 |
| 落库 / 版本快照 | 把结果存数据库;每次生成存一版,为将来"回退"预留 |
| FastAPI | 把 Python 函数变成 HTTP 接口的框架 |

---

## 9. 当前完成度与未完成清单(接手必读)

**已完成(代码 + 单测,98 passed)**:服务端 F1~F5 全部实现——素材校验、Prompt 组装、两层校验、调模型+自愈重试、HTTP 接口+并发锁+落库。**整条"描述→生成→校验→落库→返回 pageJson"链路打通,前端可对接。**

**质量已实测达标(1.11)**:24 题测试题库**联真模型(qwen-plus)跑过**,Schema 合格率 / 卡片选对率 / 素材命中率**三项均 100%**(目标 ≥98% / >90% / ≥80%),平均调用 1.12 次。详见 [agent_service/eval/README.md](../agent_service/eval/README.md)。

**全量调用日志已完成**:每次生成把**完整 prompt、模型原始输出、各轮校验错误、重试次数、延迟、token** 按 traceId **脱敏后落盘**(按天 JSONL,见 [app/services/call_log.py](../agent_service/app/services/call_log.py)),可按 traceId 还原任意一次请求。

**仅剩一项(且必须等前端)**:

| # | 未完成 | 说明 |
|---|--------|------|
| 1 | **整体联调验收(1.12)** | "后端→真模型→合法 pageJson"已通过题库验证;但"前端 Mapper 渲染 / 编辑器导入"那段**需要前端**,绕不开。**服务端本身已无欠账。** |

**不在本服务范围(别找了)**:图片上传/OSS、前端转换器 Mapper、布局引擎、编辑器集成——这些是平台后端 / 前端的活。F5 按[决议 ②](./phase1-kickoff-decisions.md)**只返回 pageJson**,平台配置与预览由前端 Mapper 产出。
