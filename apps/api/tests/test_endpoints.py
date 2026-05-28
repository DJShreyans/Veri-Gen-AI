import io
import unittest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app

class TestVeriGenAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.responses_patcher = patch("app.services.ai.openai_service.OpenAIService.responses_json", new_callable=AsyncMock)
        cls.vision_patcher = patch("app.services.ai.openai_service.OpenAIService.vision_json", new_callable=AsyncMock)
        cls.codex_patcher = patch("app.services.ai.openai_service.OpenAIService.codex_fix_json", new_callable=AsyncMock)
        cls.mock_responses = cls.responses_patcher.start()
        cls.mock_vision = cls.vision_patcher.start()
        cls.mock_codex = cls.codex_patcher.start()

    @classmethod
    def tearDownClass(cls):
        cls.responses_patcher.stop()
        cls.vision_patcher.stop()
        cls.codex_patcher.stop()

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "service": "verigen-api"})

    def test_debug_rtl_endpoint(self):
        self.mock_responses.return_value = """{
            "summary": "Mock debug RTL summary",
            "issues": [
                {
                    "severity": "error",
                    "category": "syntax",
                    "message": "A reset assignment appears to be missing a semicolon.",
                    "line": 4,
                    "suggestion": "Terminate the reset assignment, for example q <= 1'b0;"
                }
            ],
            "corrected_code": "module dff (input wire clk, input wire reset, input wire d, output reg q); always @(posedge clk) begin if (reset) q <= 0; else q <= d; end endmodule",
            "best_practices": ["Use non-blocking assignments."]
        }"""
        payload = {
            "rtl": "module dff (input wire clk, input wire reset, input wire d, output reg q);\nalways @(posedge clk) begin\n  if (reset)\n    q = 0\n  else\n    q <= d;\nend\nendmodule",
            "language": "verilog"
        }
        response = self.client.post("/debug-rtl", json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("summary", data)
        self.assertIn("issues", data)
        self.assertIn("corrected_code", data)
        self.assertIn("best_practices", data)
        self.assertIn("input_validation", data)
        self.assertIn("validation", data)
        
        self.assertTrue(len(data["issues"]) > 0)
        self.assertEqual(data["issues"][0]["category"], "syntax")

    def test_generate_testbench_endpoint(self):
        self.mock_responses.return_value = """{
            "summary": "Mock testbench generation summary",
            "testbench": "module tb_sample;\\nendmodule",
            "coverage_notes": ["Mock coverage notes"]
        }"""
        payload = {
            "rtl": "module sample (input wire clk, output reg q);\nendmodule",
            "language": "verilog",
            "top_module": "sample"
        }
        response = self.client.post("/generate-testbench", json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("summary", data)
        self.assertIn("testbench", data)
        self.assertIn("coverage_notes", data)
        self.assertIn("validation", data)
        self.assertTrue("tb_sample" in data["testbench"])

    def test_codex_fix_endpoint(self):
        self.mock_codex.return_value = """{
            "summary": "Mock codex fix summary",
            "fixed_code": "module sample (input wire clk, output reg q);\\nalways @(posedge clk) q <= 0;\\nendmodule",
            "changes": ["Fixed blocking assignment"],
            "rationale": ["Mock rationale"]
        }"""
        payload = {
            "rtl": "module sample (input wire clk, output reg q);\nalways @(posedge clk) q = 0\nendmodule",
            "language": "verilog",
            "intent": "Fix blocking assignments"
        }
        response = self.client.post("/codex-fix", json=payload)
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn("summary", data)
        self.assertIn("fixed_code", data)
        self.assertIn("changes", data)
        self.assertIn("rationale", data)
        self.assertIn("validation", data)

    def test_analyze_waveform_endpoint(self):
        self.mock_vision.return_value = """{
            "summary": "Mock waveform vision analysis summary",
            "findings": [
                {
                    "severity": "info",
                    "signal": "q",
                    "message": "Signal q goes high when d goes high",
                    "evidence": "At edge 5ns"
                }
            ],
            "timing_concerns": ["No timing concerns"],
            "confidence": "high"
        }"""
        # 1x1 black pixel PNG bytes
        image_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        files = {
            "image": ("test_waveform.png", io.BytesIO(image_content), "image/png")
        }
        data = {
            "context": "Expected q to go high when d goes high",
            "rtl": "module sample; endmodule"
        }
        response = self.client.post("/analyze-waveform", files=files, data=data)
        self.assertEqual(response.status_code, 200)
        
        res_data = response.json()
        self.assertIn("summary", res_data)
        self.assertIn("findings", res_data)
        self.assertIn("timing_concerns", res_data)
        self.assertIn("confidence", res_data)
        self.assertTrue(len(res_data["findings"]) > 0)

if __name__ == "__main__":
    unittest.main()
