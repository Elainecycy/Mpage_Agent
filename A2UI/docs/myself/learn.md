# Cascade Chat Conversation

Note: _This is purely the output of the chat conversation and does not contain any raw data, codebase snippets, etc. used to generate the output._

### User Input

我需要了解json的生成以及根据json如何渲染成页面的具体逻辑，以某一个简单的请求操作为入口，介绍一下逻辑并且使用到了哪些代码哪些方法

### Planner Response

我会以一个最简单的请求 `"Top 5 Chinese restaurants in New York."` 为入口，沿着 React 前端 → A2A 中间件 → Python Agent → A2UI JSON 生成 → React 渲染 的链路梳理具体代码和方法。为了讲准确，我会再查看关键函数实现位置。

_Grep searched codebase_

_Grep searched codebase_

_Grep searched codebase_

_Grep searched codebase_

### Planner Response

我已经定位到核心链路。为了说明“JSON 如何生成”和“JSON 如何渲染”，我再读几段关键实现：Python agent 的 `stream`、executor 的 `execute`、web_core 的 `MessageProcessor`、React 的 `A2uiSurface`。

_Viewed [agent_executor.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent_executor.py) _

_Viewed [agent.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py) _

_Viewed [message-processor.ts](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts) _

_Viewed [A2uiSurface.tsx](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/A2uiSurface.tsx) _

### Planner Response

# 以一个简单请求为入口看完整链路

我们以你在 React 前端输入：

```text
Top 5 Chinese restaurants in New York.
```

为例，完整链路是：

```text
React 表单提交
→ React client 发请求到 /a2a
→ Vite middleware 转发到 Python A2A Agent
→ Python Agent 调 LLM + tool 生成 A2UI JSON
→ 后端把 JSON 包成 A2A DataPart 返回
→ React client 收到 JSON
→ MessageProcessor 更新内存 UI model
→ A2uiSurface 根据 model 渲染 React 页面
```

---

# 1. 前端入口：用户提交请求

## 文件

```text
samples/client/react/shell/src/App.tsx
```

## 关键方法

### `handleSubmit`

位置大约在 [App.tsx](file:///Users/elaine/A2UI-New/samples/client/react/shell/src/App.tsx:0:0-0:0)：

```ts
const handleSubmit = useCallback(
  (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = formData.get('body') as string;
    if (!body) return;

    sendAndProcess(body);
  },
  [sendAndProcess],
);
```

## 作用

用户点击发送按钮后：

- **读取输入框内容**
- **调用 `sendAndProcess(body)`**
- 此时 `body` 就是：

```text
Top 5 Chinese restaurants in New York.
```

---

# 2. 前端发送请求：`sendAndProcess`

## 文件

```text
samples/client/react/shell/src/App.tsx
```

## 关键方法

### `sendAndProcess`

核心逻辑：

```ts
response = await client.send(message, chunkMessages => {
  processor.processMessages(chunkMessages);
  setMessages(prev => [...prev, ...chunkMessages]);
});
```

## 作用

这个方法做几件事：

- **清空旧页面**
    - 删除已有 surfaces
- **调用 [client.send(...)](file:///Users/elaine/A2UI-New/samples/client/lit/shell/client.ts:51:2-114:3)**
    - 把用户文本发给后端
- **收到后端返回的 A2UI JSON 后**
    - 调用 [processor.processMessages(chunkMessages)](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:216:2-226:3)
    - 更新 React 状态
    - 页面随之渲染

这里的 `processor` 是：

```ts
const processor = useMemo(() => {
  return new MessageProcessor([basicCatalog], action => {
    if (sendAndProcessRef.current) {
      sendAndProcessRef.current({version: 'v0.9', action});
    }
  });
}, []);
```

也就是说，前端注册了一个 `basicCatalog`，只允许渲染这个 catalog 中定义的组件，比如：

- `Column`
- `Row`
- `Card`
- `Text`
- `Image`
- `Button`
- `TextField`
- `DateTimeInput`

这体现了 README 里说的：**LLM 不生成可执行代码，只生成声明式 JSON；前端只渲染可信 catalog 里的组件。**

---

# 3. React client 请求 `/a2a`

## 文件

```text
samples/client/react/shell/src/client.ts
```

## 关键方法

### [A2UIClient.send](file:///Users/elaine/A2UI-New/samples/client/lit/shell/client.ts:51:2-114:3)

核心代码：

```ts
const response = await fetch('/a2a', {
  method: 'POST',
  body: body,
});
```

## 作用

React 页面并不是直接请求 Python 后端，而是请求本地 Vite dev server 的：

```text
POST /a2a
```

如果后端是流式返回，则走：

```ts
if (contentType?.includes('text/event-stream')) {
  ...
  const parts = JSON.parse(dataStr) as Part[];
  ...
  allMessages.push(uiMessage);
  onChunk?.(chunkMessages);
}
```

也就是说：

- 后端每返回一段 A2UI JSON
- 前端就解析成 `A2uiMessage`
- 然后交给 [processor.processMessages](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:216:2-226:3)

---

# 4. Vite middleware 转发到 Python Agent

## 文件

```text
samples/client/react/shell/middleware/a2a.ts
```

## 关键方法

### [plugin](file:///Users/elaine/A2UI-New/samples/client/react/shell/middleware/a2a.ts:53:0-179:2)

Vite 配置中使用了这个插件：

```ts
plugins: [react(), a2aPlugin()]
```

对应文件：

```text
samples/client/react/shell/vite.config.ts
```

### `/a2a` handler

核心代码：

```ts
server.middlewares.use('/a2a', async (req, res, next) => {
  if (req.method === 'POST') {
    ...
  }
});
```

## 文本请求处理逻辑

对于普通文本：

```ts
sendParams = {
  message: {
    messageId: crypto.randomUUID(),
    role: 'user',
    parts: [
      {
        kind: 'text',
        text: originalBody,
      },
    ],
    kind: 'message',
  },
};
```

这里会把：

```text
Top 5 Chinese restaurants in New York.
```

包装成 A2A 的 `TextPart`。

## 连接 Python 后端

```ts
client = await A2AClient.fromCardUrl(
  'http://localhost:10002/.well-known/agent-card.json',
  {
    fetchImpl: fetchWithCustomHeader,
  },
);
```

并且加了 A2UI extension header：

```ts
headers.set(
  'X-A2A-Extensions',
  'https://a2ui.org/a2a-extension/a2ui/v0.9',
);
```

这个 header 很关键。

它告诉 Python Agent：

```text
客户端支持 A2UI v0.9，请返回 A2UI JSON，而不是普通文本。
```

---

# 5. Python 后端入口

## 文件

```text
samples/agent/adk/restaurant_finder/__main__.py
```

## 关键逻辑

启动服务：

```py
uvicorn.run(app, host=host, port=port)
```

默认端口：

```text
localhost:10002
```

创建 agent：

```py
agent = RestaurantAgent(base_url=base_url)
agent_executor = RestaurantAgentExecutor(agent)
```

注册 A2A server：

```py
server = A2AStarletteApplication(
    agent_card=agent.agent_card,
    http_handler=request_handler
)
```

所以后端请求进入后，会交给：

```text
RestaurantAgentExecutor
```

---

# 6. 后端 executor：判断是文本请求还是 UI 事件

## 文件

```text
samples/agent/adk/restaurant_finder/agent_executor.py
```

## 关键方法

### [RestaurantAgentExecutor.execute](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent_executor.py:45:2-168:11)

核心逻辑：

```py
active_ui_version = try_activate_a2ui_extension(
    context,
    self._agent.agent_card
)
```

这里会根据前端传来的：

```text
X-A2A-Extensions: https://a2ui.org/a2a-extension/a2ui/v0.9
```

判断当前是否启用 A2UI。

如果启用：

```py
logger.info("--- AGENT_EXECUTOR: A2UI extension is active. Using UI agent. ---")
```

## 普通文本请求

对于我们这个简单请求，没有 UI action，因此走：

```py
query = context.get_user_input()
```

也就是：

```text
Top 5 Chinese restaurants in New York.
```

然后调用：

```py
async for item in self._agent.stream(
    query,
    task.context_id,
    active_ui_version,
    use_streaming=use_streaming
):
```

---

# 7. Python Agent 构造 LLM：让模型生成 A2UI JSON

## 文件

```text
samples/agent/adk/restaurant_finder/agent.py
```

## 关键方法

### [\_build_llm_agent](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:147:2-176:5)

```py
def _build_llm_agent(
    self,
    schema_manager: Optional[A2uiSchemaManager] = None
) -> LlmAgent:
```

核心代码：

```py
instruction = (
    schema_manager.generate_system_prompt(
        role_description=ROLE_DESCRIPTION,
        ui_description=UI_DESCRIPTION,
        include_schema=True,
        include_examples=True,
        validate_examples=True,
    )
    if schema_manager
    else get_text_prompt()
)
```

这一步非常关键。

如果当前是 A2UI 模式，系统 prompt 不是普通 prompt，而是通过：

```py
A2uiSchemaManager.generate_system_prompt(...)
```

生成的。

它会把这些内容注入给 LLM：

- **角色说明**
    - restaurant finding assistant
- **UI 生成要求**
    - 生成 A2UI JSON
- **A2UI schema**
    - `createSurface`
    - `updateComponents`
    - `updateDataModel`
- **示例**
    - 餐厅列表如何用 `Card`、`Text`、`Image`、`Button` 表示
- **catalog 限制**
    - 只能生成 basic catalog 里允许的组件

## Tool

同一个 LLM agent 还绑定了工具：

```py
tools=[get_restaurants]
```

对应文件：

```text
samples/agent/adk/restaurant_finder/tools.py
```

用户问：

```text
Top 5 Chinese restaurants in New York.
```

模型应该调用：

```py
get_restaurants
```

从本地数据里取餐厅数据。

数据文件：

```text
samples/agent/adk/restaurant_finder/restaurant_data.json
```

---

# 8. JSON 生成：[RestaurantAgent.stream](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:178:2-399:48)

## 文件

```text
samples/agent/adk/restaurant_finder/agent.py
```

## 关键方法

### [stream](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:178:2-399:48)

核心逻辑：

```py
async for event in runner.run_async(
    user_id=self._user_id,
    session_id=session.id,
    run_config=run_config.RunConfig(
        streaming_mode=...
    ),
    new_message=current_message,
):
```

这里真正调用 ADK Runner，让 LLM 处理用户请求。

LLM 的输出不是直接页面，而是类似这样的 A2UI JSON 消息列表：

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "default",
    "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json",
    "theme": {
      "primaryColor": "#FF0000",
      "font": "Roboto"
    }
  }
}
```

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "default",
    "components": [
      {
        "id": "root",
        "component": "Column",
        "children": ["title-heading", "restaurant-list"]
      },
      {
        "id": "title-heading",
        "component": "Text",
        "variant": "h1",
        "text": {
          "path": "/title"
        }
      }
    ]
  }
}
```

