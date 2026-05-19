# AuraPlan — AI-Powered Event Planner

AuraPlan is a premium, AI-driven event planning platform designed for architectural precision and futuristic user experiences. The project is a full-stack application with real-time editing and AI-simulated logic.

## Features
- **AI-Generated Plans:** Structured event generation using Gemini 2.0 with robust mock fallbacks.
- **Dynamic Optimization:** "Optimize with Aura" engine rebalances budget, guests, and itinerary flow.
- **AI Coworker Chat:** Direct plan editing and orchestration via natural language intent detection.
- **Blueprint Previews:** Visual architectural blueprints for spatial and layout planning.
- **Persistence:** PostgreSQL-backed history with JSONB schema synchronization.
- **Responsive Design:** Premium "Aura-Futurism" glassmorphic UI.

## Tech Stack
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS
- **Backend:** FastAPI, Pydantic V2, SQLAlchemy 2.0 (async), PostgreSQL
- **AI/Intelligence:** Google GenAI / Mock-Fallback Architecture

## Deployment
See `DEPLOYMENT.md` for full production setup instructions.

## Local Development
1. **Prerequisites:** PostgreSQL 16+, Node.js 22+, Python 3.12+
2. **Backend:** `cd backend`, create venv, `pip install -r requirements.txt`.
3. **Database:** Set `DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/auraplan`.
4. **Run Backend:** `uvicorn main:app --reload`
5. **Run Frontend:** `npm install`, `npm run dev`

## Docker Development
```bash
docker compose up --build
```
This will spin up a PostgreSQL 16 container and the backend API on port 8000.

## API Endpoints
- `POST /api/auth/register` / `login`
- `POST /api/plan/generate`
- `PATCH /api/plan/{event_id}`
- `POST /api/plan/optimize`
- `POST /api/bot/chat`

---
*Built for precision and performance.*
