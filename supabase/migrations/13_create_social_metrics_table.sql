-- Create social_metrics table
create table public.social_metrics (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    date date not null default CURRENT_DATE,
    followers integer not null default 0,
    avg_likes integer,
    avg_comments integer,
    screenshot_url text, -- Optional: link to the uploaded print in storage
    platform text default 'instagram', -- Prepared for future platforms
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.social_metrics enable row level security;

-- Policies
create policy "Users can view their own metrics"
    on public.social_metrics for select
    using (auth.uid() = user_id);

create policy "Users can insert their own metrics"
    on public.social_metrics for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own metrics"
    on public.social_metrics for update
    using (auth.uid() = user_id);

create policy "Users can delete their own metrics"
    on public.social_metrics for delete
    using (auth.uid() = user_id);

-- Constraints
-- Ensure one record per platform per day per user (upsert logic friendly)
alter table public.social_metrics 
    add constraint social_metrics_user_date_platform_key unique (user_id, date, platform);

-- Indexes
create index social_metrics_user_date_idx on public.social_metrics(user_id, date);
