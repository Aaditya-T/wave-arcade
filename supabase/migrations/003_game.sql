-- Game state: quests, balances, transactions, events

create table public.quests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  xp_reward integer not null default 0 check (xp_reward >= 0),
  required_level integer not null default 1 check (required_level >= 1),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.quest_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  quest_id uuid not null references public.quests (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, quest_id)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  tx_hash text not null unique,
  amount_drops bigint not null,
  destination text not null,
  source_tag integer,
  status text not null default 'pending' check (status in ('pending', 'applied', 'failed')),
  created_at timestamptz not null default now()
);

create table public.balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  arcade_balance_drops bigint not null default 0 check (arcade_balance_drops >= 0),
  updated_at timestamptz not null default now()
);

create table public.game_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index quest_completions_user_id_idx on public.quest_completions (user_id);
create index quest_completions_quest_id_idx on public.quest_completions (quest_id);
create index transactions_user_id_idx on public.transactions (user_id);
create index game_events_user_id_idx on public.game_events (user_id);

create trigger balances_set_updated_at
  before update on public.balances
  for each row execute function public.set_updated_at();

alter table public.quests enable row level security;
alter table public.quest_completions enable row level security;
alter table public.transactions enable row level security;
alter table public.balances enable row level security;
alter table public.game_events enable row level security;
