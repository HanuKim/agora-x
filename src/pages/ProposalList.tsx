import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useProposals } from '../features/proposal/useProposals';
import { ProposalCard } from '../components/proposal/ProposalCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchFilter } from '../components/common/SearchFilter';
import { GlobalDialog } from '../components/common/GlobalDialog';
import { CONTENT_CATEGORIES } from '../features/common/types';

export const ProposalList: React.FC = () => {
    const { user } = useAuth();
    const { proposals, loading, fetchAllProposals, removeProposal } = useProposals();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeTab, setActiveTab] = React.useState('전체');
    const [dialogConfig, setDialogConfig] = React.useState<{
        isOpen: boolean;
        type: 'alert' | 'confirm' | 'prompt';
        title: string;
        message: string;
        confirmText?: string;
        isDestructive?: boolean;
        defaultValue?: string;
        onConfirm: (val?: string) => void;
    }>({
        isOpen: false,
        type: 'confirm',
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const closeDialog = () => setDialogConfig(prev => ({ ...prev, isOpen: false }));

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
                                onEdit={user?.id === proposal.authorId ? (e) => {
                                    e.stopPropagation();
                                    navigate(`/proposals/${proposal.id}/edit`);
                                } : undefined}
                                onDelete={user?.id === proposal.authorId ? (e) => {
                                    e.stopPropagation();
                                    setDialogConfig({
                                        isOpen: true,
                                        type: 'confirm',
                                        title: '게시물 삭제',
                                        message: '정말로 이 게시물을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
                                        confirmText: '삭제',
                                        isDestructive: true,
                                        onConfirm: () => {
                                            removeProposal(proposal.id);
                                            closeDialog();
                                        }
                                    });
                                } : undefined}
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
                </Button>
            </div>

            <GlobalDialog
                isOpen={dialogConfig.isOpen}
                type={dialogConfig.type}
                title={dialogConfig.title}
                message={dialogConfig.message}
                confirmText={dialogConfig.confirmText}
                defaultValue={dialogConfig.defaultValue}
                isDestructive={dialogConfig.isDestructive}
                onConfirm={dialogConfig.onConfirm}
                onCancel={closeDialog}
            />
        </div>
    );
};
