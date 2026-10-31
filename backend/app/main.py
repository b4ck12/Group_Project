from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.redis import init_redis_pool, close_redis_pool, check_redis_health
from app.core.http_client import init_http_client, close_http_client
from app.api.v1 import auth, events, invitations, places, plans, votes, ai, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Quản lý vòng đời khởi tạo và dọn dẹp tài nguyên (Redis, HTTPX Client)."""
    # Startup
    await init_redis_pool()
    await init_http_client()
    yield
    # Shutdown
    await close_redis_pool()
    await close_http_client()


app = FastAPI(
    title="TripMateAI",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(invitations.router, prefix="/api/v1")
app.include_router(places.router, prefix="/api/v1")
app.include_router(plans.router, prefix="/api/v1")
app.include_router(votes.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/api/v1/healthz")
@app.get("/api/healthz")
async def health_check():
    """Endpoint kiểm tra sức khỏe hệ thống và kết nối Redis."""
    redis_health = await check_redis_health()
    overall_status = "healthy" if redis_health.get("connected") else "degraded"
    return {
        "status": overall_status,
        "service": "tripmate-gateway",
        "redis": redis_health,
    }
