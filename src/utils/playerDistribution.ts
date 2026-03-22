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
    let startersCount = team.players.filter((p) => p.isStarter).length;
    let reservesCount = team.players.filter((p) => !p.isStarter).length;

    const assignedPlayers: Array<{ player: Player; isStarter: boolean }> = [];

    // Step 1: Try to fill starters up to exactly 11 based on formation limits
    Object.entries(FORMATION_REQUIREMENTS).forEach(([position, required]) => {
      const currentPosStarters = team.players.filter((p) => p.player.position === position && p.isStarter).length;
      let needed = required - currentPosStarters;

      while (needed > 0 && startersCount < 11) {
        if (playersByPosition[position]?.length > 0) {
          const player = playersByPosition[position].pop()!;
          assignedPlayers.push({ player, isStarter: true });
          startersCount++;
          needed--;
        } else {
          break; // No more medianos available for this position
        }
      }
    });

    // If we STILL don't have 11 starters (ran out of exact position constraints), fill with any available mediano
    if (startersCount < 11) {
      for (const pos in playersByPosition) {
        while (playersByPosition[pos].length > 0 && startersCount < 11) {
          const player = playersByPosition[pos].pop()!;
          assignedPlayers.push({ player, isStarter: true });
          startersCount++;
        }
      }
    }

    // Step 2: Fill reserves up to exactly 7
    const currentReserves = team.players.filter((p) => !p.isStarter).map(p => p.player);

    RESERVE_REQUIREMENTS.forEach((positionRequirement) => {
      if (reservesCount >= 7) return;

      const positions = Array.isArray(positionRequirement) ? positionRequirement : [positionRequirement];
      // Check if team already has a reserve that fits this requirement
      const alreadyHasReserve =
        currentReserves.some((r) => positions.includes(r.position)) ||
        assignedPlayers.some(p => !p.isStarter && positions.includes(p.player.position));

      if (!alreadyHasReserve) {
        for (const position of positions) {
          if (playersByPosition[position]?.length > 0) {
            const player = playersByPosition[position].pop()!;
            assignedPlayers.push({ player, isStarter: false });
            reservesCount++;
            break;
          }
        }
      }
    });

    // If we STILL don't have 7 reserves, fill with any available mediano
    if (reservesCount < 7) {
      for (const pos in playersByPosition) {
        while (playersByPosition[pos].length > 0 && reservesCount < 7) {
          const player = playersByPosition[pos].pop()!;
          assignedPlayers.push({ player, isStarter: false });
          reservesCount++;
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
