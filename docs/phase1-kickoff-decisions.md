# 第 1 期开工前决议（单人开发定稿版）

> 上游：[设计方案](./ai-page-builder-agent.md) · [迭代计划](./development-iteration-plan.md) · [服务端技改](./tech-spec-phase1-agent.md) · [前端技改](./tech-spec-phase1-frontend-render.md)
> 本文把开工前所有「跨团队边界」一次性拍死。**单人开发，无需对外确认；以下决议即最终口径**，后续写代码、改文档以本文为准。两份技改文档与本文冲突时，**以本文为准**（已在对应处标注修订）。
> 拍板日期：2026-06-14。

---

## 0. 决议速览表

| # | 议题 | 决议 | 影响任务 |
|---|------|------|---------|
| ① | 平台原生配置格式 | 自定义最小扁平格式（text / background / icon 三种基础组件），见 §1 | 1.7 转换器 |
| ② | Agent 输出边界 | **Agent 只返回 pageJson**；platformConfig、previewUrl 由前端产 | 1.6 / F5 |
| ③ | 落库与主库 | Agent 自存 pageJson + 版本表，MVP 用 SQLite（可一键切 MySQL/PG） | 1.6 / F5 |
| ④ | 素材清单字段 + URL 白名单 | manifest = `url`(必)+`name?`+`note?`+`width?`+`height?`；白名单精确匹配 | F1 / 1.5 |
| ⑤ | 合规网关与默认模型 | qwen-plus + OpenAI 兼容网关；JSON mode 默认关、可配置 | F3 |
| ⑥ | 结构化错误码 | 6 个枚举，见 §6 | F5 + 前端 |
| ⑦ | 布局预设数值 | 全部定死具体数值，见 §7（设计稿宽 375） | 1.8 布局引擎 |
| ⑧ | Eval 评分口径 | 每题标注「可接受集合」，自动判分，见 §8 | 1.11 题库 |
| ⑨ | 并发控制 | MVP 单实例，进程内 per-pageId 锁 | F5 |

---

## 1. 议题①：平台原生配置格式（Mapper 的输出靶子）

平台「文字 / 背景图 / 图标」基础组件没有现成的对外格式定义，这里**自定义一套最小扁平格式**作为 Mapper（`mapPageJsonToPlatform`）的输出目标。渲染器/编辑器按此格式对接。

```jsonc
// PlatformComponent[]：一维扁平列表，每项就是编辑器里可独立选中的一个基础组件
{
  "id": "string",            // 沿用 pageJson 组件 id；一拆多时加后缀，如 card-icon-1__icon
  "type": "text" | "background" | "icon",   // 平台基础组件类型（≠ pageJson 语义组件）
  "x": 0, "y": 0,            // 绝对坐标（px，设计稿宽 375，布局引擎算好写死）
  "width": 0, "height": 0,
  "props": { /* 按 type 不同，见下 */ }
}
```

各类型 `props`：

| type | 语义来源 | props 字段 |
|------|---------|-----------|
| `text` | Text / 卡片里的文字 | `content`(string)、`fontSize`、`color`、`fontWeight`、`textAlign`、`lineHeight` |
| `background` | BackgroundImage / 卡片背景 | `src`(url)、`fit`（默认 `"cover"`） |
| `icon` | Icon / IconCard 图标 | `src`(url)、`alt?` |

> 这套格式是 **MVP 自定的暂定靶子**；若日后接入了真实平台的既有配置格式，以真实格式为准、只改 Mapper，pageJson 契约和 Agent 完全不动（这正是「JSON + Mapper」分层的好处）。

**语义组件 → 平台基础组件拆解对照**（确定性，Mapper 实现）：

| pageJson 组件 | 拆成 |
|--------------|------|
| `Page` / `Header` / `Chapter` | 不产出组件，只传排版上下文 |
| `BackgroundImage` | 1×background |
| `Text` | 1×text |
| `Icon` | 1×icon |
| `TextCard` | 1×text |
| `IconCard` | 1×icon + 1~2×text（title / description，缺则不产出） |
| `BackgroundTextCard` | 1×background + 1×text |

---

## 2. 议题②：Agent 的输出边界

**决议：F5 生成接口只返回 `pageJson`。** 不返回 platformConfig、不返回 previewUrl。

