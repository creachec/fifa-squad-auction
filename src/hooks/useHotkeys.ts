import { useEffect } from 'react';

export function useHotkeys(keys: string | string[], callback: (e: KeyboardEvent) => void) {
    useEffect(() => {
        const keyArray = Array.isArray(keys) ? keys : [keys];

        const handler = (e: KeyboardEvent) => {
            const activeTag = document.activeElement?.tagName;

            // se estiver digitando em um input de texto, ignoramos
            if (activeTag === 'INPUT' && (document.activeElement as HTMLInputElement).type !== 'number') {
                return;
            }

            if (keyArray.includes(e.key)) {
                // Prevent default browser behavior for these specific keys
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ') {
                    e.preventDefault();
                }
                callback(e);
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [keys, callback]);
}
