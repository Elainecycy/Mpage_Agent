"""pytest 全局夹具：默认关闭调用日志落盘，避免单测在 ./logs 留下文件。

需要验证日志落盘的用例（``test_call_log.py``）会在用例内显式重新打开并指向临时目录。
"""

import pytest

from app.config import get_settings


@pytest.fixture(autouse=True)
def _disable_call_log(monkeypatch: pytest.MonkeyPatch):
    """所有用例默认关闭调用日志落盘（清缓存使配置即时生效）。

    Yields:
        控制权交还给用例；结束后再清一次配置缓存，避免串味。
    """
    monkeypatch.setenv("MPAGE_CALL_LOG_ENABLED", "false")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
