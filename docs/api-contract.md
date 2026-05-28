# VeriGen AI API Contract

Base URL:

```text
http://localhost:8000
```

## Health

```http
GET /health
```

Response:

```json
{
  "status": "ok",
  "service": "verigen-api"
}
```

## Debug RTL

```http
POST /debug-rtl
Content-Type: application/json
```

Request:

```json
{
  "rtl": "module example(...); endmodule",
  "language": "verilog",
  "top_module": "example"
}
```

Response:

```json
{
  "summary": "Reset branch uses blocking assignment and is missing a semicolon.",
  "issues": [
    {
      "severity": "error",
      "category": "syntax",
      "message": "Missing semicolon after q = 0.",
      "line": 4,
      "suggestion": "Use q <= 1'b0; in the reset branch."
    }
  ],
  "corrected_code": "module example(...); endmodule",
  "best_practices": [
    "Use non-blocking assignments inside clocked always blocks."
  ],
  "input_validation": {
    "status": "failed",
    "tool": "iverilog",
    "logs": "design.v:4: syntax error",
    "exit_code": 1,
    "command": ["iverilog", "-g2012", "-Wall", "-o", "sim.out", "design.v"]
  },
  "validation": {
    "status": "passed",
    "tool": "iverilog",
    "logs": "iverilog compile passed with no compiler output",
    "exit_code": 0,
    "command": ["iverilog", "-g2012", "-Wall", "-o", "sim.out", "design.v"]
  }
}
```

## Generate Testbench

```http
POST /generate-testbench
Content-Type: application/json
```

Request:

```json
{
  "rtl": "module example(...); endmodule",
  "language": "verilog",
  "top_module": "example"
}
```

Response:

```json
{
  "summary": "Generated a basic directed testbench with reset, clock, and edge-case stimulus.",
  "testbench": "module tb_example; endmodule",
  "coverage_notes": [
    "Exercises reset assertion and deassertion.",
    "Checks input transitions around clock edges."
  ],
  "validation": {
    "status": "skipped",
    "tool": "iverilog",
    "logs": "iverilog not available"
  }
}
```

## Analyze Waveform

```http
POST /analyze-waveform
Content-Type: multipart/form-data
```

Form fields:

- `image`: waveform screenshot file
- `context`: optional text describing expected behavior
- `rtl`: optional RTL context

Response:

```json
{
  "summary": "Reset appears unstable around the first active clock edge.",
  "findings": [
    {
      "severity": "warning",
      "signal": "reset",
      "message": "Reset deassertion occurs close to a clock edge.",
      "evidence": "The reset transition visually aligns near the rising clock edge."
    }
  ],
  "timing_concerns": [
    "Potential setup/hold risk near reset release."
  ],
  "confidence": "medium"
}
```

## Codex Fix

```http
POST /codex-fix
Content-Type: application/json
```

Request:

```json
{
  "rtl": "module example(...); endmodule",
  "language": "verilog",
  "intent": "Fix syntax and improve sequential logic style."
}
```

Response:

```json
{
  "summary": "Rewrote the sequential block to use consistent non-blocking assignments.",
  "fixed_code": "module example(...); endmodule",
  "changes": [
    "Added missing semicolon in reset branch.",
    "Changed blocking assignment to non-blocking assignment."
  ],
  "rationale": [
    "Clocked always blocks should use non-blocking assignments to avoid simulation races."
  ],
  "validation": {
    "status": "passed",
    "tool": "iverilog",
    "logs": ""
  }
}
```

## Error Shape

```json
{
  "error": {
    "code": "OPENAI_REQUEST_FAILED",
    "message": "Unable to complete AI request.",
    "details": {}
  }
}
```
