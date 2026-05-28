import shutil
import subprocess
import tempfile
from pathlib import Path

from app.models.common import ValidationResult


IVERILOG_TIMEOUT_SECONDS = 8


def validate_verilog(rtl: str, testbench: str | None = None) -> ValidationResult:
    iverilog = shutil.which("iverilog")
    if not iverilog:
        return ValidationResult(status="skipped", logs="iverilog not available on this machine")

    with tempfile.TemporaryDirectory(prefix="verigen_") as tmp:
        tmp_path = Path(tmp)
        design_file = tmp_path / "design.v"
        output_file = tmp_path / "sim.out"
        design_file.write_text(rtl, encoding="utf-8")

        command = [iverilog, "-g2012", "-Wall", "-o", output_file.name, design_file.name]
        if testbench:
            tb_file = tmp_path / "tb.v"
            tb_file.write_text(testbench, encoding="utf-8")
            command.append(tb_file.name)

        try:
            result = subprocess.run(
                command,
                cwd=tmp_path,
                capture_output=True,
                text=True,
                timeout=IVERILOG_TIMEOUT_SECONDS,
                check=False,
                shell=False,
            )
        except subprocess.TimeoutExpired:
            return ValidationResult(
                status="failed",
                logs=f"iverilog validation timed out after {IVERILOG_TIMEOUT_SECONDS} seconds",
                command=command,
            )

    logs = "\n".join(part for part in [result.stdout.strip(), result.stderr.strip()] if part)
    if not logs and result.returncode == 0:
        logs = "iverilog compile passed with no compiler output"

    return ValidationResult(
        status="passed" if result.returncode == 0 else "failed",
        logs=logs,
        exit_code=result.returncode,
        command=command,
    )
