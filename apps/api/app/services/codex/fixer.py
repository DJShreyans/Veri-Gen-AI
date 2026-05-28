from app.core.config import settings
from app.core.errors import APIError
from app.models.rtl import CodexFixRequest, CodexFixResponse
from app.prompts.rtl import CODEX_FIX_SYSTEM
from app.services.ai.json_tools import extract_json_object
from app.services.ai.openai_service import openai_service
from app.services.hardware.icarus import validate_verilog


def _demo_codex_fix(request: CodexFixRequest) -> CodexFixResponse:
    fixed = request.rtl
    fixed = fixed.replace("q = 0\n", "q <= 1'b0;\n")
    fixed = fixed.replace("q = 0\r\n", "q <= 1'b0;\r\n")
    return CodexFixResponse(
        summary="Codex Fix Mode rewrote the obvious sequential assignment issue and prepared the RTL for validation.",
        fixed_code=fixed,
        changes=[
            "Converted reset assignment to non-blocking style where pattern matched.",
            "Added a width-explicit reset literal in the common q/reset pattern.",
        ],
        rationale=[
            "Sequential logic should use non-blocking assignments to avoid simulation races.",
            "Width-explicit constants make reset behavior clearer for synthesis and review.",
        ],
        validation=validate_verilog(fixed),
    )


async def codex_fix(request: CodexFixRequest) -> CodexFixResponse:
    if not settings.openai_api_key:
        return _demo_codex_fix(request)

    prompt = f"""
Return JSON with keys: summary, fixed_code, changes, rationale.
Preserve the RTL intent and make a production-quality rewrite.

Intent: {request.intent or "Fix correctness, synthesizability, and style issues."}
Language: {request.language}

RTL:
```verilog
{request.rtl}
```
"""
    try:
        raw = await openai_service.codex_fix_json(CODEX_FIX_SYSTEM, prompt)
        payload = extract_json_object(raw)
        fixed = payload.get("fixed_code", request.rtl)
        raw_changes = payload.get("changes", [])
        if isinstance(raw_changes, str):
            changes = [raw_changes]
        elif isinstance(raw_changes, list):
            changes = [str(c) for c in raw_changes]
        else:
            changes = []

        raw_rationale = payload.get("rationale", [])
        if isinstance(raw_rationale, str):
            rationale = [raw_rationale]
        elif isinstance(raw_rationale, list):
            rationale = [str(r) for r in raw_rationale]
        else:
            rationale = []

        return CodexFixResponse(
            summary=payload["summary"],
            fixed_code=fixed,
            changes=changes,
            rationale=rationale,
            validation=validate_verilog(fixed),
        )
    except APIError:
        raise
    except Exception as exc:
        raise APIError(
            "CODEX_FIX_PARSE_FAILED",
            "AI returned Codex fix output that could not be parsed.",
            status_code=502,
            details={"type": exc.__class__.__name__},
        ) from exc
