/**
 * useIssueWithAI — 한국 사회 토론 이슈 AI 분석 훅 (Cache-First)
 *
 * koreanSocialIssues.json 이슈 목록을 로드하고,
 * 선택된 이슈에 대해 지식 수준 맞춤 AI 분석을 생성/캐싱합니다.
 *
 * 캐시 전략:
 * - IndexedDB 조회 우선 (TTL 7일)
 * - 캐시 미스: Claude API 호출 → IndexedDB 저장
 * - 지식 수준 변경(UserPrefsContext) 시 캐시 무효화 → 재호출
 */

import { useCallback, useState, useEffect } from 'react';
import issuesData from '../../data/koreanSocialIssues.json';
import { claudeService, type IssueAIAnalysis } from '../../services/ai/claudeService';
import { getCachedAIResult, setCachedAIResult, cacheKey } from '../../services/ai/aiCacheDB';
import { useUserPrefs } from '../user/hooks/useUserPrefs';
import { mapToContentCategory } from '../user/types';

export interface SocialIssue {
    id: number;
    topic: string;
    category: string;
    pro: string[];
    con: string[];
}

const allIssues: SocialIssue[] = (
    issuesData as { title: string; issues: SocialIssue[] }
).issues;

export interface IssueWithAI extends SocialIssue {
    aiAnalysis: IssueAIAnalysis | null;
    aiLoading: boolean;
}

export function useIssueWithAI() {
    const { getLevelForCategory } = useUserPrefs();

    // 개별 이슈 AI 분석 상태 (선택된 이슈만 on-demand 로드)
    const [analysisMap, setAnalysisMap] = useState<Record<number, IssueAIAnalysis | null>>({});
    const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

    /**
     * 특정 이슈의 AI 분석을 가져옵니다 (캐시-퍼스트).
     * DiscussionAI 상세 페이지에서 선택 시 호출합니다.
     */
    const fetchIssueAnalysis = useCallback(
        async (issue: SocialIssue) => {
            const contentCategory = mapToContentCategory(issue.category);
            const level = getLevelForCategory(contentCategory);
            const key = cacheKey.issue(issue.id, contentCategory, level);

            // 이미 성공적으로 로드됨 → 스킵 (null은 실패이므로 재시도 허용)
            if (analysisMap[issue.id] !== undefined && analysisMap[issue.id] !== null) return;

            setLoadingMap((prev) => ({ ...prev, [issue.id]: true }));

            // 1. 캐시 우선 조회
            const cached = await getCachedAIResult<IssueAIAnalysis>(key);
            if (cached) {
                setAnalysisMap((prev) => ({ ...prev, [issue.id]: cached }));
                setLoadingMap((prev) => ({ ...prev, [issue.id]: false }));
                return;
            }

            // 2. 캐시 미스 → Claude API 호출
            try {
                const analysis = await claudeService.generateIssueAIAnalysis(
                    issue.topic,
                    issue.category,
                    issue.pro,
                    issue.con,
                    level,
                );

                // 3. 캐싱
                await setCachedAIResult(key, analysis);
                setAnalysisMap((prev) => ({ ...prev, [issue.id]: analysis }));
            } catch (e) {
                console.warn('[useIssueWithAI] AI 분석 실패, fallback 사용:', e);
                setAnalysisMap((prev) => ({ ...prev, [issue.id]: null }));
            } finally {
                setLoadingMap((prev) => ({ ...prev, [issue.id]: false }));
            }
        },
        [getLevelForCategory, analysisMap],
    );

    /**
     * 지식 수준 변경 후 특정 이슈의 캐시를 리셋하고 재조회합니다.
     * UserPrefsContext의 invalidateCategoryCache와 연동됩니다.
     */
    const resetIssueCache = useCallback((issueId: number) => {
        setAnalysisMap((prev) => {
            const next = { ...prev };
            delete next[issueId];
            return next;
        });
    }, []);

    return {
        /** 전체 이슈 목록 (원본 JSON 데이터) */
        issues: allIssues,
        /** issue.id → AI 분석 매핑 */
        analysisMap,
        /** issue.id → 로딩 상태 매핑 */
        loadingMap,
        /** 특정 이슈의 AI 분석을 가져오는 함수 (on-demand) */
        fetchIssueAnalysis,
        /** 캐시 리셋 */
        resetIssueCache,
    };
}

/**
 * 특정 이슈에 대한 50자 내외의 짧은 설명을 가져오는 훅 (캐시 지원)
 */
export function useIssueSummary(issue: SocialIssue) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        const fetchSummary = async () => {
            const cacheKeyStr = cacheKey.issue(issue.id, issue.category, 'short_summary');

            try {
                // 1. Check cache
                const cached = await getCachedAIResult<string>(cacheKeyStr);
                if (cached) {
                    if (isMounted) {
                        setSummary(cached);
                        setLoading(false);
                    }
                    return;
                }

                // 2. Fetch from AI
                const result = await claudeService.generateIssueSummary(issue.topic, issue.category);

                // 3. Save to cache
                if (result) {
                    await setCachedAIResult(cacheKeyStr, result);
                    if (isMounted) {
                        setSummary(result);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch issue summary:', err);
                if (isMounted) setSummary('이 이슈에 대한 주요 쟁점을 확인해보세요.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchSummary();

        return () => {
            isMounted = false;
        };
    }, [issue.id, issue.topic, issue.category]);

    return { summary, loading };
}
