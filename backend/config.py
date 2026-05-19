import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/auraplan")
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "local-dev-secret-change-later")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# Phase 4 AI configuration
AI_PROVIDER = os.getenv("AI_PROVIDER", "mock")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "gemini-2.5-flash")
AI_TIMEOUT_SECONDS = int(os.getenv("AI_TIMEOUT_SECONDS", "30"))
AI_FALLBACK_TO_MOCK = os.getenv("AI_FALLBACK_TO_MOCK", "true").lower() == "true"

# Phase 5 Bot configuration
CHAT_PROVIDER = os.getenv("CHAT_PROVIDER", "mock")
SEARCH_PROVIDER = os.getenv("SEARCH_PROVIDER", "mock")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
SEARCH_TIMEOUT_SECONDS = int(os.getenv("SEARCH_TIMEOUT_SECONDS", "10"))
SEARCH_FALLBACK_TO_MOCK = os.getenv("SEARCH_FALLBACK_TO_MOCK", "true").lower() == "true"
ENABLE_VENDOR_SEARCH = os.getenv("ENABLE_VENDOR_SEARCH", "false").lower() == "true"
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")

# Quota Settings (Free Tier Protection)
MAX_TAVILY_QUOTA = int(os.getenv("MAX_TAVILY_QUOTA", "1000"))
MAX_FIRECRAWL_QUOTA = int(os.getenv("MAX_FIRECRAWL_QUOTA", "1000"))
# DDG is free but we can still limit it
MAX_DDG_QUOTA = int(os.getenv("MAX_DDG_QUOTA", "5000"))

USAGE_STATS_FILE = os.path.join(os.path.dirname(__file__), "usage_stats.json")