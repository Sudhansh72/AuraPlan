from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routes.health import router as health_router
from routes.plan import router as plan_router
from routes.auth import router as auth_router
from routes.bot import router as bot_router
from config import FRONTEND_ORIGIN
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    await init_db()
    yield

app = FastAPI(title="AuraPlan API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_ORIGIN,
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(plan_router, prefix="/api/plan")
app.include_router(bot_router, prefix="/api/bot")

@app.get("/")
async def root():
    return {"message": "Welcome to AuraPlan API"}
