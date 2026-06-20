-- Wave Arcade core identity tables

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  display_name text,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  faction_id uuid,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  address text not null,
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  unique (address)
);

create unique index wallets_one_primary_per_user
  on public.wallets (user_id)
  where is_primary = true;

create table public.linked_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  provider text not null check (provider in ('discord', 'telegram', 'web')),
  provider_id text not null,
  username text,
  created_at timestamptz not null default now(),
  unique (provider, provider_id)
);

create index profiles_user_id_idx on public.profiles (user_id);
create index wallets_user_id_idx on public.wallets (user_id);
create index linked_accounts_user_id_idx on public.linked_accounts (user_id);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.linked_accounts enable row level security;
