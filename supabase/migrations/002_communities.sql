-- Community mapping for Discord / Telegram guilds

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('discord', 'telegram', 'web')),
  external_id text not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, external_id)
);

create table public.community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (community_id, user_id)
);

create table public.community_settings (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null unique references public.communities (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index community_members_community_id_idx on public.community_members (community_id);
create index community_members_user_id_idx on public.community_members (user_id);

create trigger communities_set_updated_at
  before update on public.communities
  for each row execute function public.set_updated_at();

create trigger community_settings_set_updated_at
  before update on public.community_settings
  for each row execute function public.set_updated_at();

alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_settings enable row level security;
