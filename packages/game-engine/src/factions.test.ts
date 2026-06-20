import { describe, expect, it } from 'vitest';
import {
  canAssignRole,
  canDisbandFaction,
  canEditFaction,
  canKick,
  canManageMembers,
  canPromoteTo,
  isFactionCreationFree,
  roleRank,
} from './factions.js';

describe('faction roles', () => {
  it('ranks leader above officer above member', () => {
    expect(roleRank('leader')).toBeGreaterThan(roleRank('officer'));
    expect(roleRank('officer')).toBeGreaterThan(roleRank('member'));
  });

  it('leader has full faction permissions', () => {
    expect(canEditFaction('leader')).toBe(true);
    expect(canDisbandFaction('leader')).toBe(true);
    expect(canAssignRole('leader')).toBe(true);
    expect(canManageMembers('leader')).toBe(true);
  });

  it('officer can manage members but not edit or disband', () => {
    expect(canManageMembers('officer')).toBe(true);
    expect(canEditFaction('officer')).toBe(false);
    expect(canDisbandFaction('officer')).toBe(false);
    expect(canAssignRole('officer')).toBe(false);
  });

  it('member has no management permissions', () => {
    expect(canManageMembers('member')).toBe(false);
    expect(canEditFaction('member')).toBe(false);
  });

  it('canKick respects rank hierarchy', () => {
    expect(canKick('leader', 'officer')).toBe(true);
    expect(canKick('leader', 'member')).toBe(true);
    expect(canKick('officer', 'member')).toBe(true);
    expect(canKick('officer', 'leader')).toBe(false);
    expect(canKick('member', 'member')).toBe(false);
  });

  it('canPromoteTo blocks promoting to leader rank by non-leader paths', () => {
    expect(canPromoteTo('leader', 'officer')).toBe(true);
    expect(canPromoteTo('leader', 'leader')).toBe(false);
    expect(canPromoteTo('officer', 'officer')).toBe(false);
  });

  it('isFactionCreationFree re-export works', () => {
    expect(isFactionCreationFree(0)).toBe(true);
    expect(isFactionCreationFree(0.1)).toBe(false);
  });
});
