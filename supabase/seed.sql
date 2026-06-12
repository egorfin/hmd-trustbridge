-- Seed initial prompt config keys
insert into prompt_config (key, value) values
  ('fuse_recommendation_threshold', '45'),
  ('max_concern_penalty', '15')
on conflict (key) do nothing;
