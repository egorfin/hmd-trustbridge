# HMD TrustBridge

**AI-powered Digital Safety Advisor for parents considering their child's first smartphone.**

> *From Protection to Independence*

TrustBridge helps parents answer one question: **Is my child ready for a smartphone?**

The HMD Fuse recommendation is earned through the assessment — a consequence of the parent's answers, not the starting point.

> This demo runs locally but uses OpenAI API and Supabase over the internet.
> No real API keys are included in the public repository.
> For private hackathon submission, `.env.hackathon` may be included in the ZIP package only. Do not commit `.env.hackathon`.

---

## Quick Start

```bash
cp .env.example .env
# Fill in: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Supabase Setup

1. Create a free Supabase project at https://supabase.com
2. Open **SQL Editor**
3. Run `supabase/schema.sql`
4. Run `supabase/seed.sql`
5. Copy **Project URL** and **service_role key** into `.env`
6. Start the backend — it will log sessions, assessments, and agent steps automatically

Verify logs in the Supabase **Table Editor**:
- `tb_sessions` — one row per assessment
- `tb_assessments` — scoring inputs and outputs
- `tb_agent_steps` — per-step trace: `incoming_assessment_request`, `deterministic_scoring`, `llm_report_generation`

> The readiness score is deterministic — OpenAI only generates the explanation/report. LLM failures return a fallback report and never break the endpoint.

## User Journey

1. Parent scans QR code next to HMD Fuse in-store
2. Completes 60–90 second digital readiness assessment
3. Receives a Digital Readiness Snapshot
4. Sees main digital risks for their child's profile
5. Gets a personalized Digital Safety Strategy
6. Understands why HMD Fuse supports that strategy

## Docs

- [Setup Guide](docs/setup.md)
- [Architecture](docs/architecture.md)
- [Product Spec](docs/product_spec.md)
- [Test Scenarios](docs/test_scenarios.md)
- [Pitch Notes](docs/pitch_notes.md)
