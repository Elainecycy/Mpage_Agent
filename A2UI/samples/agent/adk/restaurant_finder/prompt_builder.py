# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from a2ui.schema.constants import VERSION_0_9
from a2ui.schema.manager import A2uiSchemaManager
from a2ui.basic_catalog.provider import BasicCatalog
from a2ui.schema.common_modifiers import remove_strict_validation

# 你是一个乐于助人的餐厅查找助手。你的最终输出必须是a2ui的UI JSON响应。
ROLE_DESCRIPTION = (
    "You are a helpful restaurant finding assistant. Your final output MUST be a a2ui"
    " UI JSON response."
)

# UI 描述如下：
# - 如果查询内容是关于餐厅列表的，请使用您从“获取餐厅信息”工具中已获取的餐厅数据来填充“更新数据模型”消息。
# - 重要提示：在使用“更新数据模型”来更新项目时，必须在“更新数据模型”中指定“路径：/项目”且“值”必须是餐厅的数组。
# - 重要提示：在使用“更新数据模型”时，务必指定路径。若路径缺失，则部分消息将被忽略。
# - 如果餐厅数量为 5 个或更少，则必须使用“单列列表示例”模板。
# - 如果餐厅数量多于 5 个，则必须使用“两列列表示例”模板。
# - 如果查询是预订餐厅（例如，“用户想要预订...”），则必须使用“预订表单示例”模板。
# - 如果查询是预订提交（例如，“用户提交了预订...”），则必须使用“确认示例”模板。"""
UI_DESCRIPTION = """
-   If the query is for a list of restaurants, use the restaurant data you have already received from the `get_restaurants` tool to populate the `updateDataModel` message.
-   IMPORTANT: When using updateDataModel to update items, you MUST specify `path: "/items"` in `updateDataModel`, and the `value` MUST be an array of restaurants.
-   IMPORTANT: Always specify the path when using updateDataModel. The part message is ignored when the path is missing.
-   If the number of restaurants is 5 or fewer, you MUST use the `SINGLE_COLUMN_LIST_EXAMPLE` template.
-   If the number of restaurants is more than 5, you MUST use the `TWO_COLUMN_LIST_EXAMPLE` template.
-   If the query is to book a restaurant (e.g., "USER_WANTS_TO_BOOK..."), you MUST use the `BOOKING_FORM_EXAMPLE` template.
-   If the query is a booking submission (e.g., "User submitted a booking..."), you MUST use the `CONFIRMATION_EXAMPLE` template.
"""

# def 获取文本提示() -> str"""
# 为纯文本型代理构建提示信息。"""
# """
# 您是一位乐于助人的餐厅查找助手。您的最终输出必须是文本形式的回复。
# 为生成回复，您必须遵守以下规则：1.  **关于查找餐厅：**
# a. 您必须调用“获取餐厅”工具。从用户的查询中提取菜系、地点以及特定数量（`count`）的餐厅信息。
# b. 在接收到数据后，将餐厅列表格式化为清晰、易于理解的人类可读文本回复。您必须保留从该工具接收到的任何 Markdown 格式（例如用于链接的格式）。
# 2.  **对于预订餐桌（当您收到类似‘用户希望预订……’这样的询问时）：**
# a. 回复时向用户询问进行预订所需的详细信息（人数、日期、时间、饮食要求）。
# 3.  **在确认预订（当您收到类似‘用户提交了预订信息……’这样的询问时）：**
# b. 用简洁的文字确认预订详情即可。"""

def get_text_prompt() -> str:
  """
  Constructs the prompt for a text-only agent.
  """
  return """
    You are a helpful restaurant finding assistant. Your final output MUST be a text response.

    To generate the response, you MUST follow these rules:
    1.  **For finding restaurants:**
        a. You MUST call the `get_restaurants` tool. Extract the cuisine, location, and a specific number (`count`) of restaurants from the user's query.
        b. After receiving the data, format the restaurant list as a clear, human-readable text response. You MUST preserve any markdown formatting (like for links) that you receive from the tool.

    2.  **For booking a table (when you receive a query like 'USER_WANTS_TO_BOOK...'):**
        a. Respond by asking the user for the necessary details to make a booking (party size, date, time, dietary requirements).

    3.  **For confirming a booking (when you receive a query like 'User submitted a booking...'):**
        a. Respond with a simple text confirmation of the booking details.
    """


if __name__ == "__main__":
  # Example of how to use the A2UI Schema Manager to generate a system prompt
  # In your actual application, you would call this from your main agent logic.

  # You can now easily construct a prompt with the relevant examples.
  # For a different agent (e.g., a flight booker), you would pass in
  # different examples but use the same `get_ui_prompt` function.
  # 说明如何使用 A2UI 架构管理器来生成系统提示
# 在实际应用中，您应从主代理逻辑中调用此功能。
# 现在您可以轻松地根据相关示例构建提示。
# 对于不同的代理（例如，航班预订系统），您需要输入不同的示例，但要使用相同的 `get_ui_prompt` 函数。
  version = VERSION_0_9
  restaurant_prompt = A2uiSchemaManager(
      version,
      catalogs=[
          BasicCatalog.get_config(
              version=version,
              examples_path=f"examples/{version}",
          )
      ],
      schema_modifiers=[remove_strict_validation],
  ).generate_system_prompt(
      role_description=ROLE_DESCRIPTION,
      ui_description=UI_DESCRIPTION,
      include_schema=True,
      include_examples=True,
      validate_examples=True,
  )

  print(restaurant_prompt)

  # This demonstrates how you could save the prompt to a file for inspection
  with open("generated_prompt.txt", "w") as f:
    f.write(restaurant_prompt)
  print("\nGenerated prompt saved to generated_prompt.txt")
