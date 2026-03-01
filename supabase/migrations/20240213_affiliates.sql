-- Create affiliates table
create table if not exists affiliates (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  user_id uuid references auth.users(id), -- Optional: link to a user if specific users are affiliates
  created_at timestamptz default now()
);

-- Create referrals table
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid references affiliates(id),
  user_id uuid references auth.users(id),
  status text default 'trial', -- trial, paid, churned
  created_at timestamptz default now()
);

-- Add affiliate_code to profiles if not exists (User mentioned 'profiles' table)
-- do $$ 
-- begin 
--   if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'referred_by') then
--     alter table profiles add column referred_by text;
--   end if; 
-- end $$;
-- BETTER: Let's assume user runs this manually or we just add the column.
-- The user request says: "Alterações em Tabelas Existentes profiles: Adicionar coluna referred_by (código do afiliado)."
alter table profiles add column if not exists referred_by text;

-- RLS Policies
alter table affiliates enable row level security;
alter table referrals enable row level security;

-- Admin can see everything (Assuming admin has a specific role or claim, or we use a service_role key in the admin app)
-- For now, let's allow read access to authenticated users for affiliates (so they can be validated?) 
-- changing checking approach: public read for affiliates code lookup?
create policy "Allow public read of affiliates code" on affiliates for select using (true);

-- Only admins/service_role should modify affiliates
-- (Supabase default is deny all for mutation unless policy exists)

-- Referrals: Users can see their own referrals? Or just Admin?
-- Admin only for now.
create policy "Admin read all referrals" on referrals for select using (auth.role() = 'service_role'); -- basic check, needs robust admin role check if using client lib with auth user.

-- For the Admin App, user mentioned reusing the project.
-- If using service_role key in Admin App (server-side) or specific admin user, RLS logic applies.
-- User said: "RLS (Row Level Security) no Supabase: Apenas usuários com role = 'admin' podem ler a tabela de métricas financeiras."
-- We will assume there is a way to distinguish admins. For now, using service_role or specific claim.
