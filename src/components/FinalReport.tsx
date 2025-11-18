import { Team, MAX_PLAYERS_PER_TEAM } from '@/types/auction';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, DollarSign, TrendingUp, Users, Download, FileText } from 'lucide-react';
import { exportToPDF } from '@/utils/pdfExport';
import TacticalView from '@/components/TacticalView';

interface FinalReportProps {
  teams: Team[];
  onReset: () => void;
}

export default function FinalReport({ teams, onReset }: FinalReportProps) {
  const getTeamStats = (team: Team) => {
    const totalSpent = team.initialBudget - team.budget;
    const avgPrice = team.players.length > 0 ? totalSpent / team.players.length : 0;
    const avgRating =
      team.players.length > 0
        ? team.players.reduce((sum, p) => sum + p.player.rating, 0) / team.players.length
        : 0;
    const top3 = [...team.players]
      .sort((a, b) => b.player.rating - a.player.rating)
      .slice(0, 3);

    return { totalSpent, avgPrice, avgRating, top3 };
  };

  const handleExportPDF = () => {
    exportToPDF(teams);
  };

  const exportReport = () => {
    let report = 'FIFA 26 Auction - Final Report\n\n';
    
    teams.forEach((team) => {
      const stats = getTeamStats(team);
      report += `${team.name}\n`;
      report += `Orçamento Inicial: $${team.initialBudget}\n`;
      report += `Orçamento Restante: $${team.budget}\n`;
      report += `Total Gasto: $${stats.totalSpent}\n`;
      report += `Preço Médio: $${stats.avgPrice.toFixed(2)}\n`;
      report += `Rating Médio: ${stats.avgRating.toFixed(1)}\n`;
      report += `Total de Jogadores: ${team.players.length}\n\n`;
      report += 'Jogadores:\n';
      team.players.forEach((p) => {
        report += `- ${p.player.name} (${p.player.position}, ${p.player.rating} OVR) - $${p.pricePaid}\n`;
      });
      report += '\n---\n\n';
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fifa26-auction-report.txt';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Relatório Final
          </h1>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleExportPDF} className="bg-gradient-primary">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button onClick={exportReport} variant="outline" className="border-primary text-primary">
              <FileText className="h-4 w-4 mr-2" />
              Exportar TXT
            </Button>
            <Button onClick={onReset} className="bg-gradient-secondary">
              Novo Leilão
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((team) => {
            const stats = getTeamStats(team);
            const starters = team.players.filter((p) => p.isStarter);
            const subs = team.players.filter((p) => !p.isStarter);
            const isComplete = team.players.length >= MAX_PLAYERS_PER_TEAM;

            return (
              <Card
                key={team.id}
                className="p-6 bg-card border-border shadow-card"
                style={{ borderColor: team.color }}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold" style={{ color: team.color }}>
                        {team.name}
                      </h2>
                      {isComplete && (
                        <Badge className="mt-1 bg-gradient-secondary text-secondary-foreground">
                          Time Completo
                        </Badge>
                      )}
                    </div>
                    <Trophy className="h-6 w-6" style={{ color: team.color }} />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <DollarSign className="h-4 w-4" />
                        <span>Gasto Total</span>
                      </div>
                      <p className="text-xl font-bold text-primary">${stats.totalSpent}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <TrendingUp className="h-4 w-4" />
                        <span>Média Preço</span>
                      </div>
                      <p className="text-xl font-bold text-secondary">
                        ${stats.avgPrice.toFixed(0)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Trophy className="h-4 w-4" />
                        <span>Rating Médio</span>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {stats.avgRating.toFixed(1)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Users className="h-4 w-4" />
                        <span>Jogadores</span>
                      </div>
                      <p className="text-xl font-bold text-secondary">{team.players.length}</p>
                    </div>
                  </div>

                  {/* Top 3 Players */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">Top 3 Jogadores</h3>
                    <div className="space-y-2">
                      {stats.top3.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-primary">
                              {p.player.position}
                            </Badge>
                            <span className="text-sm">{p.player.name}</span>
                          </div>
                          <Badge className="bg-gradient-primary text-primary-foreground">
                            {p.player.rating}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Players Tabs */}
                  <Tabs defaultValue="tactical" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted">
                      <TabsTrigger value="tactical">Tática</TabsTrigger>
                      <TabsTrigger value="starters">Titulares ({starters.length})</TabsTrigger>
                      <TabsTrigger value="subs">Reservas ({subs.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tactical" className="mt-4">
                      <TacticalView team={team} />
                    </TabsContent>
                    <TabsContent value="starters" className="space-y-2 max-h-64 overflow-y-auto">
                      {starters.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-muted text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {p.player.position}
                            </Badge>
                            <span>{p.player.name}</span>
                            <span className="text-muted-foreground text-xs">({p.player.team})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-primary">{p.player.rating}</span>
                            <span className="text-muted-foreground">${p.pricePaid}</span>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="subs" className="space-y-2 max-h-64 overflow-y-auto">
                      {subs.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded bg-muted text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {p.player.position}
                            </Badge>
                            <span>{p.player.name}</span>
                            <span className="text-muted-foreground text-xs">({p.player.team})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-primary">{p.player.rating}</span>
                            <span className="text-secondary">{p.pricePaid === 0 ? 'GRÁTIS' : `$${p.pricePaid}`}</span>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
