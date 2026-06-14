"""页面生成路由（任务 1.6 / 技改 F5）：把整条生成链路包成 REST 接口。

``POST /api/pages/{pageId}/generate``：同 pageId 串行化（并发撞车 409）→ 调生成服务
（素材校验→组装→调模型→两层校验→自愈重试）→ 落库（当前态 + 版本快照）→ 返回 pageJson。
``GET /api/pages/{pageId}``：读最近一次生成的页面 JSON（验收 §4.5.2-3）。

生成失败一律以 ``AppError`` 抛出，由 ``main`` 的异常处理器转成结构化错误码响应；本路由不
自行拼错误体。
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_gateway
from app.db import get_session
from app.schemas.generate import GenerateRequest, GenerateResponse
from app.services.generator import generate_page_json
from app.services.llm_gateway import SupportsComplete
from app.services.page_locks import page_generation_lock
from app.services.page_store import get_current_page, save_generation

router = APIRouter(prefix="/api/pages", tags=["pages"])


@router.post("/{page_id}/generate", response_model=GenerateResponse)
def generate(
    page_id: str,
    body: GenerateRequest,
    session: Session = Depends(get_session),
    gateway: SupportsComplete = Depends(get_gateway),
) -> GenerateResponse:
    """据描述与素材清单生成页面 JSON 并落库（生成接口 F5）。

    大致逻辑：先拿该 pageId 的生成锁（占用中则直接 409）→ 调 ``generate_page_json``
    （内部串联素材校验 / 组装 / 调模型 / 两层校验 / 自愈重试，失败抛 ``AppError``）→
    ``save_generation`` 写当前态并追加版本快照 → 返回 ``{pageId, version, pageJson}``。

    Args:
        page_id: 路径参数，平台页面 id。
        body: 请求体，含 ``userPrompt`` 与 ``assetManifest``。
        session: 数据库会话（依赖注入）。
        gateway: LLM 网关（依赖注入；测试可覆盖为假网关）。

    Returns:
        ``GenerateResponse``：本次版本号与通过校验的页面 JSON。

    Raises:
        AppError: ``CONCURRENT_GENERATION``(409) / ``INVALID_MANIFEST``(400) /
            ``MODEL_TIMEOUT``(504) / ``MODEL_ERROR``(502) / ``GENERATION_FAILED``(422)，
            由全局异常处理器转结构化响应。
    """
    with page_generation_lock(page_id):
        result = generate_page_json(body.userPrompt, body.assetManifest, gateway=gateway)
        version = save_generation(session, page_id, result.page_json)
        return GenerateResponse(pageId=page_id, version=version, pageJson=result.page_json)


@router.get("/{page_id}")
def get_page(page_id: str, session: Session = Depends(get_session)) -> dict:
    """读取某页面最近一次生成的页面 JSON。

    Args:
        page_id: 路径参数，平台页面 id。
        session: 数据库会话（依赖注入）。

    Returns:
        ``{"pageId": ..., "pageJson": ...}``。

    Raises:
        HTTPException: 404——该 pageId 尚无生成记录。
    """
    page_json = get_current_page(session, page_id)
    if page_json is None:
        raise HTTPException(status_code=404, detail=f"页面 {page_id} 暂无生成记录")
    return {"pageId": page_id, "pageJson": page_json}


__all__ = ["router"]