```json
{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "default",
    "path": "/",
    "value": {
      "title": "Top Chinese Restaurants in New York",
      "items": [
        {
          "name": "Xi'an Famous Foods",
          "rating": "★★★★☆",
          "detail": "Spicy and savory hand-pulled noodles."
        }
      ]
    }
  }
}
```

实际 demo 中，列表结构可能更复杂，例如两列 card、带图片、按钮等。

---

# 9. 后端校验 JSON

## 文件

```text
samples/agent/adk/restaurant_finder/agent.py
```

## 关键逻辑

LLM 输出后，后端会 parse + validate：

```py
response_parts = parse_response(final_response_content)
```

然后：

```py
selected_catalog.validator.validate(parsed_json_data)
```

如果 JSON 不符合 A2UI schema，会重试一次：

```py
current_query_text = (
    f"Your previous response was invalid. {error_message} ..."
)
```

这一步保证：

- 不是随便什么 JSON 都能发给前端
- 必须符合 A2UI schema
- 必须是 catalog 支持的结构

---

# 10. 后端把 JSON 转成 A2A Parts

## 文件

```text
samples/agent/adk/restaurant_finder/agent.py
```

## 关键方法

```py
final_parts = parse_response_to_parts(
    final_response_content,
    fallback_text="OK."
)
```

如果是流式，前面会通过：

```py
stream_response_to_parts(...)
```

边解析边返回。

这些 parts 最终回到：

```text
agent_executor.py
```

然后执行：

```py
await updater.update_status(final_state, message)
```

也就是把 A2UI JSON 作为 A2A message parts 返回给前端。

---

# 11. 前端收到 JSON：[client.ts](file:///Users/elaine/A2UI-New/samples/client/lit/shell/client.ts:0:0-0:0)

## 文件

```text
samples/client/react/shell/src/client.ts
```

如果是 SSE 流式响应：

```ts
const parts = JSON.parse(dataStr) as Part[];
```

然后提取 data part：

```ts
if (part.kind === 'data' && part.data) {
  const uiMessage = part.data as unknown as A2uiMessage;
  chunkMessages.push(uiMessage);
}
```

