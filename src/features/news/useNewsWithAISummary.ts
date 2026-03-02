/**
 * useNewsWithAISummary
 *
 * Feature hook: news/ 폴더의 비즈니스 로직 담당.
 * selectedNews.json을 로드하고 각 기사에 대해 Claude AI 요약을 생성합니다.
 *
 * @param limit - 처리할 기사 수 (기본값: undefined = 전체). Home에서는 9, 전체 목록에서는 제한 없음.
 */
import { useEffect, useState } from 'react';
import rawNewsData from '../../data/selectedNews.json';
import { claudeService, type NewsAISummary } from '../../services/ai/claudeService';

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

export function useNewsWithAISummary(limit?: number) {
    const allArticles = parseArticles(rawArticles);
    const articlesToProcess = limit !== undefined ? allArticles.slice(0, limit) : allArticles;

    const [items, setItems] = useState<NewsWithAI[]>(
        articlesToProcess.map((a) => ({
            ...a,
            aiSummary: { overview: a.summary.slice(0, 80) || a.topic, debateTopic: a.topic },
            aiLoading: true,
        }))
    );

    useEffect(() => {
        let cancelled = false;

        const fetchSummaries = async () => {
            await Promise.allSettled(
                articlesToProcess.map(async (article, idx) => {
                    const aiSummary = await claudeService.generateNewsAISummary(
                        article.topic,
                        article.summary
                    );
                    if (!cancelled) {
                        setItems((prev) =>
                            prev.map((item, i) =>
                                i === idx ? { ...item, aiSummary, aiLoading: false } : item
                            )
                        );
                    }
                })
            );
        };

        fetchSummaries();

        return () => {
            cancelled = true;
        };
        // articlesToProcess 내용이 변하지 않으므로 limit 변화에만 반응
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit]);

    return { items };
}
