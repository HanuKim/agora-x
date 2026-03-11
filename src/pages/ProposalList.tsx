import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProposals } from '../features/proposal/useProposals';
import { ProposalCard } from '../components/proposal/ProposalCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchFilter } from '../components/common/SearchFilter';
import { CONTENT_CATEGORIES } from '../features/common/types';

export const ProposalList: React.FC = () => {
    const { proposals, loading, fetchAllProposals } = useProposals();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeTab, setActiveTab] = React.useState('전체');

    const tabs = ['전체', ...CONTENT_CATEGORIES];

    useEffect(() => {
        fetchAllProposals();
    }, [fetchAllProposals]);

    const filteredProposals = proposals.filter((p) => {
        // Text Match
        const matchesSearch = p.title.includes(searchQuery) || (p.problem)?.includes(searchQuery);
        // Category Match
        const matchesCategory = activeTab === '전체' || p.category === activeTab;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="px-xl py-xl w-full max-w-[1200px] mx-auto">
            {/* Header Section */}
            <div className="mb-xl flex flex-col gap-lg">
                <div className="flex-1">
                    <h1 className="text-[2.25rem] font-extrabold mb-sm">
                        국민 제안
                    </h1>
                    <p className="text-text-secondary">
                        우리 사회의 문제점을 짚어보고 함께 해결책을 모색하는 시민들의 공론장입니다.
                    </p>
                </div>

                {/* Search and Filters */}
                <SearchFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabs={tabs}
                />
            </div>

            <div>
                {loading ? (
                    <div className="flex justify-center py-xl">
                        <span className="text-2xl animate-spin">🐻</span>
                    </div>
                ) : filteredProposals.length === 0 ? (
                    <EmptyState
                        message="검색 결과가 없습니다."
                        icon="search_off"
                        description="검색어나 필터를 변경해 보세요."
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                        {filteredProposals.map((proposal) => (
                            <ProposalCard
                                key={proposal.id}
                                proposal={proposal}
                                onClick={() => navigate(`/proposals/${proposal.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8 z-100">
                <Button
                    size="md"
                    onClick={() => navigate('/proposals/new')}
                    className="rounded-full! shadow-lg! flex items-center gap-2 px-4! py-3! hover:-translate-y-1 transition-transform"
                >
                    <span className="material-icons-round text-sm!">edit</span>
                    {/* <span className="font-bold">제안하기</span> */}
                </Button>
            </div>
        </div>
    );
};
