-- 1. Cria o Bucket 'progress-photos' (se não existir)
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;

-- 2. Tabela user_screenshots (se não existir)
create table if not exists public.user_screenshots (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    image_url text not null,
    image_path text not null,
    type text check (type in ('profile', 'insights')),
    captured_at timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

-- 3. Habilita RLS
alter table public.user_screenshots enable row level security;

-- 4. Cria Políticas de Tabela (removendo antigas se existirem para evitar conflito)
drop policy if exists "Users can view their own screenshots" on public.user_screenshots;
create policy "Users can view their own screenshots" on public.user_screenshots for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own screenshots" on public.user_screenshots;
create policy "Users can insert their own screenshots" on public.user_screenshots for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own screenshots" on public.user_screenshots;
create policy "Users can delete their own screenshots" on public.user_screenshots for delete using (auth.uid() = user_id);

-- 5. Políticas do Storage (Bucket)
drop policy if exists "Users can upload their own photos" on storage.objects;
create policy "Users can upload their own photos" on storage.objects for insert with check (bucket_id = 'progress-photos' AND auth.uid() = owner);

drop policy if exists "Users can update their own photos" on storage.objects;
create policy "Users can update their own photos" on storage.objects for update using (bucket_id = 'progress-photos' AND auth.uid() = owner);

drop policy if exists "Users can delete their own photos" on storage.objects;
create policy "Users can delete their own photos" on storage.objects for delete using (bucket_id = 'progress-photos' AND auth.uid() = owner);

drop policy if exists "Public Access to Photos" on storage.objects;
create policy "Public Access to Photos" on storage.objects for select using (bucket_id = 'progress-photos');
