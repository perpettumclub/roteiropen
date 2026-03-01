-- Add persistence for Trial Scripts
alter table public.profiles
add column if not exists free_scripts_used integer default 0,
add column if not exists free_scripts_limit integer default 3;

-- Update RLS (if needed, but profiles usually has update policy)
