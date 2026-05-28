import base64

from fastapi import UploadFile

from app.core.config import settings
from app.core.errors import APIError
from app.models.waveform import WaveformResponse
from app.prompts.rtl import WAVEFORM_SYSTEM
from app.services.ai.json_tools import extract_json_object
from app.services.ai.openai_service import openai_service


SUPPORTED_TYPES = {"image/png", "image/jpeg", "image/webp"}


def _demo_waveform_response(filename: str) -> WaveformResponse:
    return WaveformResponse(
        summary=f"Demo waveform analysis prepared for {filename}. Add OPENAI_API_KEY for visual signal inspection.",
        findings=[
            {
                "severity": "info",
                "signal": None,
                "message": "Waveform image upload succeeded.",
                "evidence": "Backend accepted the image and reached waveform analysis mode.",
            },
            {
                "severity": "warning",
                "signal": "reset",
                "message": "In demo mode, verify reset release is not close to an active clock edge.",
                "evidence": "This is a best-practice placeholder until vision analysis is enabled.",
            },
        ],
        timing_concerns=[
            "Check reset deassertion relative to the first active clock edge.",
            "Check that output transitions occur after clock edges, not before them.",
        ],
        confidence="low",
    )


async def analyze_waveform(
    image: UploadFile,
    context: str | None,
    rtl: str | None,
) -> WaveformResponse:
    if image.content_type not in SUPPORTED_TYPES:
        raise APIError(
            "UNSUPPORTED_IMAGE_TYPE",
            "Upload a PNG, JPEG, or WebP waveform screenshot.",
            status_code=415,
            details={"content_type": image.content_type},
        )

    content = await image.read()
    if len(content) > settings.max_waveform_bytes:
        raise APIError(
            "WAVEFORM_IMAGE_TOO_LARGE",
            "Waveform screenshot is larger than the configured upload limit.",
            status_code=413,
            details={"max_bytes": settings.max_waveform_bytes},
        )

    if not settings.openai_api_key:
        return _demo_waveform_response(image.filename or "waveform screenshot")

    encoded = base64.b64encode(content).decode("ascii")
    data_url = f"{image.content_type};base64,{encoded}"
    if not data_url.startswith("data:"):
        data_url = f"data:{data_url}"

    prompt = f"""
Return JSON with keys: summary, findings, timing_concerns, confidence.
Each finding should include severity, optional signal, message, and optional evidence.

Expected behavior / user context:
{context or "No extra context provided."}

Optional RTL context:
```verilog
{rtl or "No RTL context provided."}
```
"""
    try:
        raw = await openai_service.vision_json(WAVEFORM_SYSTEM, prompt, data_url)
        payload = extract_json_object(raw)
        
        # Normalize findings to match Pydantic schema constraints
        raw_findings = payload.get("findings", [])
        normalized_findings = []
        for finding in raw_findings:
            severity = str(finding.get("severity", "info")).lower()
            if severity in ("high", "error", "critical"):
                norm_severity = "error"
            elif severity in ("medium", "warning"):
                norm_severity = "warning"
            else:
                norm_severity = "info"
            
            normalized_findings.append({
                "severity": norm_severity,
                "signal": finding.get("signal"),
                "message": finding.get("message", "No message provided."),
                "evidence": finding.get("evidence"),
            })

        return WaveformResponse(
            summary=payload["summary"],
            findings=normalized_findings,
            timing_concerns=payload.get("timing_concerns", []),
            confidence=payload.get("confidence", "medium"),
        )
    except APIError:
        raise
    except Exception as exc:
        raise APIError(
            "WAVEFORM_PARSE_FAILED",
            "AI returned waveform output that could not be parsed.",
            status_code=502,
            details={"type": exc.__class__.__name__},
        ) from exc
