# AuraPlan Project Instructions

This document outlines the architectural principles, design standards, and development workflows for the AuraPlan AI Event Planner project.

## Core Mission
AuraPlan is a premium, AI-driven event planning platform designed for architectural precision and futuristic user experiences. The project is a full-stack application with real-time editing, AI-simulated logic, and robust fallback architecture.

## Tech Stack
- **Frontend:** React 19 (TypeScript 6), Vite 8
- **State Management:** Zustand 5
- **Backend:** FastAPI (Python 3.12+)
- **AI Integration:** Google GenAI (Gemini 2.0 Flash)
- **Database:** PostgreSQL (with SQLAlchemy 2.0 / AsyncPG)
- **Deployment:** Docker, Docker Compose
- **Styling:** Tailwind CSS 3.4 (Dark-mode first, Glassmorphism)
- **Icons:** Lucide React
- **Routing:** React Router DOM 7
- **API Client:** Axios

## Design System (Aura-Futurism)
All UI elements must adhere to the "Aura-Futurism" aesthetic:
- **Base Palette:** `slate-950` (#020617) for backgrounds, `white` and `slate-200` for text.
- **Accents:** Indigo-400 (#818cf8), Pink-400 (#f472b6), and Emerald-400 gradients.
- **Glassmorphism:** Use `.glass-card` for containers (`bg-white/5`, `backdrop-blur-xl`, `border-white/10`).
- **Typography:** 
  - Headings: `font-black`, `tracking-tighter`, `uppercase`, often `italic`.
  - Data/Inputs/Timeline: `font-mono` for precision.
- **Animations:** 
  - Subtle pulsing glows: `.glow-orb`
  - Gradient shifts: `.animate-gradient-x`
  - Fade in: `.animate-fade-in`
  - Glass-hover: `hover:bg-white/10 transition-colors`

## Core Features & Logic
- **Real-Time Temporal Flow:** Itinerary items use absolute clock times calculated from the event's start time.
- **AI Strategy Generation:** Dynamic plan generation using Gemini with structured output validation. Includes a robust fallback to mock generation if the AI service is unavailable.
- **Surgical Plan Editing:** Users can edit budget allocations, themes, guest counts, and itinerary details directly on the Dashboard.
- **Data Synchronization:** When plans are optimized or updated via the `PATCH /api/plan/{event_id}` endpoint, the backend strictly ensures top-level relational columns (budget, guest count, etc.) are synchronized with the `generated_plan_json` JSONB structure.
- **Neural Synchronization:** Modified plans are locally tracked and synchronized with the backend via the "Commit Changes" protocol.
- **Database Storage:** Event plans are stored as structured `JSONB` objects in PostgreSQL for flexibility and speed.

## Development Workflow
### Running Locally (Without Docker)
- **Database:** Ensure PostgreSQL is running on port 5432 with database `auraplan`.
- **Frontend:** `npm run dev` (Runs on `http://localhost:5173` or `5174`)
- **Backend:** `cd backend && .\.venv\Scripts\uvicorn.exe main:app --reload --port 8000`

### Running with Docker Compose
- Run `docker compose up --build` from the root directory.
- This provisions a PostgreSQL container and a lightweight Python 3.12-slim backend container automatically.
- *Note:* The backend inside Docker connects to the DB via `postgresql+asyncpg://postgres:postgres@postgres:5432/auraplan` instead of `localhost`.

### Environment Configuration
- **Backend (.env):**
  - `DATABASE_URL`: PostgreSQL connection string (asyncpg).
  - `JWT_SECRET_KEY`: Security key for auth tokens.
  - `FRONTEND_ORIGIN`: Allowed CORS origin (e.g., `http://localhost:5173` or `*`).
  - `GEMINI_API_KEY`: API key for Google GenAI.
  - `AI_PROVIDER`: `gemini` or `mock`.
- **Frontend (.env):**
  - `VITE_API_BASE_URL`: Pointing to the backend API (e.g., `http://localhost:8000`).

## Component Guidelines
- **Responsiveness:** Maintain mobile-first design with floating action buttons for chat on small screens.
- **Types:** Always use `import type` for type-only imports to improve build performance.
- **State Management:** Use `useAuthStore` (Zustand) for authentication and user session data.
- **Editing Mode:** Use consistent indigo/emerald accents for editable fields and "Commit" actions.
- **Validation:** AI-generated plans must pass strict schema validation on both backend and frontend.

## Project Structure
- `src/`: React frontend source code.
- `backend/`: FastAPI backend source.
  - `routes/`: API endpoint definitions.
  - `services/`: Business logic and AI integration.
  - `models.py`: SQLAlchemy database models.
  - `schemas.py`: Pydantic data validation schemas.
- `src/components/`: Reusable UI modules (Timeline, BudgetTable, ThemeSummaryCard).
- `src/api/`: Axios client and service definitions.
- `src/store/`: Zustand store definitions.
- `src/types/`: Centralized TypeScript interfaces.
- `docker-compose.yml` & `backend/Dockerfile`: Container orchestration configurations.
