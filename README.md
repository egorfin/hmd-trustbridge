# HMD TrustBridge

**AI-powered Digital Safety Advisor for parents considering their child's first smartphone.**

> *From Protection to Independence*

TrustBridge helps parents answer one question: **Is my child ready for a smartphone?**

The HMD Fuse recommendation is earned through the assessment — it's a consequence of the parent's answers, not the starting point.

---

## Quick Start

```bash
cp .env.example .env
# Fill in OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

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
