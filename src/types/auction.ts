export interface Player {
  position: string;
  name: string;
  team: string;
  rating: number;
  minPrice: number;
  type: 'Elite' | 'Mediano';
  eaId?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  budget: number;
  initialBudget: number;
  players: PlayerAssignment[];
}

export interface PlayerAssignment {
  player: Player;
  pricePaid: number;
  isStarter: boolean;
}

export interface AuctionState {
  currentPositionIndex: number;
  currentPlayerIndex: number;
  history: AuctionHistoryEntry[];
}

export interface AuctionHistoryEntry {
  player: Player;
  team: Team;
  pricePaid: number;
  timestamp: number;
}

export const POSITIONS_ORDER = ['ST', 'LW', 'RW', 'CM', 'LB', 'RB', 'CB', 'GK'];

export const FORMATION_REQUIREMENTS = {
  GK: 1,
  CB: 2,
  LB: 1,
  RB: 1,
  CM: 4,
  ST: 2,
};

export const MIN_SUBSTITUTES = 7;

export const MAX_PLAYERS_PER_TEAM = 18;

