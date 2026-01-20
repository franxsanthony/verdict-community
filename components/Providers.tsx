'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import ModelPreloader from './ModelPreloader';

interface ProvidersProps {
    children: ReactNode;
    initialToken?: string;
}

export default function Providers({ children, initialToken }: ProvidersProps) {
    return (
        <LanguageProvider>
            <AuthProvider initialToken={initialToken}>
                <ModelPreloader />
                {children}
            </AuthProvider>
        </LanguageProvider>
    );
}
