'use client';

import React, { createContext, useContext } from 'react';

type Language = 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: string) => string;
    dir: 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // English only - no state needed
    const language: Language = 'en';

    const setLanguage = () => {
        // No-op: English only
    };

    const toggleLanguage = () => {
        // No-op: English only
    };

    const t = (key: string) => key;

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            toggleLanguage,
            t,
            dir: 'ltr'
        }}>
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
