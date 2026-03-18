import type { ContentCategory } from '../features/common/types';

/**
 * categoryColors.ts — 카테고리 색상
 * 국민 제안, 토론 연습 등 앱 전반에서 사용되는 카테고리 색상 및 뱃지 스타일.
 */

export const getCategoryColorClass = (category: ContentCategory | string) => {
    switch (category) {
        case '정치': return 'bg-blue-500/10 text-blue-500 border-blue-500/30 hover:border-blue-500';
        case '경제': return 'bg-green-500/10 text-green-500 border-green-500/30 hover:border-green-500';
        case '사회': return 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:border-amber-500';
        case '국제': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 hover:border-indigo-500';
        case '문화': return 'bg-pink-500/10 text-pink-500 border-pink-500/30 hover:border-pink-500';
        case '기술': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30 hover:border-cyan-500';
        case '기타': return 'bg-gray-500/10 text-gray-500 border-gray-500/30 hover:border-gray-500';
        default: return 'bg-surface text-text-secondary border-border hover:border-text-secondary hover:text-text-primary';
    }
};

export const getActiveCategoryColorClass = (category: ContentCategory | string) => {
    switch (category) {
        case '정치': return 'bg-blue-500 text-white border-blue-500';
        case '경제': return 'bg-green-500 text-white border-green-500';
        case '사회': return 'bg-amber-500 text-white border-amber-500';
        case '국제': return 'bg-indigo-500 text-white border-indigo-500';
        case '문화': return 'bg-pink-500 text-white border-pink-500';
        case '기술': return 'bg-cyan-500 text-white border-cyan-500';
        case '기타': return 'bg-gray-500 text-white border-gray-500';
        default: return 'bg-text-primary text-bg border-text-primary';
    }
};

export const DEFAULT_CATEGORY_BADGE = 'bg-surface text-text-secondary';

/**
 * Returns the Tailwind badge class for a given category string.
 * Falls back to `DEFAULT_CATEGORY_BADGE` if the category is not mapped.
 */
export function getCategoryBadgeClass(category: ContentCategory | string): string {
    return getCategoryColorClass(category);
}
