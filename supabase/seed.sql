-- Sample data for local / hosted dev (no predefined factions)

insert into public.quests (slug, title, description, xp_reward, required_level)
values
  (
    'connect-wallet',
    'Connect Wallet',
    'Link your XRPL wallet to Wave Arcade.',
    50,
    1
  ),
  (
    'first-tip',
    'Send First Tip',
    'Tip another community member.',
    100,
    2
  ),
  (
    'join-faction',
    'Join a Faction',
    'Create or join a faction.',
    75,
    1
  )
on conflict (slug) do nothing;

insert into public.communities (platform, external_id, name)
values ('discord', 'test-guild-001', 'Wave Arcade Test Server')
on conflict (platform, external_id) do nothing;
