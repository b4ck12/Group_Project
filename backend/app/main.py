from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import auth, events, invitations, places, plans, votes, ai

app = FastAPI(
    title="TripMateAI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(events.router,prefix="/api/v1")
app.include_router(invitations.router,prefix="/api/v1")
app.include_router(places.router,prefix="/api/v1")
app.include_router(plans.router,prefix="/api/v1")
app.include_router(votes.router,prefix="/api/v1")
app.include_router(ai.router,prefix="/api/v1")

@app.get("/")
def root():
   return{"status": "ok"}
