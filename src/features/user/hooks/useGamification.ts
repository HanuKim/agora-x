/**
 * useGamification.ts
 *
 * Hook for user XP, level, and manner score.
 * Business logic only — no UI rendering.
 */

import { useState, useCallback } from 'react';
import {
    getUserLevel,
    addXP as dbAddXP,
    initUserLevelIfNeeded,
    LEVEL_THRESHOLDS,
    type UserLevel,
} from '../../../services/db/gamificationDB';

export function useGamification() {
    const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchUserLevel = useCallback(async (userId: string) => {
        setLoading(true);
        try {
            const data = await getUserLevel(userId);
            setUserLevel(data);
            return data;
        } finally {
            setLoading(false);
        }
    }, []);

    const initLevel = useCallback(async (userId: string) => {
        const data = await initUserLevelIfNeeded(userId);
        setUserLevel(data);
        return data;
    }, []);

    const addXP = useCallback(
        async (userId: string, amount: number) => {
            const result = await dbAddXP(userId, amount);
            setUserLevel(result.userLevel);
            return result;
        },
        []
    );

    const getLevelInfo = useCallback((level: number) => {
        return LEVEL_THRESHOLDS.find((t) => t.level === level) ?? LEVEL_THRESHOLDS[0];
    }, []);

    const getProgressToNextLevel = useCallback((xp: number, level: number) => {
        const current = LEVEL_THRESHOLDS.find((t) => t.level === level);
        const next = LEVEL_THRESHOLDS.find((t) => t.level === level + 1);
        if (!current) return 100;
        if (!next) return 100; // Max level
        const totalNeeded = next.minXP - current.minXP;
        const progress = xp - current.minXP;
        return Math.min(100, Math.round((progress / totalNeeded) * 100));
    }, []);

    return {
        userLevel,
        loading,
        fetchUserLevel,
        initLevel,
        addXP,
        getLevelInfo,
        getProgressToNextLevel,
    };
}
