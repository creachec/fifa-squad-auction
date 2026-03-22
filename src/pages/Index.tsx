import { useState } from 'react';
import TeamSetup from '@/components/TeamSetup';
import AuctionBoard from '@/components/AuctionBoard';
import FinalReport from '@/components/FinalReport';
import PlayerDatabase from '@/components/PlayerDatabase';
import MainLayout from '@/components/MainLayout';
import { parsePlayersCSV } from '@/utils/csvParser';
import { distributeMedianoPlayers } from '@/utils/playerDistribution';
import { saveAuction, loadAuction } from '@/utils/auctionStorage';
import { Team, AuctionState, Player } from '@/types/auction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

type AppState = 'setup' | 'auction' | 'distributing' | 'report' | 'database';

const Index = () => {
  const { t } = useLanguage();
  const [appState, setAppState] = useState<AppState>('setup');
  const [teams, setTeams] = useState<Team[]>([]);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [auctionName, setAuctionName] = useState('');
  const [currentAuctionId, setCurrentAuctionId] = useState<string | null>(null);
  const [customPlayers, setCustomPlayers] = useState<Player[]>([]);
  const [playerOverrides, setPlayerOverrides] = useState<Record<string, Partial<Player>>>({});
  const [deletedPlayers, setDeletedPlayers] = useState<string[]>([]);

  const basePlayers = parsePlayersCSV();
  const players = [...basePlayers, ...customPlayers]
    .filter(p => !deletedPlayers.includes(p.eaId || p.name))
    .map(p => ({
      ...p,
      ...playerOverrides[p.eaId || p.name]
    }));

  const handleDeletePlayer = (originalId: string) => {
    setDeletedPlayers(prev => [...prev, originalId]);
    toast.success('Jogador excluído!');
  };

  const handleUpdatePlayer = (originalId: string, player: Player) => {
    setPlayerOverrides(prev => ({
      ...prev,
      [originalId]: {
        rating: player.rating,
        name: player.name,
        position: player.position,
        eaId: player.eaId,
        avatarUrl: player.avatarUrl
      }
    }));
    toast.success(`${player.name} atualizado com sucesso!`);
  };

  const handleQuickListPlayer = (player: Player) => {
    setCustomPlayers(prev => [...prev, player]);
    toast.success(`${player.name} ${t('toast.added')}`);
  };

  const handleStart = (configuredTeams: Team[]) => {
    setTeams(configuredTeams);
    setAppState('auction');
  };

  const handleAuctionUpdate = (updatedTeams: Team[], state: AuctionState) => {
    setTeams(updatedTeams);
    setAuctionState(state);
  };

  const handleFinish = () => {
    setAppState('distributing');
    setTimeout(() => {
      const updatedTeams = distributeMedianoPlayers(teams, players);
      setTeams(updatedTeams);
      setAppState('report');
      toast.success(t('toast.drawFinish'));
    }, 4000);
  };

  const doSave = async (reqName: string) => {
    const totalBudget = teams[0]?.initialBudget || 1000;
    const status = appState === 'report' ? 'completed' : 'in_progress';
    return await saveAuction(reqName, teams, totalBudget, status);
  };

  const handleSaveAuction = async () => {
    if (!auctionName.trim()) {
      toast.error('Informe um nome para o leilão.');
      return;
    }
    const result = await doSave(auctionName);
    if (result.success) {
      setCurrentAuctionId(result.auctionId || null);
      toast.success(t('toast.saved'));
      setShowSaveDialog(false);
      setAuctionName('');
    } else {
      toast.error(t('toast.errSave'));
    }
  };

  const handleLoadAuction = async (auctionId: string) => {
    const result = await loadAuction(auctionId);
    if (result.success && result.auction) {
      setTeams(result.auction.teams);
      setCurrentAuctionId(result.auction.id);
      if (result.auction.status === 'completed') {
        setAppState('report');
      } else {
        setAppState('auction');
      }
      toast.success(t('toast.loaded'));
    } else {
      toast.error(t('toast.errLoad'));
    }
  };

  const handleReset = () => {
    setAppState('setup');
    setTeams([]);
    setAuctionState(null);
  };

  const handleHomeClick = async () => {
    if (appState === 'auction' || appState === 'report') {
      const confirmed = window.confirm('Leilão não finalizado, quer realmente sair da pagina?');
      if (confirmed) {
        const autoName = auctionName.trim() || `Auto-Save ${new Date().toLocaleDateString()}`;
        await doSave(autoName);
        toast.info('Progresso salvo automaticamente na nuvem antes de sair.');
        handleReset();
      }
    } else {
      handleReset();
    }
  };

  if (appState === 'setup') {
    return (
      <MainLayout
        activeTab="setup"
        onLoadAuction={handleLoadAuction}
        onQuickListPlayer={handleQuickListPlayer}
        onTabChange={(tab) => setAppState(tab === 'database' ? 'database' : 'setup')}
        onHomeClick={handleHomeClick}
      >
        <TeamSetup onStart={handleStart} />
      </MainLayout>
    );
  }

  if (appState === 'database') {
    return (
      <MainLayout
        activeTab="database"
        onLoadAuction={handleLoadAuction}
        onQuickListPlayer={handleQuickListPlayer}
        onTabChange={(tab) => setAppState(tab === 'database' ? 'database' : 'setup')}
        onHomeClick={handleHomeClick}
      >
        <PlayerDatabase
          players={players}
          onUpdatePlayer={handleUpdatePlayer}
          onDeletePlayer={handleDeletePlayer}
          onAddNewRequest={() => { /* triggers quick list or ignores */ }}
        />
      </MainLayout>
    );
  }

  if (appState === 'auction') {
    return (
      <MainLayout
        activeTab="auction"
        onLoadAuction={handleLoadAuction}
        onQuickListPlayer={handleQuickListPlayer}
        onTabChange={(tab) => setAppState(tab === 'database' ? 'database' : 'auction')}
        onHomeClick={handleHomeClick}
      >
        <div className="fixed top-24 right-4 z-50 flex gap-2">
          <Button onClick={() => setShowSaveDialog(true)} className="bg-surface-container-highest border border-primary/20 hover:bg-primary/20 text-primary">
            <Save className="h-4 w-4 mr-2" />
            {t('index.saveBtn')}
          </Button>
        </div>

        <AuctionBoard
          players={players}
          teams={teams}
          onUpdate={handleAuctionUpdate}
          onFinish={handleFinish}
        />

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="bg-surface-container-highest border border-outline-variant/20 text-on-surface">
            <DialogHeader>
              <DialogTitle className="font-headline tracking-tighter uppercase italic">{t('index.saveAuction')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="auction-name" className="font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{t('index.nameLabel')}</Label>
                <Input
                  id="auction-name"
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value)}
                  placeholder={t('index.namePlace')}
                  className="bg-background border-outline-variant/20 mt-2"
                />
              </div>
              <Button onClick={handleSaveAuction} className="w-full bg-gradient-primary text-primary-foreground font-bold font-headline uppercase tracking-widest">
                {t('index.saveBtn')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </MainLayout>
    );
  }

  if (appState === 'distributing') {
    return (
      <MainLayout
        activeTab="auction"
        onLoadAuction={handleLoadAuction}
        onQuickListPlayer={handleQuickListPlayer}
        onHomeClick={handleHomeClick}
      >
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in duration-1000">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-surface-variant rounded-full border-t-primary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary animate-pulse">model_training</span>
            </div>
          </div>
          <h2 className="text-4xl font-headline font-black italic uppercase tracking-tighter text-on-surface text-center">
            {t('index.drawTitle')}
          </h2>
          <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest max-w-sm text-center">
            {t('index.drawSub')}
          </p>
        </div>
      </MainLayout>
    );
  }

  if (appState === 'report') {
    return (
      <MainLayout
        activeTab="results"
        onLoadAuction={handleLoadAuction}
        onQuickListPlayer={handleQuickListPlayer}
        onHomeClick={handleHomeClick}
      >
        <div className="fixed top-24 right-4 z-50 flex gap-2">
          <Button onClick={() => setShowSaveDialog(true)} className="bg-surface-container-highest border border-primary/20 hover:bg-primary/20 text-primary">
            <Save className="h-4 w-4 mr-2" />
            {t('index.saveBtn')}
          </Button>
        </div>

        <FinalReport teams={teams} onReset={handleReset} />

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="bg-surface-container-highest border border-outline-variant/20 text-on-surface">
            <DialogHeader>
              <DialogTitle className="font-headline tracking-tighter uppercase italic">{t('index.saveAuction')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="auction-name-report" className="font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{t('index.nameLabel')}</Label>
                <Input
                  id="auction-name-report"
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value)}
                  placeholder={t('index.namePlace')}
                  className="bg-background border-outline-variant/20 mt-2"
                />
              </div>
              <Button onClick={handleSaveAuction} className="w-full bg-gradient-primary text-primary-foreground font-bold font-headline uppercase tracking-widest">
                {t('index.saveBtn')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </MainLayout>
    );
  }

  return <FinalReport teams={teams} onReset={handleReset} />;
};

export default Index;
