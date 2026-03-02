import React from 'react';
import { NewsCard } from '../components/community/NewsCard';
import { useNewsWithAISummary } from '../features/news/useNewsWithAISummary';

export const Community: React.FC = () => {
    // limit 없이 호출 → 전체 기사 처리
    const { items } = useNewsWithAISummary();

    return (
        <div className="px-xl py-xl max-w-[1200px] mx-auto">
            <h1 className="text-[2.25rem] font-bold mb-sm">K-Agora 커뮤니티</h1>
            <p className="text-text-secondary mb-xl">
                현 시점 한국 사회의 가장 뜨거운 뉴스 기사를 중심으로 토론합니다.
            </p>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-lg">
                {items.map((item) => (
                    <NewsCard
                        key={item.id}
                        article={item}
                        showAI={false}
                        onClick={() => {/* 상세 페이지 연결 예정 */ }}
                    />
                ))}
            </div>
        </div>
    );
};
