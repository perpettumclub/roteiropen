-- 1. Coupons Table (Admin defined)
create table if not exists public.coupons (
    id uuid default gen_random_uuid() primary key,
    code text not null unique,
    discount_percent integer not null default 0,
    max_uses integer default null,
    uses_count integer default 0,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Coupons
alter table public.coupons enable row level security;
create policy "Anyone can read coupons" on public.coupons for select using (true);

-- 2. Referrals Table (User to User)
create table if not exists public.referrals (
    id uuid default gen_random_uuid() primary key,
    referrer_id uuid references auth.users(id) on delete cascade not null,
    referred_user_id uuid references auth.users(id) on delete cascade unique, -- One user can only be referred once
    status text default 'pending', -- pending, completed, paid
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Referrals
alter table public.referrals enable row level security;
create policy "Users can view their own referrals"
    on public.referrals for select
    using (auth.uid() = referrer_id);

create policy "Users can insert referrals" -- Usually backend does this on signup
    on public.referrals for insert
    with check (true);

-- 3. Add referral_code to profiles
-- Adding a column to store the user's permanent referral code
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'referral_code') then
        alter table public.profiles add column referral_code text unique;
    end if;
end $$;
