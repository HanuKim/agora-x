import React from 'react';
import type { Opinion } from '../../services/db/proposalDB';

interface OpinionItemProps {
    opinion: Opinion;
    isAuthor: boolean;
    currentUserId?: string;
    onLike?: (opinionId: string) => void;
}

export const OpinionItem: React.FC<OpinionItemProps> = ({ opinion, isAuthor, currentUserId, onLike }) => {
    const hasLiked = currentUserId && opinion.likedBy?.includes(currentUserId);
    const likeCount = opinion.likes || 0;

    return (
        <div className="flex flex-col gap-sm p-lg rounded-xl bg-surface/50 border border-border">
            <div className="flex items-center gap-sm">
                <span className="flex items-center font-bold text-sm text-text-primary">
                    {opinion.authorNickname}
                    {isAuthor && (
                        <span className="ml-2 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            제안자
                        </span>
                    )}
                </span>
                <span className="text-xs text-text-secondary">
                    {new Date(opinion.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </span>
            </div>

            <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap break-keep my-xs">
                {opinion.content}
            </p>

            {/* Interaction Buttons */}
            <div className="flex gap-md text-xs font-semibold text-text-secondary mt-xs">
                <button
                    className={`flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 ${hasLiked ? 'text-primary' : 'hover:text-primary'}`}
                    onClick={() => onLike && onLike(opinion.id)}
                >
                    <span className="material-icons-round text-[16px]">
                        {hasLiked ? 'thumb_up' : 'thumb_up_off_alt'}
                    </span>
                    공감 {likeCount > 0 ? likeCount : ''}
                </button>
            </div>
        </div>
    );
};
