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

import logging
import os
from pathlib import Path
from typing import TYPE_CHECKING

import click
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

# 为 IDE 提供稳定的静态导入目标（Cmd+点击/F12）。
if TYPE_CHECKING:
  from .agent import RestaurantAgent
  from .agent_executor import RestaurantAgentExecutor
else:
  from agent import RestaurantAgent
  from agent_executor import RestaurantAgentExecutor

load_dotenv(dotenv_path=Path(__file__).with_name(".env"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MissingAPIKeyError(Exception):
  """Exception for missing API key."""


@click.command()
@click.option("--host", default="localhost")
@click.option("--port", default=10002)
def main(host, port):
  try:
    # Check for Gemini API key only when a Gemini model is in use.
    # Non-Gemini LiteLLM setups (e.g., DashScope OpenAI-compatible) can use
    # LITELLM_BASE_URL/LITELLM_API_KEY instead.
    litellm_model = os.getenv("LITELLM_MODEL", "gemini/gemini-2.5-flash")
    uses_gemini = "gemini" in litellm_model.lower()
    if uses_gemini and not os.getenv("GOOGLE_GENAI_USE_VERTEXAI") == "TRUE":
      if not os.getenv("GEMINI_API_KEY"):
        raise MissingAPIKeyError(
            "GEMINI_API_KEY environment variable not set and GOOGLE_GENAI_USE_VERTEXAI"
            " is not TRUE."
        )

    base_url = f"http://{host}:{port}"

    agent = RestaurantAgent(base_url=base_url)

    agent_executor = RestaurantAgentExecutor(agent)

    request_handler = DefaultRequestHandler(
        agent_executor=agent_executor,
        task_store=InMemoryTaskStore(),
    )
    server = A2AStarletteApplication(
        agent_card=agent.agent_card, http_handler=request_handler
    )
    import uvicorn

    app = server.build()

    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"http://localhost:\d+",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.mount("/static", StaticFiles(directory="images"), name="static")

    uvicorn.run(app, host=host, port=port)
  except MissingAPIKeyError as e:
    logger.error(f"Error: {e}")
    exit(1)
  except Exception as e:
    logger.error(f"An error occurred during server startup: {e}")
    exit(1)


if __name__ == "__main__":
  main()
