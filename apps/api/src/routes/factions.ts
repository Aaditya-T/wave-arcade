import {
  canAssignRole,
  canKick,
  canPromoteTo,
  type FactionRole,
} from '@wave/game-engine';
import { factionCreationFeeDrops, isFactionCreationFree } from '@wave/config';
import type { AppContext } from '../lib/response.js';
import { requireParam } from '../lib/response.js';
import { apiError } from '../middleware/error.js';

export async function createFactionHandler(c: AppContext) {
  const deps = c.get('deps');
  const session = c.get('session');
  const body = await c.req.json<{ name?: string; description?: string; paymentTxHash?: string }>();

  if (!body.name?.trim()) {
    throw apiError('invalid_request', 'name is required', 400);
  }

  const existingMember = await deps.db.getFactionMember(session.userId);
  if (existingMember) {
    throw apiError('already_in_faction', 'User already belongs to a faction', 409);
  }

  const existingName = await deps.db.getFactionByName(body.name.trim());
  if (existingName) {
    throw apiError('faction_name_taken', 'Faction name already exists', 409);
  }

  const feeXrp = deps.env.FACTION_CREATION_FEE_XRP;
  if (!isFactionCreationFree(feeXrp) && !body.paymentTxHash) {
    throw apiError(
      'payment_required',
      `Faction creation requires ${feeXrp} XRP (paymentTxHash required until M3 verification)`,
      402,
    );
  }

  const result = await deps.db.createFaction({
    name: body.name.trim(),
    description: body.description,
    createdBy: session.userId,
    creationFeeDrops: factionCreationFeeDrops(feeXrp),
    feeTxHash: body.paymentTxHash,
  });

  return c.json(
    {
      ok: true,
      faction: {
        id: result.faction.id,
        name: result.faction.name,
        slug: result.faction.slug,
        leaderId: result.faction.leader_id,
        creationFeeDrops: result.faction.creation_fee_drops,
        feeTxHash: result.faction.fee_tx_hash,
      },
      role: result.member.role,
    },
    201,
  );
}

export async function listFactionsHandler(c: AppContext) {
  const deps = c.get('deps');
  const factions = await deps.db.listFactions();
  return c.json({
    factions: factions.map((f) => ({
      id: f.id,
      name: f.name,
      slug: f.slug,
      leaderId: f.leader_id,
      memberCount: null,
    })),
  });
}

export async function getFactionHandler(c: AppContext) {
  const deps = c.get('deps');
  const factionId = requireParam(c, 'id');
  const faction = await deps.db.getFactionById(factionId);
  if (!faction || faction.status !== 'active') {
    throw apiError('not_found', 'Faction not found', 404);
  }

  const members = await deps.db.getFactionMembers(factionId);
  return c.json({
    faction: {
      id: faction.id,
      name: faction.name,
      slug: faction.slug,
      description: faction.description,
      leaderId: faction.leader_id,
      creationFeeDrops: faction.creation_fee_drops,
    },
    members: members.map((m) => ({
      userId: m.user_id,
      role: m.role,
      joinedAt: m.joined_at,
    })),
  });
}

export async function joinFactionHandler(c: AppContext) {
  const deps = c.get('deps');
  const session = c.get('session');
  const factionId = requireParam(c, 'id');

  const faction = await deps.db.getFactionById(factionId);
  if (!faction || faction.status !== 'active') {
    throw apiError('not_found', 'Faction not found', 404);
  }

  const existing = await deps.db.getFactionMember(session.userId);
  if (existing) {
    throw apiError('already_in_faction', 'User already belongs to a faction', 409);
  }

  const member = await deps.db.addFactionMember(factionId, session.userId, 'member');
  return c.json({ ok: true, role: member.role });
}

export async function leaveFactionHandler(c: AppContext) {
  const deps = c.get('deps');
  const session = c.get('session');
  const factionId = requireParam(c, 'id');

  const member = await deps.db.getFactionMember(session.userId);
  if (!member || member.faction_id !== factionId) {
    throw apiError('not_in_faction', 'Not a member of this faction', 400);
  }

  if (member.role === 'leader') {
    throw apiError('leader_cannot_leave', 'Leader must transfer leadership before leaving', 400);
  }

  await deps.db.removeFactionMember(factionId, session.userId);
  return c.json({ ok: true });
}

export async function assignFactionRoleHandler(c: AppContext) {
  const deps = c.get('deps');
  const session = c.get('session');
  const factionId = requireParam(c, 'id');
  const targetUserId = requireParam(c, 'userId');
  const body = await c.req.json<{ role?: FactionRole }>();

  if (!body.role || !['officer', 'member', 'leader'].includes(body.role)) {
    throw apiError('invalid_request', 'Valid role is required', 400);
  }

  const actor = await deps.db.getFactionMember(session.userId);
  if (!actor || actor.faction_id !== factionId) {
    throw apiError('forbidden', 'Not a member of this faction', 403);
  }

  const target = await deps.db.getFactionMember(targetUserId);
  if (!target || target.faction_id !== factionId) {
    throw apiError('not_found', 'Target user is not in this faction', 404);
  }

  if (body.role === 'leader') {
    if (!canAssignRole(actor.role)) {
      throw apiError('forbidden', 'Only the leader can transfer leadership', 403);
    }
    await deps.db.updateFactionMemberRole(factionId, targetUserId, 'leader');
    await deps.db.updateFactionMemberRole(factionId, session.userId, 'officer');
    return c.json({ ok: true, role: 'leader', transferredFrom: session.userId });
  }

  if (!canAssignRole(actor.role)) {
    throw apiError('forbidden', 'Insufficient permissions to assign roles', 403);
  }

  if (!canPromoteTo(actor.role, body.role)) {
    throw apiError('forbidden', 'Cannot assign this role', 403);
  }

  if (targetUserId !== session.userId && !canKick(actor.role, target.role)) {
    throw apiError('forbidden', 'Cannot modify this member', 403);
  }

  const updated = await deps.db.updateFactionMemberRole(factionId, targetUserId, body.role);
  return c.json({ ok: true, role: updated.role });
}
