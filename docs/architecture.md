# Architecture — HMD TrustBridge

## Components

```
Browser (mobile)
    │
    ▼
Next.js Frontend (port 3000)
    │  POST /api/assessment
    ▼
FastAPI Backend (port 8000)
    ├── scoring.py           → deterministic readiness score
    ├── llm.py               → OpenAI report generation (Task 4)
    └── supabase_client.py   → session + assessment logging
    │
    ├── OpenAI API (gpt-4.1-mini by default)
    └── Supabase (tb_sessions, tb_assessments, tb_agent_steps)
```

## Assessment Request Flow

```
POST /api/assessment
    │
    ├── 1. create_session()              → tb_sessions row
    ├── 2. log_agent_step()              → incoming_assessment_request
    ├── 3. compute_assessment()          → deterministic score + risk profile
    ├── 4. log_assessment()              → tb_assessments row
    ├── 5. log_agent_step()              → deterministic_scoring result
    ├── 6. generate_digital_readiness_report()
    │       ├── load prompt (Supabase → local file → hardcoded)
    │       ├── call OpenAI with compact assessment context
    │       └── fallback to deterministic report if OpenAI fails
    ├── 7. log_agent_step()              → llm_report_generation
    └── 8. return AssessmentResponse
              ├── session_id
              ├── assessment_id
              ├── readiness_score        ← deterministic, never changed by LLM
              ├── readiness_level + readiness_display_label
              ├── risk_profile           ← deterministic, never changed by LLM
              ├── score_drivers
              ├── strategy_focus
              ├── fuse_recommendation_level  ← deterministic
              └── report
                    ├── headline
                    ├── summary
                    ├── why_this_score
                    ├── risk_explanation
                    ├── safety_strategy
                    ├── suggested_parent_child_conversation
                    ├── why_hmd_fuse_fits
                    └── confidence_shift_message
```

## Supabase Tables

| Table | Purpose |
|---|---|
| `tb_sessions` | One row per browser session / QR scan |
| `tb_assessments` | Scoring inputs + outputs |
| `tb_agent_steps` | Per-step trace: request, scoring, LLM call |
| `tb_prompt_versions` | Versioned LLM system/user prompts |
| `tb_rules` | Configurable guidance rules by country, age, concern |

## Key Design Decisions

- **Score is deterministic** — `readiness_score`, `readiness_level`, `risk_profile`, `fuse_recommendation_level` are set by `scoring.py` before LLM is called. LLM cannot change them.
- **LLM only generates the report narrative** — it explains the already-calculated result in warm, parent-friendly language
- **LLM failures are non-blocking** — deterministic fallback report returned on any error
- **Prompt source priority** — Supabase `tb_prompt_versions` → local `.txt` files → hardcoded strings
- **Supabase failures are non-blocking** — assessment continues even if logging fails
- **Server key stays server-side** — `SUPABASE_SERVICE_ROLE_KEY` never reaches the browser
- **No auth (MVP)** — anonymous sessions only
- **CORS open (MVP)** — tighten before production
- **Docker Compose** for local + demo environments
