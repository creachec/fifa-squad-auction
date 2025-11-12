import { Team, AuctionHistoryEntry, Player } from '@/types/auction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  calculateTotalSpent,
  calculateAverageRating,
  findHighestBid,
  rankTeamsBySpending,
  rankTeamsByRating,
} from '@/utils/auctionStats';
import { Trophy, DollarSign, BarChart, Users, Percent } from 'lucide-react';

interface AuctionStatsProps {
  teams: Team[];
  history: AuctionHistoryEntry[];
  totalPlayers: number;
  currentPlayerCount: number;
}

export default function AuctionStats({
  teams,
  history,
  totalPlayers,
  currentPlayerCount,
}: AuctionStatsProps) {
  const teamsSortedBySpending = rankTeamsBySpending([...teams]);
  const teamsSortedByRating = rankTeamsByRating([...teams]);
  const highestBid = findHighestBid(history);
  const auctionProgress = (currentPlayerCount / totalPlayers) * 100;

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Estatísticas do Leilão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Progresso do Leilão</span>
              <span className="text-sm font-bold">{Math.round(auctionProgress)}%</span>
            </div>
            <Progress value={auctionProgress} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1">
              {currentPlayerCount} de {totalPlayers} jogadores leiloados
            </p>
          </div>

          <Tabs defaultValue="spending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="spending">
                <DollarSign className="h-4 w-4 mr-1" /> Gastos
              </TabsTrigger>
              <TabsTrigger value="roster">
                <Users className="h-4 w-4 mr-1" /> Elenco
              </TabsTrigger>
              <TabsTrigger value="records">
                <Trophy className="h-4 w-4 mr-1" /> Recordes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spending" className="mt-4 space-y-3">
              <h4 className="font-semibold">Ranking de Gastos</h4>
              {teamsSortedBySpending.map((team, index) => (
                <div key={team.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <span>{index + 1}. {team.name}</span>
                  </div>
                  <span className="font-mono">${calculateTotalSpent(team)}</span>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="roster" className="mt-4 space-y-3">
              <h4 className="font-semibold">Ranking de Rating Médio</h4>
              {teamsSortedByRating.map((team, index) => (
                 <div key={team.id} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <span
                       className="w-4 h-4 rounded-full"
                       style={{ backgroundColor: team.color }}
                     />
                     <span>{index + 1}. {team.name} ({team.players.length} jogadores)</span>
                   </div>
                   <Badge variant="secondary">{calculateAverageRating(team).toFixed(2)}</Badge>
                 </div>
               ))}
            </TabsContent>

            <TabsContent value="records" className="mt-4 space-y-2">
               <h4 className="font-semibold">Maiores Feitos</h4>
               {highestBid ? (
                 <div className="p-3 rounded-md bg-muted/50 border border-border">
                   <p className="font-bold text-primary">Maior Lance</p>
                   <p className="text-sm">
                     <span className="font-mono">${highestBid.amount}</span> por{' '}
                     <strong>{highestBid.player.name}</strong> ({highestBid.player.rating})
                   </p>
                   <p className="text-xs text-muted-foreground">
                     Arrematado por: {highestBid.team.name}
                   </p>
                 </div>
               ) : (
                 <p className="text-sm text-muted-foreground">Nenhum lance recorde ainda.</p>
               )}
             </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
