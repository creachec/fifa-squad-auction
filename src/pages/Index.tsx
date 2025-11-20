import { useState } from 'react';
import TeamSetup from '@/components/TeamSetup';
import AuctionBoard from '@/components/AuctionBoard';
import FinalReport from '@/components/FinalReport';
import { parsePlayersCSV } from '@/utils/csvParser';
import { distributeMedianoPlayers } from '@/utils/playerDistribution';
import { Team, AuctionState, Player } from '@/types/auction';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shuffle } from 'lucide-react';
import { toast } from 'sonner';

type AppState = 'setup' | 'auction' | 'report';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [teams, setTeams] = useState<Team[]>([]);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [showDistributeButton, setShowDistributeButton] = useState(false);
  const players = parsePlayersCSV();


  const handleStart = (configuredTeams: Team[]) => {
    setTeams(configuredTeams);
    setAppState('auction');
  };

  const handleAuctionUpdate = (updatedTeams: Team[], state: AuctionState) => {
    setTeams(updatedTeams);
    setAuctionState(state);
  };

  const handleFinish = () => {
    setShowDistributeButton(true);
    setAppState('report');
  };

  const handleDistributePlayers = () => {
    const updatedTeams = distributeMedianoPlayers(teams, players);
    setTeams(updatedTeams);
    setShowDistributeButton(false);
    toast.success('Jogadores medianos distribuídos randomicamente!');
  };

  const handleReset = () => {
    setAppState('setup');
    setTeams([]);
    setAuctionState(null);
    setShowDistributeButton(false);
  };

  if (appState === 'setup') {
    return <TeamSetup onStart={handleStart} />;
  }

  if (appState === 'auction') {
    return (
      <AuctionBoard
        players={players}
        teams={teams}
        onUpdate={handleAuctionUpdate}
        onFinish={handleFinish}
      />
    );
  }

  if (appState === 'report') {
    return (
      <div className="min-h-screen bg-gradient-dark">
        {showDistributeButton && (
          <div className="p-8 flex justify-center">
            <Card className="p-6 bg-card border-border max-w-2xl w-full">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">Sortear Jogadores Medianos</h3>
                <p className="text-muted-foreground">
                  Distribua jogadores medianos (≤82) randomicamente para completar os times com 11 titulares e 7 reservas (total: 18 jogadores). Times que já tenham essa formação completa não participarão do sorteio.
                </p>
                <Button
                  onClick={handleDistributePlayers}
                  className="bg-gradient-secondary"
                  size="lg"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  Sortear Jogadores Medianos
                </Button>
              </div>
            </Card>
          </div>
        )}
        <FinalReport teams={teams} onReset={handleReset} />
      </div>
    );
  }

  return <FinalReport teams={teams} onReset={handleReset} />;

};

export default Index;
