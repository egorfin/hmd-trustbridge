-- TrustBridge Supabase schema
-- No long-term child profiles. Only session logs and anonymous assessment records.

create extension if not exists "pgcrypto";

create table if not exists assessment_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  payload     jsonb not null,
  created_at  timestamptz not null default now()
);

-- Index for debug queries by session
create index if not exists idx_assessment_logs_session_id on assessment_logs(session_id);

-- Prompt/rule config table — allows tuning prompts without redeploying
create table if not exists prompt_config (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  value       text not null,
  updated_at  timestamptz not null default now()
);
