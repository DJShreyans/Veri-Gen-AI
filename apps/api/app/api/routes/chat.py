from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.errors import APIError
from app.services.ai.openai_service import openai_service
from app.services.ai.json_tools import extract_json_object

router = APIRouter(tags=["AI Assistant"])


class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    rtl: str = Field(..., min_length=1, max_length=50000)
    message: str = Field(..., min_length=1, max_length=5000)
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    response: str


CHAT_SYSTEM_PROMPT = """You are VeriGen Assistant, a helpful and knowledgeable RTL design and verification expert.
Answer the user's question about the provided RTL design.
Maintain context from the previous chat history if relevant.
Your output must be JSON with a single key "response" containing your markdown-formatted response.
Always output markdown inside the JSON value.
"""


@router.post("/chat", response_model=ChatResponse)
async def chat_route(request: ChatRequest) -> ChatResponse:
    if not settings.openai_api_key:
        return ChatResponse(
            response=f"**Demo Mode**: I received your question about the RTL: *'{request.message}'*. Please add an `OPENAI_API_KEY` to `.env` to enable live assistant responses."
        )

    history_str = ""
    for msg in request.history:
        history_str += f"{msg.role.upper()}: {msg.text}\n"

    prompt = f"""
RTL Code:
```verilog
{request.rtl}
```

Chat History:
{history_str}

User's Question:
{request.message}
"""
    try:
        raw = await openai_service.responses_json(CHAT_SYSTEM_PROMPT, prompt)
        payload = extract_json_object(raw)
        return ChatResponse(response=payload.get("response", "No response from AI assistant."))
    except Exception as exc:
        raise APIError(
            "CHAT_REQUEST_FAILED",
            "AI Assistant failed to process chat request.",
            status_code=502,
            details={"type": exc.__class__.__name__},
        ) from exc
