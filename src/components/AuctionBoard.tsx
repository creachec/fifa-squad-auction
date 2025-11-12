import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Player, Team, AuctionState, POSITIONS_ORDER } from '@/types/auction';
import { ChevronRight, SkipForward, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import AuctionStats from '@/components/AuctionStats';

interface AuctionBoardProps {
  players: Player[];
  teams: Team[];
  onUpdate: (teams: Team[], auctionState: AuctionState) => void;
  onFinish: () => void;
}

export default function AuctionBoard({ players, teams, onUpdate, onFinish }: AuctionBoardProps) {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [auctionHistory, setAuctionHistory] = useState<any[]>([]);
  const [localTeams, setLocalTeams] = useState(teams);
  const [bidAmounts, setBidAmounts] = useState<Record<string, number>>({});


  const currentPosition = POSITIONS_ORDER[currentPositionIndex];
  const positionPlayers = players.filter(
    (p) => p.position === currentPosition && p.type === 'Elite'
  );
  const currentPlayer = positionPlayers[currentPlayerIndex];

  const assignPlayer = (teamId: string) => {
    const team = localTeams.find((t) => t.id === teamId);
    if (!team || !currentPlayer) return;

    // Use custom bid amount if provided, otherwise use minimum price
    const bidAmount = bidAmounts[teamId] ?? currentPlayer.minPrice;
    
    // Validate bid amount
    if (bidAmount < currentPlayer.minPrice) {
      toast.error(`Lance mínimo é $${currentPlayer.minPrice}!`);
      return;
    }

    if (team.budget < bidAmount && bidAmount > 0) {
      toast.error(`${team.name} não tem orçamento suficiente!`);
      return;
    }

    const newTeams = localTeams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          budget: t.budget - bidAmount,
          players: [...t.players, { player: currentPlayer, pricePaid: bidAmount, isStarter: true }],
        };
      }
      return t;
    });

    const historyEntry = {
      player: currentPlayer,
      team,
      pricePaid: bidAmount,
      timestamp: Date.now(),
    };

    setLocalTeams(newTeams);
    setAuctionHistory([...auctionHistory, historyEntry]);
    setBidAmounts({}); // Reset bid amounts
    toast.success(`${currentPlayer.name} → ${team.name} por ${bidAmount > 0 ? `$${bidAmount}` : 'GRÁTIS'}`);
    
    nextPlayer();
  };


  const nextPlayer = () => {
    if (currentPlayerIndex < positionPlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      nextPosition();
    }
  };

  const nextPosition = () => {
    if (currentPositionIndex < POSITIONS_ORDER.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
      setCurrentPlayerIndex(0);
      toast.info(`Mudando para posição: ${POSITIONS_ORDER[currentPositionIndex + 1]}`);
    } else {
      // Auction finished
      handleFinish();
    }
  };

  const handleFinish = () => {
    // Distribute free players (≤82) to teams with 0 budget
    const freePlayers = players.filter((p) => p.type === 'Mediano');
    const updatedTeams = localTeams.map((team) => {
      if (team.budget <= 0) {
        return {
          ...team,
          players: [
            ...team.players,
            ...freePlayers.map((p) => ({ player: p, pricePaid: 0, isStarter: false })),
          ],
        };
      }
      return team;
    });

    onUpdate(updatedTeams, {
      currentPositionIndex,
      currentPlayerIndex,
      history: auctionHistory,
    });
    onFinish();
  };

  const undo = () => {
    if (auctionHistory.length === 0) return;

    const lastEntry = auctionHistory[auctionHistory.length - 1];
    const newTeams = localTeams.map((t) => {
      if (t.id === lastEntry.team.id) {
        return {
          ...t,
          budget: t.budget + lastEntry.pricePaid,
          players: t.players.slice(0, -1),
        };
      }
      return t;
    });

    setLocalTeams(newTeams);
    setAuctionHistory(auctionHistory.slice(0, -1));
    
    // Go back one player
    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    } else if (currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1);
      const prevPosition = POSITIONS_ORDER[currentPositionIndex - 1];
      const prevPositionPlayers = players.filter(
        (p) => p.position === prevPosition && p.type === 'Elite'
      );
      setCurrentPlayerIndex(prevPositionPlayers.length - 1);
    }
    
    toast.info('Última ação desfeita');
  };

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-8">
        <Card className="p-8 text-center space-y-4 bg-card border-border">
          <h2 className="text-2xl font-bold">Leilão Finalizado!</h2>
          <Button onClick={handleFinish} className="bg-gradient-primary">
            Ver Resultados
          </Button>
        </Card>
      </div>
    );
  }

  const elitePlayers = players.filter((p) => p.type === 'Elite');

  const auctionedPlayersCount =
    POSITIONS_ORDER.slice(0, currentPositionIndex).reduce(
      (count, position) =>
        count +
        players.filter((p) => p.position === position && p.type === 'Elite')
          .length,
      0
    ) + currentPlayerIndex;

  return (
    <div className="min-h-screen bg-gradient-dark p-8">
      <div className="grid lg:grid-cols-4 gap-8 max-w-screen-2xl mx-auto">
        {/* Stats Sidebar */}
        <div className="lg:col-span-1">
          <AuctionStats
            teams={localTeams}
            history={auctionHistory}
            totalPlayers={elitePlayers.length}
            currentPlayerCount={auctionedPlayersCount}
          />
        </div>

        {/* Main Auction Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Position Progress */}
          <div className="flex gap-2 justify-center flex-wrap">
            {POSITIONS_ORDER.map((pos, idx) => (
              <Badge
              key={pos}
              variant={idx === currentPositionIndex ? 'default' : 'outline'}
              className={
                idx === currentPositionIndex
                  ? 'bg-gradient-primary text-primary-foreground'
                  : 'border-border'
              }
            >
              {pos}
            </Badge>
          ))}
        </div>

        {/* Current Player Card */}
        <Card className="p-8 bg-card border-border shadow-card">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Badge className="bg-gradient-secondary text-secondary-foreground">
                {currentPlayer.position}
              </Badge>
              <h2 className="text-4xl font-bold">{currentPlayer.name}</h2>
              <p className="text-muted-foreground text-lg">{currentPlayer.team}</p>
            </div>
            
            <div className="flex gap-8 justify-center items-center">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Overall</p>
                <p className="text-3xl font-bold text-primary">{currentPlayer.rating}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Preço Mínimo</p>
                <p className="text-3xl font-bold text-secondary">
                  ${currentPlayer.minPrice}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {localTeams.map((team) => {
            const bidAmount = bidAmounts[team.id] ?? currentPlayer.minPrice;
            const canAfford = team.budget >= bidAmount;
            
            return (
              <Card
                key={team.id}
                className="p-6 bg-card border-border hover:shadow-glow transition-shadow"
                style={{ borderColor: team.color }}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: team.color }}>
                      {team.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Orçamento: ${team.budget}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Jogadores: {team.players.length}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Valor do Lance (Min: ${currentPlayer.minPrice})
                    </Label>
                    <Input
                      type="number"
                      min={currentPlayer.minPrice}
                      value={bidAmount}
                      onChange={(e) =>
                        setBidAmounts({
                          ...bidAmounts,
                          [team.id]: parseInt(e.target.value) || currentPlayer.minPrice,
                        })
                      }
                      className="bg-muted border-border"
                      placeholder={currentPlayer.minPrice.toString()}
                    />
                  </div>

                  <Button
                    onClick={() => assignPlayer(team.id)}
                    disabled={!canAfford || bidAmount < currentPlayer.minPrice}
                    className="w-full"
                    style={{
                      backgroundColor: canAfford ? team.color : undefined,
                      color: canAfford ? '#0A0F1C' : undefined,
                    }}
                  >
                    {canAfford ? `Lance: $${bidAmount}` : 'Sem Orçamento'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={undo}
            disabled={auctionHistory.length === 0}
            variant="outline"
            className="border-border"
          >
            <Undo2 className="h-4 w-4 mr-2" />
            Desfazer
          </Button>
          <Button onClick={nextPlayer} variant="outline" className="border-primary text-primary">
            <ChevronRight className="h-4 w-4 mr-2" />
            Próximo Jogador
          </Button>
          <Button onClick={nextPosition} className="bg-gradient-secondary">
            <SkipForward className="h-4 w-4 mr-2" />
            Próxima Posição
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
