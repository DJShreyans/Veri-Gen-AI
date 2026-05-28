import subprocess
import unittest
from unittest.mock import MagicMock, patch

from app.services.hardware.icarus import validate_verilog


class TestIcarusValidation(unittest.TestCase):
    @patch("shutil.which")
    def test_missing_binary(self, mock_which):
        # Setup iverilog missing from PATH
        mock_which.return_value = None
        
        result = validate_verilog(rtl="module test; endmodule")
        self.assertEqual(result.status, "skipped")
        self.assertEqual(result.logs, "iverilog not available on this machine")
        self.assertIsNone(result.exit_code)
        self.assertEqual(result.command, [])

    @patch("subprocess.run")
    @patch("shutil.which")
    def test_compilation_success(self, mock_which, mock_run):
        # Setup iverilog present
        mock_which.return_value = "C:\\iverilog\\bin\\iverilog.exe"
        
        # Setup successful subprocess execution
        mock_completed = MagicMock()
        mock_completed.returncode = 0
        mock_completed.stdout = ""
        mock_completed.stderr = ""
        mock_run.return_value = mock_completed

        result = validate_verilog(rtl="module test; endmodule")
        self.assertEqual(result.status, "passed")
        self.assertEqual(result.logs, "iverilog compile passed with no compiler output")
        self.assertEqual(result.exit_code, 0)
        self.assertTrue(len(result.command) > 0)
        mock_run.assert_called_once()

    @patch("subprocess.run")
    @patch("shutil.which")
    def test_compilation_failure(self, mock_which, mock_run):
        # Setup iverilog present
        mock_which.return_value = "C:\\iverilog\\bin\\iverilog.exe"
        
        # Setup failing subprocess execution
        mock_completed = MagicMock()
        mock_completed.returncode = 1
        mock_completed.stdout = ""
        mock_completed.stderr = "design.v:3: syntax error"
        mock_run.return_value = mock_completed

        result = validate_verilog(rtl="module test; endmodule")
        self.assertEqual(result.status, "failed")
        self.assertEqual(result.logs, "design.v:3: syntax error")
        self.assertEqual(result.exit_code, 1)
        mock_run.assert_called_once()

    @patch("subprocess.run")
    @patch("shutil.which")
    def test_compilation_timeout(self, mock_which, mock_run):
        # Setup iverilog present
        mock_which.return_value = "C:\\iverilog\\bin\\iverilog.exe"
        
        # Setup subprocess timeout
        mock_run.side_effect = subprocess.TimeoutExpired(cmd=["iverilog"], timeout=8)

        result = validate_verilog(rtl="module test; endmodule")
        self.assertEqual(result.status, "failed")
        self.assertIn("timed out after 8 seconds", result.logs)
        self.assertIsNone(result.exit_code)
        mock_run.assert_called_once()


if __name__ == "__main__":
    unittest.main()
