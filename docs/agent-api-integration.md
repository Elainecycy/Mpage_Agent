# Agent 生成接口 · 对接说明（第 1 期）

> 给**调用 Agent 的平台后端（请求转换层）**与**消费 pageJson 的前端**对接用。
> 上游：[设计方案](./ai-page-builder-agent.md) · [服务端技改](./tech-spec-phase1-agent.md) · [开工决议](./phase1-kickoff-decisions.md)。代码 README：[agent_service/README.md](../agent_service/README.md)。

---

## 1. 调用拓扑（谁调谁）

Agent 是平台的**下游服务，不直接对接浏览器**：

```
浏览器/前端 ──► 平台后端(请求转换层) ──► Agent 服务
  描述 + 选图     在此完成图片上传/存OSS,           收到 assetManifest(URL数组)+描述
                组装 assetManifest(URL),调下面的 F5    → 返回 pageJson
                ◄────────────────────────────────────
  前端拿到 pageJson 后,用 Mapper 转成平台组件配置 → 编辑器加载 → 渲染预览
```

- **图片上传 / 存 OSS 不在 Agent**：流转到 Agent 时图片已是 URL。Agent 不收文件、不暴露上传接口。
- **Agent 只返回 `pageJson`**（决议 ②）：platformConfig 与预览由**前端 Mapper** 产出，Agent 不掺和。

---

## 2. 接口清单

| 方法 | 路径 | 用途 |
|------|------|------|
| `POST` | `/api/pages/{pageId}/generate` | 据描述+素材生成页面 JSON 并落库（核心接口 F5） |
| `GET` | `/api/pages/{pageId}` | 读该页面最近一次生成的 pageJson |
| `GET` | `/health` | 探活 |

`pageId` 由平台分配并作为路径参数传入；Agent 以它为键存储与串行化。

---

## 3. 生成接口 `POST /api/pages/{pageId}/generate`

### 3.1 请求体

```jsonc
{
  "userPrompt": "做一个新春活动页，头图用主视觉图，主标题新春特惠……",   // 必填，非空
  "assetManifest": [                                              // 必填，1~20 项
    {
      "url":   "https://cdn.example.com/kv.png",   // 必填：稳定可访问地址
      "name":  "kv.png",                           // 可选：原始文件名，辅助 AI 选图
      "note":  "头图主视觉",                         // 可选：用途标注，辅助 AI 选图
      "width":  750,                               // 可选：像素宽（供前端头图高度换算）
      "height": 400                                // 可选：像素高
    }
  ]
}
```

**素材清单（assetManifest）口径**（决议 ④）：
- `url` 是**最终稳定地址**，会被原样写进 `pageJson.data.images[*].url`。
- **URL 白名单按精确字符串匹配**：若平台要加签名/有效期/query，**必须在 Agent 之后再加工**，否则会被判为"编造"拦下。
- 清单里没被用上的图不影响生成；最终 `data.images` 只含实际引用的图。

### 3.2 成功响应 `200`

```jsonc
{
  "pageId": "page_123",
  "version": 1,                 // 同 pageId 内自 1 递增；每生成一次 +1
  "pageJson": { "components": [ ... ], "data": { "texts": {...}, "images": {...} } }
}
```

> 前端拿到 `pageJson` 后：本地 `mapPageJsonToPlatform(pageJson)` → 平台组件配置 → `editor.load` → 渲染预览。

### 3.3 失败响应（结构化错误码）

业务失败统一返回 **`{ "error": { "code", "message", "details?" } }`**，HTTP 状态码与 `code` 对应：

