/**
 * LikedOpinionsTab.tsx
 *
 * "공감한 의견" tab: shows opinions the user has liked,
 * with the associated proposal title for context.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import type { Opinion, Proposal } from '../../services/db/proposalDB';

export interface LikedOpinionItem {
    opinion: Opinion;
    proposal: Proposal | null;
}

interface LikedOpinionsTabProps {
    items: LikedOpinionItem[];
}

export const LikedOpinionsTab: React.FC<LikedOpinionsTabProps> = ({ items }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-lg">
            <h2 className="text-xl font-bold text-text-primary m-0 flex items-center gap-sm">
                <span className="material-icons-round text-primary">thumb_up</span>
                공감한 의견
            </h2>

            {items.length === 0 ? (
                <EmptyState
                    message="공감한 의견이 없습니다"
                    icon="thumb_up_off_alt"
                    description="게시물의 의견에 공감을 눌러보세요."
                />
            ) : (
                <div className="flex flex-col gap-md">
                    {items.map(({ opinion, proposal }) => (
                        <Card
                            key={opinion.id}
                            className="p-lg cursor-pointer hover:-translate-y-[1px] hover:shadow-md transition-all"
                            onClick={() => {
                                if (proposal) navigate(`/proposals/${proposal.id}`);
                            }}
                        >
                            {/* Source proposal */}
                            {proposal && (
                                <div className="flex items-center gap-xs mb-sm">
                                    <span className="material-icons-round text-[14px] text-primary">
                                        description
                                    </span>
                                    <span className="text-xs font-bold text-primary line-clamp-1">
                                        {proposal.title}
                                    </span>
                                </div>
                            )}

                            {/* Opinion content */}
                            <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap break-keep m-0 line-clamp-3">
                                {opinion.content}
                            </p>

                            <div className="flex items-center justify-between mt-sm">
                                <span className="text-xs text-text-secondary">
                                    {opinion.authorNickname}
                                </span>
                                <div className="flex items-center gap-xs text-xs text-text-secondary">
                                    <span className="material-icons-round text-[14px] text-primary">
                                        thumb_up
                                    </span>
                                    {opinion.likes || 0}
                                    <span className="ml-sm flex items-center gap-xs">
                                        <span className="material-icons-round text-[14px]">schedule</span>
                                        {new Date(opinion.createdAt).toLocaleDateString('ko-KR', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
