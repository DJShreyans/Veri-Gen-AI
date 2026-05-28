from fastapi import APIRouter, File, Form, UploadFile

from app.models.waveform import WaveformResponse
from app.services.waveform.analyzer import analyze_waveform


router = APIRouter(tags=["Waveform Analyzer"])


@router.post("/analyze-waveform", response_model=WaveformResponse)
async def analyze_waveform_route(
    image: UploadFile = File(...),
    context: str | None = Form(default=None),
    rtl: str | None = Form(default=None),
) -> WaveformResponse:
    return await analyze_waveform(image=image, context=context, rtl=rtl)