最终回调到 [App.tsx](file:///Users/elaine/A2UI-New/samples/client/react/shell/src/App.tsx:0:0-0:0)：

```ts
onChunk?.(chunkMessages);
```

---

# 12. JSON 变成页面模型：[MessageProcessor](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:47:0-353:1)

## 文件

```text
renderers/web_core/src/v0_9/processing/message-processor.ts
```

## 关键方法

### [processMessages](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:216:2-226:3)

```ts
processMessages(messages: A2uiMessage[] | A2uiMessageListWrapper): void {
  const messageList = Array.isArray(messages) ? messages : messages.messages;
  for (const message of messageList) {
    this.processMessage(message);
  }
}
```

它逐条处理 A2UI message。

---

## 12.1 `createSurface`

```ts
if ('createSurface' in message) {
  this.processCreateSurfaceMessage(message);
  return;
}
```

实际处理：

```ts
const surface = new SurfaceModel<T>(
  surfaceId,
  catalog,
  theme,
  sendDataModel ?? false
);
this.model.addSurface(surface);
```

作用：

- 创建一个 UI surface
- 绑定 catalog
- 保存 theme
- 相当于创建一个“页面画布”

---

## 12.2 `updateComponents`

```ts
if ('updateComponents' in message) {
  this.processUpdateComponentsMessage(message);
  return;
}
```

实际处理：

```ts
for (const comp of payload.components) {
  const {id, component, ...properties} = comp;
  const newComponent = new ComponentModel(id, component, properties);
  surface.componentsModel.addComponent(newComponent);
}
```

作用：

- 把 JSON 中的组件定义转成 `ComponentModel`
- 存入 `surface.componentsModel`

例如 JSON：

```json
{
  "id": "title-heading",
  "component": "Text",
  "variant": "h1",
  "text": {
    "path": "/title"
  }
}
```

会变成一个 component model：

```text
id = title-heading
type = Text
properties = {
  variant: "h1",
  text: { path: "/title" }
}
```

---

## 12.3 `updateDataModel`

```ts
if ('updateDataModel' in message) {
  this.processUpdateDataModelMessage(message);
  return;
}
```

实际处理：

```ts
const path = payload.path || '/';
const value = payload.value;
surface.dataModel.set(path, value);
```

作用：

- 更新数据模型
- 组件里的 `path` 会从这里取值

例如：

```json
{
  "text": {
    "path": "/title"
  }
}
```

会从 data model 里取：

```json
{
  "title": "Top Chinese Restaurants in New York"
}
```

最终显示成页面标题。

---

# 13. 页面渲染入口：[A2uiSurface](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/A2uiSurface.tsx:126:0-131:2)

## 文件

```text
renderers/react/src/v0_9/A2uiSurface.tsx
```

## 关键组件

### [A2uiSurface](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/A2uiSurface.tsx:126:0-131:2)

```tsx
export const A2uiSurface: React.FC<{surface: SurfaceModel<ReactComponentImplementation>}> = ({
  surface,
}) => {
  return <DeferredChild surface={surface} id="root" basePath="/" />;
};
```

A2UI 约定：

```text
root 组件是页面根节点
```

所以 React 从 `root` 开始递归渲染。

---

# 14. 根据组件 id 找组件实现

## 文件

```text
renderers/react/src/v0_9/A2uiSurface.tsx
```

## 关键组件

### `DeferredChild`

```tsx
const componentModel = surface.componentsModel.get(id);
```

通过 id 找到组件模型，比如：

```text
root
title-heading
restaurant-list
card-template
```

然后：

```tsx
const compImpl = surface.catalog.components.get(componentModel.type);
```

根据组件类型找 React 实现。

例如：

```text
Text → React Text component
Card → React Card component
Image → React Image component
Button → React Button component
```

如果 catalog 里没有这个组件，就报：

```tsx
Unknown component: xxx
```

这也是安全边界之一：**LLM 只能请求渲染 catalog 里存在的组件。**

---

# 15. 真正渲染 React 组件

## 文件

```text
renderers/react/src/v0_9/A2uiSurface.tsx
```

## 关键组件

### `ResolvedChild`

```tsx
const ComponentToRender = compImpl.render;
```

然后：

```tsx
return <ComponentToRender context={context} buildChild={buildChild} />;
```

这里传了两个重要东西：

- **`context`**
    - 当前 surface
    - 当前组件 id
    - 当前数据路径
- **`buildChild`**
    - 用来递归渲染子组件

---

# 16. basic catalog 中的 React 组件

## 目录

```text
renderers/react/src/v0_9/catalog/basic/components
```

常见组件实现：

- **[Column.tsx](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/catalog/basic/components/Column.tsx:0:0-0:0)**
    - 渲染纵向布局
- **[Row.tsx](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/catalog/basic/components/Row.tsx:0:0-0:0)**
    - 渲染横向布局
- **[Card.tsx](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/catalog/basic/components/Card.tsx:0:0-0:0)**
    - 渲染卡片
- **[Text.tsx](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/catalog/basic/components/Text.tsx:0:0-0:0)**
    - 渲染文本
- **[Image.tsx](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/catalog/basic/components/Image.tsx:0:0-0:0)**
    - 渲染图片
- **[Button.tsx](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/catalog/basic/components/Button.tsx:0:0-0:0)**
    - 渲染按钮
- **[TextField.tsx](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/catalog/basic/components/TextField.tsx:0:0-0:0)**
    - 渲染输入框
- **[DateTimeInput.tsx](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/catalog/basic/components/DateTimeInput.tsx:0:0-0:0)**
    - 渲染日期时间选择

catalog 注册位置：

```text
renderers/react/src/v0_9/catalog/basic/index.ts
```

里面有：

```ts
export const basicCatalog = new Catalog<ReactComponentImplementation>(
  'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json',
  basicComponents,
  BASIC_FUNCTIONS,
);
```

---

# 17. 数据绑定是怎么生效的

以这个 JSON 为例：

```json
{
  "id": "title-heading",
  "component": "Text",
  "variant": "h1",
  "text": {
    "path": "/title"
  }
}
```

对应 data model：

```json
{
  "title": "Top Chinese Restaurants in New York"
}
```

渲染时：

- `Text` 组件拿到 props
- props 里的 `text` 已经通过 A2UI core 的数据绑定解析
- `{ path: "/title" }` 会被解析成：

```text
Top Chinese Restaurants in New York
```

所以最后页面上显示标题。

同理，餐厅卡片里的：

```json
{
  "text": {
    "path": "name"
  }
}
```

如果当前 list item 是：

```json
{
  "name": "Xi'an Famous Foods"
}
```

那就显示：

```text
Xi'an Famous Foods
```

---

# 18. List 是如何渲染多张卡片的

后端可能返回类似：

```json
{
  "id": "restaurant-list",
  "component": "List",
  "direction": "vertical",
  "children": {
    "componentId": "row-template",
    "path": "/items"
  }
}
```

含义是：

- 从 data model 的 `/items` 取数组
- 对数组每一项重复渲染 `row-template`
- 每个 item 会成为子组件的数据上下文

所以：

```json
"items": [
  {"name": "Xi'an Famous Foods"},
  {"name": "Han Dynasty"}
]
```

就会渲染出多个 restaurant card。

---

# 19. 点击按钮后的逻辑

如果用户点击 `Book Now`，组件 JSON 里通常有：

```json
{
  "component": "Button",
  "action": {
    "event": {
      "name": "book_restaurant",
      "context": {
        "restaurantName": {
          "path": "name"
        },
        "imageUrl": {
          "path": "imageUrl"
        },
        "address": {
          "path": "address"
        }
      }
    }
  }
}
```

React [MessageProcessor](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:47:0-353:1) 初始化时注册了 action handler：

```ts
new MessageProcessor([basicCatalog], action => {
  if (sendAndProcessRef.current) {
    sendAndProcessRef.current({version: 'v0.9', action});
  }
});
```

所以点击按钮后：

```text
Button click
→ 触发 action
→ sendAndProcess({ version: 'v0.9', action })
→ client.ts 发到 /a2a
→ middleware/a2a.ts 把它包装成 DataPart
→ Python agent_executor.py 识别 action
```

后端识别：

```py
if action == "book_restaurant":
    query = (
        f"USER_WANTS_TO_BOOK: {restaurant_name}, Address: {address}, ImageURL:"
        f" {image_url}"
    )
```

然后 LLM 根据这个 query 生成新的 A2UI JSON，比如预订表单。

---

# 20. 总结：JSON 生成和渲染的核心分工

## JSON 生成侧

主要代码：

- **[samples/agent/adk/restaurant_finder/agent.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:0:0-0:0)**
    - [\_build_llm_agent](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:147:2-176:5)
    - [stream](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:178:2-399:48)
- **[samples/agent/adk/restaurant_finder/agent_executor.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent_executor.py:0:0-0:0)**
    - [execute](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent_executor.py:45:2-168:11)
- **[samples/agent/adk/restaurant_finder/prompt_builder.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/prompt_builder.py:0:0-0:0)**
    - 定义 UI prompt / role / examples
- **[samples/agent/adk/restaurant_finder/tools.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/tools.py:0:0-0:0)**
    - `get_restaurants`
- **`agent_sdks/python/src/a2ui/schema/manager.py`**
    - `A2uiSchemaManager.generate_system_prompt`

核心逻辑：

```text
用户请求
→ LLM 根据 schema + examples + tool data
→ 生成 A2UI JSON
→ 后端校验 JSON
→ 包成 A2A DataPart 返回
```

## JSON 渲染侧

主要代码：

- **[samples/client/react/shell/src/App.tsx](file:///Users/elaine/A2UI-New/samples/client/react/shell/src/App.tsx:0:0-0:0)**
    - `handleSubmit`
    - `sendAndProcess`
    - [processor.processMessages](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:216:2-226:3)
    - `<A2uiSurface />`
- **[samples/client/react/shell/src/client.ts](file:///Users/elaine/A2UI-New/samples/client/react/shell/src/client.ts:0:0-0:0)**
    - [A2UIClient.send](file:///Users/elaine/A2UI-New/samples/client/lit/shell/client.ts:51:2-114:3)
- **[samples/client/react/shell/middleware/a2a.ts](file:///Users/elaine/A2UI-New/samples/client/react/shell/middleware/a2a.ts:0:0-0:0)**
    - `/a2a` 转发到 Python 后端
- **[renderers/web_core/src/v0_9/processing/message-processor.ts](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:0:0-0:0)**
    - [processMessages](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:216:2-226:3)
    - [processCreateSurfaceMessage](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:263:2-279:3)
    - [processUpdateComponentsMessage](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:287:2-321:3)
    - [processUpdateDataModelMessage](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:323:2-335:3)
- **[renderers/react/src/v0_9/A2uiSurface.tsx](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/A2uiSurface.tsx:0:0-0:0)**
    - [A2uiSurface](file:///Users/elaine/A2UI-New/renderers/react/src/v0_9/A2uiSurface.tsx:126:0-131:2)
    - `DeferredChild`
    - `ResolvedChild`
- **`renderers/react/src/v0_9/catalog/basic/components/*`**
    - React 组件实现

核心逻辑：

```text
A2UI JSON
→ MessageProcessor 更新 SurfaceModel
→ SurfaceModel 保存 components + dataModel
→ A2uiSurface 从 root 开始递归渲染
→ 根据 catalog 找到 React 组件
→ 根据 path 从 dataModel 取数据
→ 渲染成真实页面
```

---

# 最核心的一句话

A2UI 的本质是：

```text
LLM 只负责生成声明式 JSON：
  页面有哪些组件、组件之间怎么连接、数据在哪里

React 前端只负责解释这个 JSON：
  用可信 catalog 把 Column/Card/Text/Button 等抽象组件映射成真实 React 组件
```

所以这个项目里，**JSON 的生成逻辑主要在 Python Agent + prompt/schema 侧；JSON 到页面的渲染逻辑主要在 [MessageProcessor](file:///Users/elaine/A2UI-New/renderers/web_core/src/v0_9/processing/message-processor.ts:47:0-353:1) + React renderer 侧。**

_Viewed [agent_executor.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent_executor.py) _

### User Input

6. 后端 executor：判断是文本请求还是 UI 事件 这里的文本事件和UI事件分别是什么，为什么当前Top 5 Chinese restaurants in New York.是普通文本事件

### Planner Response

# 文本请求和 UI 事件分别是什么

在 [agent_executor.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent_executor.py:0:0-0:0) 这一段里，后端收到的 A2A message 可能包含不同类型的 `part`：

```py
if isinstance(part.root, DataPart):
    ...
elif isinstance(part.root, TextPart):
    ...
```

这里主要区分两类输入：

---

## 1. 文本请求：`TextPart`

文本请求就是用户在输入框里直接输入的一句话，比如：

```text
Top 5 Chinese restaurants in New York.
```

它在前端会被包装成 A2A 的 `TextPart`：

```json
{
  "kind": "text",
  "text": "Top 5 Chinese restaurants in New York."
}
```

对应后端判断：

```py
elif isinstance(part.root, TextPart):
  logger.info(f"  Part {i}: TextPart (text: {part.root.text})")
```

如果没有识别到 UI 事件，后端最后会走：

```py
query = context.get_user_input()
```

也就是把用户输入框里的文本作为普通自然语言 query 传给 LLM。

---

## 2. UI 事件：`DataPart`

UI 事件不是用户手动输入的一句话，而是用户**在已经渲染出来的 A2UI 页面上做了交互**，例如：

- **点击 `Book Now` 按钮**
- **提交预订表单**
- **修改某个表单字段后触发 action**

这种事件会被前端包装成结构化 JSON，作为 A2A 的 `DataPart` 发送给后端。

例如点击餐厅卡片里的 `Book Now` 后，前端可能发送：

```json
{
  "version": "v0.9",
  "action": {
    "name": "book_restaurant",
    "context": {
      "restaurantName": "Xi'an Famous Foods",
      "imageUrl": "http://localhost:10002/static/shrimpchowmein.jpeg",
      "address": "81 St Marks Pl, New York, NY 10003"
    }
  }
}
```

它在 A2A message 里大致是：

```json
{
  "kind": "data",
  "data": {
    "version": "v0.9",
    "action": {
      "name": "book_restaurant",
      "context": {
        "restaurantName": "Xi'an Famous Foods"
      }
    }
  },
  "mimeType": "application/json+a2ui"
}
```

对应后端判断：

```py
if part.root.data.get("version") == "v0.9" and "action" in part.root.data:
  logger.info(f"  Part {i}: Found a2ui v0.9 action payload.")
  ui_event_part = part.root.data["action"]
```

一旦识别到 `ui_event_part`，后端会进入：

```py
if ui_event_part:
  logger.info(f"Received a2ui ClientEvent: {ui_event_part}")
```

然后根据事件名转换成给 LLM 的 query：

```py
if action == "book_restaurant":
  query = (
      f"USER_WANTS_TO_BOOK: {restaurant_name}, Address: {address}, ImageURL:"
      f" {image_url}"
  )
```

---

# 为什么 `Top 5 Chinese restaurants in New York.` 是普通文本请求

因为它是用户在搜索框里**主动输入的一段自然语言文本**，不是从某个 A2UI 组件 action 触发出来的结构化事件。

在 React 前端里，表单提交逻辑是：

```ts
const handleSubmit = useCallback(
  (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = formData.get('body') as string;
    if (!body) return;

    sendAndProcess(body);
  },
  [sendAndProcess],
);
```

这里传给 `sendAndProcess` 的是字符串：

```ts
sendAndProcess(body);
```

也就是说：

```ts
message = "Top 5 Chinese restaurants in New York."
```

然后在 [client.ts](file:///Users/elaine/A2UI-New/samples/client/lit/shell/client.ts:0:0-0:0) 里：

```ts
const body = typeof message === 'string' ? message : JSON.stringify(message);
```

因为它是字符串，所以最终请求体就是普通文本。

到了 Vite middleware：

```ts
if (isJson(originalBody)) {
  // JSON UI event
} else {
  // text query
}
```

`Top 5 Chinese restaurants in New York.` 不是 JSON，因此进入：

```ts
sendParams = {
  message: {
    messageId: crypto.randomUUID(),
    role: 'user',
    parts: [
      {
        kind: 'text',
        text: originalBody,
      },
    ],
    kind: 'message',
  },
};
```

所以后端收到的是：

```py
TextPart(text="Top 5 Chinese restaurants in New York.")
```

不是：

```py
DataPart(data={version: "v0.9", action: ...})
```

因此它是普通文本请求。

---

# 什么时候会变成 UI 事件

当页面已经渲染出餐厅列表后，用户点击 `Book Now`。

餐厅卡片按钮的 A2UI JSON 里一般有：

```json
{
  "id": "template-book-button",
  "component": "Button",
  "child": "book-now-text",
  "action": {
    "event": {
      "name": "book_restaurant",
      "context": {
        "restaurantName": {
          "path": "name"
        },
        "imageUrl": {
          "path": "imageUrl"
        },
        "address": {
          "path": "address"
        }
      }
    }
  }
}
```

这个不是用户手动输入文本，而是 A2UI 组件定义的事件。

点击后，React renderer 会触发 action handler：

```ts
new MessageProcessor([basicCatalog], action => {
  if (sendAndProcessRef.current) {
    sendAndProcessRef.current({version: 'v0.9', action});
  }
});
```

这时候传入 `sendAndProcess` 的不是字符串，而是对象：

```ts
{
  version: 'v0.9',
  action: {
    name: 'book_restaurant',
    context: {
      restaurantName: "Xi'an Famous Foods",
      imageUrl: "...",
      address: "..."
    }
  }
}
```

这个对象会被序列化成 JSON：

```ts
const body = typeof message === 'string' ? message : JSON.stringify(message);
```

然后 middleware 判断：

```ts
if (isJson(originalBody)) {
  // 这是 UI event
}
```

于是发送给后端的是 `DataPart`。

---

# 对比总结

| 类型         | 来源                    | 前端传参  | A2A Part   | 后端处理                                   |
| ------------ | ----------------------- | --------- | ---------- | ------------------------------------------ |
| 普通文本请求 | 用户在输入框输入        | 字符串    | `TextPart` | `query = context.get_user_input()`         |
| UI 事件      | 用户点击/提交 A2UI 组件 | JSON 对象 | `DataPart` | `ui_event_part = part.root.data["action"]` |

---

# 当前请求为什么不是 UI 事件

`Top 5 Chinese restaurants in New York.` 满足这些特征：

- **它是自然语言字符串**
- **来自搜索框提交**
- **不是 JSON**
- **没有 `version: "v0.9"`**
- **没有 `action` 字段**
- **不是由 Button/Form 等 A2UI 组件自动触发**

所以它走的是：

```py
else:
  logger.info("No a2ui UI event part found. Falling back to text input.")
  query = context.get_user_input()
```

也就是普通文本请求。

_Viewed [agent.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py) _

### User Input

8. JSON 生成 这里解释一下agent究竟是怎么根据用户的输入生成json的

### Planner Response

# Agent 是怎么根据用户输入生成 JSON 的

以用户输入：

```text
Top 5 Chinese restaurants in New York.
```

为例，后端 Agent 生成 JSON 的核心过程不是代码里手写拼 JSON，而是：

```text
用户输入
→ 作为 query 传给 LLM Agent
→ LLM Agent 根据 system prompt 知道必须返回 A2UI JSON
→ LLM 根据 query 调用 get_restaurants 工具拿数据
→ LLM 把工具数据组织成 A2UI JSON
→ 后端解析、校验、包装成 A2A DataPart 返回
```

关键点：**这个 demo 里的 A2UI JSON 主要是 LLM 根据 prompt/schema/examples 动态生成的，不是 Python 代码硬编码生成的。**

---

# 1. 用户输入先变成 `query`

在 [agent_executor.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent_executor.py:0:0-0:0) 里，如果不是 UI 事件，就会走：

```py
query = context.get_user_input()
```

所以：

```text
Top 5 Chinese restaurants in New York.
```

会作为普通自然语言 query 传给：

```py
self._agent.stream(
    query,
    task.context_id,
    active_ui_version,
    use_streaming=use_streaming
)
```

也就是进入：

```py
RestaurantAgent.stream(...)
```

---

# 2. [stream](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:178:2-399:48) 先判断当前是不是 A2UI 模式

你当前看的代码：

```py
if ui_version:
  runner = self._ui_runners[ui_version]
  schema_manager = self._schema_managers[ui_version]
  selected_catalog = (
      schema_manager.get_selected_catalog() if schema_manager else None
  )
else:
  runner = self._text_runner
  schema_manager = None
  selected_catalog = None
```

这里有两条路：

## 有 `ui_version`

说明前端声明支持 A2UI，比如：

```text
https://a2ui.org/a2a-extension/a2ui/v0.9
```

这时使用：

```py
self._ui_runners[ui_version]
```

也就是 **UI Agent runner**。

这个 runner 背后的 LLM prompt 会要求模型输出 A2UI JSON。

## 没有 `ui_version`

说明客户端只是普通文本客户端。

这时使用：

```py
self._text_runner
```

也就是普通文本 Agent。

它只会输出文本，不会输出 A2UI JSON。

---

# 3. UI Agent 是怎么构造出来的

在 [agent.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:0:0-0:0) 里：

```py
def _build_llm_agent(
    self,
    schema_manager: Optional[A2uiSchemaManager] = None
) -> LlmAgent:
```

核心代码：

```py
instruction = (
    schema_manager.generate_system_prompt(
        role_description=ROLE_DESCRIPTION,
        ui_description=UI_DESCRIPTION,
        include_schema=True,
        include_examples=True,
        validate_examples=True,
    )
    if schema_manager
    else get_text_prompt()
)
```

如果传了 `schema_manager`，就说明这是 UI Agent。

于是 system prompt 来自：

```py
schema_manager.generate_system_prompt(...)
```

而不是普通的 [get_text_prompt()](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/prompt_builder.py:55:0-72:7)。

---

# 4. `generate_system_prompt` 给 LLM 提供了什么

它会把这些信息组合进 system instruction：

## 1. 角色说明：`ROLE_DESCRIPTION`

大意是：

```text
你是一个餐厅查找和预订助手
```

所以 LLM 知道自己要处理餐厅查询、餐桌预订等任务。

## 2. UI 说明：`UI_DESCRIPTION`

这个描述告诉 LLM：

```text
你需要返回 A2UI 格式的 UI，不是普通文字。
```

例如：

- 查询餐厅时，返回餐厅列表 UI
- 预订时，返回预订表单 UI
- 确认预订时，返回确认页面 UI

## 3. A2UI schema

因为参数里有：

```py
include_schema=True
```

所以 prompt 里会包含 A2UI JSON 的结构规范。

模型会知道它应该生成类似这些 message：

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "default",
    "catalogId": "...",
    "theme": {}
  }
}
```

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "default",
    "components": []
  }
}
```

```json
{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "default",
    "path": "/",
    "value": {}
  }
}
```

## 4. 示例 examples

因为参数里有：

```py
include_examples=True
```

所以 prompt 里还会包含示例。

这些示例告诉 LLM：

```text
餐厅列表应该如何组织成 Card/List/Button/Image/Text
预订表单应该如何组织成 TextField/DateTimeInput/Button
确认页应该如何组织
```

所以模型不是凭空猜 JSON，而是参考示例生成类似结构。

## 5. catalog 约束

`schema_manager` 绑定了 basic catalog。

在 [agent.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:0:0-0:0) 里创建 schema manager 时，大致逻辑是：

```py
A2uiSchemaManager(
    version=version,
    catalogs=[
        BasicCatalog.get_config(...)
    ]
)
```

因此 LLM 被要求只能使用 basic catalog 中的组件，例如：

- `Column`
- `Row`
- `Card`
- `Text`
- `Image`
- `List`
- `Button`
- `TextField`
- `DateTimeInput`

---

# 5. LLM Agent 绑定了工具 `get_restaurants`

[\_build_llm_agent](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:147:2-176:5) 最后返回：

```py
return LlmAgent(
    model=Gemini(model=model_name),
    name="restaurant_agent",
    description="An agent that finds restaurants and helps book tables.",
    instruction=instruction,
    tools=[get_restaurants],
)
```

注意这里：

```py
tools=[get_restaurants]
```

这意味着 LLM 可以调用 Python 工具函数：

```py
get_restaurants
```

对应文件：

```text
samples/agent/adk/restaurant_finder/tools.py
```

用户输入：

```text
Top 5 Chinese restaurants in New York.
```

LLM 会从中抽取：

```text
cuisine = Chinese
location = New York
count = 5
```

然后调用工具获取餐厅数据。

工具返回的数据大概包括：

```json
[
  {
    "name": "Xi'an Famous Foods",
    "rating": "★★★★☆",
    "detail": "Spicy and savory hand-pulled noodles.",
    "imageUrl": "http://localhost:10002/static/shrimpchowmein.jpeg",
    "infoLink": "[More Info](https://www.xianfoods.com/)",
    "address": "81 St Marks Pl, New York, NY 10003"
  }
]
```

---

# 6. LLM 如何把工具结果变成 A2UI JSON

拿到工具返回的餐厅数据后，LLM 根据 system prompt 里的 schema 和 examples，生成 A2UI message 列表。

通常会包含三类 message。

---

## 6.1 `createSurface`：创建页面画布

LLM 先生成：

```json
{
  "version": "v0.9",
  "createSurface": {
    "surfaceId": "default",
    "catalogId": "https://a2ui.org/specification/v0_9/basic_catalog.json",
    "theme": {
      "primaryColor": "#FF0000",
      "font": "Roboto"
    }
  }
}
```

意思是：

```text
创建一个名为 default 的 UI surface，使用 basic catalog 渲染。
```

---

## 6.2 `updateComponents`：声明页面组件树

然后生成组件结构，例如：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "surfaceId": "default",
    "components": [
      {
        "id": "root",
        "component": "Column",
        "children": [
          "title-heading",
          "restaurant-list"
        ]
      },
      {
        "id": "title-heading",
        "component": "Text",
        "variant": "h1",
        "text": {
          "path": "/title"
        }
      },
      {
        "id": "restaurant-list",
        "component": "List",
        "direction": "vertical",
        "children": {
          "componentId": "restaurant-card-template",
          "path": "/items"
        }
      },
      {
        "id": "restaurant-card-template",
        "component": "Card",
        "child": "card-layout"
      }
    ]
  }
}
```

这一步不放具体餐厅文本，而是声明：

```text
页面有哪些组件
组件之间是什么父子关系
每个组件从数据模型的哪个 path 取值
```

比如：

```json
"text": {
  "path": "/title"
}
```

表示这个 Text 组件显示 data model 里的 `/title`。

---

## 6.3 `updateDataModel`：填充页面数据

最后生成数据：

```json
{
  "version": "v0.9",
  "updateDataModel": {
    "surfaceId": "default",
    "path": "/",
    "value": {
      "title": "Top 5 Chinese Restaurants in New York",
      "items": [
        {
          "name": "Xi'an Famous Foods",
          "rating": "★★★★☆",
          "detail": "Spicy and savory hand-pulled noodles.",
          "imageUrl": "http://localhost:10002/static/shrimpchowmein.jpeg",
          "address": "81 St Marks Pl, New York, NY 10003"
        }
      ]
    }
  }
}
```

这一步才是真正的数据。

前面的组件通过 `path` 引用这些数据。

例如：

```json
{
  "id": "template-name",
  "component": "Text",
  "text": {
    "path": "name"
  }
}
```

会在每个 list item 里取：

```json
"name": "Xi'an Famous Foods"
```

---

# 7. [stream](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:178:2-399:48) 里真正调用 LLM 的地方

在 [RestaurantAgent.stream](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:178:2-399:48) 中，真正触发 LLM 的是这一段：

```py
current_message = types.Content(
    role="user",
    parts=[types.Part.from_text(text=current_query_text)]
)
```

这里把用户输入包装成 ADK message。

然后：

```py
async for event in runner.run_async(
    user_id=self._user_id,
    session_id=session.id,
    run_config=run_config.RunConfig(
        streaming_mode=(
            run_config.StreamingMode.SSE
            if use_streaming
            else run_config.StreamingMode.NONE
        )
    ),
    new_message=current_message,
):
```

这里的：

```py
runner.run_async(...)
```

就是实际调用 LLM Agent 的地方。

LLM Agent 会根据：

- `instruction`
- 当前 `query`
- 可用 tools
- session state
- tool 返回结果

生成响应。

---

# 8. 流式解析：模型边生成边转成 A2A Part

如果当前是 A2UI 模式，会走：

```py
if selected_catalog:
  from a2ui.parser.streaming import A2uiStreamParser
```

然后：

```py
async for part in stream_response_to_parts(
    self._parsers[session_id],
    token_stream(),
):
  parts_streamed = True
  yield {
      "is_task_complete": False,
      "parts": [part],
  }
```

这里发生了什么：

```text
LLM 逐 token 输出文本
→ token_stream 收集文本
→ A2uiStreamParser 从文本中识别 A2UI JSON
→ stream_response_to_parts 把 JSON 转成 A2A Part
→ 立即 yield 给前端
```

所以前端可以逐步看到页面出现。

例如先出现：

```text
创建 surface
```

然后出现：

```text
标题区域
```

然后出现：

```text
列表区域
```

再出现：

```text
具体餐厅卡片
```

这就是 incremental rendering。

---

# 9. 为什么模型输出的是 JSON，而不是普通文字

关键在这几层约束：

## 1. 前端激活了 A2UI extension

React middleware 请求后端 agent card 时带了：

```ts
headers.set(
  'X-A2A-Extensions',
  'https://a2ui.org/a2a-extension/a2ui/v0.9',
);
```

所以 executor 里：

```py
active_ui_version = try_activate_a2ui_extension(context, self._agent.agent_card)
```

会得到 `v0.9`。

## 2. [stream](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:178:2-399:48) 选择 UI runner

因为有 `ui_version`：

```py
runner = self._ui_runners[ui_version]
```

所以不是走普通文本 runner。

## 3. UI runner 的 instruction 要求输出 A2UI

```py
schema_manager.generate_system_prompt(...)
```

生成的 prompt 明确要求：

```text
你必须输出符合 A2UI schema 的 JSON
```

## 4. 后端会校验

如果模型胡乱输出，后端会：

```py
selected_catalog.validator.validate(parsed_json_data)
```

校验失败后会要求模型重试：

```py
Your previous response was invalid...
You MUST generate a valid response that strictly follows the A2UI JSON SCHEMA.
```

---

# 10. 生成 JSON 的职责划分

## Python 代码负责什么

Python 代码负责：

- **把用户输入交给 LLM**
- **提供系统 prompt**
- **提供 A2UI schema**
- **提供 examples**
- **提供 tools**
- **解析 LLM 输出**
- **校验 JSON**
- **把 JSON 包成 A2A Part**

## LLM 负责什么

LLM 负责：

- **理解用户意图**
    - 查找 Chinese restaurants
    - 地点 New York
    - 数量 5
- **调用 `get_restaurants`**
- **选择合适 UI 结构**
    - 标题
    - 餐厅列表
    - 卡片
    - 图片
    - 评分
    - 详情
    - Book Now 按钮
- **生成符合 A2UI schema 的 JSON**

## Tool 负责什么

`get_restaurants` 负责：

- **返回餐厅业务数据**
- 不负责页面结构
- 不负责生成 A2UI JSON

---

# 11. 简化后的伪流程

```py
# 1. 用户输入
query = "Top 5 Chinese restaurants in New York."

# 2. 因为前端支持 A2UI，所以选择 UI runner
runner = self._ui_runners["v0.9"]

# 3. 构造给 LLM 的用户消息
current_message = Content(
    role="user",
    parts=[Part.from_text(query)]
)

# 4. 调用 LLM
events = runner.run_async(new_message=current_message)

# 5. LLM 内部根据 prompt 调用 get_restaurants
restaurants = get_restaurants(
    cuisine="Chinese",
    location="New York",
    count=5
)

# 6. LLM 根据 schema/examples 生成 A2UI JSON
a2ui_messages = [
    {"version": "v0.9", "createSurface": ...},
    {"version": "v0.9", "updateComponents": ...},
    {"version": "v0.9", "updateDataModel": ...},
]

# 7. 后端解析和校验
selected_catalog.validator.validate(a2ui_messages)

# 8. 包成 A2A parts 返回前端
return parse_response_to_parts(a2ui_messages)
```

---

# 12. 一句话总结

`Agent` 根据用户输入生成 JSON 的核心机制是：

```text
不是 Python 代码手写 JSON，
而是 LLM 在 A2UI system prompt、schema、examples、catalog 约束和 get_restaurants 工具结果的共同作用下，动态生成符合 A2UI 协议的 JSON。
```

具体触发点是：

```py
runner.run_async(...)
```

具体约束来源是：

```py
schema_manager.generate_system_prompt(...)
```

具体数据来源是：

```py
tools=[get_restaurants]
```

具体安全校验是：

```py
selected_catalog.validator.validate(parsed_json_data)
```

### User Input

那看来前端的UI展示其实模型是参考了预设的json模板，查询得到数据，一起返回前端渲染的，那和之前的普通的开发页面，插接口得到数据渲染，A2UI的优势是什么呢

### Planner Response

# 你的理解基本正确

可以这么理解：

```text
传统前端：
前端工程师提前写死页面结构
→ 调接口拿数据
→ 把数据填进固定组件里

A2UI：
Agent/模型根据任务动态生成 UI JSON
→ 同时返回 UI 结构 + 数据
→ 前端只负责安全地解释和渲染这个 JSON
```

你说的“模型参考预设 JSON 模板，查询得到数据，一起返回前端渲染”，在这个 demo 里是对的。

不过 A2UI 的价值不只是“换一种方式渲染页面”，而是把 **UI 决策权从前端固定代码里部分转移给 Agent**。

---

# 传统开发页面是什么模式

比如餐厅搜索页面，传统 React 可能是这样：

```text
RestaurantSearchPage
├── SearchInput
├── RestaurantList
│   └── RestaurantCard
│       ├── Image
│       ├── Name
│       ├── Rating
│       └── BookButton
└── BookingModal
```

前端工程师提前决定：

- 页面有哪些区域
- 什么情况下展示列表
- 什么情况下展示表单
- 什么情况下展示确认页
- 每个接口数据字段怎么绑定组件
- 点击按钮后调哪个接口
- loading/error/empty 状态怎么显示

后端接口通常只返回数据：

```json
{
  "restaurants": [
    {
      "name": "Xi'an Famous Foods",
      "rating": "★★★★☆"
    }
  ]
}
```

前端拿到后自己决定怎么展示。

---

# A2UI 是什么模式

A2UI 里，后端 Agent 返回的不只是数据，而是：

```text
UI 结构 + 数据模型 + 交互事件定义
```

例如：

```json
{
  "version": "v0.9",
  "updateComponents": {
    "components": [
      {
        "id": "restaurant-list",
        "component": "List",
        "children": {
          "componentId": "restaurant-card-template",
          "path": "/items"
        }
      }
    ]
  }
}
```

再返回数据：

```json
{
  "version": "v0.9",
  "updateDataModel": {
    "value": {
      "items": [...]
    }
  }
}
```

前端不需要提前知道：

```text
这次一定是餐厅列表
```

它只需要知道：

```text
我支持 Card、Text、Button、List、Image 这些可信组件
```

然后按 JSON 渲染。

---

# A2UI 的核心优势

## 1. UI 可以随任务动态变化

传统页面通常是：

```text
一个页面服务一个固定场景
```

比如餐厅页就是餐厅页，航班页就是航班页，表单页就是表单页。

A2UI 可以根据用户请求动态生成不同 UI：

```text
用户问：找餐厅
→ 返回餐厅卡片列表

用户说：帮我订这家
→ 返回预订表单

用户说：我有过敏忌口
→ 表单里动态加 dietary requirements 字段

用户说：我要包间，带儿童座椅
→ Agent 可以动态生成额外输入项

用户说：比较这几家餐厅
→ 返回对比表格或分组卡片
```

传统前端也能做，但每一种状态都要前端提前写好。

A2UI 的优势是：

```text
Agent 可以根据上下文决定下一步最合适的 UI。
```

---

## 2. 更适合 Agentic workflow

普通接口开发里，流程通常是前端设计好的：

```text
搜索 → 列表 → 详情 → 下单
```

但 Agent 场景里，用户请求可能非常开放：

```text
帮我找一家适合 6 个人、预算 100 美元以内、离我酒店近、可以带狗的餐厅，如果有空位就帮我订明晚 7 点
```

这种场景下，下一步 UI 不一定固定。

Agent 可能需要：

- 先展示候选餐厅
- 再让用户补充人数
- 再展示时间选择器
- 再展示确认卡片
- 再展示错误恢复方案
- 再展示替代餐厅

A2UI 让 Agent 可以在每一步动态决定 UI。

---

## 3. 前端不需要为每个 Agent 单独开发页面

这是 A2UI 很重要的价值。

假设你有很多 agent：

- 餐厅预订 agent
- 航班预订 agent
- 酒店预订 agent
- 医疗问诊 agent
- 保险理赔 agent
- HR 表单 agent
- 数据分析 agent

传统模式下，你可能要为每个 agent 写不同页面：

```text
RestaurantPage
FlightPage
HotelPage
MedicalFormPage
InsuranceClaimPage
DashboardPage
...
```

A2UI 模式下，前端可以是一个通用 shell：

```text
A2UIShell
```

只要 agent 返回的是 A2UI JSON，shell 就能渲染。

也就是：

```text
一个前端 shell，可以承载多个 agent。
```

---

## 4. 跨端/跨框架复用

README 里提到：

```text
Framework-agnostic and portable
```

同一份 A2UI JSON 可以被不同客户端渲染：

```text
React renderer
Lit renderer
Flutter renderer
SwiftUI renderer
Android native renderer
```

比如 agent 返回：

```json
{
  "component": "Button",
  "child": "submit-text"
}
```

React 端可以渲染成：

```tsx
<button>Submit</button>
```

Flutter 端可以渲染成：

```dart
ElevatedButton(...)
```

SwiftUI 可以渲染成：

```swift
Button(...)
```

传统前端页面很难做到这一点，因为页面逻辑和 React/Vue/Flutter 代码强绑定。

A2UI 把 UI 抽象成协议。

---

## 5. 安全性比“让模型生成代码”高

如果让 LLM 直接生成 React 代码：

```tsx
return <script>...</script>
```

风险很高。

A2UI 不让模型生成可执行代码，只允许生成声明式 JSON：

```json
{
  "component": "Card"
}
```

前端只会从可信 catalog 里找组件：

```text
Card
Text
Button
Image
TextField
DateTimeInput
```

如果模型生成了未知组件：

```json
{
  "component": "EvilScript"
}
```

前端不会执行它，只会报错：

```text
Unknown component: EvilScript
```

所以 A2UI 的安全边界是：

```text
模型只能请求使用前端预注册的安全组件。
```

这比“LLM 生成 HTML/JS”安全很多。

---

## 6. 支持渐进式渲染

A2UI JSON 是一条条 message：

```text
createSurface
updateComponents
updateDataModel
```

甚至可以边生成边渲染。

比如模型先返回：

```json
createSurface
```

前端创建页面。

然后返回：

```json
updateComponents: title
```

前端先显示标题。

然后返回：

```json
updateComponents: loading skeleton
```

前端显示骨架屏。

然后返回：

```json
updateDataModel
```

前端填充数据。

这比传统接口：

```text
等接口完整返回后再渲染
```

更适合 LLM streaming 场景。

---

## 7. 交互可以回流给 Agent

传统页面里，点击按钮通常是：

```text
Button onClick → 调固定接口
```

A2UI 里，按钮 action 可以变成结构化事件：

```json
{
  "event": {
    "name": "book_restaurant",
    "context": {
      "restaurantName": {
        "path": "name"
      }
    }
  }
}
```

点击后，前端把事件发回 Agent：

```json
{
  "version": "v0.9",
  "action": {
    "name": "book_restaurant",
    "context": {
      "restaurantName": "Xi'an Famous Foods"
    }
  }
}
```

Agent 再决定下一步 UI。

所以流程不是前端写死：

```text
点击 Book → 打开固定 modal
```

而是：

```text
点击 Book → 告诉 Agent 用户想订这家 → Agent 生成下一步 UI
```

这更适合对话式、多轮任务。

---

# 和传统开发的本质区别

## 传统模式

```text
前端决定 UI
后端提供数据
```

例如：

```text
前端：我要渲染 RestaurantCard
后端：给你 restaurants 数据
```

## A2UI 模式

```text
Agent 决定当前任务需要什么 UI
前端提供可信渲染能力
```

例如：

```text
Agent：请创建一个 List，里面每项是 Card，Card 里有 Image、Text、Button
前端：这些组件我都认识，我来安全渲染
```

---

# 什么时候 A2UI 有优势

## 适合

- **Agent 应用**
    - 用户意图开放，不是固定页面流程
- **多步骤任务**
    - 查询、补充信息、确认、提交
- **动态表单**
    - 字段根据上下文变化
- **多 agent 平台**
    - 一个 shell 承载多个 agent
- **跨端渲染**
    - 同一 Agent 输出给 Web、移动端、桌面端
- **LLM streaming UI**
    - 边生成边渲染
- **低代码/动态 UI**
    - 后端或 Agent 控制 UI 形态

---

# 什么时候传统开发更合适

A2UI 不是替代所有前端开发。

如果你的页面是：

- 电商首页
- 高度定制的复杂 dashboard
- 性能极致优化页面
- 交互非常固定
- 视觉设计要求非常强
- SEO 很重要
- 前端逻辑复杂到需要大量本地状态管理

那传统 React/Vue/Next 页面通常更合适。

A2UI 更适合：

```text
任务型 Agent UI
```

而不是所有 UI。

---

# 用这个餐厅 demo 对比一下

## 传统做法

你会写：

```text
RestaurantSearchPage.tsx
RestaurantCard.tsx
BookingForm.tsx
Confirmation.tsx
api.ts
```

然后写固定流程：

```text
搜索 → 显示列表
点击 Book → 打开 BookingForm
提交 → 显示 Confirmation
```

## A2UI 做法

前端只有一个通用 shell：

```text
App.tsx
A2uiSurface.tsx
basicCatalog
```

后端 Agent 返回：

```text
这一步应该展示餐厅列表
下一步应该展示预订表单
再下一步应该展示确认页
```

前端不关心这是餐厅、航班还是酒店。

只要 JSON 符合 A2UI schema，它就能渲染。

---

# 更准确地说，A2UI 的优势不是“省掉接口”

它不是说：

```text
以后不用接口了
```

而是把接口从：

```text
只返回业务数据
```

扩展成：

```text
返回任务当前阶段所需的 UI 描述 + 数据 + 交互事件
```

也就是：

```text
API response = UI state
```

这在 Agent 场景里非常有价值，因为 Agent 的下一步 UI 是动态的。

---

# 一句话总结

A2UI 相比传统“前端写页面 + 调接口拿数据”的优势是：

```text
传统前端把 UI 流程写死在客户端；
A2UI 把 UI 结构变成一种安全、可校验、跨端的 JSON 协议，让 Agent 可以根据用户意图和上下文动态决定下一步展示什么 UI。
```

在这个 demo 里，餐厅列表看起来和传统接口渲染差别不大；但当任务变成多轮、开放、跨 agent、跨端、动态表单时，A2UI 的价值就明显了。

### User Input

那模型怎么知道下一步UI是什么

### Planner Response

# 模型怎么知道下一步 UI 是什么

简单说：

```text
模型不是“天然知道”下一步 UI，
而是根据 system prompt、当前用户输入、历史上下文、工具结果、A2UI schema、示例 examples 共同推理出来的。
```

在这个餐厅 demo 里，模型判断下一步 UI 的依据主要有 5 个。

---

# 1. System prompt 告诉它业务流程

在 [prompt_builder.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/prompt_builder.py:0:0-0:0) / [agent.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:0:0-0:0) 里，会给模型一个系统提示。

核心意思是：

```text
你是一个餐厅查找和订座助手。
你需要根据用户请求返回合适的 A2UI UI。
```

并且 prompt 里通常会描述几种场景：

```text
1. 用户要找餐厅
   → 调用 get_restaurants
   → 返回餐厅列表 UI

2. 用户想预订某家餐厅
   → 返回预订信息填写 UI

3. 用户提交了预订信息
   → 返回确认 UI
```

所以模型并不是随便猜，而是被 prompt 明确引导。

---

# 2. 当前用户输入告诉它用户意图

例如用户输入：

```text
Top 5 Chinese restaurants in New York.
```

模型会理解这是：

```text
找餐厅
```

所以它选择下一步 UI：

```text
餐厅列表 UI
```

如果用户输入：

```text
I want to book Xi'an Famous Foods
```

模型会理解这是：

```text
预订餐厅
```

所以它选择：

```text
预订表单 UI
```

如果用户输入：

```text
Book it for 2 people tomorrow 7pm, no peanuts
```

模型会理解这是：

```text
提交预订信息
```

所以它可能选择：

```text
确认页 UI
```

---

# 3. UI 事件也会告诉模型下一步是什么

在 A2UI 里，前端点击按钮后，会把结构化事件发回后端。

例如点击 `Book Now` 后，前端发：

```json
{
  "version": "v0.9",
  "action": {
    "name": "book_restaurant",
    "context": {
      "restaurantName": "Xi'an Famous Foods",
      "address": "81 St Marks Pl, New York, NY 10003",
      "imageUrl": "http://localhost:10002/static/shrimpchowmein.jpeg"
    }
  }
}
```

后端 [agent_executor.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent_executor.py:0:0-0:0) 会把它转换成自然语言 query：

```py
query = (
    f"USER_WANTS_TO_BOOK: {restaurant_name}, Address: {address}, ImageURL:"
    f" {image_url}"
)
```

所以模型收到的不是模糊输入，而是很明确的：

```text
USER_WANTS_TO_BOOK: Xi'an Famous Foods, Address: ..., ImageURL: ...
```

于是模型就知道：

```text
用户点击了订餐按钮，下一步应该展示预订表单。
```

---

# 4. 工具结果决定 UI 里的数据

比如用户说：

```text
Top 5 Chinese restaurants in New York.
```

模型先判断要找餐厅，然后调用：

```py
get_restaurants
```

工具返回餐厅数据后，模型知道：

```text
我现在有一个 restaurant list
```

于是它选择适合列表数据的 UI：

```text
List + Card + Image + Text + Button
```

如果工具返回的是：

```text
没有找到餐厅
```

那模型可能生成：

```text
空状态 UI
```

比如：

```text
没有找到匹配餐厅，请换一个地点或菜系
```

如果工具返回的是：

```text
需要用户补充地点
```

那模型可能生成：

```text
让用户输入 location 的表单
```

所以工具结果也影响下一步 UI。

---

# 5. 历史上下文告诉模型当前处于哪一步

[RestaurantAgent.stream](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent.py:178:2-399:48) 里使用了 session：

```py
session = await runner.session_service.get_session(...)
```

如果没有 session，会创建：

```py
session = await runner.session_service.create_session(...)
```

这意味着多轮对话中，模型可以看到上下文。

例如：

第一轮：

```text
User: Top 5 Chinese restaurants in New York.
Agent: 返回餐厅列表 UI
```

第二轮用户点击：

```text
Book Now
```

这时模型知道：

```text
刚才展示的是餐厅列表
现在用户选择了其中一家
```

所以它更容易判断下一步是：

```text
预订表单
```

第三轮用户提交表单：

```text
partySize=2, reservationTime=tomorrow 7pm
```

模型知道：

```text
用户已经填写了预订信息
```

所以生成：

```text
确认页
```

---

# 用餐厅 demo 举三个具体例子

## 例子 1：用户第一次搜索餐厅

用户输入：

```text
Top 5 Chinese restaurants in New York.
```

模型判断：

```text
意图 = find restaurants
```

工具调用：

```text
get_restaurants(cuisine="Chinese", location="New York", count=5)
```

下一步 UI：

```text
餐厅列表
```

生成的组件大概是：

```text
Column
├── Text(title)
└── List(items)
    └── Card
        ├── Image
        ├── Text(name)
        ├── Text(rating)
        ├── Text(detail)
        └── Button(Book Now)
```

---

## 例子 2：用户点击 Book Now

前端发回 UI event：

```json
{
  "action": {
    "name": "book_restaurant",
    "context": {
      "restaurantName": "Xi'an Famous Foods"
    }
  }
}
```

后端转成：

```text
USER_WANTS_TO_BOOK: Xi'an Famous Foods
```

模型判断：

```text
意图 = booking
缺少 party size/date/time/dietary
```

下一步 UI：

```text
预订表单
```

生成：

```text
Column
├── Text(Book a Table at Xi'an Famous Foods)
├── Image
├── Text(address)
├── TextField(partySize)
├── DateTimeInput(reservationTime)
├── TextField(dietary)
└── Button(Submit Reservation)
```

---

## 例子 3：用户提交预订表单

前端发：

```json
{
  "action": {
    "name": "submit_booking",
    "context": {
      "restaurantName": "Xi'an Famous Foods",
      "partySize": "2",
      "reservationTime": "2026-05-29 19:00",
      "dietary": "no peanuts"
    }
  }
}
```

后端转成：

```text
User submitted a booking for Xi'an Famous Foods for 2 people at 2026-05-29 19:00 with dietary requirements: no peanuts.
```

模型判断：

```text
意图 = confirmation
```

下一步 UI：

```text
确认页
```

生成：

```text
Card
└── Column
    ├── Text(Booking Confirmed)
    ├── Image
    ├── Text(2 people at 2026-05-29 19:00)
    ├── Text(Dietary Requirements: no peanuts)
    └── Text(We look forward to seeing you!)
```

---

# 模型“知道”的本质：不是规则代码，而是 prompt + 上下文推理

在传统前端里，下一步 UI 是代码写死的：

```ts
if (action === 'book_restaurant') {
  showBookingForm();
}
```

在 A2UI 里，这个决策更多交给模型：

```text
用户现在想订餐
→ 需要收集人数、时间、忌口
→ 所以下一步应该是表单
```

但是注意，这不是完全无约束的。

模型受到这些约束：

- **业务 prompt**
    - 告诉它餐厅查找/预订的流程
- **A2UI schema**
    - 告诉它 JSON 必须长什么样
- **catalog**
    - 限制它只能用哪些组件
- **examples**
    - 给它参考模板
- **validator**
    - 后端会校验生成结果是否合法

---

# 那是不是完全靠模型自由发挥？

不是。

这个 demo 是一种偏 Agentic 的做法：

```text
模型负责决策下一步 UI
```

但实际生产里通常会混合使用：

## 方式 1：模型自由生成 UI

适合：

- demo
- 快速原型
- 开放式任务
- UI 变化很多的 agent

优点：

```text
灵活
```

缺点：

```text
稳定性依赖 prompt 和模型能力
```

---

## 方式 2：模型只选 UI 模板

生产中更常见。

比如你可以预设：

```text
restaurant_list_template
booking_form_template
confirmation_template
empty_state_template
error_template
```

模型只输出：

```json
{
  "next_ui": "booking_form_template",
  "data": {...}
}
```

然后后端用确定性代码生成 A2UI JSON。

优点：

```text
稳定、可控、好测试
```

缺点：

```text
灵活性弱一些
```

---

## 方式 3：规则 + 模型混合

例如：

```py
if action == "book_restaurant":
    return render_booking_form_json(ctx)

if action == "submit_booking":
    return render_confirmation_json(ctx)

else:
    let model generate restaurant list
```

这种方式很实用。

关键业务流程用代码保证，开放式查询交给模型。

---

# 回到你的问题

你问：

```text
模型怎么知道下一步 UI 是什么？
```

答案是：

```text
它根据当前输入或 UI action 判断用户意图，
结合 prompt 中定义的业务流程，
参考 examples 中的 UI 模板，
使用工具返回的数据，
再根据 A2UI schema/catalog 生成下一步 UI JSON。
```

在餐厅 demo 里：

- `Top 5 Chinese restaurants...`
    - 意图是找餐厅
    - 下一步是餐厅列表 UI

- `book_restaurant` action
    - 意图是预订
    - 下一步是预订表单 UI

- `submit_booking` action
    - 意图是确认预订
    - 下一步是确认页 UI

---

# 最核心的一句话

```text
模型不是凭空知道下一步 UI；
它是被 prompt 告知业务流程，被 schema/catalog 限制可用组件，被 examples 提供参考样式，再结合用户输入、UI 事件和工具数据推理出下一步 UI。
```

_Edited relevant file_

_Edited relevant file_

_Viewed [agent_executor.py](file:///Users/elaine/A2UI-New/samples/agent/adk/restaurant_finder/agent_executor.py) _

### User Input

Open a browser preview of my website.
