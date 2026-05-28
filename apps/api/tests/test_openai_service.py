import unittest
from unittest.mock import MagicMock, patch

from app.core.errors import APIError
from app.services.ai.openai_service import OpenAIService


class TestOpenAIService(unittest.IsolatedAsyncioTestCase):
    @patch("app.services.ai.openai_service.settings")
    def test_enabled_property(self, mock_settings):
        service = OpenAIService()
        # Test disabled path
        mock_settings.openai_api_key = None
        self.assertFalse(service.enabled)
        with self.assertRaises(APIError) as ctx:
            service._ensure_enabled()
        self.assertEqual(ctx.exception.code, "OPENAI_API_KEY_MISSING")
        self.assertEqual(ctx.exception.status_code, 503)

        # Test enabled path
        mock_settings.openai_api_key = "mocked_key"
        self.assertTrue(service.enabled)
        # Should not raise an error
        service._ensure_enabled()

    @patch("app.services.ai.openai_service.settings")
    @patch("openai.OpenAI")
    async def test_responses_json_workflow(self, mock_openai_cls, mock_settings):
        service = OpenAIService()
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        
        # Setup mock settings
        mock_settings.openai_api_key = "mocked_key"
        mock_settings.openai_model = "gpt-4.1-mini"

        # Setup mock response
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = '{"summary": "Test passed"}'
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        result = await service.responses_json(
            system_prompt="System instructions",
            user_prompt="User input text"
        )
        self.assertEqual(result, '{"summary": "Test passed"}')
        mock_client.chat.completions.create.assert_called_once_with(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "System instructions"},
                {"role": "user", "content": "User input text"}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )

    @patch("app.services.ai.openai_service.settings")
    @patch("openai.OpenAI")
    async def test_vision_json_workflow(self, mock_openai_cls, mock_settings):
        service = OpenAIService()
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        
        # Setup mock settings
        mock_settings.openai_api_key = "mocked_key"
        mock_settings.openai_vision_model = "gpt-4.1-mini"

        # Setup mock response
        mock_response = MagicMock()
        mock_choice = MagicMock()
        mock_choice.message.content = '{"summary": "Vision parsed"}'
        mock_response.choices = [mock_choice]
        mock_client.chat.completions.create.return_value = mock_response

        result = await service.vision_json(
            system_prompt="System instructions",
            user_prompt="User vision prompt",
            image_data_url="data:image/png;base64,xxxx"
        )
        self.assertEqual(result, '{"summary": "Vision parsed"}')
        mock_client.chat.completions.create.assert_called_once_with(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "System instructions"},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "User vision prompt"},
                        {"type": "image_url", "image_url": {"url": "data:image/png;base64,xxxx"}},
                    ],
                }
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )


if __name__ == "__main__":
    unittest.main()
