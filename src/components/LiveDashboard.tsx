import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Team, AuctionHistoryEntry, POSITIONS_ORDER } from '@/types/auction';
import { calculateAverageRating } from '@/utils/auctionStats';

interface LiveDashboardProps {
  teams: Team[];
  history: AuctionHistoryEntry[];
}

export default function LiveDashboard({ teams, history }: LiveDashboardProps) {
  const getLastPlayerForTeam = (team: Team): AuctionHistoryEntry | null => {
    const teamHistory = history.filter(h => h.team.id === team.id);
    return teamHistory.length > 0 ? teamHistory[teamHistory.length - 1] : null;
  };

  const getPlayersByPosition = (team: Team) => {
    const positions: Record<string, number> = {};
    POSITIONS_ORDER.forEach(pos => {
      positions[pos] = team.players.filter(p => p.player.position === pos).length;
    });
    return positions;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">Times em Tempo Real</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {teams.map(team => {
          const lastPlayer = getLastPlayerForTeam(team);
          const avgRating = calculateAverageRating(team);
          const playersByPosition = getPlayersByPosition(team);

          return (
            <Card
              key={team.id}
              className="p-4 bg-card border-2 transition-all hover:shadow-glow"
              style={{ borderColor: team.color }}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg" style={{ color: team.color }}>
                    {team.name}
                  </h4>
                  <Badge variant="outline" className="text-sm">
                    {team.players.length} jogadores
                  </Badge>
                </div>

                {/* Budget & Rating */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Orçamento</p>
                    <p className="font-bold text-lg">${team.budget}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rating Médio</p>
                    <p className="font-bold text-lg">
                      {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                    </p>
                  </div>
                </div>

                {/* Players by Position */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Jogadores por Posição</p>
                  <div className="flex flex-wrap gap-1">
                    {POSITIONS_ORDER.map(pos => (
                      <Badge
                        key={pos}
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        {pos}: {playersByPosition[pos] || 0}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Last Player */}
                {lastPlayer && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Última Aquisição</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {lastPlayer.player.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lastPlayer.player.position} · {lastPlayer.player.rating} OVR
                        </p>
                      </div>
                      <Badge className="ml-2">
                        ${lastPlayer.pricePaid}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
