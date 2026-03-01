-- 1. Enable Storage Extension (if not already)
-- create extension if not exists "storage" schema "extensions";

-- 2. Create Bucket 'progress-photos'
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;

-- 3. Create Table for Metadata (to list gallery easily)
create table if not exists public.user_screenshots (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    image_url text not null,
    image_path text not null, -- path in bucket
    type text check (type in ('profile', 'insights')),
    captured_at timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

-- 4. Enable RLS
alter table public.user_screenshots enable row level security;

create policy "Users can view their own screenshots"
    on public.user_screenshots for select
    using (auth.uid() = user_id);

create policy "Users can insert their own screenshots"
    on public.user_screenshots for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own screenshots"
    on public.user_screenshots for delete
    using (auth.uid() = user_id);

-- 5. Storage Policies (Bucket Level)
-- Allow public access to view (since bucket is public) or restricted?
-- Let's make it so authenticated users can upload, but anyone with link can view (standard for public buckets) or restrict.
-- Given 'public: true' above:

create policy "Public Access to Photos"
  on storage.objects for select
  using ( bucket_id = 'progress-photos' );

create policy "Users can upload their own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos' AND
    auth.uid() = owner
  );

create policy "Users can update their own photos"
  on storage.objects for update
  using (
    bucket_id = 'progress-photos' AND
    auth.uid() = owner
  );

create policy "Users can delete their own photos"
  on storage.objects for delete
  using (
    bucket_id = 'progress-photos' AND
    auth.uid() = owner
  );
