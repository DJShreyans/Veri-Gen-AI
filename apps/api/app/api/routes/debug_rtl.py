from fastapi import APIRouter

from app.models.rtl import DebugRtlResponse, RtlRequest
from app.services.ai.rtl_debugger import debug_rtl


router = APIRouter(tags=["RTL Debugger"])


@router.post("/debug-rtl", response_model=DebugRtlResponse)
async def debug_rtl_route(request: RtlRequest) -> DebugRtlResponse:
    return await debug_rtl(request)

