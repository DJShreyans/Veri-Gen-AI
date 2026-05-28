from dataclasses import dataclass
import os
from dotenv import load_dotenv

load_dotenv()


def _csv_env(name: str, default: str) -> list[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")
    openai_base_url: str | None = os.getenv("OPENAI_BASE_URL")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    openai_codex_model: str = os.getenv("OPENAI_CODEX_MODEL", os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
    openai_vision_model: str = os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini")
    cors_origins: list[str] = None  # type: ignore[assignment]
    max_waveform_bytes: int = int(os.getenv("MAX_WAVEFORM_BYTES", "5242880"))

    def __post_init__(self) -> None:
        if self.cors_origins is None:
            object.__setattr__(
                self,
                "cors_origins",
                _csv_env(
                    "CORS_ORIGINS",
                    "http://localhost:3000,http://127.0.0.1:3000",
                ),
            )


settings = Settings()
