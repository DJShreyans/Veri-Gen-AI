from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.analyze_waveform import router as waveform_router
from app.api.routes.codex_fix import router as codex_router
from app.api.routes.debug_rtl import router as debug_router
from app.api.routes.generate_testbench import router as testbench_router
from app.api.routes.chat import router as chat_router
from app.core.config import settings
from app.core.errors import APIError, api_error_handler, generic_error_handler, validation_error_handler


app = FastAPI(
    title="VeriGen AI API",
    description="Hardware-native AI workflows for RTL debugging and verification.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(APIError, api_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(Exception, generic_error_handler)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "verigen-api"}


app.include_router(debug_router)
app.include_router(testbench_router)
app.include_router(waveform_router)
app.include_router(codex_router)
app.include_router(chat_router)
