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

function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return String(Math.abs(hash));
}

function stableUserIdKey(provider: User['provider'], email: string) {
    return `agora-x-stable-user-id:${provider}:${email}`;
}

function isLikelyUnstableId(userId: string, provider: User['provider']) {
    // Fallback login paths used `kakao-${Date.now()}` / `naver-${Date.now()}`
    if (provider === 'kakao' && /^kakao-\d+$/.test(userId)) return true;
    if (provider === 'naver' && /^naver-\d+$/.test(userId)) return true;
    return false;
}

function ensureStableUserId(userData: User): User {
    const email = (userData.email ?? '').trim();
    const provider = userData.provider;
    if (!email) return userData;

    const key = stableUserIdKey(provider, email);
    const stored = localStorage.getItem(key);

    // Prefer already-established stable id for this provider+email
    if (stored) {
        return { ...userData, id: stored };
    }

    // If incoming id is stable-looking, adopt it as the stable id
    if (userData.id && !isLikelyUnstableId(userData.id, provider)) {
        localStorage.setItem(key, userData.id);
        return userData;
    }

    // Otherwise generate deterministic local id from provider+email
    const generated = `local-${provider}-${hashString(`${provider}:${email}`)}`;
    localStorage.setItem(key, generated);
    return { ...userData, id: generated };
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
            if (!savedUser) return null;
            const parsed = JSON.parse(savedUser) as User;
            // Migrate to stable id if needed
            const stabilized = ensureStableUserId(parsed);
            if (stabilized.id !== parsed.id) {
                localStorage.setItem('agora-x-auth', JSON.stringify(stabilized));
            }
            return stabilized;
        } catch {
            return null;
        }
    });
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const login = (userData: User) => {
        const stabilized = ensureStableUserId(userData);
        setUser(stabilized);
        localStorage.setItem('agora-x-auth', JSON.stringify(stabilized));
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