| HTTP | `code` | 含义 | 前端建议提示 |
|------|--------|------|------------|
| 400 | `invalid_manifest` | 素材清单非法（空/缺 url/格式错/超 20 项） | 「素材有误，请重新选择」；`details.errors` 有逐条原因 |
| 409 | `concurrent_generation` | 该页面正在生成中 | 「正在生成，请稍候」，禁用按钮/轮询 |
| 422 | `generation_failed` | AI 重试后仍不合格，**不返回半成品** | 「生成失败，请重试或调整描述」；`details.errors` 有失败原因 |
| 504 | `model_timeout` | 模型调用超时 | 「AI 响应超时，请重试」 |
| 502 | `model_error` | 网关/模型异常 | 「AI 服务异常，请稍后重试」 |
| 500 | `internal_error` | 兜底未预期异常 | 「系统错误」 |

```jsonc
// 例：422 generation_failed
{ "error": { "code": "generation_failed",
             "message": "生成的页面 JSON 多次未通过校验，请调整描述或重试。",
             "details": { "errors": ["…具体校验错误…"], "trace_id": "ab12…", "attempts": 2 } } }
```

> ⚠️ **两种错误体并存,前端都要兼容**：
> - **业务错误**（上表）→ `{ "error": { "code", ... } }`，按 `code` 区分。
> - **请求体本身不合法**（如缺 `userPrompt`、`assetManifest` 不是数组）→ FastAPI 默认校验错误 `422`，形如 `{ "detail": [ … ] }`（**不是** `error` 信封）。
> - **`GET` 查询 404** → `{ "detail": "页面 … 暂无生成记录" }`（也是 `detail` 信封）。
> 实务上：先看 HTTP 状态码，再看响应体里是 `error` 还是 `detail`。

### 3.4 并发与幂等

- 同一 `pageId` 的生成请求**串行化**：进行中再提交 → `409 concurrent_generation`（不排队、立即返回）。前端应防抖/禁用按钮。
- 每次成功生成都会**新增一个版本**（`version` 递增）并覆盖"当前态"。

### 3.5 curl 示例

```bash
curl -X POST http://<agent-host>/api/pages/page_123/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userPrompt": "做一个新春活动页，主标题新春特惠，一个章节放图标卡片和规则文案",
    "assetManifest": [
      { "url": "https://cdn.example.com/kv.png",   "note": "头图" },
      { "url": "https://cdn.example.com/redbag.png","note": "红包图标" }
    ]
  }'
```

---

## 4. 查询接口 `GET /api/pages/{pageId}`

读该页面最近一次生成的 pageJson。

```jsonc
// 200
{ "pageId": "page_123", "pageJson": { "components": [...], "data": {...} } }
// 404（无记录）
{ "detail": "页面 page_123 暂无生成记录" }
```

---

## 5. pageJson 字段速查（前端 Mapper 必读）

pageJson = **扁平组件表 + 数据区**，靠 `id` + `children` 拼成树。详见[设计方案 §3](./ai-page-builder-agent.md)，这里给对接最小集。

### 5.1 顶层

```jsonc
{
  "components": [ /* 平铺的组件节点，顺序不限，按 id 建 Map 后从 id="root" 还原树 */ ],
  "data": {
    "texts":  { "<key>": "文案字符串" },
    "images": { "<key>": { "url": "https://…", "name": "可选" } }
  }
}
```

- 组件里文案/图片字段不写值，写**引用** `{ "path": "/texts/<key>" }` 或 `{ "path": "/images/<key>" }`，到 `data` 取值。
- 渲染顺序由各容器的 `children` 数组顺序决定（`Page.children` 定章节先后，`Chapter.children` 定卡片先后）。

### 5.2 九种组件（语义组件 → 前端基础组件）

> Page/Header/Chapter 是**排版容器,不产前端组件**;卡片要**拆成多个基础组件**。

