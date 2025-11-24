import { useState } from 'react';
import TeamSetup from '@/components/TeamSetup';
import AuctionBoard from '@/components/AuctionBoard';
import FinalReport from '@/components/FinalReport';
import AuctionHistory from '@/components/AuctionHistory';
import { parsePlayersCSV } from '@/utils/csvParser';
import { distributeMedianoPlayers } from '@/utils/playerDistribution';
import { saveAuction, loadAuction } from '@/utils/auctionStorage';
import { Team, AuctionState, Player } from '@/types/auction';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shuffle, Save } from 'lucide-react';
import { toast } from 'sonner';

type AppState = 'setup' | 'auction' | 'report';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [teams, setTeams] = useState<Team[]>([]);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [showDistributeButton, setShowDistributeButton] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [auctionName, setAuctionName] = useState('');
  const [currentAuctionId, setCurrentAuctionId] = useState<string | null>(null);
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

  const handleSaveAuction = async () => {
    if (!auctionName.trim()) {
      toast.error('Digite um nome para o leilão');
      return;
    }

    const totalBudget = teams[0]?.initialBudget || 1000;
    const status = appState === 'report' ? 'completed' : 'in_progress';
    
    const result = await saveAuction(auctionName, teams, totalBudget, status);
    
    if (result.success) {
      setCurrentAuctionId(result.auctionId || null);
      toast.success('Leilão salvo com sucesso!');
      setShowSaveDialog(false);
      setAuctionName('');
    } else {
      toast.error('Erro ao salvar leilão');
    }
  };

  const handleLoadAuction = async (auctionId: string) => {
    const result = await loadAuction(auctionId);
    
    if (result.success && result.auction) {
      setTeams(result.auction.teams);
      setCurrentAuctionId(result.auction.id);
      
      // Check if auction is completed
      if (result.auction.status === 'completed') {
        setAppState('report');
      } else {
        setAppState('auction');
      }
      
      toast.success('Leilão carregado com sucesso!');
    } else {
      toast.error('Erro ao carregar leilão');
    }
  };

  const handleReset = () => {
    setAppState('setup');
    setTeams([]);
    setAuctionState(null);
    setShowDistributeButton(false);
  };

  if (appState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <div className="p-4 flex justify-end">
          <AuctionHistory onLoadAuction={handleLoadAuction} />
        </div>
        <TeamSetup onStart={handleStart} />
      </div>
    );
  }

  if (appState === 'auction') {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <AuctionHistory onLoadAuction={handleLoadAuction} />
          <Button
            onClick={() => setShowSaveDialog(true)}
            className="bg-gradient-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Leilão
          </Button>
        </div>
        
        <AuctionBoard
          players={players}
          teams={teams}
          onUpdate={handleAuctionUpdate}
          onFinish={handleFinish}
        />

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Salvar Leilão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="auction-name">Nome do Leilão</Label>
                <Input
                  id="auction-name"
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value)}
                  placeholder="Ex: Leilão FIFA 2024"
                  className="bg-muted border-border"
                />
              </div>
              <Button onClick={handleSaveAuction} className="w-full bg-gradient-primary">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (appState === 'report') {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <AuctionHistory onLoadAuction={handleLoadAuction} />
          <Button
            onClick={() => setShowSaveDialog(true)}
            className="bg-gradient-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Leilão
          </Button>
        </div>

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

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Salvar Leilão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="auction-name-report">Nome do Leilão</Label>
                <Input
                  id="auction-name-report"
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value)}
                  placeholder="Ex: Leilão FIFA 2024"
                  className="bg-muted border-border"
                />
              </div>
              <Button onClick={handleSaveAuction} className="w-full bg-gradient-primary">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return <FinalReport teams={teams} onReset={handleReset} />;

};

export default Index;
