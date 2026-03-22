import { useState } from 'react';
import { Team } from '@/types/auction';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadAvatar } from '@/utils/imageUpload';

interface TeamSetupProps {
  onStart: (teams: Team[]) => void;
}

const PRESET_COLORS = [
  '#a4ffb9', // primary
  '#ffd334', // secondary
  '#c2d5ff', // tertiary
  '#ff716c', // error
  '#a855f7', // purple-500
  '#60a5fa', // blue-400
];

export default function TeamSetup({ onStart }: TeamSetupProps) {
  const { t } = useLanguage();
  const [teams, setTeams] = useState<Array<{ name: string; color: string; budget: number; ownerPhoto?: string }>>([]);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState<number>(1000);
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newOwnerPhoto, setNewOwnerPhoto] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadingToast = toast.loading('Compactando e upando imagem...');

    try {
      const publicUrl = await uploadAvatar(file);
      setNewOwnerPhoto(publicUrl);
      toast.success('Imagem salva no Supabase com sucesso!', { id: loadingToast });
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem', { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const addTeam = () => {
    if (!newName.trim()) {
      toast.error('Informe o nome do clube.');
      return;
    }
    if (teams.length >= 12) {
      toast.error('Máximo de 12 clubes atingido.');
      return;
    }
    setTeams([...teams, { name: newName, color: newColor, budget: newBudget, ownerPhoto: newOwnerPhoto }]);
    setNewName('');
    setNewOwnerPhoto('');
    setNewColor(PRESET_COLORS[(teams.length + 1) % PRESET_COLORS.length]);
  };

  const removeTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    if (teams.length < 2) {
      toast.error('Mínimo 2 clubes para iniciar o leilão.');
      return;
    }
    const formattedTeams: Team[] = teams.map((team, i) => ({
      ...team,
      id: `team-${i}`,
      initialBudget: team.budget,
      players: [],
    }));
    onStart(formattedTeams);
  };

  const totalBudget = teams.reduce((acc, team) => acc + team.budget, 0);

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      {/* Tournament Status Summary */}
      <section className="px-8 py-8 bg-surface-container-low/50">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-2">
            <span className="font-label text-primary text-xs font-bold uppercase tracking-[0.2em]">{t('setup.title')}</span>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none font-headline">Squad Setup Phase</h1>
            <p className="text-on-surface-variant max-w-md font-label text-sm">
              {t('setup.subtitle')} <span className="text-secondary font-mono bg-secondary/10 px-1 rounded">supabase.auction_teams</span>
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-48 bg-surface-container-highest p-4 border-l-4 border-primary">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest font-label">{t('setup.registered')}</p>
              <p className="text-3xl font-bold font-headline">{teams.length.toString().padStart(2, '0')} <span className="text-sm text-on-surface-variant">/ 12</span></p>
            </div>
            <div className="flex-1 md:w-48 bg-surface-container-highest p-4 border-l-4 border-secondary">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest font-label">{t('setup.globalPurse')}</p>
              <p className="text-3xl font-bold font-headline">{totalBudget.toLocaleString()} <span className="text-sm text-on-surface-variant">CR</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout: Sidebar and Grid */}
      <section className="px-8 py-8 flex flex-col xl:flex-row gap-8 max-w-[1920px] mx-auto w-full flex-grow">
        {/* Side Panel: Add New Club */}
        <div className="xl:w-80 shrink-0">
          <div className="bg-surface-container p-6 border border-outline-variant/15 rounded-lg sticky top-28 shadow-lg">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 font-headline">
              <span className="material-symbols-outlined text-primary">add_circle</span>
              {t('setup.addTeam')}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 block">{t('setup.newTeamName')}</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-surface-variant focus:border-primary outline-none py-2 transition-all font-medium text-on-surface"
                  placeholder="e.g. Manchester Pulse"
                  type="text"
                />
              </div>
              <div>
                <label className="font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 block">Owner Photo (Upload)</label>
                <div className="flex items-center gap-3">
                  {newOwnerPhoto && (
                    <img src={newOwnerPhoto} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-primary/40 shrink-0" />
                  )}
                  <label className={`w-full bg-surface-container-highest border-2 border-dashed border-outline-variant/30 hover:border-primary/50 text-center py-3 rounded-lg cursor-pointer transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className="text-xs font-bold font-label text-on-surface-variant uppercase">{isUploading ? 'Upando...' : 'Selecionar Imagem'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-2 block">{t('setup.budget')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent border-b-2 border-surface-variant focus:border-primary outline-none py-2 transition-all font-medium text-on-surface pr-8"
                    placeholder="1000"
                  />
                  <span className="absolute right-0 bottom-2 text-xs font-bold text-primary">CR</span>
                </div>
              </div>
              <div>
                <label className="font-label text-[10px] uppercase font-bold tracking-widest text-on-surface-variant mb-4 block">{t('setup.color')}</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${newColor === c ? 'scale-110 ring-2 ring-white' : 'opacity-80 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <button className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center border border-outline-variant relative">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-xs">colorize</span>
                  </button>
                </div>
              </div>

              <button onClick={addTeam} className="w-full py-4 bg-surface-bright text-primary font-bold rounded hover:bg-primary/20 transition-all flex items-center justify-center gap-2 mt-4 group border border-primary/20">
                <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
                {t('setup.addTeam')}
              </button>
            </div>
          </div>
        </div>

        {/* Grid of Active Participants */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold uppercase tracking-tight font-headline">{t('setup.totalTeams')} <span className="text-primary ml-2">({teams.length.toString().padStart(2, '0')})</span></h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
            {teams.map((team, idx) => (
              <div key={idx} className="bg-surface-container-highest p-6 relative overflow-hidden group hover:bg-[#1b2028] transition-all rounded-lg border border-outline-variant/10">
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-2xl transition-all" style={{ backgroundColor: `${team.color}20` }}></div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex shrink-0 items-center justify-center bg-surface-container" style={{ borderColor: team.color }}>
                      {team.ownerPhoto ? (
                        <img src={team.ownerPhoto} alt={`${team.name} Owner`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-2xl text-on-surface-variant">person</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black italic uppercase leading-none mb-1 font-headline truncate max-w-[14rem]" title={team.name}>{team.name}</h4>
                      <p className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant font-label uppercase">CLUB {idx + 1}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label mb-1">Current Budget</p>
                    <p className="text-2xl font-bold font-headline" style={{ color: team.color }}>
                      {team.budget.toLocaleString()} <span className="text-xs text-on-surface-variant">CR</span>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/15 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {/* Space allocated for future player minatures if I want to show them */}
                    </div>
                    <button onClick={() => removeTeam(idx)} className="text-error opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-error/10 rounded-full" title={t('setup.remove')}>
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {Array.from({ length: Math.max(0, 4 - teams.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center p-8 gap-4 opacity-40 rounded-lg">
                <span className="material-symbols-outlined text-4xl">add_circle</span>
                <p className="font-bold uppercase tracking-widest text-sm font-label">Avail. Slot</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-12 right-12 z-50">
        <button
          onClick={handleStart}
          disabled={teams.length < 2}
          className="bg-gradient-to-r from-primary to-primary-container text-on-primary p-6 rounded-xl shadow-[0_0_50px_rgba(164,255,185,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 group disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-start leading-none">
            <span className="font-label text-[10px] font-bold uppercase tracking-widest opacity-80">Finalize & Start</span>
            <span className="text-xl font-black italic uppercase tracking-tight font-headline">{t('setup.startAuction')}</span>
          </div>
          <span className="material-symbols-outlined text-3xl group-hover:translate-x-1 transition-transform">rocket_launch</span>
        </button>
      </div>
    </div>
  );
}
