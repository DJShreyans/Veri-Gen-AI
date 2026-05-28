import unittest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app


class TestChatEndpoint(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.responses_patcher = patch(
            "app.services.ai.openai_service.OpenAIService.responses_json",
            new_callable=AsyncMock,
        )
        cls.mock_responses = cls.responses_patcher.start()

    @classmethod
    def tearDownClass(cls):
        cls.responses_patcher.stop()

    @patch("app.api.routes.chat.settings")
    def test_chat_endpoint_success(self, mock_settings):
        # Configure mocked settings to enable openai service
        mock_settings.openai_api_key = "test-key"

        self.mock_responses.return_value = """{
            "response": "Here is the explanation for the reset behavior: reset should be active-high synchronous or asynchronous."
        }"""

        payload = {
            "rtl": "module dff (input wire clk, input wire reset, output reg q); always @(posedge clk) if (reset) q <= 0; endmodule",
            "message": "Explain the reset logic",
            "history": [
                {"role": "user", "text": "Hi"},
                {"role": "assistant", "text": "Hello, how can I help?"},
            ],
        }

        response = self.client.post("/chat", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("response", data)
        self.assertEqual(
            data["response"],
            "Here is the explanation for the reset behavior: reset should be active-high synchronous or asynchronous.",
        )

    @patch("app.api.routes.chat.settings")
    def test_chat_endpoint_demo_mode(self, mock_settings):
        # Configure settings to disable openai service (demo mode)
        mock_settings.openai_api_key = None

        payload = {
            "rtl": "module sample; endmodule",
            "message": "Is this synthesizable?",
            "history": [],
        }

        response = self.client.post("/chat", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("response", data)
        self.assertIn("Demo Mode", data["response"])
        self.assertIn("Is this synthesizable?", data["response"])
