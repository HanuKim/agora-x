/**
 * useNewsWithAISummary — Cache-First Edition (v2)
 *
 * 변경 사항:
 * - IndexedDB 캐시 우선 조회 → 캐시 미스 시에만 Claude API 호출
 * - 지식 수준(KnowledgeLevel)을 캐시 키와 프롬프트에 반영
 * - 지식 수준 변경(UserPrefsContext) 시 캐시 무효화 → 자동 재호출
 *
 * @param limit - 처리할 기사 수 (기본값: undefined = 전체). Home에서는 9, 전체 목록에서는 제한 없음.
 */
import { useEffect, useMemo, useState } from 'react';
import rawNewsData from '../../data/selectedNews.json';
import { claudeService, type NewsAISummary } from '../../services/ai/claudeService';
import { getCachedAIResult, setCachedAIResult, cacheKey } from '../../services/ai/aiCacheDB';
import { useUserPrefs } from '../user/hooks/useUserPrefs';
import { mapToContentCategory } from '../user/types';

export interface NewsArticle {
    id: number;
    title: string;
    summary: string;
    topic: string;
    category: string;
    imageUrl: string | null;
    commentCount: number;
    regDt: string;
    articleUrl: string;
}

export interface NewsWithAI extends NewsArticle {
    aiSummary: NewsAISummary;
    aiLoading: boolean;
}

const rawArticles = (rawNewsData as { selectedNews: Record<string, unknown>[] }).selectedNews;

function parseArticles(data: Record<string, unknown>[]): NewsArticle[] {
    return data.map((item, idx) => {
        const article = item.article as Record<string, unknown>;
        const summary = item.article_summary as Record<string, string>;
        const categories = item.categories as Array<Record<string, string>> | undefined;
        const images = item.images as Array<{ image_url: string }> | undefined;
        const comments = item.comments as unknown[] | undefined;

        return {
            id: idx + 1,
            title: (article?.title as string) ?? '',
            summary: summary?.summary ?? '',
            topic: (item.topic as string) ?? '',
            category: categories?.[0]?.middle_code_nm ?? '기타',
            imageUrl: images?.[0]?.image_url ?? null,
            commentCount: comments?.length ?? 0,
            regDt: (article?.reg_dt as string) ?? '',
            articleUrl: (item.article_url as string) ?? '',
        };
    });
}

const allParsedArticles = parseArticles(rawArticles);

export function useNewsWithAISummary(limit?: number) {
    const { getLevelForCategory, knowledgePrefs } = useUserPrefs();

    const articlesToProcess = useMemo(
        () => (limit !== undefined ? allParsedArticles.slice(0, limit) : allParsedArticles),
        [limit],
    );

    const [items, setItems] = useState<NewsWithAI[]>(() =>
        articlesToProcess.map((a) => ({
            ...a,
            aiSummary: { overview: a.summary.slice(0, 80) || a.topic, debateTopic: a.topic },
            aiLoading: true,
        })),
    );

    // knowledgePrefs가 바뀌면 items를 loading 상태로 리셋 후 재조회
    useEffect(() => {
        setItems(
            articlesToProcess.map((a) => ({
                ...a,
                aiSummary: { overview: a.summary.slice(0, 80) || a.topic, debateTopic: a.topic },
                aiLoading: true,
            })),
        );
    }, [knowledgePrefs, articlesToProcess]);

    useEffect(() => {
        let cancelled = false;

        const fetchSummaries = async () => {
            await Promise.allSettled(
                articlesToProcess.map(async (article, idx) => {
                    const contentCategory = mapToContentCategory(article.category);
                    const level = getLevelForCategory(contentCategory);
                    const key = cacheKey.news(article.id, contentCategory, level);

                    // 1. 캐시 우선 조회
                    const cached = await getCachedAIResult<NewsAISummary>(key);
                    if (cached) {
                        if (!cancelled) {
                            setItems((prev) =>
                                prev.map((item, i) =>
                                    i === idx ? { ...item, aiSummary: cached, aiLoading: false } : item,
                                ),
                            );
                        }
                        return;
                    }

                    // 2. 캐시 미스 → Claude API 호출
                    const aiSummary = await claudeService.generateNewsAISummary(
                        article.topic,
                        article.summary,
                        level,
                    );

                    // 3. 결과 캐싱
                    await setCachedAIResult(key, aiSummary);

                    if (!cancelled) {
                        setItems((prev) =>
                            prev.map((item, i) =>
                                i === idx ? { ...item, aiSummary, aiLoading: false } : item,
                            ),
                        );
                    }
                }),
            );
        };

        fetchSummaries();

        return () => {
            cancelled = true;
        };
        // knowledgePrefs 변경 시 재실행
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [knowledgePrefs, limit]);

    return { items };
}
