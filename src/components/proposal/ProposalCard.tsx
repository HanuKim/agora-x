import React from 'react';
import type { Proposal } from '../../services/db/proposalDB';
import { getActiveCategoryColorClass } from '../../pages/ProposalList';

interface ProposalCardProps {
    proposal: Proposal;
    onClick: () => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onClick }) => {
    return (
        <div
            className="flex flex-col rounded-xl border border-border p-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)] h-full"
            onClick={onClick}
        >
            <div className="flex flex-col justify-between h-full">
                <div>
                    <div className="mb-md">
                        {proposal.category ? (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border ${getActiveCategoryColorClass(proposal.category)}`}>
                                {proposal.category}
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                국민 제안
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold mb-sm line-clamp-2 text-text-primary leading-tight">
                        {proposal.title}
                    </h3>

                    <div className="mb-md">
                        <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
                            {proposal.problem || proposal.description}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-sm border-t border-border pt-sm mt-auto">
                    <div className="flex align-center items-center gap-xs text-text-secondary">
                        <span className="text-xs font-bold">제안 날짜: {new Date(proposal.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
                        <div className="flex gap-md">
                            <span className="flex items-center gap-1">
                                <span className="material-icons-round text-text-emphasis text-[16px]">chat_bubble_outline</span>
                                {(proposal.opinionCount || 0)}개 의견
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="material-icons-round text-text-emphasis text-[16px]">article</span>
                                관련 기사 {(proposal.relatedArticleCount || 0)}개
                            </span>
                        </div>
                        {proposal.likes ? (
                            <span className="flex items-center gap-1">
                                <span className="material-icons-round text-text-emphasis text-[16px]">thumb_up</span>
                                {proposal.likes}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};
