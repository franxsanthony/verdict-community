'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    isVerified: boolean;
    lastLogin: string;
    createdAt: string;
    role: string;
    profile_picture?: string | null;
}

interface AuthContextType {
    user: User | null;
    profile: any | null; // Application profile
    loading: boolean;
    isAuthenticated: boolean;
    login: (token: string, redirectUrl?: string) => void;
    logout: () => void;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, initialToken }: { children: React.ReactNode; initialToken?: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    const refreshSession = async () => {
        // [CLEANUP] /api/auth/me endpoint was removed. 
        // Disabling session check to prevent 404s.
        // TODO: Re-implement using Supabase Client if client-side auth is needed.
        setLoading(false);
        setUser(null);
        setProfile(null);
    };

    useEffect(() => {
        // If initialToken is provided (SSR), strictly we might verify it, but usually we just fetch /me
        // to get the user details.
        // We can optimistically assume logged in if we wanted, but explicit fetch is safer.
        refreshSession();
    }, []);

    const login = (token: string, redirectUrl = '/dashboard') => {
        // In a cookie-based system, the token is usually set by the server (httpOnly) or via document.cookie.
        // If passed here, we might set it manually if it's not httpOnly, but our system seems to use cookies.
        // We'll assume the caller handled cookie setting or the API did.
        // We just refresh session and redirect.
        refreshSession().then(() => {
            router.push(redirectUrl);
        });
    };

    const logout = async () => {
        try {
            // Call logout API
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error', e);
        }
        setUser(null);
        setProfile(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            isAuthenticated: !!user,
            login,
            logout,
            refreshSession
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
