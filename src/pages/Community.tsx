import React from 'react';
import { NewsCard } from '../components/community/NewsCard';
import { SearchFilter } from '../components/common/SearchFilter';
import { EmptyState } from '../components/ui/EmptyState';
import { useNewsWithAISummary } from '../features/news/useNewsWithAISummary';
import { CONTENT_CATEGORIES } from '../features/common/types';
import { Link } from 'react-router-dom';

export const Community: React.FC = () => {
    const { items } = useNewsWithAISummary();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeTab, setActiveTab] = React.useState('전체');

    const tabs = ['전체', ...CONTENT_CATEGORIES];

    const filteredItems = items.filter((item) => {
        const matchesSearch =
            item.title.includes(searchQuery) ||
            item.summary?.includes(searchQuery) ||
            item.topic?.includes(searchQuery);
        const matchesCategory = activeTab === '전체' || item.category === activeTab;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="w-full px-xl py-xl max-w-[1200px] mx-auto">
            <div className="mb-xl flex flex-col gap-lg">
                <div className="flex-1">
                    <h1 className="text-[2.25rem] font-extrabold mb-sm">
                        국민 토론
                    </h1>
                    <p className="text-text-secondary">
                        현 시점 한국 사회의 가장 뜨거운 뉴스 기사를 중심으로 토론합니다.
                    </p>
                </div>

                <SearchFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabs={tabs}
                    placeholder="기사 제목, 요약, 주제로 검색..."
                />
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg min-h-0">
                {filteredItems.length === 0 ? (
                    <div className="col-span-full w-full min-w-0 flex justify-center items-start pt-xl">
                        <EmptyState
                            message="검색 결과가 없습니다."
                            icon="search_off"
                            description="검색어나 카테고리 필터를 변경해 보세요."
                        />
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <Link key={item.id} to={`/detail/${item.id}`} className="no-underline">
                            <NewsCard
                                article={item}
                                showAI={false}
                                onClick={() => {}}
                            />
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};
