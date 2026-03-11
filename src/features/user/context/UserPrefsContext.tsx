/**
 * UserPrefsContext
 *
 * 사용자 분야별 지식 수준(상/중/하) 전역 상태를 관리합니다.
 *
 * 역할 (features/ 규칙 준수):
 * - React Context & Provider 정의
 * - localStorage 영속화
 * - 지식 수준 변경 시 관련 IndexedDB 캐시 무효화
 */

import React, { createContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import {
    DEFAULT_KNOWLEDGE_PREFS,
    type KnowledgeLevel,
    type UserKnowledgePrefs,
} from '../types';
import type { ContentCategory } from '../../common/types';
import { invalidateCategoryCache } from '../../../services/ai/aiCacheDB';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPrefsContextType {
    /** 분야별 지식 수준 맵 */
    knowledgePrefs: UserKnowledgePrefs;
    /**
     * 특정 분야의 지식 수준을 변경합니다.
     * 변경 즉시 해당 분야의 IndexedDB 캐시를 무효화합니다.
     */
    setKnowledgeLevel: (category: ContentCategory, level: KnowledgeLevel) => void;
    /** 특정 분야의 지식 수준 조회 헬퍼 */
    getLevelForCategory: (category: ContentCategory) => KnowledgeLevel;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const UserPrefsContext = createContext<UserPrefsContextType | undefined>(undefined);

// ─── Storage key ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'agora-x-knowledge-prefs';

function loadPrefsFromStorage(): UserKnowledgePrefs {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ...DEFAULT_KNOWLEDGE_PREFS };
        return { ...DEFAULT_KNOWLEDGE_PREFS, ...(JSON.parse(raw) as Partial<UserKnowledgePrefs>) };
    } catch {
        return { ...DEFAULT_KNOWLEDGE_PREFS };
    }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const UserPrefsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [knowledgePrefs, setKnowledgePrefs] = useState<UserKnowledgePrefs>(loadPrefsFromStorage);

    const setKnowledgeLevel = useCallback(
        async (category: ContentCategory, level: KnowledgeLevel) => {
            setKnowledgePrefs((prev) => {
                const next = { ...prev, [category]: level };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
                return next;
            });

            // 해당 분야 IndexedDB 캐시 무효화 → 다음 접근 시 재호출됨
            await invalidateCategoryCache(category);
            console.info(`[UserPrefs] "${category}" 지식 수준 → "${level}" 변경, 캐시 초기화 완료`);
        },
        [],
    );

    const getLevelForCategory = useCallback(
        (category: ContentCategory): KnowledgeLevel => {
            return knowledgePrefs[category] ?? 'medium';
        },
        [knowledgePrefs],
    );

    return (
        <UserPrefsContext.Provider
            value={{ knowledgePrefs, setKnowledgeLevel, getLevelForCategory }}
        >
            {children}
        </UserPrefsContext.Provider>
    );
};
