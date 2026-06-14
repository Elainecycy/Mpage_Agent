"""配置：模型网关地址/密钥、超时、重试次数、DB URL（走环境变量）。

所有运行期可调项集中在 ``Settings``，经 pydantic-settings 从环境变量 / ``.env`` 读取，
默认值仅用于本地起服务与测试；线上由部署环境注入。换模型只改 ``MPAGE_LLM_*`` 配置、
不动代码（对应设计文档 §8「薄 LLM Gateway 抽象」）。
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Agent 服务运行期配置（全部可经环境变量 / .env 覆盖）。

    大致逻辑：实例化时 pydantic-settings 按字段名（大小写不敏感、统一加 ``MPAGE_`` 前缀）
    从环境变量与 ``.env`` 读取并做类型校验，缺省回落到此处默认值；未知环境变量忽略。

    Attributes:
        llm_base_url: LLM 网关基址（OpenAI 兼容接口）。默认指向冒烟用的 dashscope 兼容地址，
            线上须替换为公司合规网关。环境变量 ``MPAGE_LLM_BASE_URL``。
        llm_api_key: 网关密钥。**默认空**，必须由环境注入，禁止硬编码进代码库。
            环境变量 ``MPAGE_LLM_API_KEY``。
        llm_model: 默认模型名（冒烟选定 ``qwen-plus``，15/15 通过）。``MPAGE_LLM_MODEL``。
        llm_temperature: 采样温度，结构化输出固定 0.2。``MPAGE_LLM_TEMPERATURE``。
        llm_json_mode: 网关是否启用 JSON mode（支持时可提升合法率）。``MPAGE_LLM_JSON_MODE``。
        llm_timeout_s: 单次模型调用超时秒数。``MPAGE_LLM_TIMEOUT_S``。
        llm_max_retries: 校验失败后的自愈重试次数（设计文档 §4.3：最多 1 次）。``MPAGE_LLM_MAX_RETRIES``。
        database_url: 会话/版本存储连接串，默认本地 SQLite，线上换主库。``MPAGE_DATABASE_URL``。
        app_name: 服务名，用于日志与 /health。``MPAGE_APP_NAME``。
        log_level: 日志级别。``MPAGE_LOG_LEVEL``。
        call_log_enabled: 是否把每次生成的全量调用记录（脱敏后）落盘。``MPAGE_CALL_LOG_ENABLED``。
        call_log_dir: 调用日志落盘目录（按天分文件 JSONL）。``MPAGE_CALL_LOG_DIR``。
    """

    model_config = SettingsConfigDict(
        env_prefix="MPAGE_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # —— LLM 网关（薄抽象，换模型只改配置）——
    llm_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    llm_api_key: str = ""
    llm_model: str = "qwen-plus"
    llm_temperature: float = 0.2
    llm_json_mode: bool = False
    llm_timeout_s: float = 60.0
    llm_max_retries: int = 1

    # —— 存储 ——
    database_url: str = "sqlite:///./mpage_agent.db"

    # —— 服务 ——
    app_name: str = "mpage-agent"
    log_level: str = "INFO"

    # —— 全量调用日志（技改 §4.3.1：prompt/原始输出/校验错误/重试/延迟/token 按 traceId 落盘）——
    call_log_enabled: bool = True
    call_log_dir: str = "./logs"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """返回进程内缓存的配置单例。

    大致逻辑：首次调用构造 ``Settings``（触发一次环境读取与校验），结果缓存复用，
    保证全进程同一份配置；测试可通过 ``get_settings.cache_clear()`` 重置。

    Args:
        无。

    Returns:
        已加载并校验完成的 ``Settings`` 实例。
    """
    return Settings()
