import asyncio
from typing import Any

from app.core.config import settings
from app.core.errors import APIError


class OpenAIService:
    """Reusable OpenAI integration for VeriGen AI hardware workflows."""

    @property
    def enabled(self) -> bool:
        return bool(settings.openai_api_key)

    async def responses_json(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float = 0.2,
    ) -> str:
        """Use the OpenAI Responses API for text-first hardware reasoning."""
        self._ensure_enabled()
        return await asyncio.to_thread(
            self._responses_json_sync,
            system_prompt,
            user_prompt,
            model or settings.openai_model,
            temperature,
        )

    async def codex_fix_json(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.15,
    ) -> str:
        """Use Codex Fix Mode for RTL repair and code-focused rewrites."""
        self._ensure_enabled()
        return await asyncio.to_thread(
            self._responses_json_sync,
            system_prompt,
            user_prompt,
            settings.openai_codex_model,
            temperature,
        )

    async def vision_json(
        self,
        system_prompt: str,
        user_prompt: str,
        image_data_url: str,
        temperature: float = 0.2,
    ) -> str:
        """Use vision-capable Responses API input for waveform screenshots."""
        self._ensure_enabled()
        return await asyncio.to_thread(
            self._vision_json_sync,
            system_prompt,
            user_prompt,
            image_data_url,
            settings.openai_vision_model,
            temperature,
        )

    def _ensure_enabled(self) -> None:
        if not self.enabled:
            raise APIError(
                "OPENAI_API_KEY_MISSING",
                "OPENAI_API_KEY is not configured.",
                status_code=503,
            )

    def _client(self) -> Any:
        try:
            from openai import OpenAI
        except ImportError as exc:
            raise APIError(
                "OPENAI_SDK_MISSING",
                "Install backend requirements before calling AI endpoints.",
                status_code=500,
            ) from exc
        return OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
        )

    def _responses_json_sync(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str,
        temperature: float,
    ) -> str:
        import time
        from openai import RateLimitError
        max_attempts = 3
        backoff = 2.0
        for attempt in range(max_attempts):
            try:
                response = self._client().chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature,
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return content if content is not None else ""
            except RateLimitError as exc:
                if attempt == max_attempts - 1:
                    raise APIError(
                        "OPENAI_REQUEST_FAILED",
                        f"Unable to complete OpenAI request due to rate limit: {str(exc)}",
                        status_code=429,
                        details={"type": exc.__class__.__name__, "model": model},
                    ) from exc
                time.sleep(backoff * (attempt + 1))
            except Exception as exc:
                raise APIError(
                    "OPENAI_REQUEST_FAILED",
                    "Unable to complete OpenAI request.",
                    status_code=502,
                    details={"type": exc.__class__.__name__, "model": model},
                ) from exc

    def _vision_json_sync(
        self,
        system_prompt: str,
        user_prompt: str,
        image_data_url: str,
        model: str,
        temperature: float,
    ) -> str:
        import time
        from openai import RateLimitError
        max_attempts = 3
        backoff = 2.0
        for attempt in range(max_attempts):
            try:
                response = self._client().chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": user_prompt},
                                {"type": "image_url", "image_url": {"url": image_data_url}},
                            ],
                        }
                    ],
                    temperature=temperature,
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return content if content is not None else ""
            except RateLimitError as exc:
                if attempt == max_attempts - 1:
                    raise APIError(
                        "OPENAI_VISION_REQUEST_FAILED",
                        f"Unable to complete OpenAI vision request due to rate limit: {str(exc)}",
                        status_code=429,
                        details={"type": exc.__class__.__name__, "model": model},
                    ) from exc
                time.sleep(backoff * (attempt + 1))
            except Exception as exc:
                raise APIError(
                    "OPENAI_VISION_REQUEST_FAILED",
                    "Unable to complete OpenAI vision request.",
                    status_code=502,
                    details={"type": exc.__class__.__name__, "model": model},
                ) from exc


openai_service = OpenAIService()

