/**
 * DiscussionAI Page
 *
 * 토론 주제 목록 페이지
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IssueCard } from '../components/discussion/IssueCard';
import { useIssueWithAI } from '../features/discussion/useIssueWithAI';
import { SearchFilter } from '../components/common/SearchFilter';
import { CONTENT_CATEGORIES } from '../features/common/types';
import { EmptyState } from '../components/ui/EmptyState';

export const DiscussionAI: React.FC = () => {
    const { issues } = useIssueWithAI();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('전체');

    const tabs = ['전체', ...CONTENT_CATEGORIES];

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.topic.includes(searchQuery) || issue.pro.some(p => p.includes(searchQuery)) || issue.con.some(c => c.includes(searchQuery));
        const matchesCategory = activeTab === '전체' || issue.category === activeTab;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="px-xl py-xl max-w-[1200px] mx-auto w-full">
            <div className="mb-xl">
                <h1 className="text-[2.25rem] font-extrabold mb-sm">일대일 토론</h1>
                <p className="text-text-secondary mb-lg">
                    Agora-X의 AI, 아곰이와 함께 한국 사회의 주요 쟁점들을 깊게 파헤쳐 봅니다.
                </p>
                <SearchFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabs={tabs}
                />
            </div>

            {/* 주제 목록 */}
            {filteredIssues.length === 0 ? (
                <EmptyState
                    message="검색 결과가 없습니다."
                    icon="search_off"
                    description="검색어나 필터를 변경해 보세요."
                />
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-lg">
                    {filteredIssues.map((issue) => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            onClick={() => navigate(`/ai-discussion/${issue.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

