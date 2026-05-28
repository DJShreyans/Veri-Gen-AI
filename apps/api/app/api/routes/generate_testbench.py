from fastapi import APIRouter

from app.models.rtl import RtlRequest, TestbenchResponse
from app.services.ai.testbench_generator import generate_testbench


router = APIRouter(tags=["Testbench Generator"])


@router.post("/generate-testbench", response_model=TestbenchResponse)
async def generate_testbench_route(request: RtlRequest) -> TestbenchResponse:
    return await generate_testbench(request)

