-- TrustBridge Supabase schema
-- No long-term child profiles. Only session logs and anonymous assessment records.
--
-- NOTE: The placeholder tables below (assessment_logs, prompt_config) will be
-- replaced in the next task by the production schema:
--   tb_sessions, tb_assessments, tb_agent_steps, tb_prompt_versions, tb_rules
-- Do not build application logic on top of the placeholder tables.

create extension if not exists "pgcrypto";

-- PLACEHOLDER — will be replaced by tb_sessions + tb_assessments
create table if not exists assessment_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  payload     jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_assessment_logs_session_id on assessment_logs(session_id);

-- PLACEHOLDER — will be replaced by tb_prompt_versions + tb_rules
create table if not exists prompt_config (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  value       text not null,
  updated_at  timestamptz not null default now()
);
