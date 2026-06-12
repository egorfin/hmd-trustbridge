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

Run `supabase/schema.sql` in your Supabase SQL editor, then `supabase/seed.sql`.

### 4. Start

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

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
