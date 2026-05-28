import re

from app.core.config import settings
from app.core.errors import APIError
from app.models.rtl import RtlRequest, TestbenchResponse
from app.prompts.rtl import TESTBENCH_SYSTEM
from app.services.ai.json_tools import extract_json_object
from app.services.ai.openai_service import openai_service
from app.services.hardware.icarus import validate_verilog


def _module_name(rtl: str, fallback: str | None) -> str:
    if fallback:
        return fallback
    match = re.search(r"\bmodule\s+([a-zA-Z_][a-zA-Z0-9_$]*)", rtl)
    return match.group(1) if match else "dut"


def _demo_testbench(request: RtlRequest) -> TestbenchResponse:
    top = _module_name(request.rtl, request.top_module)
    testbench = f"""`timescale 1ns/1ps

module tb_{top};
  reg clk;
  reg reset;

  initial clk = 1'b0;
  always #5 clk = ~clk;

  initial begin
    reset = 1'b1;
    repeat (2) @(posedge clk);
    reset = 1'b0;

    repeat (8) @(posedge clk);
    $display("VeriGen AI demo test completed");
    $finish;
  end

  initial begin
    $monitor("%0t clk=%b reset=%b", $time, clk, reset);
  end

  // TODO: connect DUT ports after VeriGen extracts the full module interface.
  // {top} dut (...);
endmodule
"""
    return TestbenchResponse(
        summary="Generated a minimal simulation testbench scaffold with clock, reset, monitor, and completion flow.",
        testbench=testbench,
        coverage_notes=[
            "Exercises reset assertion and deassertion.",
            "Provides stable clock generation for sequential RTL.",
            "Leaves DUT port wiring explicit when the interface cannot be inferred safely.",
        ],
        validation=validate_verilog(request.rtl, testbench),
    )


async def generate_testbench(request: RtlRequest) -> TestbenchResponse:
    if not settings.openai_api_key:
        return _demo_testbench(request)

    prompt = f"""
Return JSON with keys: summary, testbench, coverage_notes.
The testbench should be practical Verilog/SystemVerilog for simulation.
Include clock generation, reset handling, stimulus vectors, edge cases, and monitor statements.

Language: {request.language}
Top module: {request.top_module or "infer from RTL"}

RTL:
```verilog
{request.rtl}
```
"""
    try:
        raw = await openai_service.responses_json(TESTBENCH_SYSTEM, prompt)
        payload = extract_json_object(raw)
        testbench = payload.get("testbench", "")
        raw_notes = payload.get("coverage_notes", [])
        if isinstance(raw_notes, str):
            notes = [raw_notes]
        elif isinstance(raw_notes, list):
            notes = [str(n) for n in raw_notes]
        else:
            notes = []

        return TestbenchResponse(
            summary=payload["summary"],
            testbench=testbench,
            coverage_notes=notes,
            validation=validate_verilog(request.rtl, testbench),
        )
    except APIError:
        raise
    except Exception as exc:
        raise APIError(
            "TESTBENCH_PARSE_FAILED",
            "AI returned testbench output that could not be parsed.",
            status_code=502,
            details={"type": exc.__class__.__name__},
        ) from exc
