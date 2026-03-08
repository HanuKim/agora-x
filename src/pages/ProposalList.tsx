import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProposals } from '../features/proposal/useProposals';
import { ProposalCard } from '../components/proposal/ProposalCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { CONTENT_CATEGORIES, type ContentCategory } from '../features/user';

// Define colors for each category badge in the filter
export const getCategoryColorClass = (category: ContentCategory | string) => {
    switch (category) {
        case '정치': return 'bg-blue-500/10 text-blue-500 border-blue-500/30 hover:border-blue-500';
        case '경제': return 'bg-green-500/10 text-green-500 border-green-500/30 hover:border-green-500';
        case '사회': return 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:border-amber-500';
        case '국제': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30 hover:border-indigo-500';
        case '문화': return 'bg-pink-500/10 text-pink-500 border-pink-500/30 hover:border-pink-500';
        case '기술': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30 hover:border-cyan-500';
        case '기타': return 'bg-gray-500/10 text-gray-500 border-gray-500/30 hover:border-gray-500';
        default: return 'bg-surface text-text-secondary border-border hover:border-text-secondary hover:text-text-primary';
    }
};

export const getActiveCategoryColorClass = (category: ContentCategory | string) => {
    switch (category) {
        case '정치': return 'bg-blue-500 text-white border-blue-500';
        case '경제': return 'bg-green-500 text-white border-green-500';
        case '사회': return 'bg-amber-500 text-white border-amber-500';
        case '국제': return 'bg-indigo-500 text-white border-indigo-500';
        case '문화': return 'bg-pink-500 text-white border-pink-500';
        case '기술': return 'bg-cyan-500 text-white border-cyan-500';
        case '기타': return 'bg-gray-500 text-white border-gray-500';
        default: return 'bg-text-primary text-bg border-text-primary';
    }
};

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
        const matchesSearch = p.title.includes(searchQuery) || p.description.includes(searchQuery) || (p.problem)?.includes(searchQuery);
        // Category Match
        const matchesCategory = activeTab === '전체' || p.category === activeTab;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="px-xl py-xl w-full max-w-[1200px] mx-auto">
            {/* Header Section */}
            <div className="mb-xl flex flex-col gap-lg">
                <div className="flex-1">
                    <h1 className="text-[2.5rem] font-bold mb-xs text-text-primary leading-tight">
                        국민 제안
                    </h1>
                    <p className="text-text-secondary">
                        우리 사회의 문제점을 짚어보고 함께 해결책을 모색하는 시민들의 공론장입니다.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-md lg:flex-row lg:items-center w-full">
                    {/* Search Bar */}
                    <div className="flex items-center bg-surface rounded-lg border border-border px-sm py-xs flex-1 max-w-[400px]">
                        <span className="material-icons-round text-text-secondary mr-sm">search</span>
                        <input
                            type="text"
                            placeholder="제안 검색하기..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none w-full text-sm text-text-primary placeholder:text-text-secondary"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide flex-1">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all border ${isActive
                                        ? getActiveCategoryColorClass(tab)
                                        : getCategoryColorClass(tab)
                                        }`}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </div>
                </div>
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
