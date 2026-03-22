import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MusicContextData {
    isMuted: boolean;
    toggleMute: () => void;
    setMuted: (muted: boolean) => void;
}

const MusicContext = createContext<MusicContextData>({} as MusicContextData);

export function MusicProvider({ children }: { children: ReactNode }) {
    // Start muted by default to comply with browser autoplay policies
    const [isMuted, setIsMuted] = useState(true);

    const toggleMute = () => setIsMuted(prev => !prev);
    const setMuted = (muted: boolean) => setIsMuted(muted);

    return (
        <MusicContext.Provider value={{ isMuted, toggleMute, setMuted }}>
            {children}
        </MusicContext.Provider>
    );
}

export function useMusic() {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
}
