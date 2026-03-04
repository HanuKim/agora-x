/**
 * useUserPrefs hook
 *
 * UserPrefsContext를 소비하는 훅입니다.
 * 반드시 UserPrefsProvider 하위에서만 사용 가능합니다.
 *
 * 사용 예:
 * ```ts
 * const { getLevelForCategory, setKnowledgeLevel } = useUserPrefs();
 * const level = getLevelForCategory('경제');
 * ```
 */

import { useContext } from 'react';
import { UserPrefsContext } from '../context/UserPrefsContext';

export function useUserPrefs() {
    const ctx = useContext(UserPrefsContext);
    if (!ctx) {
        throw new Error('useUserPrefs must be used within UserPrefsProvider');
    }
    return ctx;
}
