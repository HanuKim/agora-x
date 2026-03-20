/**
 * NewsCard — 커뮤니티용 뉴스 기사 카드
 *
 * 사용처:
 *  - Home.tsx      ("진행 중인 국민 토론" 섹션, AI 요약 포함)
 *  - Community.tsx (뉴스 그리드 전체 목록)
 *
 * Props:
 *  - article   : 기사 데이터
 *  - onClick   : 카드 클릭 핸들러
 *  - showAI    : true → AI 개요 + 토론 주제 박스 표시 (Home용). 기본값 false
 */
import React from 'react';
import type { ContentCategory } from '../../features/common/types';
import { getActiveCategoryColorClass } from '../../design/categoryColors';

export interface NewsCardArticle {
    id: number;
    title: string;
    summary: string;
    topic: string;
    category: ContentCategory;
    imageUrl: string | null;
    commentCount: number;
    regDt: string;
    url?: string;
    /** AI 생성 요약 (showAI=true 일 때 사용) */
    aiSummary?: {
        overview: string;
        debateTopic: string;
    };
    aiLoading?: boolean;
}

interface NewsCardProps {
    article: NewsCardArticle;
    onClick: () => void;
    /** showAI=true: AI 개요·토론 주제 박스 포함 (Home 전용). false: Community 스타일 */
    showAI?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onClick, showAI }) => {
    return (
        <div
            className="flex flex-col bg-bg rounded-[1.25rem] border border-border overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            onClick={onClick}
        >
            {/* ── Image ─────────────────────────────── */}
            {article.imageUrl ? (
                <div className="relative h-[200px] w-full overflow-hidden">
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getActiveCategoryColorClass(article.category)}`}>
                            {article.category}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="relative h-[200px] bg-surface flex items-center justify-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getActiveCategoryColorClass(article.category)} absolute top-3 left-3`}>
                        {article.category}
                    </span>
                    <span className="text-4xl opacity-20">📰</span>
                </div>
            )}

            {/* ── Body ──────────────────────────────── */}
            <div className="p-lg flex flex-col flex-1">
                <h3 className="h-[45px] text-lg font-bold mb-md leading-snug line-clamp-2">
                    {article.title}
                </h3>

                {showAI && article.aiSummary ? (
                    <>
                        {/* AI 개요 박스 */}
                        <div className="p-md bg-surface rounded-lg mb-md border border-border">
                            <div className="flex items-center gap-xs mb-xs">
                                <span className="text-xs font-bold text-primary uppercase tracking-wide">
                                    ✦ AI 개요
                                </span>
                                {article.aiLoading && (
                                    <span className="text-[10px] text-gray-brand animate-pulse">
                                        생성 중...
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                                {article.aiSummary.overview}
                            </p>
                        </div>

                        {/* 토론 주제 박스 */}
                        <div className="p-md bg-primary/5 rounded-lg border border-primary/20 mb-md">
                            <div className="text-xs font-bold text-primary mb-xs">
                                💬 토론 주제
                            </div>
                            <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
                                {article.aiSummary.debateTopic}
                            </p>
                        </div>
                    </>
                ) : (
                    /* Community 스타일: 텍스트 요약 3줄 */
                    <p className="text-sm text-text-secondary line-clamp-3 mb-md flex-1 min-h-[3.75rem]">
                        {article.summary || article.topic}
                    </p>
                )}

                {/* ── Footer ────────────────────────── */}
                <div className="mt-auto pt-md border-t border-border flex justify-between items-center text-gray-brand text-sm font-medium">
                    <span>{article.commentCount}개 댓글</span>
                    <span>
                        {article.regDt
                            ? new Date(article.regDt).toLocaleDateString('ko-KR')
                            : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};
