from typing import Literal

from pydantic import BaseModel, Field

from app.models.common import Issue, ValidationResult


Language = Literal["verilog", "systemverilog"]


class RtlRequest(BaseModel):
    rtl: str = Field(min_length=1, max_length=50000)
    language: Language = "verilog"
    top_module: str | None = None


class CodexFixRequest(BaseModel):
    rtl: str = Field(min_length=1, max_length=50000)
    language: Language = "verilog"
    intent: str | None = None


class DebugRtlResponse(BaseModel):
    summary: str
    issues: list[Issue]
    corrected_code: str
    best_practices: list[str]
    input_validation: ValidationResult
    validation: ValidationResult


class TestbenchResponse(BaseModel):
    summary: str
    testbench: str
    coverage_notes: list[str]
    validation: ValidationResult


class CodexFixResponse(BaseModel):
    summary: str
    fixed_code: str
    changes: list[str]
    rationale: list[str]
    validation: ValidationResult
