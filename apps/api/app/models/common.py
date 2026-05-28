from typing import Literal

from pydantic import BaseModel, Field


Severity = Literal["info", "warning", "error"]
ValidationStatus = Literal["passed", "failed", "skipped"]


class Issue(BaseModel):
    severity: Severity
    category: str
    message: str
    line: int | None = None
    suggestion: str | None = None


class ValidationResult(BaseModel):
    status: ValidationStatus
    tool: str = "iverilog"
    logs: str = ""
    exit_code: int | None = None
    command: list[str] = Field(default_factory=list)


class ApiErrorResponse(BaseModel):
    error: dict = Field(default_factory=dict)
