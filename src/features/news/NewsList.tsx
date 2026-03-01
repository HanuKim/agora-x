import React from 'react';
import { Card } from '../../components/ui/Card';
import newsData from '../../data/selectedNews.json';

export const NewsList: React.FC = () => {
    const newsList = newsData.selectedNews || [];

    return (
        <div className="min-h-screen px-xl py-xl bg-bg font-sans">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-xl">
                    <h1 className="text-[2.25rem] text-text-primary m-0 font-bold">Agora-X News</h1>
                    <div className="text-text-secondary">{newsList.length} articles found</div>
                </header>

                {/* Grid */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-lg">
                    {newsList.map((newsItem, index) => {
                        const imgUrl = newsItem.images?.[0]?.image_url;
                        return (
                            <Card
                                key={index}
                                padding="none"
                                className="overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                            >
                                {/* Image */}
                                {imgUrl && (
                                    <div
                                        className="w-full h-[240px] bg-cover bg-center"
                                        style={{ backgroundImage: `url(${imgUrl})` }}
                                    />
                                )}

                                {/* Content */}
                                <div className="p-lg flex flex-col flex-1">
                                    {/* Categories */}
                                    <div className="flex gap-sm mb-sm flex-wrap">
                                        {newsItem.categories?.map((cat, i) => (
                                            <span key={i} className="bg-surface text-primary px-sm py-xs rounded-full text-xs font-medium">
                                                {cat.code_nm}
                                            </span>
                                        ))}
                                    </div>

                                    <h2 className="text-lg text-text-primary mb-sm leading-snug font-bold">
                                        {newsItem.article?.title || 'Untitled Article'}
                                    </h2>

                                    <p className="text-text-secondary text-sm mb-md line-clamp-3 leading-relaxed">
                                        {newsItem.article_summary?.summary || ''}
                                    </p>

                                    <div className="mt-auto pt-md flex justify-between items-center border-t border-border">
                                        <span className="text-[0.8rem] text-text-secondary">
                                            By {newsItem.article?.writers?.split(' ')?.[0] || 'Unknown'}
                                        </span>
                                        <a
                                            href={newsItem.article_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary-hover font-medium text-sm no-underline hover:underline"
                                        >
                                            Read full article →
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
