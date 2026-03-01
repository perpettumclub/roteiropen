-- 1. Cria a tabela de metas do usuário (se não existir)
create table if not exists public.user_goals (
    user_id uuid references auth.users(id) on delete cascade primary key,
    target_followers integer,
    target_date date,
    notification_weekly boolean default true,
    notification_monthly boolean default true,
    weekly_scripts_goal integer default 3,
    current_streak integer default 0,
    longest_streak integer default 0,
    last_active_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilita a segurança (RLS)
alter table public.user_goals enable row level security;

-- 3. Cria regras de acesso (Cada um só mexe na sua meta)
drop policy if exists "Users can view their own goals" on public.user_goals;
create policy "Users can view their own goals" on public.user_goals for select using (auth.uid() = user_id);

drop policy if exists "Users can insert/update their own goals" on public.user_goals;
create policy "Users can insert/update their own goals" on public.user_goals for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own goals" on public.user_goals;
create policy "Users can update their own goals" on public.user_goals for update using (auth.uid() = user_id);
