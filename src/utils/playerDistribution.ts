import { Player, Team, MAX_PLAYERS_PER_TEAM } from '@/types/auction';

export function distributeMedianoPlayers(teams: Team[], allPlayers: Player[]): Team[] {
  // Get all mediano players
  const medianoPlayers = allPlayers.filter((p) => p.type === 'Mediano');
  
  // Shuffle the mediano players
  const shuffled = [...medianoPlayers].sort(() => Math.random() - 0.5);
  
  // Teams that need players (less than 30)
  const teamsNeedingPlayers = teams.filter((t) => t.players.length < MAX_PLAYERS_PER_TEAM);
  
  if (teamsNeedingPlayers.length === 0) {
    return teams;
  }

  const updatedTeams = teams.map((team) => {
    if (team.players.length >= MAX_PLAYERS_PER_TEAM) {
      return team;
    }

    const playersNeeded = MAX_PLAYERS_PER_TEAM - team.players.length;
    const assignedPlayers: Player[] = [];

    // Take players from shuffled pool
    for (let i = 0; i < playersNeeded && shuffled.length > 0; i++) {
      const player = shuffled.pop();
      if (player) {
        assignedPlayers.push(player);
      }
    }

    return {
      ...team,
      players: [
        ...team.players,
        ...assignedPlayers.map((p) => ({
          player: p,
          pricePaid: 0,
          isStarter: false,
        })),
      ],
    };
  });

  return updatedTeams;
}
