import { useState } from 'react';
import TeamSetup from '@/components/TeamSetup';
import AuctionBoard from '@/components/AuctionBoard';
import FinalReport from '@/components/FinalReport';
import { parsePlayersCSV } from '@/utils/csvParser';
import { Team, AuctionState } from '@/types/auction';

type AppState = 'setup' | 'auction' | 'report';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [teams, setTeams] = useState<Team[]>([]);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
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
    setAppState('report');
  };

  const handleReset = () => {
    setAppState('setup');
    setTeams([]);
    setAuctionState(null);
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

  return <FinalReport teams={teams} onReset={handleReset} />;
};

export default Index;