| component | 关键字段 | Mapper 展开为 |
|-----------|---------|--------------|
| `Page` | `children`（=root） | 不产组件，根容器 |
| `Header` | `children` | 不产组件，头图区容器 |
| `Chapter` | `children` | 不产组件，章节容器 |
| `BackgroundImage` | `src`🖼, `height?`（仅 Header 内生效） | 背景图组件 ×1 |
| `Text` | `content`🔤, `style?` | 文字组件 ×1 |
| `Icon` | `src`🖼, `alt?` | 图标组件 ×1 |
| `TextCard` | `content`🔤, `style?` | 文字组件 ×1 |
| `IconCard` | `src`🖼, `title?`🔤, `description?`🔤, `style?` | 图标组件 ×1 + 文字组件 ×1~2 |
| `BackgroundTextCard` | `backgroundImage`🖼, `content`🔤, `style?` | 背景图组件 ×1 + 文字组件 ×1 |

（🔤=绑定到 `/texts`，🖼=绑定到 `/images`。）

`style` 仅这些键：`fontSize`(number) / `color`(十六进制) / `fontWeight`(`normal`\|`bold`) / `textAlign`(`left`\|`center`\|`right`) / `lineHeight`(number)。**多余字段静默丢弃即可**（与服务端宽严分级一致）。

### 5.3 本期不带坐标

本期 `Text` / `Icon` **不输出 `position` / `size`**，前端按默认布局规则摆放（布局预设数值见[开工决议 §7](./phase1-kickoff-decisions.md)）。第 2 期接入 Vision 后才带坐标。

### 5.4 最小完整示例

```jsonc
{
  "components": [
    { "id": "root", "component": "Page", "children": ["header-1", "chapter-1"] },
    { "id": "header-1", "component": "Header", "children": ["header-bg", "main-title"] },
    { "id": "header-bg", "component": "BackgroundImage", "src": { "path": "/images/headerBg" }, "height": 200 },
    { "id": "main-title", "component": "Text", "content": { "path": "/texts/mainTitle" },
      "style": { "fontSize": 28, "color": "#FFFFFF", "fontWeight": "bold" } },
    { "id": "chapter-1", "component": "Chapter", "children": ["card-1"] },
    { "id": "card-1", "component": "IconCard", "src": { "path": "/images/redbag" },
      "title": { "path": "/texts/cardTitle" } }
  ],
  "data": {
    "texts":  { "mainTitle": "新春特惠", "cardTitle": "集卡领红包" },
    "images": { "headerBg": { "url": "https://cdn.example.com/kv.png" },
                "redbag":   { "url": "https://cdn.example.com/redbag.png" } }
  }
}
```

---

## 6. 前端职责边界（本期）

| 事项 | 谁做 |
|------|------|
| `pageJson → 平台组件配置`（`mapPageJsonToPlatform`，纯函数） | **前端**（任务 1.7） |
| 无坐标默认布局（头图高度、卡片流式排版等） | **前端**（任务 1.8，预设值见决议 §7） |
| 编辑器导入与预览 | **前端**（任务 1.9，复用现有能力） |
| 「手动编辑后脱离 AI」标记 | **前端**（任务 1.10）。Agent 侧 `pages` 表已存 `ai_editable` 字段备用 |
| 生成 / 校验 / 落库 / 错误码 | Agent（已交付） |

---

## 7. 对接注意事项

1. **图片 URL 要稳定**：传给 Agent 的 `url` 即模型要照抄的最终地址；签名/有效期等加工放在 Agent 之后，否则白名单误杀。
2. **不返回半成品**：任何失败都走错误码，绝不会返回未过校验的 pageJson；前端无需自己再校验 pageJson 合法性（但 Mapper 仍建议对未知组件/悬空 path 做防御性跳过，作最后防线）。
3. **并发防抖**：同页面生成期间禁用"生成"按钮，遇 `409` 提示稍候。
4. **重试成本**：单次生成含模型调用，P95 ≤ 60s；前端应有加载态与超时提示（`model_timeout`）。
5. **错误体两种形态**：业务错误 `{error:{code}}`，请求/路由错误 `{detail}`，按 §3.3 兼容。
6. **换模型对前端透明**：默认 `qwen-plus`，换模型只改 Agent 配置，接口契约不变。
