# Setup Guide

## Prerequisites

- Docker + Docker Compose
- OpenAI API key
- Supabase project (free tier works)

## Steps

### 1. Clone

```bash
git clone <repo-url>
cd hmd-trustbridge
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

### 3. Set up Supabase schema

1. Create a free project at https://supabase.com
2. Open **SQL Editor** in the Supabase dashboard
3. Paste and run `supabase/schema.sql` — creates all five tables and indexes
4. Paste and run `supabase/seed.sql` — inserts prompt versions and rules (safe to re-run)
5. Copy **Project URL** → `SUPABASE_URL` in `.env`
6. Copy **service_role** key (Settings → API) → `SUPABASE_SERVICE_ROLE_KEY` in `.env`

> The backend works without Supabase — it skips logging and returns `debug.supabase: "not configured"` when `debug: true`.

### Verify Supabase logs

After sending one assessment request, check these tables in **Table Editor**:
- `tb_sessions` — one row per request
- `tb_assessments` — scoring inputs + outputs
- `tb_agent_steps` — step trace (`incoming_assessment_request`, `deterministic_scoring`)

### 4. Start

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

> `NEXT_PUBLIC_API_BASE_URL` must point to `http://localhost:8000` (the host-visible address) because API calls are made from the **browser**, not from the Next.js server process. The Docker service name `backend` is only reachable container-to-container and will not work in the browser.

## Local development (without Docker)

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
