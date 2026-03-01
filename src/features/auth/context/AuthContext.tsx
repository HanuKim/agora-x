import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    picture?: string;
    provider: 'google' | 'kakao' | 'naver';
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => void;
    isLoginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

/**
 * AuthContext — internal context instance.
 * Do NOT import this directly outside of features/auth.
 * Use the `useAuth` hook from features/auth/hooks/useAuth instead.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const savedUser = localStorage.getItem('agora-x-auth');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('agora-x-auth', JSON.stringify(userData));
        setIsLoginModalOpen(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('agora-x-auth');
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login,
            logout,
            isLoginModalOpen,
            openLoginModal: () => setIsLoginModalOpen(true),
            closeLoginModal: () => setIsLoginModalOpen(false),
        }}>
            {children}
        </AuthContext.Provider>
    );
};
