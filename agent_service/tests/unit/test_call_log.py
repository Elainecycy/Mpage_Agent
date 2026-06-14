"""全量调用日志单测（技改 §4.3.1）：脱敏、序列化、落盘、与生成服务的端到端写入。"""

import json

import pytest

from app.catalog import load_example_page
from app.config import get_settings
from app.services.call_log import (
    GenerationLog,
    redact,
    serialize_log,
    write_generation_log,
)
from app.services.generator import generate_page_json
from app.services.llm_gateway import LLMResponse, LLMTimeoutError


class _FakeGateway:
    """假网关：按脚本返回内容或抛异常。"""

    def __init__(self, outputs: list) -> None:
        self.outputs = outputs
        self.calls = 0

    def complete(self, messages, *, json_mode=None) -> LLMResponse:
        item = self.outputs[self.calls]
        self.calls += 1
        if isinstance(item, Exception):
            raise item
        return LLMResponse(content=item, model="fake", latency_s=0.5, prompt_tokens=10, completion_tokens=20)


def _manifest() -> list[dict]:
    ex = load_example_page()
    return [{"url": v["url"]} for v in ex["data"]["images"].values()]


# ——————————————————— 脱敏 ———————————————————


def test_redact_scrubs_sk_keys_and_explicit_secret() -> None:
    """sk- 串与显式密钥都被抹掉，普通文本保留。"""
    text = "key=sk-abcDEF123456 用户描述正常保留 token=my-secret-xyz"
    out = redact(text, secrets=("my-secret-xyz",))
    assert "sk-abcDEF123456" not in out
    assert "my-secret-xyz" not in out
    assert "用户描述正常保留" in out
    assert out.count("***REDACTED***") == 2


def test_redact_none_returns_empty() -> None:
    """None 文本返回空串。"""
    assert redact(None) == ""


# ——————————————————— 序列化（纯函数）———————————————————


def _sample_log() -> GenerationLog:
    log = GenerationLog(trace_id="t1", user_prompt="做个活动页", asset_count=2)
    log.add_attempt(
        attempt=1, messages=[{"role": "system", "content": "规则…"}, {"role": "user", "content": "描述…"}],
        raw_output="{ bad json", latency_s=1.234, prompt_tokens=100, completion_tokens=50,
        errors=["必须存在唯一 id=root"],
    )
    log.add_attempt(
        attempt=2, messages=[{"role": "system", "content": "规则…"}, {"role": "user", "content": "描述…"},
                             {"role": "assistant", "content": "{ bad json"}, {"role": "user", "content": "请修正"}],
        raw_output="{}", latency_s=2.0, prompt_tokens=120, completion_tokens=60, errors=[],
    )
    log.status = "success"
    log.model = "fake"
    return log


def test_serialize_log_shape_and_redaction() -> None:
    """序列化产出完整字段，敏感串被抹，token 求和，attempts 由明细推出。"""
    log = _sample_log()
    log.add_attempt(
        attempt=3, messages=[{"role": "user", "content": "我的 key 是 sk-LEAK000111222"}],
        raw_output="ok", latency_s=0.1, prompt_tokens=1, completion_tokens=1, errors=[],
    )
    d = serialize_log(log, secrets=("超级机密",))
    assert d["trace_id"] == "t1"
    assert d["status"] == "success"
    assert d["attempts"] == 3
    assert d["total_prompt_tokens"] == 221
    assert d["total_completion_tokens"] == 111
    # 第一轮的校验错误被保留（用于复盘）
    assert d["attempts_detail"][0]["errors"] == ["必须存在唯一 id=root"]
    # sk- 串被脱敏
    assert "sk-LEAK000111222" not in json.dumps(d, ensure_ascii=False)


# ——————————————————— 落盘 ———————————————————


def test_write_disabled_returns_none(tmp_path) -> None:
    """未启用时不落盘、返回 None。"""
    assert write_generation_log(_sample_log(), log_dir=str(tmp_path), enabled=False) is None
    assert list(tmp_path.iterdir()) == []


def test_write_appends_jsonl_line(tmp_path) -> None:
    """启用时写出一行可解析的 JSONL，按 traceId 可还原 prompt。"""
    path = write_generation_log(_sample_log(), log_dir=str(tmp_path), enabled=True)
    assert path is not None and path.exists()
    lines = path.read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 1
    rec = json.loads(lines[0])
    assert rec["trace_id"] == "t1"
    # 完整 prompt 可还原：第一轮 messages 含 system + user
    roles = [m["role"] for m in rec["attempts_detail"][0]["messages"]]
    assert roles == ["system", "user"]


# ——————————————————— 与生成服务端到端 ———————————————————


def test_generation_writes_log_on_success(tmp_path, monkeypatch) -> None:
    """成功生成会落一条 status=success 的日志，prompt 可还原。"""
    monkeypatch.setenv("MPAGE_CALL_LOG_ENABLED", "true")
    monkeypatch.setenv("MPAGE_CALL_LOG_DIR", str(tmp_path))
    get_settings.cache_clear()

    page = json.dumps(load_example_page())
    generate_page_json("做个新春活动页", _manifest(), gateway=_FakeGateway([page]), max_retries=0)

    files = list(tmp_path.glob("generation-*.jsonl"))
    assert len(files) == 1
    rec = json.loads(files[0].read_text(encoding="utf-8").strip())
    assert rec["status"] == "success"
    assert rec["attempts"] == 1
    assert "做个新春活动页" in rec["user_prompt"]
    assert rec["attempts_detail"][0]["messages"][0]["role"] == "system"


def test_generation_writes_log_on_timeout(tmp_path, monkeypatch) -> None:
    """模型超时也会落日志，status=failed、记录 model_timeout。"""
    monkeypatch.setenv("MPAGE_CALL_LOG_ENABLED", "true")
    monkeypatch.setenv("MPAGE_CALL_LOG_DIR", str(tmp_path))
    get_settings.cache_clear()

    from app.errors import AppError

    with pytest.raises(AppError):
        generate_page_json("x", _manifest(), gateway=_FakeGateway([LLMTimeoutError("超时")]), max_retries=0)

    rec = json.loads(next(tmp_path.glob("generation-*.jsonl")).read_text(encoding="utf-8").strip())
    assert rec["status"] == "failed"
    assert rec["error_code"] == "model_timeout"
