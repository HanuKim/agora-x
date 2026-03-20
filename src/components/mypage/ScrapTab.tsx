/**
 * ScrapTab.tsx
 *
 * "스크랩한 게시물" tab: shows scraped proposals and articles
 * with category filter (전체 | 국민제안 | 국민토론 | 일대일토론).
 */

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ProposalCard } from '../proposal/ProposalCard';
import { NewsCard, type NewsCardArticle } from '../community/NewsCard';
import type { Proposal } from '../../services/db/proposalDB';
import type { ArticleScrap } from '../../services/db/gamificationDB';

type ScrapCategory = '전체' | '국민제안' | '국민토론' | '일대일토론';

const CATEGORIES: ScrapCategory[] = ['전체', '국민제안', '국민토론', '일대일토론'];

interface ScrapTabProps {
    scrapedProposals: Proposal[];
    scrapedArticles: ArticleScrap[];
    articleTitleMap: Map<number, { title: string; topic: string }>;
    /** 전체 뉴스 목록 (국민토론 섹션에서 NewsCard로 표시용) */
    newsItems?: NewsCardArticle[];
}

export const ScrapTab: React.FC<ScrapTabProps> = ({
    scrapedProposals,
    scrapedArticles,
    articleTitleMap,
    newsItems = [],
}) => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<ScrapCategory>('전체');

    const communityArticles = scrapedArticles.filter((a) => a.source === '국민토론');
    const discussionArticles = scrapedArticles.filter((a) => a.source === '일대일토론');

    /** 스크랩 순서대로 국민토론 기사를 NewsCard용 article 형태로 정렬 */
    const communityNewsCards = useMemo(() => {
        const byId = new Map(newsItems.map((n) => [n.id, n]));
        return communityArticles
            .map((a) => byId.get(a.articleId))
            .filter((n): n is NewsCardArticle => n != null);
    }, [communityArticles, newsItems]);

    const showProposals = activeCategory === '전체' || activeCategory === '국민제안';
    const showCommunity = activeCategory === '전체' || activeCategory === '국민토론';
    const showDiscussion = activeCategory === '전체' || activeCategory === '일대일토론';

    const totalCount =
        (showProposals ? scrapedProposals.length : 0) +
        (showCommunity ? communityNewsCards.length : 0) +
        (showDiscussion ? discussionArticles.length : 0);

    return (
        <div className="flex flex-col gap-lg">
            <h2 className="text-2xl font-bold text-text-primary m-0 flex items-center gap-sm">
                <span className="material-icons-round text-amber-500">bookmark</span>
                스크랩한 게시물
            </h2>

            {/* Category Filter */}
            <div className="flex gap-xs flex-wrap">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-md py-xs text-sm font-semibold rounded-full transition-all duration-200 border cursor-pointer ${
                            activeCategory === cat
                                ? 'bg-primary text-white border-primary'
                                : 'bg-bg text-text-secondary border-border hover:border-primary hover:text-primary'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {totalCount === 0 ? (
                <EmptyState
                    message="스크랩한 게시물이 없습니다"
                    icon="bookmark_border"
                    description="관심 있는 게시물을 스크랩해 보세요."
                />
            ) : (
                <div className="flex flex-col gap-xl">
                    {/* 국민제안 */}
                    {showProposals && scrapedProposals.length > 0 && (
                        <div>
                            {activeCategory === '전체' && (
                                <h3 className="text-md font-bold text-text-secondary mb-md flex items-center gap-xs">
                                    <span className="material-icons-round text-[16px]">description</span>
                                    국민제안
                                </h3>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                {scrapedProposals.map((p) => (
                                    <ProposalCard
                                        key={p.id}
                                        proposal={p}
                                        onClick={() => navigate(`/proposals/${p.id}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 국민토론 기사 — Community와 동일한 NewsCard 사용 */}
                    {showCommunity && communityNewsCards.length > 0 && (
                        <div>
                            {activeCategory === '전체' && (
                                <h3 className="text-md font-bold text-text-secondary mb-md flex items-center gap-xs">
                                    <span className="material-icons-round text-[16px]">forum</span>
                                    국민토론
                                </h3>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                                {communityNewsCards.map((article) => (
                                    <NewsCard
                                        key={article.id}
                                        article={article}
                                        showAI={false}
                                        onClick={() => navigate(`/detail/${article.id}`)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 일대일토론 기사 */}
                    {showDiscussion && discussionArticles.length > 0 && (
                        <div>
                            {activeCategory === '전체' && (
                                <h3 className="text-sm font-bold text-text-secondary mb-md flex items-center gap-xs">
                                    <span className="material-icons-round text-[16px]">smart_toy</span>
                                    일대일토론
                                </h3>
                            )}
                            <div className="flex flex-col gap-sm">
                                {discussionArticles.map((a) => {
                                    const info = articleTitleMap.get(a.articleId);
                                    return (
                                        <Card
                                            key={a.id}
                                            className="p-md cursor-pointer hover:-translate-y-[1px] hover:shadow-md transition-all"
                                            onClick={() => navigate(`/ai-discussion/${a.articleId}`)}
                                        >
                                            <p className="text-sm font-bold text-text-primary m-0 line-clamp-1">
                                                {info?.title ?? `주제 #${a.articleId}`}
                                            </p>
                                            <p className="text-xs text-text-secondary mt-xs m-0">
                                                {info?.topic ?? '일대일토론'}
                                            </p>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
