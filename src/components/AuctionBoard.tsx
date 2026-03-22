import { useState, useEffect } from 'react';
import { Player, Team, AuctionState, POSITIONS_ORDER } from '@/types/auction';
import { ChevronRight, Undo2, History } from 'lucide-react';
import { toast } from 'sonner';
import { getPlayerPhotoUrl, getPlaceholderAvatar } from '@/utils/playerPhotos';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuctionBoardProps {
  players: Player[];
  teams: Team[];
  onUpdate: (teams: Team[], auctionState: AuctionState) => void;
  onFinish: () => void;
}

export default function AuctionBoard({
  players,
  teams,
  onUpdate,
  onFinish
}: AuctionBoardProps) {
  const { t } = useLanguage();
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [auctionHistory, setAuctionHistory] = useState<any[]>([]);
  const [localTeams, setLocalTeams] = useState(teams);
  const [customBid, setCustomBid] = useState<number | ''>('');
  const [celebrating, setCelebrating] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  const currentPosition = POSITIONS_ORDER[currentPositionIndex];
  const positionPlayers = players
    .filter(p => p.position === currentPosition && p.type === 'Elite')
    .sort((a, b) => b.rating - a.rating); // Sort Descending By OVR
  const currentPlayer = positionPlayers[currentPlayerIndex];

  useEffect(() => {
    if (currentPlayer) setCustomBid(currentPlayer.minPrice);
  }, [currentPlayer]);

  // HOTKEYS
  useHotkeys('ArrowUp', () => setCustomBid(c => (Number(c) || currentPlayer?.minPrice || 0) + 10));
  useHotkeys('ArrowDown', () => setCustomBid(c => Math.max(currentPlayer?.minPrice || 0, (Number(c) || currentPlayer?.minPrice || 0) - 10)));
  useHotkeys('ArrowRight', () => nextPlayer());
  useHotkeys('Escape', () => undo());

  const skipToNextPosition = () => {
    if (currentPositionIndex < POSITIONS_ORDER.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
      setCurrentPlayerIndex(0);
    } else {
      handleFinish();
    }
  };

  const playSoldSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Sof start
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4); // Natural decay

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      };

      // Play a success "Ding-Ding"
      playTone(523.25, audioCtx.currentTime); // C5
      playTone(659.25, audioCtx.currentTime + 0.1); // E5
    } catch (e) { /* ignore */ }
  };

  const assignPlayer = (teamId: string) => {
    const team = localTeams.find(t => t.id === teamId);
    if (!team || !currentPlayer) return;

    const bidAmount = customBid || currentPlayer.minPrice;

    if (bidAmount < currentPlayer.minPrice) {
      toast.error(`Lance mínimo é $${currentPlayer.minPrice.toLocaleString()}!`);
      return;
    }
    if (team.budget < bidAmount && bidAmount > 0) {
      toast.error(`${team.name} não tem orçamento suficiente!`);
      return;
    }

    const newTeams = localTeams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          budget: t.budget - bidAmount,
          players: [...t.players, {
            player: currentPlayer,
            pricePaid: bidAmount,
            isStarter: true
          }]
        };
      }
      return t;
    });

    const historyEntry = {
      player: currentPlayer,
      team,
      pricePaid: bidAmount,
      timestamp: Date.now()
    };
    const newHistory = [...auctionHistory, historyEntry];

    setLocalTeams(newTeams);
    setAuctionHistory(newHistory);
    setCustomBid('');

    onUpdate(newTeams, {
      currentPositionIndex,
      currentPlayerIndex,
      history: newHistory
    });

    setCelebrating(true);
    setTimeout(() => setCelebrating(false), 1000);

    playSoldSound();
    toast.success(`${currentPlayer.name} → ${team.name} por ${bidAmount > 0 ? `$${bidAmount.toLocaleString()}` : 'GRÁTIS'}`);

    setTimeout(() => nextPlayer(), 600);
  };

  const nextPlayer = () => {
    if (currentPlayerIndex < positionPlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setPlayerKey(prev => prev + 1);
    } else {
      nextPosition();
    }
  };

  const nextPosition = () => {
    if (currentPositionIndex < POSITIONS_ORDER.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
      setCurrentPlayerIndex(0);
      setPlayerKey(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    const freePlayers = players.filter(p => p.type === 'Mediano');
    const updatedTeams = localTeams.map(team => {
      if (team.budget <= 0) {
        return {
          ...team,
          players: [...team.players, ...freePlayers.map(p => ({
            player: p,
            pricePaid: 0,
            isStarter: false
          }))]
        };
      }
      return team;
    });
    onUpdate(updatedTeams, {
      currentPositionIndex,
      currentPlayerIndex,
      history: auctionHistory
    });
    onFinish();
  };

  const undo = () => {
    if (auctionHistory.length === 0) return;
    const lastEntry = auctionHistory[auctionHistory.length - 1];
    const newTeams = localTeams.map(t => {
      if (t.id === lastEntry.team.id) {
        return {
          ...t,
          budget: t.budget + lastEntry.pricePaid,
          players: t.players.slice(0, -1)
        };
      }
      return t;
    });
    setLocalTeams(newTeams);
    setAuctionHistory(auctionHistory.slice(0, -1));

    if (currentPlayerIndex > 0) {
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    } else if (currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1);
      const prevPosition = POSITIONS_ORDER[currentPositionIndex - 1];
      const prevPositionPlayers = players
        .filter(p => p.position === prevPosition && p.type === 'Elite')
        .sort((a, b) => b.rating - a.rating);
      setCurrentPlayerIndex(prevPositionPlayers.length - 1);
    }
  };

  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center p-8 h-[60vh]">
        <div className="p-8 text-center space-y-4 bg-surface-container-highest border border-outline-variant/20 rounded-xl shadow-lg">
          <h2 className="text-3xl font-black font-headline uppercase italic tracking-tighter">{t('auction.finished')}</h2>
          <button onClick={handleFinish} className="px-8 py-4 mt-4 text-on-primary bg-gradient-primary font-bold font-headline rounded hover:scale-[1.02] transition-transform uppercase tracking-widest">
            {t('auction.seeResults')}
          </button>
        </div>
      </div>
    );
  }

  const elitePlayers = players.filter(p => p.type === 'Elite');
  const auctionedPlayersCount = POSITIONS_ORDER.slice(0, currentPositionIndex).reduce((count, position) => count + players.filter(p => p.position === position && p.type === 'Elite').length, 0) + currentPlayerIndex;

  const currentBidAmount = customBid || currentPlayer.minPrice;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 py-8 relative z-10 w-full">
      {/* Auction Status Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span className="text-error font-headline font-bold tracking-widest text-xs uppercase">{t('auction.highStakes')}</span>
          </div>
          <h2 className="text-5xl font-black font-headline text-on-surface tracking-tight leading-none italic">{t('auction.pulse')}</h2>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest mb-1">{t('auction.posPhase')}</p>
          <div className="flex gap-2">
            <div className="bg-surface-container-highest px-4 py-3 rounded-lg flex flex-col items-center min-w-[70px] border-b-2 border-primary">
              <span className="text-3xl font-black font-headline text-primary" style={{ color: '#a4ffb9' }}>{currentPosition}</span>
              <span className="text-[9px] font-label text-on-surface-variant/60 uppercase" style={{ color: '#a4ffb9' }}>{t('auction.current')}</span>
            </div>
            <span className="text-3xl font-black text-on-surface-variant/30 py-2">/</span>
            <button onClick={skipToNextPosition} className="bg-surface-container-highest px-4 py-3 rounded-lg flex flex-col items-center min-w-[70px] border-b-2 border-surface-variant outline outline-1 outline-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer group">
              <span className="text-3xl font-black font-headline text-on-surface-variant group-hover:text-white transition-colors">{POSITIONS_ORDER[currentPositionIndex + 1] || 'END'}</span>
              <span className="text-[9px] font-label text-on-surface-variant/60 uppercase">{t('auction.next')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Center Area: Player Card & Interaction */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-surface-container-low rounded-xl p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden group shadow-card border border-outline-variant/10">
            {/* Abstract Background Detail */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700 pointer-events-none"></div>

            {/* Celebration Effect */}
            {celebrating && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent animate-pulse pointer-events-none z-20"></div>
            )}

            {/* High Fidelity Player Card */}
            <div key={playerKey} className="relative z-10 w-full md:w-[280px] shrink-0 animate-in fade-in zoom-in-95 duration-500">
              <div className="aspect-[3/4] relative shadow-[0_0_80px_rgba(0,0,0,0.6)] rounded-[20px] overflow-hidden bg-transparent group-hover:scale-[1.02] transition-transform duration-500 hover:shadow-[0_0_100px_rgba(164,255,185,0.15)] flex items-center justify-center">
                <img
                  src={getPlayerPhotoUrl(currentPlayer)}
                  alt={currentPlayer.name}
                  className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  onError={e => { e.currentTarget.src = getPlaceholderAvatar(currentPlayer.name); }}
                />
              </div>
            </div>

            {/* Interaction Panel */}
            <div className="flex-1 flex flex-col justify-center relative z-10">
              <div className="mb-6">
                <span className="text-[11px] font-label text-on-surface-variant uppercase tracking-[0.3em] mb-2 block">{t('auction.minPrice')}</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black font-headline text-on-surface tracking-tighter">{currentPlayer.minPrice.toLocaleString()}</span>
                  <span className="text-lg font-bold font-headline text-primary">CR</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-widest ml-1 text-primary animate-pulse">{t('auction.customBid')}</label>
                  <div className="flex items-center border-b-2 border-surface-variant focus-within:border-primary transition-colors py-2 px-1">
                    <span className="text-on-surface-variant font-bold mr-2 text-xl">CR</span>
                    <input
                      type="number"
                      value={customBid}
                      onChange={(e) => setCustomBid(parseInt(e.target.value) || '')}
                      className="bg-transparent border-none text-3xl font-black font-headline w-full focus:ring-0 placeholder:text-surface-variant p-0 outline-none"
                      placeholder={t('auction.enterAmount')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => setCustomBid((c) => (Number(c) || currentPlayer.minPrice) + 10)} className="bg-surface-bright hover:bg-surface-container-highest transition-colors py-3 rounded-md font-bold font-headline text-primary text-xs flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">add</span> 10
                  </button>
                  <button onClick={() => setCustomBid((c) => (Number(c) || currentPlayer.minPrice) + 50)} className="bg-surface-bright hover:bg-surface-container-highest transition-colors py-3 rounded-md font-bold font-headline text-primary text-xs flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">add</span> 50
                  </button>
                  <button onClick={() => setCustomBid((c) => (Number(c) || currentPlayer.minPrice) + 100)} className="bg-surface-bright hover:bg-surface-container-highest transition-colors py-3 rounded-md font-bold font-headline text-primary text-xs flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">add</span> 100
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Teams for Bidding */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {localTeams.map(team => {
              const canAfford = team.budget >= currentBidAmount;
              return (
                <button
                  key={team.id}
                  onClick={() => assignPlayer(team.id)}
                  disabled={!canAfford || currentBidAmount < currentPlayer.minPrice}
                  className="p-3 sm:p-4 rounded-xl border border-outline-variant/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-left group disabled:opacity-50 disabled:hover:scale-100 disabled:grayscale relative overflow-hidden flex flex-col"
                  style={{ backgroundColor: `${team.color}15`, borderColor: `${team.color}40` }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 blur-xl opacity-30 group-hover:opacity-60 transition-opacity" style={{ backgroundColor: team.color }}></div>
                  <div className="flex items-center gap-3 relative z-10 w-full mb-1">
                    {team.ownerPhoto && (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0 border-[2px] overflow-hidden shadow-xl" style={{ borderColor: team.color }}>
                        <img src={team.ownerPhoto} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-headline font-bold text-[14px] truncate uppercase tracking-tight leading-none" style={{ color: team.color }}>{team.name}</h4>
                      <p className="text-[11px] font-label text-on-surface-variant mt-1.5 leading-none">{t('auction.bal')}{team.budget.toLocaleString()} CR</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline-variant/10 flex justify-between items-center w-full">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant font-label">{t('auction.players')} {team.players.length}</span>
                    <span className="material-symbols-outlined text-sm" style={{ color: team.color }}>gavel</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex gap-4 justify-between border-t border-outline-variant/10 pt-6">
            <button onClick={undo} disabled={auctionHistory.length === 0} className="px-6 py-3 bg-surface-container-low hover:bg-surface-bright border border-outline-variant/20 rounded font-label font-bold text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 transition-colors">
              <Undo2 className="h-4 w-4" /> {t('auction.undo')}
            </button>
            <div className="flex gap-3">
              <button onClick={handleFinish} className="px-6 py-3 bg-error/10 hover:bg-error/20 border border-error/50 text-error rounded font-label font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors text-center">
                {t('auction.endAuction')}
              </button>
              <button onClick={nextPlayer} className="px-6 py-3 bg-surface-container-high hover:bg-surface-bright border border-primary/20 text-primary rounded font-label font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(164,255,185,0.05)] text-center">
                {t('auction.skip')} <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Live Participants & Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-high rounded-xl p-6 flex flex-col h-auto max-h-[600px] border border-outline-variant/10">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-sm font-black font-headline text-on-surface uppercase tracking-widest">{t('auction.history')}</h4>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold">{auctionHistory.length} {t('auction.bids')}</span>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {auctionHistory.slice().reverse().map((entry, idx) => (
                <div key={idx} className="p-4 rounded-lg flex items-center justify-between bg-surface-container-low border-l-2" style={{ borderLeftColor: entry.team.color }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" style={{ backgroundColor: `${entry.team.color}20`, color: entry.team.color }}>
                      {entry.player.rating}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">{entry.player.name}</p>
                      <p className="text-[9px] text-on-surface-variant font-label truncate w-24">{entry.team.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black font-headline" style={{ color: entry.team.color }}>{entry.pricePaid.toLocaleString()}</p>
                    <span className="text-[8px] font-label text-on-surface-variant uppercase tracking-tighter">{t('auction.sold')}</span>
                  </div>
                </div>
              ))}

              {auctionHistory.length === 0 && (
                <div className="text-center py-10 opacity-50">
                  <History className="h-8 w-8 mx-auto mb-2 text-on-surface-variant" />
                  <p className="text-xs font-label text-on-surface-variant">{t('auction.noBids')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Marketplace Stats Wrapper */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container px-5 py-4 rounded-lg border-l-4 border-tertiary">
              <span className="text-[9px] font-label text-on-tertiary-container uppercase tracking-widest mb-1 block">{t('auction.auctioned')}</span>
              <p className="text-xl font-bold font-headline text-on-surface">{auctionedPlayersCount} <span className="text-[10px] font-normal text-on-surface-variant">/ {elitePlayers.length}</span></p>
            </div>
            <div className="bg-surface-container px-5 py-4 rounded-lg border-l-4 border-secondary">
              <span className="text-[9px] font-label text-secondary uppercase tracking-widest mb-1 block">{t('auction.remain')}</span>
              <p className="text-xl font-bold font-headline text-on-surface">{positionPlayers.length - currentPlayerIndex}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}