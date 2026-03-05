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
import { claudeService, type IssueAIAnalysis, type NewsAISummary } from '../../services/ai/claudeService';
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
    issueAnalysis: IssueAIAnalysis;
    issueLoading: boolean;
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

/** 캐시된 데이터가 예전 형식(논거별 요약 누락 등)이어도 현재 형식으로 맞춤 */
function normalizeNewsAISummary(cached: Partial<NewsAISummary> & { overview?: string; debateTopic?: string }): NewsAISummary {
    const pro = Array.isArray(cached.proArguments) ? cached.proArguments.slice(0, 2).map((s) => String(s).trim()) : [];
    const con = Array.isArray(cached.conArguments) ? cached.conArguments.slice(0, 2).map((s) => String(s).trim()) : [];
    const proSummaries = Array.isArray(cached.proArgumentSummaries)
        ? cached.proArgumentSummaries.slice(0, 2).map((s) => String(s).trim())
        : [];
    const conSummaries = Array.isArray(cached.conArgumentSummaries)
        ? cached.conArgumentSummaries.slice(0, 2).map((s) => String(s).trim())
        : [];
    return {
        overview: cached.overview?.trim() ?? '',
        debateTopic: cached.debateTopic?.trim() ?? '',
        proArguments: pro,
        conArguments: con,
        proArgumentSummaries: proSummaries,
        conArgumentSummaries: conSummaries,
    };
}

export function useNewsWithAISummary(limit?: number, issueAnalysisForId?: number) {
    const { getLevelForCategory, knowledgePrefs } = useUserPrefs();

    const articlesToProcess = useMemo(
        () => (limit !== undefined ? allParsedArticles.slice(0, limit) : allParsedArticles),
        [limit],
    );

    const [items, setItems] = useState<NewsWithAI[]>(() =>
        articlesToProcess.map((a) => ({
            ...a,
            aiSummary: {
                overview: a.summary.slice(0, 80) || a.topic,
                debateTopic: a.topic,
                proArguments: [],
                conArguments: [],
                proArgumentSummaries: [],
                conArgumentSummaries: [],
            },
            aiLoading: true,
            issueAnalysis: {
                background: `${a.topic}에 관한 한국 사회의 주요 쟁점입니다.`,
                keyPoints: [a.topic],
                proArguments: [],
                conArguments: [],
            },
            issueLoading: issueAnalysisForId !== undefined && a.id === issueAnalysisForId,
        })),
    );

    // knowledgePrefs가 바뀌면 items를 loading 상태로 리셋 후 재조회
    useEffect(() => {
        setItems(
            articlesToProcess.map((a) => ({
                ...a,
                aiSummary: {
                    overview: a.summary.slice(0, 80) || a.topic,
                    debateTopic: a.topic,
                    proArguments: [],
                    conArguments: [],
                    proArgumentSummaries: [],
                    conArgumentSummaries: [],
                },
                aiLoading: true,
                issueAnalysis: {
                    background: `${a.topic}에 관한 한국 사회의 주요 쟁점입니다.`,
                    keyPoints: [a.topic],
                    proArguments: [],
                    conArguments: [],
                },
                issueLoading: issueAnalysisForId !== undefined && a.id === issueAnalysisForId,
            })),
        );
    }, [knowledgePrefs, articlesToProcess, issueAnalysisForId]);

    useEffect(() => {
        let cancelled = false;

        const fetchSummaries = async () => {
            await Promise.allSettled(
                articlesToProcess.map(async (article, idx) => {
                    const contentCategory = mapToContentCategory(article.category);
                    const level = getLevelForCategory(contentCategory);
                    const newsKey = cacheKey.news(article.id, contentCategory, level);
                    const shouldFetchIssue = issueAnalysisForId !== undefined && article.id === issueAnalysisForId;
                    const issueKey = shouldFetchIssue ? cacheKey.issue(article.id, contentCategory, level) : null;

                    const cachedNewsPromise = getCachedAIResult<NewsAISummary>(newsKey);
                    const cachedIssuePromise = shouldFetchIssue && issueKey
                        ? getCachedAIResult<IssueAIAnalysis>(issueKey)
                        : Promise.resolve(null);
                    const [cachedNews, cachedIssue] = await Promise.all([cachedNewsPromise, cachedIssuePromise]);

                    const upsertNews = (aiSummary: NewsAISummary, aiLoading: boolean) => {
                        if (cancelled) return;
                        setItems((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, aiSummary, aiLoading } : item)),
                        );
                    };

                    const upsertIssue = (issueAnalysis: IssueAIAnalysis, issueLoading: boolean) => {
                        if (cancelled) return;
                        setItems((prev) =>
                            prev.map((item, i) =>
                                i === idx ? { ...item, issueAnalysis, issueLoading } : item,
                            ),
                        );
                    };

                    let aiSummary: NewsAISummary;
                    if (cachedNews) {
                        aiSummary = normalizeNewsAISummary(cachedNews);
                        upsertNews(aiSummary, false);
                    } else {
                        // 캐시 미스 → Claude API 호출
                        aiSummary = await claudeService.generateNewsAISummary(article.topic, article.summary, level);
                        await setCachedAIResult(newsKey, aiSummary);
                        upsertNews(aiSummary, false);
                    }

                    if (!shouldFetchIssue) {
                        return;
                    }

                    if (cachedIssue) {
                        upsertIssue(cachedIssue, false);
                        return;
                    }

                    const issueAnalysis = await claudeService.generateIssueAIAnalysis(
                        article.topic,
                        contentCategory,
                        aiSummary.proArguments,
                        aiSummary.conArguments,
                        level,
                    );

                    if (issueKey) {
                        await setCachedAIResult(issueKey, issueAnalysis);
                    }
                    upsertIssue(issueAnalysis, false);
                }),
            );
        };

        fetchSummaries();

        return () => {
            cancelled = true;
        };
        // knowledgePrefs 변경 시 재실행
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [knowledgePrefs, limit, issueAnalysisForId]);

    return { items };
}
