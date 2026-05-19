# AuraPlan Deployment Guide

## Architecture
AuraPlan follows a clean separation between the frontend SPA and the backend API, backed by a persistent PostgreSQL database.

## Prerequisites
- Managed PostgreSQL Database
- Cloud Hosting (e.g., Render, Railway, Fly.io, or Vercel for Frontend)

## Backend Configuration (Environment Variables)
The backend requires the following configuration:

- `DATABASE_URL`: Connection string (e.g., `postgresql+asyncpg://user:pass@host:port/db`)
- `JWT_SECRET_KEY`: Random string for token signing
- `FRONTEND_ORIGIN`: Allowed CORS URL (e.g., `https://auraplan.vercel.app`)
- `AI_PROVIDER`: `mock` or `gemini`
- `GEMINI_API_KEY`: (Optional) If AI_PROVIDER is `gemini`

## Frontend Configuration
- `VITE_API_BASE_URL`: URL of the deployed backend API (e.g., `https://auraplan-backend.onrender.com`)

## SPA Deployment (e.g., Vercel)
For React Router compatibility, add a `vercel.json` to the root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## Testing Checklist
1. Deploy DB.
2. Deploy backend (verify `/api/health`).
3. Deploy frontend (verify `VITE_API_BASE_URL` point to backend).
4. Register a new user.
5. Generate an event plan.
6. Verify plan history.
7. Perform an optimization.
8. Verify chat plan updates.
