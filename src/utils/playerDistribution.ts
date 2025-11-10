import { Player, Team, MAX_PLAYERS_PER_TEAM, FORMATION_REQUIREMENTS } from '@/types/auction';

export function distributeMedianoPlayers(teams: Team[], allPlayers: Player[]): Team[] {
  // Get all mediano players grouped by position
  const medianoPlayers = allPlayers.filter((p) => p.type === 'Mediano');
  const playersByPosition: Record<string, Player[]> = {};
  
  medianoPlayers.forEach((player) => {
    if (!playersByPosition[player.position]) {
      playersByPosition[player.position] = [];
    }
    playersByPosition[player.position].push(player);
  });

  // Shuffle each position array
  Object.keys(playersByPosition).forEach((pos) => {
    playersByPosition[pos].sort(() => Math.random() - 0.5);
  });

  const updatedTeams = teams.map((team) => {
    const starters = team.players.filter((p) => p.isStarter);
    const reserves = team.players.filter((p) => !p.isStarter);
    
    // Check if team already has 11 starters and 7 reserves
    if (starters.length >= 11 && reserves.length >= 7) {
      return team;
    }

    const assignedPlayers: Array<{ player: Player; isStarter: boolean }> = [];
    const positionsNeeded: string[] = [];

    // First, check what starter positions are missing
    Object.entries(FORMATION_REQUIREMENTS).forEach(([position, required]) => {
      const currentCount = starters.filter((p) => p.player.position === position).length;
      const needed = required - currentCount;
      for (let i = 0; i < needed; i++) {
        positionsNeeded.push(position);
      }
    });

    // Add missing starters
    positionsNeeded.forEach((position) => {
      if (playersByPosition[position]?.length > 0) {
        const player = playersByPosition[position].pop();
        if (player) {
          assignedPlayers.push({ player, isStarter: true });
        }
      }
    });

    // Now add reserves (one per position, 7 total)
    const reservesNeeded = 7 - reserves.length;
    const availablePositions = Object.keys(playersByPosition).filter(
      (pos) => playersByPosition[pos].length > 0
    );
    
    for (let i = 0; i < reservesNeeded && availablePositions.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const position = availablePositions[randomIndex];
      
      if (playersByPosition[position]?.length > 0) {
        const player = playersByPosition[position].pop();
        if (player) {
          assignedPlayers.push({ player, isStarter: false });
        }
        
        // Remove position if no more players available
        if (playersByPosition[position].length === 0) {
          availablePositions.splice(randomIndex, 1);
        }
      }
    }

    return {
      ...team,
      players: [
        ...team.players,
        ...assignedPlayers.map((p) => ({
          player: p.player,
          pricePaid: 0,
          isStarter: p.isStarter,
        })),
      ],
    };
  });

  return updatedTeams;
}
