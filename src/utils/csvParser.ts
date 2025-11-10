import { Player } from '@/types/auction';
import playersCSV from '@/data/players.csv?raw';

export function parsePlayersCSV(): Player[] {
  const lines = playersCSV.trim().split('\n');
  const players: Player[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [position, name, team, rating, minPrice, type] = line.split(',');
    
    players.push({
      position: position.trim(),
      name: name.trim(),
      team: team.trim(),
      rating: parseInt(rating),
      minPrice: parseInt(minPrice),
      type: type.trim() as 'Elite' | 'Mediano',
    });
  }

  return players;
}
