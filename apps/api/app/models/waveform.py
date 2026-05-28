from typing import Literal

from pydantic import BaseModel

from app.models.common import Severity


Confidence = Literal["low", "medium", "high"]


class WaveformFinding(BaseModel):
    severity: Severity
    signal: str | None = None
    message: str
    evidence: str | None = None


class WaveformResponse(BaseModel):
    summary: str
    findings: list[WaveformFinding]
    timing_concerns: list[str]
    confidence: Confidence

