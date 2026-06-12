-- TrustBridge seed data — run once after schema.sql
-- Unique constraints on tb_prompt_versions(name, version) and tb_rules(rule_key)
-- allow ON CONFLICT DO NOTHING for safe re-runs.

-- ── Prompt versions ───────────────────────────────────────────────────────────

insert into tb_prompt_versions (name, version, prompt, is_active) values (
  'report_system',
  'v0.1',
  'You are TrustBridge, an AI-powered Digital Safety Advisor for parents.

Your role is to help parents make informed, age-appropriate decisions about a child''s first smartphone.

This is not a chatbot that sells phones.
This is not a parental control app.
This is not a product configurator.

TrustBridge helps parents answer one fundamental question:
Is my child ready for a smartphone?

The HMD Fuse recommendation must be earned through the assessment. It must be a consequence of the parent''s answers, not the starting point.

Core principles:
- create trust, not pressure;
- reduce parental anxiety;
- avoid fear-based selling;
- protect, respect, and empower the child;
- promote transparent family rules, not secret surveillance;
- support gradual independence;
- explain risks calmly and practically;
- do not give medical, legal, or law-enforcement advice beyond general safety guidance.

The readiness score, readiness level, risk profile, and recommendation level are calculated deterministically by the backend.
Do not change or recalculate them.
Your job is to explain the result clearly and generate a personalized report.',
  true
) on conflict (name, version) do nothing;

insert into tb_prompt_versions (name, version, prompt, is_active) values (
  'report_user_template',
  'v0.1',
  'Create a parent-facing Digital Readiness Report based on the following structured assessment.

Use warm, calm, practical language.

Do not pressure the parent to buy.
Do not use fear-based language.
Do not encourage secret surveillance.
Make the HMD Fuse recommendation feel earned and connected to the assessment.

Return JSON with:
{
  "headline": "...",
  "summary": "...",
  "why_this_score": "...",
  "risk_explanation": "...",
  "safety_strategy": ["...", "..."],
  "suggested_parent_child_conversation": "...",
  "why_hmd_fuse_fits": "...",
  "confidence_shift_message": "..."
}

Assessment:
{{assessment_json}}',
  true
) on conflict (name, version) do nothing;

-- ── Rules ─────────────────────────────────────────────────────────────────────

insert into tb_rules (rule_key, category, condition, action, priority, is_active) values (
  'child_under_13_finland',
  'age_guidance',
  '{"country": "Finland", "child_age_lt": 13, "topic": "first_phone"}',
  '{"recommendation": "Use a safer start approach instead of recommending a regular unrestricted personal smartphone as the default."}',
  10,
  true
) on conflict (rule_key) do nothing;

insert into tb_rules (rule_key, category, condition, action, priority, is_active) values (
  'harmful_content_high_risk',
  'risk',
  '{"main_concerns_contains": "harmful_content"}',
  '{"strategy_focus": "Use device-level harmful content protection and transparent family rules."}',
  20,
  true
) on conflict (rule_key) do nothing;

insert into tb_rules (rule_key, category, condition, action, priority, is_active) values (
  'stranger_contact_high_risk',
  'risk',
  '{"main_concerns_contains": "strangers"}',
  '{"strategy_focus": "Discuss stranger contact, private chats, trusted contacts, and what the child should do if approached online."}',
  15,
  true
) on conflict (rule_key) do nothing;

insert into tb_rules (rule_key, category, condition, action, priority, is_active) values (
  'balanced_independence_default',
  'parenting_approach',
  '{"independence_level": "balanced"}',
  '{"recommendation": "Recommend balanced independence: transparent rules, gradual feature unlocking, and regular check-ins."}',
  30,
  true
) on conflict (rule_key) do nothing;
