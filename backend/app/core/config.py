"""
Đọc toàn bộ biến môi trường từ file .env vào 1 object Settings duy nhất.
Dùng pydantic-settings để: (1) tự validate kiểu dữ liệu (VD PORT phải là int),
(2) báo lỗi ngay lúc khởi động nếu thiếu biến bắt buộc, thay vì lỗi ngầm lúc chạy.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    # --- Server ---
    PROJECT_NAME: str = "Web Len Ke Hoach Nhom AI"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    FRONTEND_URL: str = "http://localhost:5173"

    # --- Database ---
    DATABASE_URL: str = ""
    DIRECT_URL: str = ""

    # --- Redis & Cache ---
    REDIS_URL: str = "redis://localhost:6379/0"
    HTTP_CLIENT_TIMEOUT: float = 10.0
    CACHE_DEFAULT_TTL: int = 86400  # 24 giờ cho POIs L2 Cache

    # --- Auth (JWT & OAuth2) ---
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_CALLBACK_URL: str = ""
    FACEBOOK_APP_ID: str = ""
    FACEBOOK_APP_SECRET: str = ""

    # --- AI Agent / LLM Providers (Pure OpenAI SDK `AsyncOpenAI`, ADR-001) ---
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com/v1"
    AI_MODEL_DEFAULT: str = "deepseek-chat"
    AI_MODEL_REASONING: str = "deepseek-reasoner"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL_FALLBACK: str = "gpt-4o"
    GOOGLE_API_KEY: str = ""
    GEMINI_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai/"
    GEMINI_MODEL_FALLBACK: str = "gemini-1.5-pro"
    AI_MAX_TOKENS_PER_REQUEST: int = 4096
    AI_MAX_STEPS_PER_SESSION: int = 15
    AI_REQUEST_TIMEOUT: float = 30.0

    # --- External APIs & Circuit Breaker ---
    GOOGLE_PLACES_API_KEY: str = ""
    GOOGLE_PLACES_BASE_URL: str = "https://places.googleapis.com/v1"
    PLACES_API_TIMEOUT: float = 2.5
    CIRCUIT_BREAKER_FAIL_MAX: int = 3
    CIRCUIT_BREAKER_RESET_TIMEOUT: int = 60
    MAPBOX_ACCESS_TOKEN: str = ""
    OPENWEATHER_API_KEY: str = ""
    OPENWEATHER_BASE_URL: str = "https://api.openweathermap.org/data/2.5"
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    WEATHER_API_TIMEOUT: float = 3.0
    WEATHER_CACHE_TTL: int = 10800  # 3 giờ cho Weather L2 Cache (TASK-207)
    EXCHANGE_RATE_API_KEY: str = ""
    EXCHANGE_RATE_API_BASE_URL: str = "https://v6.exchangerate-api.com/v6"
    EXCHANGE_RATE_OPEN_BASE_URL: str = "https://open.er-api.com/v6"
    CURRENCY_API_TIMEOUT: float = 3.0
    CURRENCY_CACHE_TTL: int = 43200  # 12 giờ cho Currency L2 Cache (TASK-208)

    # --- Email & SMTP ---
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = ""
    EMAILS_FROM_NAME: str = ""

    # --- Rate Limit ---
    RATE_LIMIT_AI_PER_MINUTE: int = 20
    RATE_LIMIT_AUTH_PER_MINUTE: int = 10

    # Đọc từ file .env ở thư mục backend hoặc repo root, bỏ qua các biến VITE_* của frontend
    model_config = SettingsConfigDict(
        env_file=[str(BASE_DIR / ".env"), str(BASE_DIR.parent / ".env")],
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """
    Cache lại 1 instance duy nhất — tránh đọc lại file .env mỗi lần gọi.
    Dùng: from app.core.config import get_settings; settings = get_settings()
    """
    return Settings()


settings = get_settings()
