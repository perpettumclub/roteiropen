-- Create user_goals table to store growth targets and notification preferences
create table public.user_goals (
    user_id uuid references auth.users(id) on delete cascade primary key,
    target_followers integer,
    target_date date,
    notification_weekly boolean default true,
    notification_monthly boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_goals enable row level security;

-- Policies
create policy "Users can view their own goals"
    on public.user_goals for select
    using (auth.uid() = user_id);

create policy "Users can insert/update their own goals"
    on public.user_goals for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own goals"
    on public.user_goals for update
    using (auth.uid() = user_id);

-- Function to handle timestamp update
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.user_goals
  for each row
  execute procedure public.handle_updated_at();
