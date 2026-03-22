import { useState } from 'react';
import { Player, POSITIONS_ORDER } from '@/types/auction';
import { getPlayerPhotoUrl, getPlaceholderAvatar } from '@/utils/playerPhotos';
import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { uploadAvatar } from '@/utils/imageUpload';
import { toast } from 'sonner';

interface PlayerDatabaseProps {
    players: Player[];
    onUpdatePlayer: (originalId: string, player: Player) => void;
    onDeletePlayer?: (originalId: string) => void;
    onAddNewRequest: () => void;
}

export default function PlayerDatabase({ players, onUpdatePlayer, onDeletePlayer, onAddNewRequest }: PlayerDatabaseProps) {
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('All');
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // Edit States
    const [editRating, setEditRating] = useState<number>(0);
    const [editName, setEditName] = useState('');
    const [editPosition, setEditPosition] = useState<any>('ST');
    const [editEaId, setEditEaId] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const filteredPlayers = players.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.eaId && p.eaId.toString().includes(search));
        const matchesPos = selectedPosition === 'All' || p.position === selectedPosition;
        return matchesSearch && matchesPos;
    });

    const handleEditClick = (player: Player) => {
        setEditingPlayer(player);
        setEditRating(player.rating);
        setEditName(player.name);
        setEditPosition(player.position);
        setEditEaId(player.eaId || '');
        setEditAvatarUrl(player.avatarUrl || '');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const loadingToast = toast.loading('Processando imagem do jogador...');

        try {
            const publicUrl = await uploadAvatar(file);
            setEditAvatarUrl(publicUrl);
            toast.success('Foto do jogador atualizada!', { id: loadingToast });
        } catch (error) {
            toast.error('Erro ao subir foto', { id: loadingToast });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveEdit = () => {
        if (editingPlayer) {
            const originalId = editingPlayer.eaId || editingPlayer.name;
            onUpdatePlayer(originalId, {
                ...editingPlayer,
                rating: editRating,
                name: editName,
                position: editPosition,
                eaId: editEaId,
                avatarUrl: editAvatarUrl
            });
            setEditingPlayer(null);
        }
    };

    return (
        <div className="max-w-[1920px] mx-auto px-6 py-12 relative z-10 w-full min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="font-headline text-4xl font-extrabold text-on-surface uppercase tracking-tight">Player Database</h1>
                    <p className="font-label text-on-surface-variant mt-1 text-sm tracking-wide">Manage global player assets and market valuations.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name..."
                            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-md py-2.5 pl-10 pr-4 text-sm focus:border-primary outline-none transition-colors"
                        />
                    </div>
                    <button onClick={onAddNewRequest} className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm rounded-md shadow-[0_0_15px_rgba(164,255,185,0.1)] hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap hidden sm:flex">
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add New Player
                    </button>
                </div>
            </div>

            {/* Position Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 items-center">
                <span className="font-label text-xs uppercase font-bold text-on-surface-variant tracking-widest mr-4">Posições:</span>
                <button
                    onClick={() => setSelectedPosition('All')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${selectedPosition === 'All' ? 'bg-primary/20 text-primary border-primary/50' : 'bg-surface-container border-outline-variant/20 hover:border-outline-variant/50'}`}
                >
                    Todos
                </button>
                {POSITIONS_ORDER.map(pos => (
                    <button
                        key={pos}
                        onClick={() => setSelectedPosition(pos)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors border ${selectedPosition === pos ? 'bg-primary/20 text-primary border-primary/50' : 'bg-surface-container border-outline-variant/20 hover:border-outline-variant/50'}`}
                    >
                        {pos}
                    </button>
                ))}
            </div>

            {/* Mobile Add Button */}
            <button onClick={onAddNewRequest} className="w-full mb-8 sm:hidden px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm rounded-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span> Add New Player
            </button>

            {/* Player Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlayers.slice(0, 300).map((player, idx) => (
                    <div key={`${player.name}-${idx}`} className="bg-surface-container-highest rounded-xl overflow-hidden group border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 relative flex flex-col h-full">
                        <div className="absolute top-4 left-4 z-10 drop-shadow-md">
                            <div className="font-headline text-4xl font-black text-secondary leading-none">{player.rating}</div>
                            <div className="font-label text-[10px] font-bold text-secondary/80 uppercase tracking-tighter">{player.position}</div>
                        </div>

                        <div className="relative h-48 overflow-hidden bg-gradient-to-b from-surface-container-high to-surface flex justify-center items-end pt-4">
                            <img
                                src={getPlayerPhotoUrl(player)}
                                alt={player.name}
                                className="w-3/4 h-full object-contain scale-110 group-hover:scale-125 transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                                onError={(e) => { e.currentTarget.src = getPlaceholderAvatar(player.name); }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-transparent to-transparent"></div>
                        </div>

                        <div className="p-4 pt-0 -mt-2 relative z-10 flex flex-col flex-grow">
                            <h3 className="font-headline text-xl font-bold text-on-surface truncate" title={player.name}>{player.name}</h3>
                            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">EA_ID: {player.eaId || 'CUSTOM'}</p>

                            <div className="mt-auto pt-4 flex gap-2 w-full">
                                <button
                                    onClick={() => handleEditClick(player)}
                                    className="w-full py-2 bg-surface-bright hover:bg-surface-container-high text-on-surface text-[10px] font-black uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 border border-outline-variant/20 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30"
                                >
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredPlayers.length === 0 && (
                    <div className="col-span-full py-20 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
                        <p>No players found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Edit Panel (Dialog) */}
            <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
                <DialogContent className="sm:max-w-xl bg-surface-container-highest border border-outline-variant/30 text-on-surface p-0 overflow-hidden shadow-2xl">
                    {editingPlayer && (
                        <div className="flex flex-col">
                            <div className="p-6 border-b border-outline-variant/10 bg-surface-container flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase block mb-1">Entity Management</span>
                                    <h2 className="font-headline text-2xl font-extrabold uppercase truncate max-w-[250px]">{editingPlayer.name}</h2>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                {/* Visual Feedback of Card */}
                                <div className="flex items-center gap-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/10">
                                    <div className="w-16 h-16 rounded overflow-hidden bg-surface-variant shrink-0 relative group">
                                        <img
                                            src={editAvatarUrl || getPlayerPhotoUrl(editingPlayer)}
                                            alt="Card"
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.src = getPlaceholderAvatar(editingPlayer.name); }}
                                        />
                                        <label className={`absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer ${isUploading ? 'opacity-100' : ''}`}>
                                            <span className="material-symbols-outlined text-white text-xl">{isUploading ? 'hourglass_empty' : 'upload'}</span>
                                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">{editPosition} • {editingPlayer.type}</p>
                                        <p className="font-headline text-3xl font-black">{editRating}</p>
                                    </div>
                                    <div className="text-right">
                                        <label className="text-[10px] uppercase font-bold text-primary font-label cursor-pointer hover:underline">
                                            {isUploading ? 'Upando...' : 'Trocar Foto'}
                                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="font-label text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Nome do Jogador</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full bg-surface-container-low border border-outline-variant/30 py-2 px-3 rounded text-sm font-medium outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-label text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">EA ID (Opcional)</label>
                                        <input
                                            type="text"
                                            value={editEaId}
                                            onChange={(e) => setEditEaId(e.target.value)}
                                            className="w-full bg-surface-container-low border border-outline-variant/30 py-2 px-3 rounded text-sm font-medium outline-none focus:border-primary transition-colors"
                                            placeholder="Ex: 231747"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="font-label text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Posição</label>
                                    <div className="flex flex-wrap gap-2">
                                        {POSITIONS_ORDER.map(pos => (
                                            <button
                                                key={pos}
                                                onClick={() => setEditPosition(pos as any)}
                                                className={`px-3 py-1.5 rounded text-xs font-bold font-label transition-colors border ${editPosition === pos ? 'bg-primary/20 text-primary border-primary/50' : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:text-white hover:border-outline-variant/50'}`}
                                            >
                                                {pos}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="font-label text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Overall Rating (OVR)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="40"
                                            max="99"
                                            value={editRating}
                                            onChange={(e) => setEditRating(parseInt(e.target.value))}
                                            className="flex-1 accent-primary h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                                        />
                                        <input
                                            type="number"
                                            value={editRating}
                                            onChange={(e) => setEditRating(parseInt(e.target.value))}
                                            className="w-16 bg-surface-container-low border border-outline-variant/30 text-center py-2 rounded font-headline font-bold text-xl outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-surface-container flex justify-end gap-3 border-t border-outline-variant/10">
                                {isConfirmingDelete ? (
                                    <div className="flex items-center gap-2 mr-auto bg-error/10 px-3 py-1 rounded border border-error/20">
                                        <span className="text-error font-bold text-[10px] uppercase font-label">Tem certeza?</span>
                                        <button onClick={() => setIsConfirmingDelete(false)} className="px-3 py-1.5 hover:bg-surface-variant text-on-surface rounded font-bold text-[10px] uppercase font-label transition-colors">Não</button>
                                        <button onClick={() => { if (onDeletePlayer) onDeletePlayer(editingPlayer.eaId || editingPlayer.name); setEditingPlayer(null); setIsConfirmingDelete(false); }} className="px-3 py-1.5 bg-error text-on-error rounded font-bold text-[10px] uppercase font-label hover:bg-error/90 transition-colors shadow-[0_0_15px_rgba(255,84,73,0.3)]">Sim, DELETAR</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsConfirmingDelete(true)} className="px-4 py-2 border border-error/50 text-error hover:bg-error/10 font-label font-bold text-[10px] uppercase tracking-widest rounded transition-colors mr-auto flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                        Excluir
                                    </button>
                                )}
                                <div className="flex gap-3">
                                    <button onClick={() => { setEditingPlayer(null); setIsConfirmingDelete(false); }} className="px-6 py-2.5 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center">Cancelar</button>
                                    <button onClick={handleSaveEdit} className="px-6 py-2.5 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-xs uppercase tracking-widest rounded shadow-[0_0_15px_rgba(164,255,185,0.2)] hover:scale-[1.02] transition-transform flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
