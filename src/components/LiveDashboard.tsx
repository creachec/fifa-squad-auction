import { Team, AuctionHistoryEntry, POSITIONS_ORDER } from '@/types/auction';
import { getPlayerPhotoUrl, getPlaceholderAvatar } from '@/utils/playerPhotos';
import { useLanguage } from '@/contexts/LanguageContext';

interface LiveDashboardProps {
  teams: Team[];
  history: AuctionHistoryEntry[];
}

export default function LiveDashboard({ teams, history }: LiveDashboardProps) {
  const { t } = useLanguage();
  const totalPool = teams.reduce((acc, t) => acc + t.initialBudget, 0);
  const activeBids = history.length;
  const avgWinningBid = activeBids > 0 ? history.reduce((acc, h) => acc + h.pricePaid, 0) / activeBids : 0;

  // Sorting teams by remaining budget (descending)
  const sortedTeams = [...teams].sort((a, b) => b.budget - a.budget);

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8">
      {/* Hero Stats Row */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute -right-4 -top-4 text-primary/5 font-headline text-8xl pointer-events-none group-hover:text-primary/10 transition-colors">∑</div>
          <div className="text-on-surface-variant font-label text-[10px] tracking-[0.2em] uppercase mb-1">{t('dash.totalPool')}</div>
          <div className="text-4xl font-headline font-bold text-on-surface tracking-tighter">{totalPool.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-primary text-xs mt-2 font-label">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>{t('dash.capacity')}</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute -right-4 -top-4 text-secondary/5 font-headline text-8xl pointer-events-none group-hover:text-secondary/10 transition-colors">!</div>
          <div className="text-on-surface-variant font-label text-[10px] tracking-[0.2em] uppercase mb-1">{t('dash.activeBids')}</div>
          <div className="text-4xl font-headline font-bold text-on-surface tracking-tighter">{activeBids.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-on-surface-variant text-xs mt-2 font-label">
            <span>{t('dash.soldPlayers')}</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-lg relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute -right-4 -top-4 text-tertiary/5 font-headline text-8xl pointer-events-none group-hover:text-tertiary/10 transition-colors">§</div>
          <div className="text-on-surface-variant font-label text-[10px] tracking-[0.2em] uppercase mb-1">{t('dash.avgBid')}</div>
          <div className="text-4xl font-headline font-bold text-on-surface tracking-tighter">{avgWinningBid.toFixed(0)}</div>
          <div className="flex items-center gap-1 text-tertiary text-xs mt-2 font-label">
            <span>{t('dash.marketAvg')}</span>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-lg border border-primary/20 relative overflow-hidden group shadow-[0_0_15px_rgba(164,255,185,0.05)]">
          <div className="absolute -right-4 -top-4 text-primary/5 font-headline text-8xl pointer-events-none">●</div>
          <div className="text-primary font-label text-[10px] tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            {t('dash.auctionLive')}
          </div>
          <div className="text-4xl font-headline font-bold text-on-surface tracking-tighter">{teams.length}</div>
          <div className="text-on-surface-variant text-xs mt-2 font-label">{t('dash.activePart')}</div>
        </div>
      </section>

      {/* Purchasing Power Comparison */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-lg border border-outline-variant/10 shadow-card">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline text-2xl font-bold tracking-tight">{t('dash.powerCompared')}</h2>
              <p className="text-on-surface-variant font-label text-xs mt-1">{t('dash.powerSubtitle')}</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary"></span>
                <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{t('dash.available')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-outline-variant"></span>
                <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">{t('dash.committed')}</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {sortedTeams.slice(0, 5).map(team => {
              const spent = team.initialBudget - team.budget;
              const remainingPct = Math.max(0, (team.budget / team.initialBudget) * 100);
              const spentPct = Math.max(0, (spent / team.initialBudget) * 100);

              return (
                <div key={team.id} className="space-y-2">
                  <div className="flex justify-between text-xs font-headline font-medium" style={{ color: team.color }}>
                    <span className="uppercase">{team.name}</span>
                    <span className="text-on-surface-variant font-bold">{team.budget.toLocaleString()} / {team.initialBudget.toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full bg-surface-variant flex rounded overflow-hidden">
                    <div className="h-full transition-all duration-1000" style={{ width: `${remainingPct}%`, backgroundColor: team.color }}></div>
                    <div className="h-full bg-outline-variant transition-all duration-1000" style={{ width: `${spentPct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface-container-highest p-8 rounded-lg flex flex-col justify-between border border-outline-variant/10 shadow-card">
          <div>
            <h3 className="font-headline text-lg font-bold">{t('dash.topTransfers')}</h3>
            <p className="text-on-surface-variant font-label text-xs">{t('dash.topTransfersSub')}</p>
          </div>
          <div className="space-y-4 my-6">
            {[...history].sort((a, b) => b.pricePaid - a.pricePaid).slice(0, 3).map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-surface-container-low rounded border-l-2" style={{ borderLeftColor: entry.team.color }}>
                <div className="flex items-center gap-3">
                  <span className="font-headline font-bold text-primary">0{idx + 1}</span>
                  <div>
                    <span className="font-label text-sm font-bold block">{entry.player.name}</span>
                    <span className="text-[10px] text-on-surface-variant">{entry.team.name}</span>
                  </div>
                </div>
                <span className="font-headline text-sm font-bold">{entry.pricePaid.toLocaleString()}</span>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-xs text-on-surface-variant text-center my-8">{t('dash.noTransfers')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Main Grid: Team Detailed Cards */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-2xl font-bold tracking-tight">{t('dash.standings')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedTeams.map(team => {
            const elitePlayers = team.players.filter(p => p.player.type === 'Elite').length;
            const midPlayers = team.players.filter(p => p.player.type === 'Mediano').length;
            const remainingPct = (team.budget / team.initialBudget) * 100;
            const recentAcquisitions = [...history]
              .filter(h => h.team.id === team.id)
              .reverse()
              .slice(0, 2);

            return (
              <div key={team.id} className="bg-surface-container-highest p-6 rounded-lg relative group transition-all hover:bg-surface-bright border border-outline-variant/10 shadow-card">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent blur-2xl transition-all" style={{ '--tw-gradient-from': `${team.color}15` } as any}></div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-headline text-xl font-black italic tracking-tighter uppercase truncate max-w-[12rem]" title={team.name}>{team.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-label font-bold rounded px-1.5 py-0.5" style={{ backgroundColor: `${team.color}30`, color: team.color }}>{t('dash.clubData')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-headline font-bold" style={{ color: team.color }}>{team.budget.toLocaleString()}</div>
                    <div className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">{t('dash.available')}</div>
                  </div>
                </div>

                <div className="mb-6 space-y-1">
                  <div className="h-1.5 w-full bg-surface-container-low overflow-hidden rounded">
                    <div className="h-full transition-all duration-1000" style={{ width: `${remainingPct}%`, backgroundColor: team.color }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-label text-on-surface-variant">
                    <span>{remainingPct.toFixed(0)}% {t('dash.budgetRem')}</span>
                    <span>{t('dash.total')} {team.initialBudget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-surface-container-low p-3 rounded" style={{ borderLeft: `2px solid ${team.color}` }}>
                    <div className="text-2xl font-headline font-bold text-on-surface">{elitePlayers.toString().padStart(2, '0')}</div>
                    <div className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">{t('dash.elite')}</div>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded">
                    <div className="text-2xl font-headline font-bold text-on-surface-variant">{midPlayers.toString().padStart(2, '0')}</div>
                    <div className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest">{t('dash.mid')}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest mb-3">{t('dash.recentAcq')}</div>
                  <div className="space-y-3 min-h-[5rem]">
                    {recentAcquisitions.map((entry, i) => (
                      <div key={i} className="flex items-center gap-3 bg-surface-container-low p-2 rounded">
                        <div className="w-8 h-8 rounded bg-surface-variant overflow-hidden border border-outline-variant/20 flex-shrink-0">
                          <img
                            src={getPlayerPhotoUrl(entry.player)}
                            alt={entry.player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = getPlaceholderAvatar(entry.player.name); }}
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-bold font-headline truncate uppercase">{entry.player.name}</div>
                          <div className="text-[9px] text-on-surface-variant font-label truncate">{t('dash.boughtFor')} {entry.pricePaid.toLocaleString()}</div>
                        </div>
                        <div className="font-headline font-bold text-sm" style={{ color: team.color }}>{entry.player.rating}</div>
                      </div>
                    ))}
                    {recentAcquisitions.length === 0 && (
                      <div className="text-xs text-on-surface-variant italic pt-4">{t('dash.noAcq')}</div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