理由：Mapper 是前端 TS 纯函数（设计 §8、前端技改 F1）。若 Agent 也产 platformConfig 就出现 Python/TS 双 Mapper，必然漂移——这正是设计 §8 对「双校验器」的告诫。

**修订** 服务端技改 §4.5.1 的响应体：

```jsonc
// 原：{ pageJson, platformConfig, previewUrl }
// 改：
POST /api/pages/{pageId}/generate
Response 200: { "pageId": "...", "version": 1, "pageJson": { ... } }
```

前端拿到 pageJson 后：本地跑 `mapPageJsonToPlatform` 得 platformConfig → `editor.load` → 复用现有 HTML 渲染出预览。previewUrl / platformConfig 全在前端侧产生，Agent 不掺和。

---

## 3. 议题③：落库与主库

**决议：Agent 自存 pageJson + 版本记录；MVP 用 SQLite，经 `DATABASE_URL` 可一键切 MySQL/PG。** platformConfig 不由 Agent 存（前端职责）。

用 SQLAlchemy（或 SQLModel）建两张表，第 1 期只写不读版本表（为第 3 期回滚预留）：

```
pages
  page_id        TEXT PK        -- 平台传入的 pageId
  current_json   JSON           -- 最近一次生成的 pageJson
  ai_editable    BOOLEAN         -- 默认 true；前端手改后置 false（前端技改 F4）
  created_at / updated_at

page_revisions
  id             INTEGER PK AUTOINCREMENT
  page_id        TEXT FK
  version_no     INTEGER         -- 同 page_id 内自增，从 1 起
  page_json      JSON
  instruction    TEXT NULL       -- 第 1 期恒为 NULL（生成）；第 3 期存修改指令
  created_at
```

F5 落库即写 `pages`（upsert）+ 追加一条 `page_revisions`，返回的 `version` 即本次 version_no。

---

## 4. 议题④：素材清单字段 + URL 白名单口径

**assetManifest 每项最终字段：**

| 字段 | 必填 | 说明 |
|------|------|------|
| `url` | 是 | 稳定可访问地址；**模型必须原样照抄进 `data.images.<key>.url`** |
| `name` | 否 | 原始文件名，辅助素材匹配 |
| `note` | 否 | 用户标注用途（如"头图背景"），辅助匹配，不依赖其必填 |
| `width` | 否 | 图片像素宽，用于头图高度换算（见 §7） |
| `height` | 否 | 图片像素高 |

**URL 白名单口径（钉死）：**
- 白名单 = manifest 里所有 `url` 的集合，**精确字符串匹配**（check_integrity 第 5 条）。
- 契约：传给 Agent 的 `url` 就是**最终稳定地址**。若平台要加签名/有效期/query，**必须在 Agent 之后再加工**——Agent 只认稳定基址，否则白名单会误杀合法图。
- `data.images` 只保留实际用到的图；manifest 里没用上的素材不进 pageJson。

---

## 5. 议题⑤：合规网关与默认模型

- **默认模型 qwen-plus**（冒烟 15/15），经 OpenAI 兼容网关调用，`base_url` / `api_key` / `model` 全走环境变量（已在 [config.py](../agent_service/app/config.py) 就位）。
- **JSON mode 默认关**（`MPAGE_LLM_JSON_MODE=false`）：冒烟未开 JSON mode 就已全过，部分网关的 JSON mode 反而过度约束；保留开关，上线后按网关实测决定是否开。
- 温度固定 0.2；超时 60s；校验失败自愈重试 1 次（共 2 次调用）。
- 换模型只改配置，不改代码。

---

## 6. 议题⑥：结构化错误码（前后端共享契约）

错误体复用 [main.py](../agent_service/app/main.py) 已有结构：`{ "error": { "code", "message", "details"? } }`。

| code | HTTP | 触发场景 | 前端提示方向 |
|------|------|---------|------------|
| `invalid_manifest` | 400 | manifest 空 / 缺 url / url 格式非法 | 「素材清单有误，请重新上传」 |
| `generation_failed` | 422 | 重试耗尽仍未过两层校验 | 「生成失败，请重试或调整描述」 |
| `model_timeout` | 504 | 模型调用超时 | 「AI 响应超时，请重试」 |
| `model_error` | 502 | 网关/模型返回异常 | 「AI 服务异常，请稍后重试」 |
| `concurrent_generation` | 409 | 同 pageId 生成进行中 | 「该页面正在生成，请稍候」 |
| `internal_error` | 500 | 兜底未捕获异常 | 「系统错误」 |

