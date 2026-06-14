"""空服务可启动性冒烟：构造 app 并访问 /health（任务 0.2 验收）。"""

from fastapi.testclient import TestClient

from app.main import create_app


def test_health_ok() -> None:
    """create_app 能构建应用，/health 返回 200 且结构正确。"""
    client = TestClient(create_app())
    resp = client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["service"]
    assert body["model"]
