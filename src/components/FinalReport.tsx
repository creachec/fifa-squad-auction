import { Team, MAX_PLAYERS_PER_TEAM, POSITIONS_ORDER } from '@/types/auction';
import { exportToPDF } from '@/utils/pdfExport';
import TacticalView from '@/components/TacticalView';
import { getPlayerPhotoUrl, getPlaceholderAvatar } from '@/utils/playerPhotos';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface FinalReportProps {
  teams: Team[];
  onReset: () => void;
}

export default function FinalReport({ teams, onReset }: FinalReportProps) {
  const { t } = useLanguage();

  const handleDownloadSave = () => {
    const saveData = localStorage.getItem('fifa_auction_save');
    if (saveData) {
      const blob = new Blob([saveData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fifa-auction-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast.success('Leilão salvo e baixado com sucesso!');
    } else {
      toast.error('Nenhum save encontrado no cache local!');
    }
  };

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
    const topPlayer = top3[0];

    return { totalSpent, avgPrice, avgRating, top3, topPlayer };
  };

  const sortedTeams = [...teams].sort((a, b) => getTeamStats(b).avgRating - getTeamStats(a).avgRating);
  const champion = sortedTeams[0];

  const handleExportPDF = () => {
    exportToPDF(teams);
  };

  const getPlayersByPosition = (team: Team) => {
    const positions: Record<string, number> = {};
    POSITIONS_ORDER.forEach(pos => {
      positions[pos] = team.players.filter(p => p.player.position === pos).length;
    });
    return positions;
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-12 mb-20 z-10 relative">
      {/* Header Context */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-outline-variant/20 pb-8">
        <div>
          <span className="text-[10px] font-label font-bold uppercase tracking-[0.3em] text-primary mb-2 block">{t('report.concluded')}</span>
          <h1 className="text-5xl font-black font-headline tracking-tighter uppercase italic leading-none text-on-surface">{t('report.title')}</h1>
          <p className="text-on-surface-variant font-label text-sm mt-3 max-w-xl">
            {t('report.subtitle')}
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExportPDF} className="flex flex-col items-center justify-center p-4 bg-surface-container-low border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors group min-w-[120px]">
            <span className="material-symbols-outlined text-primary text-3xl mb-2 group-hover:-translate-y-1 transition-transform">picture_as_pdf</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant font-label group-hover:text-primary transition-colors">{t('report.export')}</span>
          </button>
          <button onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
          }} className="flex flex-col items-center justify-center p-4 bg-surface-container-low border border-outline-variant/20 rounded-lg hover:bg-surface-container-highest transition-colors group min-w-[120px]">
            <span className="material-symbols-outlined text-on-surface text-3xl mb-2 group-hover:scale-110 transition-transform">share</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant font-label">{t('report.broadcast')}</span>
          </button>
        </div>
      </section>

      {/* Winner Banner */}
      {champion && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1c18] to-black border border-[#ffd334]/30 shadow-[0_0_50px_rgba(255,211,52,0.1)]">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1518605368461-1ee7c5101689?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity mask-image-gradient"></div>
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#ffd334]/10 rounded-full blur-[100px]"></div>

          <div className="relative z-10 p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="shrink-0 relative">
              <div className="absolute inset-0 bg-[#ffd334] rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="w-32 h-32 rounded-full border-4 border-[#ffd334] bg-surface-container-lowest flex items-center justify-center relative z-10 overflow-hidden shadow-2xl">
                <span className="material-symbols-outlined text-7xl text-[#ffd334]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[12px] font-label font-bold uppercase tracking-[0.4em] text-[#ffd334] mb-2 block">{t('report.highestRated')}</span>
              <h2 className="text-6xl font-black font-headline italic uppercase tracking-tighter text-white drop-shadow-md">{champion.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 px-4 py-2 rounded flex items-center gap-3">
                  <span className="text-[10px] font-label text-white/60 uppercase tracking-widest">{t('report.ovrRating')}</span>
                  <span className="text-2xl font-bold font-headline text-[#ffd334]">{getTeamStats(champion).avgRating.toFixed(1)}</span>
                </div>
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 px-4 py-2 rounded flex items-center gap-3">
                  <span className="text-[10px] font-label text-white/60 uppercase tracking-widest">{t('report.marquee')}</span>
                  <span className="text-sm font-bold font-headline text-white uppercase">{getTeamStats(champion).topPlayer?.player?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid of Teams */}
      <section className="space-y-12">
        {sortedTeams.map((team, idx) => {
          const stats = getTeamStats(team);
          const playersByPosition = getPlayersByPosition(team);

          return (
            <div key={team.id} className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 relative overflow-hidden group">
              {/* Subtle background glow based on team color */}
              <div className="absolute top-0 right-0 w-[500px] h-full opacity-[0.03] transition-opacity group-hover:opacity-[0.08] pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${team.color})` }}></div>

              {/* Left Column: Tactics & Visuals (6 cols) */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                {/* Team Header */}
                <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4 relative z-10">
                  <div className="flex items-center gap-4">
                    {team.ownerPhoto && (
                      <div className="w-16 h-16 rounded-full border-[3px] overflow-hidden shadow-xl shrink-0" style={{ borderColor: team.color }}>
                        <img src={team.ownerPhoto} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl font-black font-headline text-on-surface/30">#{idx + 1}</span>
                        <h3 className="text-3xl font-black font-headline uppercase italic tracking-tight" style={{ color: team.color }}>{team.name}</h3>
                      </div>
                      <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">{t('report.finalAssessment')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black font-headline text-on-surface">{stats.avgRating.toFixed(1)}</span>
                    <span className="block text-[9px] font-label text-on-surface-variant uppercase tracking-widest leading-none mt-1">{t('report.squadOvr')}</span>
                  </div>
                </div>

                {/* Tactical View Integration */}
                <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/10 flex-1 relative z-10 min-h-[300px]">
                  <h4 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">{t('report.startingXI')}</h4>
                  <TacticalView team={team} />
                </div>
              </div>

              {/* Right Column: Stats & Financials (6 cols) */}
              <div className="lg:col-span-6 flex flex-col gap-6 relative z-10">
                {/* Squad Breakdown */}
                <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
                  <h4 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">groups</span>
                    {t('report.marqueeAcq')}
                  </h4>
                  <div className="space-y-4">
                    {stats.top3.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between p-3 bg-surface-container shrink-0 rounded border-l-2" style={{ borderLeftColor: team.color }}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded overflow-hidden border border-outline-variant/20">
                              <img
                                src={getPlayerPhotoUrl(p.player)}
                                alt={p.player.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = getPlaceholderAvatar(p.player.name); }}
                              />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-on-surface text-surface-container-lowest text-[9px] font-black rounded px-1">{p.player.rating}</div>
                          </div>
                          <div>
                            <p className="text-sm font-bold font-headline uppercase">{p.player.name}</p>
                            <p className="text-[10px] text-on-surface-variant font-label">{p.player.position}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold font-headline text-primary">{p.pricePaid.toLocaleString()}</p>
                          <span className="text-[8px] font-label text-on-surface-variant uppercase tracking-[0.2em]">{t('report.fee')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Positional Depth */}
                  <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10 flex flex-col">
                    <h4 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">analytics</span>
                      {t('report.depth')}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 flex-1 content-start">
                      {POSITIONS_ORDER.map(pos => {
                        const count = playersByPosition[pos] || 0;
                        const isDeficient = count === 0;
                        return (
                          <div key={pos} className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
                            <span className="text-xs font-bold font-headline text-on-surface">{pos}</span>
                            <span className={`text-xs font-bold font-headline ${isDeficient ? 'text-error' : 'text-primary'}`}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial Ledger */}
                  <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10 flex flex-col justify-between">
                    <h4 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">account_balance</span>
                      {t('report.ledger')}
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest mb-1">{t('report.expenditure')}</p>
                        <p className="text-3xl font-black font-headline text-on-surface leading-none">{stats.totalSpent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-label text-on-surface-variant uppercase tracking-widest mb-1">{t('report.costPer')}</p>
                        <p className="text-xl font-bold font-headline text-on-surface leading-none">{stats.avgPrice.toFixed(0)}</p>
                      </div>
                      <div className="pt-4 border-t border-outline-variant/10 mt-auto">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-label text-on-surface-variant uppercase tracking-widest text-[9px]">{t('report.remaining')}</span>
                          <span className="font-bold font-headline text-secondary">{team.budget.toLocaleString()}</span>
                        </div>
                        <div className="h-1 w-full bg-surface-variant mt-2 rounded overflow-hidden">
                          <div className="h-full bg-secondary" style={{ width: `${(team.budget / team.initialBudget) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Substitutes / Reserves */}
                  <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/10">
                    <h4 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">sports_soccer</span>
                      Reservas (Medianos)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {team.players.filter(p => !p.isStarter && p.player.type === 'Mediano').length > 0 ? (
                        team.players
                          .filter(p => !p.isStarter && p.player.type === 'Mediano')
                          .sort((a, b) => b.player.rating - a.player.rating)
                          .map((p, pIdx) => (
                            <div key={pIdx} style={{ borderLeft: `2px solid ${team.color}` }} className="flex items-center p-2 pl-3 bg-surface-container shrink-0 rounded-r w-full">
                              <div className="flex items-center gap-3 overflow-hidden flex-1 mr-3">
                                <span className="bg-surface-container-low px-2 py-1 rounded text-[10px] font-bold font-headline shrink-0" style={{ color: team.color }}>{p.player.position}</span>
                                <span className="text-[11px] font-bold font-headline uppercase truncate">{p.player.name}</span>
                              </div>
                              <span className="text-xs font-black font-headline text-on-surface-variant shrink-0">{p.player.rating}</span>
                            </div>
                          ))
                      ) : (
                        <p className="text-xs font-label text-on-surface-variant/50 py-2">Nenhum reserva sorteado.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Floating Action */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        <button onClick={handleDownloadSave} className="px-6 py-4 bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container rounded-full shadow-2xl flex items-center gap-3 transition-all hover:scale-105 group">
          <span className="material-symbols-outlined text-primary">download</span>
          <span className="font-label text-[10px] font-bold uppercase tracking-[0.3em] text-primary text-nowrap">Backup (JSON)</span>
        </button>
        <button onClick={onReset} className="px-8 py-4 bg-surface-container-highest border border-outline-variant/20 hover:bg-surface-bright rounded-full shadow-2xl backdrop-blur flex items-center gap-3 transition-all hover:scale-105 group">
          <span className="material-symbols-outlined text-error group-hover:-rotate-180 transition-transform duration-500">sync</span>
          <span className="font-label font-bold text-[10px] uppercase tracking-[0.3em] text-on-surface">{t('report.finalize')}</span>
        </button>
      </div>
    </div>
  );
}
