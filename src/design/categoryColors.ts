/**
 * categoryColors.ts — AI 토론 주제 카테고리 색상
 *
 * Single source of truth for all `koreanSocialIssues.json` category → Tailwind class mappings.
 * Consumed by: IssueCard, DiscussionAI, Home.
 *
 * Usage:
 *   import { getCategoryBadgeClass } from '../../design/categoryColors';
 *   <span className={getCategoryBadgeClass(issue.category)}>...</span>
 */

export const CATEGORY_COLORS: Record<string, string> = {
    '사법/인권': 'bg-[#8b5cf6]/10 text-[#8b5cf6]',
    '여성/보건': 'bg-[#ec4899]/10 text-[#ec4899]',
    '성소수자/인권': 'bg-danger/10 text-danger',
    '노동/경제': 'bg-warning/10 text-warning',
    '교육': 'bg-success/10 text-success',
    '에너지/환경': 'bg-[#22c55e]/10 text-[#22c55e]',
    '다문화/인권': 'bg-[#06b6d4]/10 text-[#06b6d4]',
    '교육/디지털': 'bg-[#3b82f6]/10 text-[#3b82f6]',
    '복지/경제': 'bg-[#6366f1]/10 text-[#6366f1]',
    '안보/군사': 'bg-[#64748b]/10 text-[#64748b]',
    '젠더/행정': 'bg-[#d946ef]/10 text-[#d946ef]',
    '부동산/경제': 'bg-[#f97316]/10 text-[#f97316]',
    '의료/교육': 'bg-[#14b8a6]/10 text-[#14b8a6]',
    '디지털/인권': 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
    '의료/복지': 'bg-[#84cc16]/10 text-[#84cc16]',
    '보건/법률': 'bg-[#a78bfa]/10 text-[#a78bfa]',
    '노동/고령화': 'bg-[#fb923c]/10 text-[#fb923c]',
    '기술/세금': 'bg-[#34d399]/10 text-[#34d399]',
    '생명윤리/의료': 'bg-danger/10 text-danger',
};

export const DEFAULT_CATEGORY_BADGE = 'bg-surface text-text-secondary';

/**
 * Returns the Tailwind badge class for a given category string.
 * Falls back to `DEFAULT_CATEGORY_BADGE` if the category is not mapped.
 */
export function getCategoryBadgeClass(category: string): string {
    return CATEGORY_COLORS[category] ?? DEFAULT_CATEGORY_BADGE;
}
