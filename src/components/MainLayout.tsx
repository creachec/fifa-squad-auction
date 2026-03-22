import { ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuctionHistory from '@/components/AuctionHistory';
import { Player, POSITIONS_ORDER } from '@/types/auction';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMusic } from '@/contexts/MusicContext';

export type MainTabType = 'setup' | 'auction' | 'dashboard' | 'results' | 'database';

interface MainLayoutProps {
    children: ReactNode;
    activeTab: MainTabType;
    onTabChange?: (tab: MainTabType) => void;
    onLoadAuction?: (id: string) => void;
    onQuickListPlayer?: (player: Player) => void;
    onHomeClick?: () => void;
}

export default function MainLayout({ children, activeTab, onTabChange, onLoadAuction, onQuickListPlayer, onHomeClick }: MainLayoutProps) {
    const { t, language, setLanguage } = useLanguage();
    const { isMuted, toggleMute } = useMusic();
    const [isLoadOpen, setIsLoadOpen] = useState(false);
    const [isQuickListOpen, setIsQuickListOpen] = useState(false);
    const [quickPlayer, setQuickPlayer] = useState<Partial<Player>>({ type: 'Elite', minPrice: 1000, position: 'ST', rating: 83 });

    const handleQuickListSubmit = () => {
        if (!quickPlayer.name || !quickPlayer.position || !quickPlayer.rating) return;
        onQuickListPlayer?.(quickPlayer as Player);
        setIsQuickListOpen(false);
        setQuickPlayer({ type: 'Elite', minPrice: 1000, position: 'ST', rating: 83, name: '', eaId: '', team: '' });
    };

    return (
        <div className="min-h-screen bg-background text-on-surface antialiased overflow-x-hidden w-full flex flex-col">
            {/* TopAppBar */}
            <nav className="bg-[#0a0e14] dark:bg-[#0a0e14] docked full-width top-0 sticky z-50 border-b border-[#44484f]/15">
                <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1920px] mx-auto">
                    <div className="flex items-center gap-12">
                        <button onClick={onHomeClick} className="text-2xl font-black tracking-tighter text-[#a4ffb9] italic hover:scale-105 transition-transform">
                            {t('app.title')}
                        </button>
                        <div className="hidden md:flex items-center gap-8">
                            <span onClick={() => onTabChange && onTabChange('setup')} className={`cursor-pointer font-label uppercase tracking-widest text-[11px] ${activeTab === 'setup' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface/60 hover:text-white transition-colors'}`}>{t('nav.setup')}</span>
                            <span onClick={() => onTabChange && onTabChange('auction')} className={`cursor-pointer font-label uppercase tracking-widest text-[11px] ${activeTab === 'auction' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface/60 hover:text-white transition-colors'}`}>{t('nav.auction')}</span>
                            <span onClick={() => onTabChange && onTabChange('dashboard')} className={`cursor-pointer font-label uppercase tracking-widest text-[11px] ${activeTab === 'dashboard' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface/60 hover:text-white transition-colors'}`}>{t('nav.dashboard')}</span>
                            <span onClick={() => onTabChange && onTabChange('results')} className={`cursor-pointer font-label uppercase tracking-widest text-[11px] ${activeTab === 'results' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface/60 hover:text-white transition-colors'}`}>{t('nav.results')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button onClick={toggleMute} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container" title="Toggle Music">
                            <span className="material-symbols-outlined text-[20px]">{isMuted ? 'volume_off' : 'volume_up'}</span>
                        </button>
                        <div className="flex bg-surface-container-highest rounded-full p-1 border border-outline-variant/10">
                            <button onClick={() => setLanguage('pt')} className={`w-8 h-8 rounded-full flex justify-center items-center transition-opacity ${language === 'pt' ? 'opacity-100 ring-2 ring-primary bg-primary/20' : 'opacity-40 hover:opacity-80'}`} title="Português">🇧🇷</button>
                            <button onClick={() => setLanguage('en')} className={`w-8 h-8 rounded-full flex justify-center items-center transition-opacity ${language === 'en' ? 'opacity-100 ring-2 ring-primary bg-primary/20' : 'opacity-40 hover:opacity-80'}`} title="English">🇺🇸</button>
                        </div>
                        {/* Removed unused notification and account mocks for cleaner UI */}
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 relative">
                {/* SideNavBar (Hidden on mobile) */}
                <aside className="hidden lg:flex flex-col h-[calc(100vh-73px)] w-64 fixed left-0 top-[73px] bg-[#0a0e14] border-r border-[#44484f]/15 z-40 overflow-y-auto">
                    <nav className="flex-grow pt-6 space-y-2">
                        <a className={`flex items-center gap-3 px-6 py-4 transition-all cursor-pointer ${activeTab === 'database' ? 'text-[#0a0e14] bg-[#a4ffb9] font-bold' : 'text-[#c2d5ff]/70 hover:text-[#f1f3fc] hover:bg-[#1a1f26]'}`} onClick={() => onTabChange && onTabChange('database')}>
                            <span className="material-symbols-outlined">database</span>
                            <span className="font-['Manrope'] font-semibold">Player Database</span>
                        </a>
                        <a className="flex items-center gap-3 text-[#c2d5ff]/70 px-6 py-4 hover:text-[#f1f3fc] hover:bg-[#1a1f26] transition-all cursor-pointer" onClick={() => setIsLoadOpen(true)}>
                            <span className="material-symbols-outlined">folder_open</span>
                            <span className="font-['Manrope'] font-semibold">{t('sidebar.loadAuction')}</span>
                        </a>
                    </nav>
                    <div className="p-6 mt-auto">
                        <button onClick={() => setIsQuickListOpen(true)} className="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-md shadow-lg shadow-primary/10 hover:scale-[1.02] transition-transform text-xs uppercase tracking-wider">
                            {t('sidebar.quickList')}
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="lg:ml-64 w-full flex flex-col min-h-[calc(100vh-73px)] overflow-x-hidden relative">
                    {/* Background Decoration */}
                    <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                        <div className="absolute top-[10%] left-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px]"></div>
                        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-tertiary/5 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="flex-1 pb-10 border-b border-transparent">
                        {children}
                    </div>

                    {/* Footer */}
                    <footer className="w-full mt-auto py-8 bg-[#0a0e14] dark:bg-[#0a0e14] border-t border-[#44484f]/15 relative z-10 bottom-0">
                        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-[1920px] mx-auto gap-4">
                            <span className="text-sm font-bold text-[#f1f3fc] uppercase tracking-tighter italic">{t('app.title')}</span>
                            <p className="text-[12px] font-medium font-label tracking-wide text-[#f1f3fc]/40 uppercase">{t('index.footerCopy')}</p>
                            <div className="flex gap-6">
                                <a className="text-[12px] font-medium font-label tracking-wide text-[#f1f3fc]/40 hover:text-[#a4ffb9] transition-colors" href="#">{t('index.privacy')}</a>
                                <a className="text-[12px] font-medium font-label tracking-wide text-[#f1f3fc]/40 hover:text-[#a4ffb9] transition-colors" href="#">{t('index.terms')}</a>
                                <a className="text-[12px] font-medium font-label tracking-wide text-[#f1f3fc]/40 hover:text-[#a4ffb9] transition-colors" href="#">{t('index.rules')}</a>
                                <a className="text-[12px] font-medium font-label tracking-wide text-[#f1f3fc]/40 hover:text-[#a4ffb9] transition-colors" href="#">{t('index.support')}</a>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>

            <Dialog open={isLoadOpen} onOpenChange={setIsLoadOpen}>
                <DialogContent className="max-w-4xl bg-surface-container-highest border border-outline-variant/20 text-on-surface">
                    <DialogHeader>
                        <DialogTitle className="font-headline tracking-tighter uppercase italic">{t('load.title')}</DialogTitle>
                    </DialogHeader>
                    <AuctionHistory onLoadAuction={(id) => { onLoadAuction?.(id); setIsLoadOpen(false); }} />
                </DialogContent>
            </Dialog>

            {/* Quick List Player Modal */}
            <Dialog open={isQuickListOpen} onOpenChange={setIsQuickListOpen}>
                <DialogContent className="max-w-md bg-surface-container-highest border border-outline-variant/20 text-on-surface">
                    <DialogHeader>
                        <DialogTitle className="font-headline tracking-tighter uppercase italic">{t('quick.title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('quick.name')}</Label>
                                <Input value={quickPlayer.name || ''} onChange={e => setQuickPlayer({ ...quickPlayer, name: e.target.value })} className="bg-background border-outline-variant/20" placeholder="Ex: Mbappé" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('quick.pos')}</Label>
                                <Select value={quickPlayer.position || 'ST'} onValueChange={v => setQuickPlayer({ ...quickPlayer, position: v })}>
                                    <SelectTrigger className="bg-background border-outline-variant/20">
                                        <SelectValue placeholder="Position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {POSITIONS_ORDER.map(pos => <SelectItem key={pos} value={pos}>{pos}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>{t('quick.team')}</Label>
                                <Input value={quickPlayer.team || ''} onChange={e => setQuickPlayer({ ...quickPlayer, team: e.target.value })} className="bg-background border-outline-variant/20" placeholder="Ex: Real Madrid" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('quick.rating')}</Label>
                                <Input type="number" value={quickPlayer.rating || 83} onChange={e => setQuickPlayer({ ...quickPlayer, rating: parseInt(e.target.value) })} className="bg-background border-outline-variant/20" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('quick.minPrice')}</Label>
                                <Input type="number" value={quickPlayer.minPrice || 1000} onChange={e => setQuickPlayer({ ...quickPlayer, minPrice: parseInt(e.target.value) })} className="bg-background border-outline-variant/20" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('quick.eaId')}</Label>
                                <Input value={quickPlayer.eaId || ''} onChange={e => setQuickPlayer({ ...quickPlayer, eaId: e.target.value })} className="bg-background border-outline-variant/20" placeholder="Ex: 231747" />
                            </div>
                        </div>
                        <Button onClick={handleQuickListSubmit} className="w-full bg-gradient-primary text-primary-foreground font-bold uppercase tracking-widest mt-4">
                            {t('quick.add')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
