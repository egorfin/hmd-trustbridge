-- TrustBridge Supabase schema — MVP
-- No long-term child profiles. Anonymous session logs and assessment records only.
-- Run this file once in the Supabase SQL Editor, then run seed.sql.

create extension if not exists "pgcrypto";

-- ── Sessions ──────────────────────────────────────────────────────────────────
create table if not exists tb_sessions (
  id               uuid primary key default gen_random_uuid(),
  external_user_id text,
  channel          text default 'web',
  country          text,
  language         text default 'en',
  debug            boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ── Assessment results ────────────────────────────────────────────────────────
create table if not exists tb_assessments (
  id                           uuid primary key default gen_random_uuid(),
  session_id                   uuid references tb_sessions(id) on delete cascade,
  child_age                    int,
  first_smartphone             boolean,
  main_use                     jsonb,
  existing_apps                text,
  main_concerns                jsonb,
  independence_level           text,
  parent_confidence_before     int,
  readiness_score              int,
  readiness_level              text,
  readiness_display_label      text,
  confidence_level             text,
  recommended_parenting_approach text,
  fuse_recommendation_level    text,
  risk_profile                 jsonb,
  strategy_focus               jsonb,
  score_drivers                jsonb,
  created_at                   timestamptz default now()
);

-- ── Agent / LLM step log ──────────────────────────────────────────────────────
create table if not exists tb_agent_steps (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid references tb_sessions(id) on delete cascade,
  assessment_id     uuid references tb_assessments(id) on delete cascade,
  step_name         text not null,
  status            text default 'success',
  input             jsonb,
  output            jsonb,
  error             text,
  model             text,
  latency_ms        int,
  prompt_tokens     int,
  completion_tokens int,
  total_tokens      int,
  created_at        timestamptz default now()
);

-- ── Prompt versioning ─────────────────────────────────────────────────────────
create table if not exists tb_prompt_versions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  version    text not null,
  prompt     text not null,
  is_active  boolean default false,
  created_at timestamptz default now(),
  unique (name, version)
);

-- ── Rules / config ────────────────────────────────────────────────────────────
create table if not exists tb_rules (
  id         uuid primary key default gen_random_uuid(),
  rule_key   text not null unique,
  category   text,
  condition  jsonb,
  action     jsonb,
  priority   int default 100,
  is_active  boolean default true,
  created_at timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_tb_sessions_created_at        on tb_sessions(created_at desc);
create index if not exists idx_tb_assessments_session_id     on tb_assessments(session_id);
create index if not exists idx_tb_agent_steps_session_id     on tb_agent_steps(session_id);
create index if not exists idx_tb_agent_steps_assessment_id  on tb_agent_steps(assessment_id);
create index if not exists idx_tb_prompt_versions_name_active on tb_prompt_versions(name, is_active);
create index if not exists idx_tb_rules_category_active      on tb_rules(category, is_active);
