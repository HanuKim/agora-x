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
import { getLikeCountDelta, type Discussion } from '../../services/db/detailDB';

export interface LikedOpinionItem {
    opinion: Opinion | null;
    proposal: Proposal | null;
    discussion?: Discussion | null;
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
                    {items.map((item) => {
                        const { opinion, proposal, discussion } = item;
                        const isDiscussion = discussion != null;
                        const key = isDiscussion ? discussion.id : (opinion?.id ?? '');
                        const onClick = isDiscussion
                            ? () => navigate(`/detail/${discussion.issueId}`)
                            : () => { if (proposal) navigate(`/proposals/${proposal.id}`); };

                        return (
                            <Card
                                key={key}
                                className="p-lg cursor-pointer hover:-translate-y-[1px] hover:shadow-md transition-all"
                                onClick={onClick}
                            >
                                {/* Source: proposal title or article title */}
                                {(proposal ?? discussion?.articleTitle) && (
                                    <div className="flex items-center gap-xs mb-sm">
                                        <span className="material-icons-round text-[14px] text-primary">
                                            description
                                        </span>
                                        <span className="text-xs font-bold text-primary line-clamp-1">
                                            {isDiscussion ? (discussion.articleTitle ?? `기사 #${discussion.issueId}`) : proposal!.title}
                                        </span>
                                    </div>
                                )}

                                {/* Content */}
                                <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap break-keep m-0 line-clamp-3">
                                    {isDiscussion ? discussion.body : (opinion?.content ?? '')}
                                </p>

                                <div className="flex items-center justify-between mt-sm">
                                    <span className="text-xs text-text-secondary">
                                        {isDiscussion ? discussion.authorName : (opinion?.authorNickname ?? '')}
                                    </span>
                                    <div className="flex items-center gap-xs text-xs text-text-secondary">
                                        <span className="material-icons-round text-[14px] text-primary">
                                            thumb_up
                                        </span>
                                        {isDiscussion
                                            ? (discussion.scoreAtLike ?? 0) + getLikeCountDelta(discussion.targetId)
                                            : (opinion?.likes ?? 0)}
                                        <span className="ml-sm flex items-center gap-xs">
                                            <span className="material-icons-round text-[14px]">schedule</span>
                                            {isDiscussion
                                                ? new Date(discussion.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
                                                : (opinion ? new Date(opinion.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '')}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
