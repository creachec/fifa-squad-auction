import { Team, PlayerAssignment } from '@/types/auction';

export interface Formation433 {
  gk: PlayerAssignment | null;
  lb: PlayerAssignment | null;
  cb1: PlayerAssignment | null;
  cb2: PlayerAssignment | null;
  rb: PlayerAssignment | null;
  cm1: PlayerAssignment | null;
  cm2: PlayerAssignment | null;
  cm3: PlayerAssignment | null;
  lw: PlayerAssignment | null;
  st: PlayerAssignment | null;
  rw: PlayerAssignment | null;
}

export interface PositionAssignment {
  player: PlayerAssignment;
  position: string;
  isAdapted: boolean;
}

export function selectBest11For433(team: Team): Formation433 {
  const players = [...team.players];
  
  // Separate players by position
  const byPosition: Record<string, PlayerAssignment[]> = {
    GK: [],
    CB: [],
    LB: [],
    RB: [],
    CM: [],
    LW: [],
    RW: [],
    ST: [],
  };

  players.forEach((p) => {
    if (byPosition[p.player.position]) {
      byPosition[p.player.position].push(p);
    }
  });

  // Sort each position by rating (descending)
  Object.keys(byPosition).forEach((pos) => {
    byPosition[pos].sort((a, b) => b.player.rating - a.player.rating);
  });

  const formation: Formation433 = {
    gk: null,
    lb: null,
    cb1: null,
    cb2: null,
    rb: null,
    cm1: null,
    cm2: null,
    cm3: null,
    lw: null,
    st: null,
    rw: null,
  };

  const used: Set<string> = new Set();

  // Helper to get best available player
  const getBest = (position: string): PlayerAssignment | null => {
    const available = byPosition[position].find((p) => !used.has(p.player.name));
    if (available) {
      used.add(available.player.name);
      return available;
    }
    return null;
  };

  // Fill primary positions
  formation.gk = getBest('GK');
  formation.cb1 = getBest('CB');
  formation.cb2 = getBest('CB');
  formation.lb = getBest('LB');
  formation.rb = getBest('RB');
  formation.cm1 = getBest('CM');
  formation.cm2 = getBest('CM');
  formation.cm3 = getBest('CM');
  formation.lw = getBest('LW');
  formation.st = getBest('ST');
  formation.rw = getBest('RW');

  // Adapt players for missing positions
  if (!formation.lb) {
    formation.lb = getBest('CB') || getBest('RB');
  }
  if (!formation.rb) {
    formation.rb = getBest('CB') || getBest('LB');
  }
  if (!formation.cb1) {
    formation.cb1 = getBest('LB') || getBest('RB');
  }
  if (!formation.cb2) {
    formation.cb2 = getBest('LB') || getBest('RB');
  }
  if (!formation.lw) {
    formation.lw = getBest('RW') || getBest('ST');
  }
  if (!formation.rw) {
    formation.rw = getBest('LW') || getBest('ST');
  }
  if (!formation.st) {
    formation.st = getBest('LW') || getBest('RW');
  }
  if (!formation.cm1) {
    formation.cm1 = getBest('CM');
  }
  if (!formation.cm2) {
    formation.cm2 = getBest('CM');
  }
  if (!formation.cm3) {
    formation.cm3 = getBest('CM');
  }

  // Fill any remaining gaps with best available players
  const remainingPlayers = players
    .filter((p) => !used.has(p.player.name))
    .sort((a, b) => b.player.rating - a.player.rating);

  let remainingIndex = 0;
  const positions: (keyof Formation433)[] = [
    'gk', 'cb1', 'cb2', 'lb', 'rb', 'cm1', 'cm2', 'cm3', 'lw', 'st', 'rw'
  ];

  positions.forEach((pos) => {
    if (!formation[pos] && remainingPlayers[remainingIndex]) {
      formation[pos] = remainingPlayers[remainingIndex];
      remainingIndex++;
    }
  });

  return formation;
}

export function isPlayerAdapted(player: PlayerAssignment, assignedPosition: string): boolean {
  const positionMap: Record<string, string[]> = {
    GK: ['GK'],
    LB: ['LB'],
    RB: ['RB'],
    CB: ['CB'],
    CM: ['CM'],
    LW: ['LW'],
    RW: ['RW'],
    ST: ['ST'],
  };

  return !positionMap[player.player.position]?.includes(assignedPosition);
}

export function getRatingColor(rating: number): string {
  if (rating >= 90) return 'hsl(45 100% 60%)'; // Gold
  if (rating >= 87) return 'hsl(280 80% 65%)'; // Purple
  if (rating >= 85) return 'hsl(340 80% 60%)'; // Pink
  if (rating >= 83) return 'hsl(210 100% 60%)'; // Blue
  return 'hsl(var(--muted-foreground))'; // Gray
}
