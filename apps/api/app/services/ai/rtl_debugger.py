from app.core.config import settings
from app.core.errors import APIError
from app.models.rtl import DebugRtlResponse, RtlRequest
from app.prompts.rtl import RTL_DEBUG_SYSTEM
from app.services.ai.json_tools import extract_json_object
from app.services.ai.openai_service import openai_service
from app.services.hardware.icarus import validate_verilog


def _demo_debug_response(request: RtlRequest) -> DebugRtlResponse:
    input_validation = validate_verilog(request.rtl)
    corrected = request.rtl
    corrected = corrected.replace("q = 0\n", "q <= 1'b0;\n")
    corrected = corrected.replace("q = 0\r\n", "q <= 1'b0;\r\n")
    validation = validate_verilog(corrected)
    return DebugRtlResponse(
        summary="Demo analysis: the clocked reset path should use a non-blocking assignment and terminate statements with semicolons.",
        issues=[
            {
                "severity": "error",
                "category": "syntax",
                "message": "A reset assignment appears to be missing a semicolon.",
                "line": None,
                "suggestion": "Terminate the reset assignment, for example q <= 1'b0;",
            },
            {
                "severity": "warning",
                "category": "sequential-logic",
                "message": "Clocked always blocks should use non-blocking assignments consistently.",
                "line": None,
                "suggestion": "Use <= for both reset and normal sequential assignments.",
            },
        ],
        corrected_code=corrected,
        best_practices=[
            "Use non-blocking assignments in posedge/negedge sequential blocks.",
            "Keep reset behavior explicit and width-safe.",
            "Run generated RTL through a simulator or lint tool before committing.",
        ],
        input_validation=input_validation,
        validation=validation,
    )


async def debug_rtl(request: RtlRequest) -> DebugRtlResponse:
    if not settings.openai_api_key:
        return _demo_debug_response(request)

    input_validation = validate_verilog(request.rtl)
    prompt = f"""
Return JSON with keys: summary, issues, corrected_code, best_practices.
Each issue must include severity, category, message, optional line, optional suggestion.

Language: {request.language}
Top module: {request.top_module or "unknown"}

RTL:
```verilog
{request.rtl}
```
"""
    try:
        raw = await openai_service.responses_json(RTL_DEBUG_SYSTEM, prompt)
        payload = extract_json_object(raw)
        
        # Normalize issues to match Pydantic schema constraints
        raw_issues = payload.get("issues", [])
        normalized_issues = []
        for issue in raw_issues:
            severity = str(issue.get("severity", "info")).lower()
            if severity in ("high", "error", "critical"):
                norm_severity = "error"
            elif severity in ("medium", "warning"):
                norm_severity = "warning"
            else:
                norm_severity = "info"
            
            normalized_issues.append({
                "severity": norm_severity,
                "category": issue.get("category", "general"),
                "message": issue.get("message", "No message provided."),
                "line": issue.get("line"),
                "suggestion": issue.get("suggestion"),
            })

        response = DebugRtlResponse(
            summary=payload["summary"],
            issues=normalized_issues,
            corrected_code=payload.get("corrected_code", request.rtl),
            best_practices=payload.get("best_practices", []),
            input_validation=input_validation,
            validation=validate_verilog(payload.get("corrected_code", request.rtl)),
        )
        return response
    except APIError:
        raise
    except Exception as exc:
        raise APIError(
            "RTL_DEBUG_PARSE_FAILED",
            "AI returned RTL debug output that could not be parsed.",
            status_code=502,
            details={"type": exc.__class__.__name__},
        ) from exc