**铁律：任何未通过校验的 pageJson 都不返回**——失败一律走上表错误码。

---

## 7. 议题⑦：布局预设数值（无坐标模式，设计稿宽 375）

布局引擎（前端 1.8 / Mapper）按以下**定死的数值**算绝对坐标，写进 PlatformComponent 的 x/y/width/height（编辑器里所见即所得，可再手调）。

**全局**
- 设计稿宽：`375`
- 左右安全边距：`16`（内容可用宽 = 375 − 16×2 = `343`）

**头图 Header**
- 高度：`header-bg.height` 优先；缺省时若 manifest 有 width/height → `375 × height / width`；再缺省 → 默认 `200`
- 主标题：水平居中（除非 `style.textAlign` 指定），垂直居中于头图；缺省字号 `28`
- 副标题：紧贴主标题下方 `8`px；缺省字号 `14`
- Icon：默认 `40×40`；第 1 个左上 `(16,16)`，第 2 个右上 `(319,16)`，第 3 个起从左上往下每个 `+48`px

**章节 Chapter**
- 上下内边距：`16`
- 章节标题（如有）在顶部，标题下方 `12`px 开始排卡片
- 卡片：宽度 `343`，垂直间距 `12`，按 `children` 顺序自上而下堆叠
- 章节总高 = 标题 + 卡片排版结果 + 上下边距；章节背景图拉伸/裁切至该高度（背景图自带 height 不生效）

**卡片默认高度估算**
- `TextCard`：按文字行数 × 行高（行高取 `style.lineHeight`，缺省 `22`）+ 上下内边距 `12`
- `IconCard`：图标 `40×40` 居左，标题/说明居右；最小高 `64`，文字超出则撑高
- `BackgroundTextCard`：默认比例 16:9 → 高 `343 × 9 / 16 ≈ 193`；有背景图真实尺寸则按真实比例

> 以上为 MVP 缺省档位，后续可调；第 2 期接入 Vision 后 Text/Icon 带 position/size 时走精确坐标分支，本表仅作缺省回退。

---

## 8. 议题⑧：Eval 题库 v0 评分口径（1.11）

每道题是 `{ 描述, assetManifest, answer标注 }`，自动判分（复用 [smoke_check.py](../smoke_test/smoke_check.py) 思路）：

| 指标 | 判定 |
|------|------|
| Schema 合法率 | 两层校验全过即合格（含 1 次重试后） |
| 卡片类型选对率 | 每题为关键卡片槽位标注**「可接受类型集合」**（允许一槽多解，如"段落文案"接受 `TextCard`）；模型选中集合内即对。比例 = 对的槽位 / 标注槽位 |
| 素材命中率 | 每题标注「某素材应出现在某区域」；命中即对 |

- 标注答案存为 JSON，与跑批脚本配套，一键算出三项指标。
- 目标线：合法率 ≥ 98%、卡片选对 > 90%、素材命中 ≥ 80%（迭代计划 §九）。

---

## 9. 议题⑨：并发控制

**决议：MVP 单实例部署，进程内按 pageId 加锁**（`dict[pageId] -> asyncio.Lock`，或同等机制）。同 pageId 生成进行中时，后到请求立即返回 `concurrent_generation`(409)，不排队。

多实例上线时再换 DB 行锁 / Redis 锁——届时只改锁实现，接口契约不变。

---

## 10. 据此可立即开工的任务（不再依赖任何外部确认）

| 任务 | 依赖 | 备注 |
|------|------|------|
| 1.2 第二层校验 `check_integrity` | 已定稿 pageJson 契约 | 纯逻辑，可最先做 |
| 1.3 Prompt 组装 | 设计 §4.3 + 附录 A + §5 错误码 | 迁移 smoke 的 system_prompt |
| 1.4 生成服务 + 自愈重试 | §5 网关 + §6 错误码 | LLM Gateway 薄抽象 |
| 1.5 素材清单接入 F1 | §4 字段定稿 | 校验 manifest + 注入 + 白名单 |
| 1.6 生成接口 F5 | ②③⑥⑨ | 串联 + 落库 |
| 1.7 转换器 Mapper | §1 平台格式 | TS 纯函数 |
| 1.8 布局引擎 | §7 预设数值 | |
| 1.11 题库 v0 | §8 评分口径 | |
