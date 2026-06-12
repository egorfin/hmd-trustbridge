# curl Examples

> The readiness score is deterministic. OpenAI only generates the explanation/report.
> If OpenAI is not configured, a fallback report is returned and the endpoint still returns 200.

## Health check

```bash
curl http://localhost:8000/health
```

---

## Assessment — spec example (age 10, 3 concerns)

Expected score: **37** — `not_ready` / `Safer start recommended`

```bash
curl -X POST http://localhost:8000/api/assessment \
  -H "Content-Type: application/json" \
  -d '{
    "child_age": 10,
    "first_smartphone": true,
    "main_use": ["school", "friends", "games"],
    "existing_apps": "messaging_only",
    "main_concerns": ["harmful_content", "screen_time", "strangers"],
    "independence_level": "balanced",
    "parent_confidence_before": 2,
    "country": "Finland",
    "language": "en",
    "debug": true
  }'
```

**Expected response includes:**
```json
{
  "readiness_score": 37,
  "readiness_level": "not_ready",
  "readiness_display_label": "Safer start recommended",
  "report": {
    "headline": "...",
    "summary": "...",
    "why_this_score": "...",
    "risk_explanation": "...",
    "safety_strategy": ["..."],
    "suggested_parent_child_conversation": "...",
    "why_hmd_fuse_fits": "...",
    "confidence_shift_message": "..."
  },
  "debug": {
    "llm": { "fallback_used": false, "model": "gpt-4.1-mini", ... }
  }
}
```

If Supabase is configured, rows appear in:
- `tb_sessions`
- `tb_assessments`
- `tb_agent_steps` (steps: `incoming_assessment_request`, `deterministic_scoring`, `llm_report_generation`)

---

## Assessment — moderate readiness (age 10, 1 concern)

Expected score: **50** — `moderate` / `Ready for guided independence`

```bash
curl -X POST http://localhost:8000/api/assessment \
  -H "Content-Type: application/json" \
  -d '{
    "child_age": 10,
    "first_smartphone": true,
    "main_use": ["school"],
    "existing_apps": "messaging_only",
    "main_concerns": ["screen_time"],
    "independence_level": "balanced",
    "parent_confidence_before": 3,
    "country": "Finland",
    "language": "en",
    "debug": false
  }'
```

---

## Assessment — ready with boundaries (age 13)

Expected score: **83** — `ready_with_boundaries` / `Ready with clear boundaries`

```bash
curl -X POST http://localhost:8000/api/assessment \
  -H "Content-Type: application/json" \
  -d '{
    "child_age": 13,
    "first_smartphone": false,
    "main_use": ["school", "family"],
    "existing_apps": "messaging_only",
    "main_concerns": ["screen_time"],
    "independence_level": "balanced",
    "parent_confidence_before": 4,
    "country": "Finland",
    "language": "en",
    "debug": false
  }'
```
