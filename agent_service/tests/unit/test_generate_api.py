"""生成接口端到端集成测试（任务 1.6 / 技改 F5）。

用 TestClient + 隔离内存库 + 假网关（不触真实网络）走通：成功生成并落库、可按 pageId 查回、
版本递增、并发 409、素材非法 400、生成失败 422、模型超时 504、请求体校验 422、缺记录 404。
"""

import json

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_gateway
from app.catalog import load_example_page
from app.db import Base, get_session
from app.main import create_app
from app.services import page_locks
from app.services.llm_gateway import LLMResponse, LLMTimeoutError


class FakeGateway:
    """假网关：按脚本逐次返回内容或抛异常，并记录调用。"""

    def __init__(self, outputs: list) -> None:
        self.outputs = outputs
        self.calls: list = []

    def complete(self, messages, *, json_mode=None) -> LLMResponse:
        self.calls.append(messages)
        item = self.outputs[len(self.calls) - 1]
        if isinstance(item, Exception):
            raise item
        return LLMResponse(content=item, model="fake", latency_s=0.0, prompt_tokens=1, completion_tokens=1)


def _manifest() -> list[dict]:
    """据标准示例图片造一份全命中白名单 manifest。"""
    ex = load_example_page()
    return [{"url": v["url"]} for v in ex["data"]["images"].values()]


def _make_client(outputs: list) -> tuple[TestClient, FakeGateway]:
    """装配 TestClient：隔离内存库 + 假网关，覆盖 get_session / get_gateway 依赖。

    Args:
        outputs: 假网关的脚本输出。

    Returns:
        ``(client, fake_gateway)``。
    """
    app = create_app()
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    maker = sessionmaker(bind=engine, expire_on_commit=False)

    def _session():
        with maker() as s:
            yield s

    fake = FakeGateway(outputs)
    app.dependency_overrides[get_session] = _session
    app.dependency_overrides[get_gateway] = lambda: fake
    return TestClient(app), fake


def _body(manifest: list[dict] | None = None) -> dict:
    """组请求体（默认带标准 manifest）。"""
    return {"userPrompt": "做一个新春活动页", "assetManifest": manifest if manifest is not None else _manifest()}


# ——————————————————— 成功路径 + 落库查询 ———————————————————


def test_generate_success_and_get_back() -> None:
    """成功生成返回 pageJson、版本 1，并可按 pageId 查回同一份（验收 §4.5.2-1/3）。"""
    client, _ = _make_client([json.dumps(load_example_page())])
    resp = client.post("/api/pages/p1/generate", json=_body())
    assert resp.status_code == 200
    data = resp.json()
    assert data["pageId"] == "p1"
    assert data["version"] == 1
    assert data["pageJson"]["components"][0]["component"] == "Page"

    got = client.get("/api/pages/p1")
    assert got.status_code == 200
    assert got.json()["pageJson"] == data["pageJson"]


def test_second_generation_bumps_version() -> None:
    """同 pageId 再次生成版本号递增到 2。"""
    ex = json.dumps(load_example_page())
    client, _ = _make_client([ex, ex])
    assert client.post("/api/pages/p1/generate", json=_body()).json()["version"] == 1
    assert client.post("/api/pages/p1/generate", json=_body()).json()["version"] == 2


# ——————————————————— 失败场景（结构化错误码）———————————————————


def test_invalid_manifest_returns_400_without_model_call() -> None:
    """素材清单为空：400 invalid_manifest，且未触达网关。"""
    client, fake = _make_client([])
    resp = client.post("/api/pages/p1/generate", json=_body(manifest=[]))
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "invalid_manifest"
    assert fake.calls == []


def test_generation_failed_returns_422() -> None:
    """模型反复输出不合格：422 generation_failed，带错误明细。"""
    bad = json.dumps(
        {"components": [{"id": "x", "component": "Text", "content": {"path": "/texts/a"}}],
         "data": {"texts": {"a": "hi"}, "images": {}}}
    )
    client, _ = _make_client([bad, bad])
    resp = client.post("/api/pages/p1/generate", json=_body())
    assert resp.status_code == 422
    body = resp.json()
    assert body["error"]["code"] == "generation_failed"
    assert body["error"]["details"]["errors"]


def test_model_timeout_returns_504() -> None:
    """网关超时映射为 504 model_timeout。"""
    client, _ = _make_client([LLMTimeoutError("超时")])
    resp = client.post("/api/pages/p1/generate", json=_body())
    assert resp.status_code == 504
    assert resp.json()["error"]["code"] == "model_timeout"


def test_concurrent_generation_returns_409() -> None:
    """同 pageId 生成进行中时，重复提交被 409 拦下，且不进入生成。"""
    client, fake = _make_client([json.dumps(load_example_page())])
    with page_locks.page_generation_lock("busy"):
        resp = client.post("/api/pages/busy/generate", json=_body())
    assert resp.status_code == 409
    assert resp.json()["error"]["code"] == "concurrent_generation"
    assert fake.calls == []


# ——————————————————— 请求/路由校验 ———————————————————


def test_missing_user_prompt_returns_422() -> None:
    """缺 userPrompt 时由 FastAPI 请求体校验拦下（422）。"""
    client, _ = _make_client([])
    resp = client.post("/api/pages/p1/generate", json={"assetManifest": _manifest()})
    assert resp.status_code == 422


def test_get_unknown_page_returns_404() -> None:
    """查询不存在的 pageId 返回 404。"""
    client, _ = _make_client([])
    assert client.get("/api/pages/nope").status_code == 404
