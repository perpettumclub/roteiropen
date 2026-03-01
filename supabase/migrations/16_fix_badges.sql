-- Ensure user_badges table exists and is correct
create table if not exists public.user_badges (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    badge_slug text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, badge_slug)
);

-- Enable RLS
alter table public.user_badges enable row level security;

-- Policies
create policy "Users can view their own badges"
    on public.user_badges for select
    using (auth.uid() = user_id);

create policy "Users can insert their own badges"
    on public.user_badges for insert
    with check (auth.uid() = user_id);

-- Create index
create index if not exists user_badges_user_id_idx on public.user_badges(user_id);
