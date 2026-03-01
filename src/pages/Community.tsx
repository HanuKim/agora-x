import React from 'react';
import { Card } from '../components/ui/Card';
import newsData from '../data/selectedNews.json';

export const Community: React.FC = () => {
    const articles = newsData.selectedNews || [];

    return (
        <div className="px-xl py-xl max-w-[1200px] mx-auto">
            <h1 className="text-[2.25rem] font-bold mb-sm">K-Agora 커뮤니티</h1>
            <p className="text-text-secondary mb-xl">
                현 시점 한국 사회의 가장 뜨거운 뉴스 기사를 중심으로 토론합니다.
            </p>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-lg">
                {articles.map((item, index) => {
                    const title = item.article.title;
                    const summary = item.article_summary.summary || '본문 요약이 준비 중입니다.';
                    const category = item.categories?.[0]?.code_nm || '뉴스';
                    const imageUrl = item.images?.[0]?.image_url;

                    return (
                        <Card key={index} padding="none" className="flex flex-col overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200">
                            {/* Image */}
                            {imageUrl && (
                                <div className="h-[180px] w-full overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt={title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-lg flex flex-col flex-1">
                                <div className="flex justify-between mb-sm">
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-sm py-[2px] rounded">
                                        #{category}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold mb-xs leading-snug">{title}</h3>
                                <p className="text-sm text-text-secondary line-clamp-3">{summary}</p>

                                <div className="mt-auto pt-md flex justify-between items-center border-t border-border">
                                    <span className="text-sm text-gray-brand font-medium">
                                        댓글 {item.comments?.length || 0}개
                                    </span>
                                    <span className="text-sm text-gray-brand">
                                        {new Date(item.article.reg_dt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
