/**
 * OpinionItem.tsx
 *
 * Renders a single opinion (comment) with like and report buttons.
 */

import React, { useState } from 'react';
import type { Opinion } from '../../services/db/proposalDB';
import { ReportModal } from '../report/ReportModal';
import { useReport } from '../../features/user/hooks/useReport';

interface OpinionItemProps {
    opinion: Opinion;
    isAuthor: boolean;
    currentUserId?: string;
    onLike?: (opinionId: string) => void;
    onEdit?: (opinion: Opinion) => void;
    onDelete?: (opinionId: string) => void;
}

export const OpinionItem: React.FC<OpinionItemProps> = ({
    opinion,
    isAuthor,
    currentUserId,
    onLike,
    onEdit,
    onDelete
}) => {
    const hasLiked = currentUserId && opinion.likedBy?.includes(currentUserId);
    const likeCount = opinion.likes || 0;
    const isOwner = currentUserId && opinion.authorId === currentUserId;
    const [isReportOpen, setIsReportOpen] = useState(false);
    const { submitReport } = useReport();

    const handleReport = async (reason: string, detail: string) => {
        if (!currentUserId) return;
        await submitReport({
            reporterId: currentUserId,
            targetType: 'opinion',
            targetId: opinion.id,
            reason,
            detail,
        });
    };

    return (
        <>
            <div className="flex flex-col gap-sm p-lg rounded-xl bg-surface/50 border border-border">
                <div className="flex items-center gap-sm">
                    <span className="flex items-center font-bold text-md text-text-primary">
                        {opinion.authorNickname}
                        {isAuthor && (
                            <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                제안자
                            </span>
                        )}
                    </span>
                    <span className="text-sm text-text-secondary">
                        {new Date(opinion.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </span>
                </div>

                <p className="text-md leading-relaxed text-text-primary whitespace-pre-wrap break-keep my-xs">
                    {opinion.content}
                </p>

                {/* Interaction Buttons */}
                <div className="flex gap-md text-sm font-semibold text-text-secondary mt-xs">
                    <button
                        className={`flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 ${hasLiked ? 'text-primary' : 'hover:text-primary'}`}
                        onClick={() => onLike && onLike(opinion.id)}
                    >
                        <span className="material-icons-round text-[16px]">
                            {hasLiked ? 'thumb_up' : 'thumb_up_off_alt'}
                        </span>
                        공감 {likeCount > 0 ? likeCount : ''}
                    </button>

                    {/* Report Button */}
                    {currentUserId && opinion.authorId !== currentUserId && (
                        <button
                            className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 hover:text-danger"
                            onClick={() => setIsReportOpen(true)}
                        >
                            <span className="material-icons-round text-[16px]">flag</span>
                            신고
                        </button>
                    )}

                    {/* Edit/Delete Buttons for Owner */}
                    {isOwner && (
                        <div className="flex gap-md ml-auto">
                            <button
                                className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 hover:text-primary"
                                onClick={() => onEdit && onEdit(opinion)}
                                title="수정"
                            >
                                <span className="material-icons-round text-[16px]">edit</span>
                                수정
                            </button>
                            <button
                                className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 hover:text-danger"
                                onClick={() => onDelete && onDelete(opinion.id)}
                                title="삭제"
                            >
                                <span className="material-icons-round text-[16px]">delete</span>
                                삭제
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                onSubmit={handleReport}
                targetLabel="의견"
            />
        </>
    );
};
