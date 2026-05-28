from fastapi import APIRouter

from app.models.rtl import CodexFixRequest, CodexFixResponse
from app.services.codex.fixer import codex_fix


router = APIRouter(tags=["Codex Fix Mode"])


@router.post("/codex-fix", response_model=CodexFixResponse)
async def codex_fix_route(request: CodexFixRequest) -> CodexFixResponse:
    return await codex_fix(request)

