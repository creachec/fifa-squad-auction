import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pt' | 'en';

const translations = {
    pt: {
        // TopAppBar
        "nav.setup": "Configuração",
        "nav.auction": "Leilão",
        "nav.dashboard": "Painel de Bordo",
        "nav.results": "Resultados",
        "app.title": "LEILÃO FIFA",

        // Sidebar
        "sidebar.marketplace": "Mercado",
        "sidebar.myBids": "Meus Lances",
        "sidebar.watchlist": "Lista de Alvos",
        "sidebar.transfers": "Transferências",
        "sidebar.settings": "Configurações",
        "sidebar.quickList": "Lista Rápida (Jogador)",
        "sidebar.loadAuction": "Carregar Leilão",

        // Quick List Modal
        "quick.title": "Lista Rápida (Elite)",
        "quick.name": "Nome do Jogador *",
        "quick.pos": "Posição *",
        "quick.team": "Time Real",
        "quick.rating": "Rating OVR *",
        "quick.minPrice": "Preço Inicial",
        "quick.eaId": "EA Photo ID (Opcional)",
        "quick.add": "Adicionar ao Leilão",

        // Load Auction
        "load.title": "Carregar Leilão",
        "history.title": "Histórico de Leilões",
        "history.loading": "Carregando...",
        "history.empty": "Nenhum leilão salvo ainda",
        "history.completed": "Concluído",
        "history.inProgress": "Em Andamento",
        "history.budget": "Orçamento:",
        "history.teams": "Times:",
        "history.created": "Criado:",
        "history.finished": "Finalizado:",
        "history.load": "Carregar",

        // Team Setup
        "setup.title": "Franquias do Torneio",
        "setup.subtitle": "Registre os participantes do Leilão FIFA 26",
        "setup.globalPurse": "Orçamento Global",
        "setup.totalTeams": "Total de Times",
        "setup.startAuction": "Iniciar Casa de Leilões",
        "setup.newTeamName": "Nome da Franquia",
        "setup.color": "Identidade Visual",
        "setup.budget": "Capital Inicial",
        "setup.addTeam": "Registrar Entidade",
        "setup.registered": "Clubes Registrados",
        "setup.remove": "Remover",

        // Auction Board
        "auction.highStakes": "LEILÃO DE ALTO RISCO",
        "auction.pulse": "THE DIGITAL STADIUM PULSE",
        "auction.posPhase": "Fase de Posições",
        "auction.current": "ATUAL",
        "auction.next": "PRÓXIMO",
        "auction.end": "FIM",
        "auction.minPrice": "Preço Mín / Valor Base",
        "auction.customBid": "Seu Lance Personalizado",
        "auction.enterAmount": "Digite o valor",
        "auction.players": "Jogadores:",
        "auction.bal": "Saldo: ",
        "auction.undo": "Desfazer Ação",
        "auction.endAuction": "Encerrar Leilão",
        "auction.skip": "Pular Jogador",
        "auction.history": "Histórico do Leilão",
        "auction.bids": "LANCES",
        "auction.sold": "VENDIDO",
        "auction.noBids": "Nenhum lance ainda",
        "auction.auctioned": "Leiloados",
        "auction.remain": "Pos. Restantes",
        "auction.finished": "Leilão Finalizado!",
        "auction.seeResults": "Ver Resultados",

        // Dashboard
        "dash.totalPool": "Pool Total do Leilão",
        "dash.capacity": "Capacidade total",
        "dash.activeBids": "Lances Ativos",
        "dash.soldPlayers": "Jogadores vendidos",
        "dash.avgBid": "Média Vencedora",
        "dash.marketAvg": "Média de mercado",
        "dash.auctionLive": "Leilão Ao Vivo",
        "dash.activePart": "Participantes ativos",
        "dash.powerCompared": "Poder de Compra",
        "dash.powerSubtitle": "Densidade de orçamento entre os líderes",
        "dash.available": "Disponível",
        "dash.committed": "Comprometido",
        "dash.topTransfers": "Maiores Transferências",
        "dash.topTransfersSub": "Lances mais altos desta sessão",
        "dash.noTransfers": "Nenhuma transferência completa ainda",
        "dash.standings": "Classificação do Torneio",
        "dash.clubData": "DADOS DO CLUBE",
        "dash.budgetRem": "ORÇAMENTO RESTANTE",
        "dash.total": "TOTAL:",
        "dash.elite": "Jogadores Elite",
        "dash.mid": "Jogadores Médios",
        "dash.recentAcq": "Aquisições Recentes",
        "dash.boughtFor": "Comprado por",
        "dash.noAcq": "Nenhuma aquisição ainda",

        // Final Report
        "report.concluded": "Torneio Concluído",
        "report.title": "Resultados e Análises do Leilão",
        "report.subtitle": "Uma visão completa das formações, eficiência financeira e profundidade para todas as equipes participantes.",
        "report.export": "Exportar PDF",
        "report.broadcast": "Transmitir",
        "report.highestRated": "Elenco de Maior Geral",
        "report.ovrRating": "Rating OVR",
        "report.marquee": "Jogador Destaque",
        "report.finalAssessment": "Avaliação Final",
        "report.squadOvr": "SQUAD OVR",
        "report.startingXI": "Formação Titular (XI)",
        "report.marqueeAcq": "Maiores Aquisições",
        "report.fee": "TAXA",
        "report.depth": "Profundidade",
        "report.ledger": "Livro Financeiro",
        "report.expenditure": "Despesa Total",
        "report.costPer": "Custo por Jogador (Méd)",
        "report.remaining": "Orçamento Restante",
        "report.finalize": "Finalizar e Arquivar Torneio",

        // Index/Misc
        "toast.drawFinish": "Elencos preenchidos com sucesso!",
        "toast.saved": "Leilão salvo com sucesso!",
        "toast.errSave": "Erro ao salvar leilão",
        "toast.loaded": "Leilão carregado com sucesso!",
        "toast.errLoad": "Erro ao carregar leilão",
        "toast.added": "adicionado à fila do leilão!",
        "index.saveAuction": "Salvar Leilão",
        "index.nameLabel": "Nome do Leilão",
        "index.namePlace": "Ex: Leilão FIFA 26",
        "index.saveBtn": "Salvar",
        "index.drawTitle": "Sorteando Medianos...",
        "index.drawSub": "Aguarde enquanto a liga preenche automaticamente os elencos com jogadores base (Rating ≤ 82).",
        "index.footerCopy": "© 2026 EA SPORTS LEILÃO FIFA. O PULSO DO ESTÁDIO DIGITAL.",
        "index.privacy": "Política de Privacidade",
        "index.terms": "Termos de Serviço",
        "index.rules": "Regras do Leilão",
        "index.support": "Suporte"
    },
    en: {
        // TopAppBar
        "nav.setup": "Setup",
        "nav.auction": "Auction",
        "nav.dashboard": "Live Dashboard",
        "nav.results": "Results",
        "app.title": "FIFA AUCTION",

        // Sidebar
        "sidebar.marketplace": "Marketplace",
        "sidebar.myBids": "My Bids",
        "sidebar.watchlist": "Watchlist",
        "sidebar.transfers": "Transfers",
        "sidebar.settings": "Settings",
        "sidebar.quickList": "Quick List Player",
        "sidebar.loadAuction": "Load Auction",

        // Quick List Modal
        "quick.title": "Quick List (Elite)",
        "quick.name": "Player Name *",
        "quick.pos": "Position *",
        "quick.team": "Real Team",
        "quick.rating": "OVR Rating *",
        "quick.minPrice": "Starting Price",
        "quick.eaId": "EA Photo ID (Optional)",
        "quick.add": "Add to Auction",

        // Load Auction
        "load.title": "Load Auction",
        "history.title": "Auction History",
        "history.loading": "Loading...",
        "history.empty": "No saved auctions yet",
        "history.completed": "Completed",
        "history.inProgress": "In Progress",
        "history.budget": "Budget:",
        "history.teams": "Teams:",
        "history.created": "Created:",
        "history.finished": "Finished:",
        "history.load": "Load",

        // Team Setup
        "setup.title": "Tournament Franchises",
        "setup.subtitle": "Register participating entities for the FIFA 26 Draft",
        "setup.globalPurse": "Global Purse",
        "setup.totalTeams": "Total Teams",
        "setup.startAuction": "Launch Auction House",
        "setup.newTeamName": "Franchise Name",
        "setup.color": "Brand Identity",
        "setup.budget": "Starting Capital",
        "setup.addTeam": "Register Entity",
        "setup.registered": "Registered Clubs",
        "setup.remove": "Remove",

        // Auction Board
        "auction.highStakes": "HIGH STAKES AUCTION",
        "auction.pulse": "THE DIGITAL STADIUM PULSE",
        "auction.posPhase": "Position Phase",
        "auction.current": "CURRENT",
        "auction.next": "NEXT",
        "auction.end": "END",
        "auction.minPrice": "Min Price / Base Value",
        "auction.customBid": "Your Custom Bid",
        "auction.enterAmount": "Enter amount",
        "auction.players": "Players:",
        "auction.bal": "Bal: ",
        "auction.undo": "Undo Last",
        "auction.endAuction": "End Auction",
        "auction.skip": "Skip Player",
        "auction.history": "Auction History",
        "auction.bids": "BIDS",
        "auction.sold": "SOLD",
        "auction.noBids": "No bids placed yet",
        "auction.auctioned": "Auctioned",
        "auction.remain": "Pos. Remain",
        "auction.finished": "Auction Finished!",
        "auction.seeResults": "See Results",

        // Dashboard
        "dash.totalPool": "Total Auction Pool",
        "dash.capacity": "Total capacity",
        "dash.activeBids": "Active Bids",
        "dash.soldPlayers": "Sold players",
        "dash.avgBid": "Avg. Winning Bid",
        "dash.marketAvg": "Market average",
        "dash.auctionLive": "Auction Live",
        "dash.activePart": "Active participants",
        "dash.powerCompared": "Purchasing Power Compared",
        "dash.powerSubtitle": "Relative budget density across top franchises",
        "dash.available": "Available",
        "dash.committed": "Committed",
        "dash.topTransfers": "Top Transfers",
        "dash.topTransfersSub": "Highest bids in current session",
        "dash.noTransfers": "No transfers completed yet",
        "dash.standings": "Tournament Standings",
        "dash.clubData": "CLUB DATA",
        "dash.budgetRem": "BUDGET REMAINING",
        "dash.total": "TOTAL:",
        "dash.elite": "Elite Players",
        "dash.mid": "Mid-Tier Players",
        "dash.recentAcq": "Recent Acquisitions",
        "dash.boughtFor": "Bought for",
        "dash.noAcq": "No acquisitions yet",

        // Final Report
        "report.concluded": "Tournament Concluded",
        "report.title": "Auction Results & Analysis",
        "report.subtitle": "Comprehensive breakdown of squad formations, financial efficiency, and positional depth for all participating franchises in the FIFA 26 global auction event.",
        "report.export": "Export PDF",
        "report.broadcast": "Broadcast",
        "report.highestRated": "Highest Rated Squad",
        "report.ovrRating": "OVR Rating",
        "report.marquee": "Marquee Player",
        "report.finalAssessment": "Final Squad Assessment",
        "report.squadOvr": "SQUAD OVR",
        "report.startingXI": "Starting XI Formation",
        "report.marqueeAcq": "Marquee Acquisitions",
        "report.fee": "FEE",
        "report.depth": "Positional Depth",
        "report.ledger": "Financial Ledger",
        "report.expenditure": "Total Expenditure",
        "report.costPer": "Cost Per Player (Avg)",
        "report.remaining": "Remaining Budget",
        "report.finalize": "Finalize & Archive Tournament",

        // Index/Misc
        "toast.drawFinish": "Squads filled successfully!",
        "toast.saved": "Auction saved successfully!",
        "toast.errSave": "Error saving auction",
        "toast.loaded": "Auction loaded successfully!",
        "toast.errLoad": "Error loading auction",
        "toast.added": "added to the auction queue!",
        "index.saveAuction": "Save Auction",
        "index.nameLabel": "Auction Name",
        "index.namePlace": "Ex: FIFA 26 Draft",
        "index.saveBtn": "Save",
        "index.drawTitle": "Drawing Mediano Players...",
        "index.drawSub": "Please wait while the league automatically fills all rosters with base players (Rating ≤ 82).",
        "index.footerCopy": "© 2026 EA SPORTS FIFA AUCTION. THE DIGITAL STADIUM PULSE.",
        "index.privacy": "Privacy Policy",
        "index.terms": "Terms of Service",
        "index.rules": "Auction Rules",
        "index.support": "Support"
    }
};

type Translations = typeof translations.en;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLang] = useState<Language>(() => {
        const saved = localStorage.getItem('fifa_lang');
        return (saved === 'pt' || saved === 'en') ? saved : 'pt';
    });

    const setLanguage = (lang: Language) => {
        setLang(lang);
        localStorage.setItem('fifa_lang', lang);
    };

    const t = (key: keyof Translations): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
