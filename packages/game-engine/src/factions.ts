export type FactionRole = 'leader' | 'officer' | 'member';

const ROLE_RANK: Record<FactionRole, number> = {
  leader: 3,
  officer: 2,
  member: 1,
};

export function roleRank(role: FactionRole): number {
  return ROLE_RANK[role];
}

export function canEditFaction(role: FactionRole): boolean {
  return role === 'leader';
}

export function canDisbandFaction(role: FactionRole): boolean {
  return role === 'leader';
}

export function canAssignRole(role: FactionRole): boolean {
  return role === 'leader';
}

export function canManageMembers(role: FactionRole): boolean {
  return role === 'leader' || role === 'officer';
}

/** Actor may kick only members with strictly lower rank. */
export function canKick(actorRole: FactionRole, targetRole: FactionRole): boolean {
  if (!canManageMembers(actorRole)) return false;
  return roleRank(actorRole) > roleRank(targetRole);
}

export function canPromoteTo(actorRole: FactionRole, targetRole: FactionRole): boolean {
  if (!canAssignRole(actorRole)) return false;
  return roleRank(targetRole) < roleRank('leader');
}

export { isFactionCreationFree } from '@wave/config';
