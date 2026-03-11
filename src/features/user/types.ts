/**
 * User preference types for knowledge level personalization.
 *
 * KnowledgeLevel drives:
 * 1. Claude API prompt depth/complexity
 * 2. IndexedDB cache key suffix  (type:id:level)
 * 3. Cache invalidation on level change
 */

/** 분야별 지식 수준 */
export type KnowledgeLevel = 'high' | 'medium' | 'low';

/** UI 표시 레이블 */
export const KNOWLEDGE_LEVEL_LABELS: Record<KnowledgeLevel, string> = {
    high: '상 (전문가)',
    medium: '중 (일반인)',
    low: '하 (입문자)',
};

import type { ContentCategory } from '../common/types';

/** 모든 분야에 대한 지식 수준 맵 */
export type UserKnowledgePrefs = Record<ContentCategory, KnowledgeLevel>;

/** 기본 지식 수준 (신규 사용자) */
export const DEFAULT_KNOWLEDGE_PREFS: UserKnowledgePrefs = {
    정치: 'medium',
    경제: 'medium',
    사회: 'medium',
    국제: 'medium',
    문화: 'medium',
    기술: 'medium',
    기타: 'medium',
};

/**
 * 뉴스 기사 middle_code_nm → ContentCategory 매핑.
 * 알 수 없는 값은 '기타'로 fallback.
 */
export function mapToContentCategory(raw: string): ContentCategory {
    const map: Record<string, ContentCategory> = {
        정치: '정치',
        경제: '경제',
        사회: '사회',
        국제: '국제',
        문화: '문화',
        IT: '기술',
        과학: '기술',
        기술: '기술',
    };
    return map[raw] ?? '기타';
}
