-- Create frequency_scripts table (Renamed as requested)
create table public.frequency_scripts (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    niche text,
    is_favorite boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.frequency_scripts enable row level security;

-- Policies
create policy "Users can view their own scripts"
    on public.frequency_scripts for select
    using (auth.uid() = user_id);

create policy "Users can insert their own scripts"
    on public.frequency_scripts for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own scripts"
    on public.frequency_scripts for update
    using (auth.uid() = user_id);

create policy "Users can delete their own scripts"
    on public.frequency_scripts for delete
    using (auth.uid() = user_id);

-- Create index for performance
create index frequency_scripts_user_id_idx on public.frequency_scripts(user_id);
create index frequency_scripts_created_at_idx on public.frequency_scripts(created_at);
