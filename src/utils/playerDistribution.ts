import { Player, Team, MAX_PLAYERS_PER_TEAM, FORMATION_REQUIREMENTS } from '@/types/auction';

// Reserve positions required: 1 GK, 1 CB, 1 LB, 1 RB, 1 CM, 1 winger (LW or RW), 1 ST
const RESERVE_REQUIREMENTS = [
  'GK',
  'CB',
  'LB',
  'RB',
  'CM',
  ['LW', 'RW'], // Can be either LW or RW
  'ST',
];

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

    const assignedPlayers: Array<{ player: Player; isStarter: boolean }> = [];

    // Step 1: Complete missing starters based on FORMATION_REQUIREMENTS
    Object.entries(FORMATION_REQUIREMENTS).forEach(([position, required]) => {
      const currentCount = starters.filter((p) => p.player.position === position).length;
      const needed = required - currentCount;
      
      for (let i = 0; i < needed; i++) {
        if (playersByPosition[position]?.length > 0) {
          const player = playersByPosition[position].pop();
          if (player) {
            assignedPlayers.push({ player, isStarter: true });
          }
        }
      }
    });

    // Step 2: Add reserves following RESERVE_REQUIREMENTS (1 per position type)
    // Track which reserve positions we already have
    const currentReserves = reserves.map(r => r.player);

    RESERVE_REQUIREMENTS.forEach((positionRequirement) => {
      // Check if this reserve position type is already filled
      const positions = Array.isArray(positionRequirement) ? positionRequirement : [positionRequirement];
      
      const alreadyHasReserve = currentReserves.some((r) =>
        positions.includes(r.position)
      );

      if (!alreadyHasReserve) {
        // Try to find a player for this position
        for (const position of positions) {
          if (playersByPosition[position]?.length > 0) {
            const player = playersByPosition[position].pop();
            if (player) {
              assignedPlayers.push({ player, isStarter: false });
              currentReserves.push(player);
              break; // Found a player for this requirement, move to next
            }
          }
        }
      }
    });

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
