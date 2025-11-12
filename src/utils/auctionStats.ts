import { Team, AuctionHistoryEntry, Player } from '@/types/auction';

// Calculate total spent by a team
export function calculateTotalSpent(team: Team): number {
  return team.players.reduce((total, p) => total + p.pricePaid, 0);
}

// Calculate average rating of a team's players
export function calculateAverageRating(team: Team): number {
  if (team.players.length === 0) return 0;
  const totalRating = team.players.reduce((total, p) => total + p.player.rating, 0);
  return totalRating / team.players.length;
}

// Find the highest bid in the auction history
export function findHighestBid(
  history: AuctionHistoryEntry[]
): { amount: number; player: Player; team: Team } | null {
  if (history.length === 0) return null;

  const highestBidEntry = history.reduce((max, current) =>
    current.pricePaid > max.pricePaid ? current : max
  );

  return {
    amount: highestBidEntry.pricePaid,
    player: highestBidEntry.player,
    team: highestBidEntry.team,
  };
}

// Rank teams by total spending (descending)
export function rankTeamsBySpending(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => calculateTotalSpent(b) - calculateTotalSpent(a));
}

// Rank teams by average rating (descending)
export function rankTeamsByRating(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => calculateAverageRating(b) - calculateAverageRating(a));
}
