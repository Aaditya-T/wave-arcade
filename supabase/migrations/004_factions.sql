-- Flexible user-created factions with roles

create table public.factions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_by uuid not null references public.users (id) on delete restrict,
  leader_id uuid not null references public.users (id) on delete restrict,
  creation_fee_drops bigint not null default 0 check (creation_fee_drops >= 0),
  fee_tx_hash text,
  status text not null default 'active' check (status in ('active', 'disbanded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name)
);

create table public.faction_members (
  id uuid primary key default gen_random_uuid(),
  faction_id uuid not null references public.factions (id) on delete cascade,
  user_id uuid not null unique references public.users (id) on delete cascade,
  role text not null default 'member' check (role in ('leader', 'officer', 'member')),
  joined_at timestamptz not null default now(),
  unique (faction_id, user_id)
);

alter table public.profiles
  add constraint profiles_faction_id_fkey
  foreign key (faction_id) references public.factions (id) on delete set null;

create index factions_created_by_idx on public.factions (created_by);
create index factions_leader_id_idx on public.factions (leader_id);
create index faction_members_faction_id_idx on public.faction_members (faction_id);
create index faction_members_user_id_idx on public.faction_members (user_id);

create trigger factions_set_updated_at
  before update on public.factions
  for each row execute function public.set_updated_at();

alter table public.factions enable row level security;
alter table public.faction_members enable row level security;
