import React, { useState } from 'react';
import { ReplyInput } from './ReplyInput';
import { getStoredReplies } from '../../services/db/detailDB';
import type { CivilComment, CivilReply } from '../../features/detail/useCivilStance';
import { theme } from '../../design/theme';

const REPLIES_PAGE_SIZE = 5;

/* 시민 토론장 스탠스 뱃지 — ProposalList 카테고리 뱃지와 동일한 형태 (색만 success/danger/surface 유지) */
const stanceBadgeClass: Record<string, string> = {
  pro: `${theme.badge.base} ${theme.badge.success}`,
  con: `${theme.badge.base} ${theme.badge.danger}`,
  neutral: `${theme.badge.base} ${theme.badge.muted}`,
};

const stanceLabels: Record<string, string> = {
  pro: '찬성',
  con: '반대',
  neutral: '중립',
};

// --- Comment props (variant: 'comment')
export interface CommentItemProps {
  comment: CivilComment;
  showThreadLine?: boolean;
  onReplyAdded?: () => void;
  /** 기사 issueId — 답글 작성 시 동일 기사 내 익명 닉네임 생성용 */
  issueId?: string;
}

// --- Reply props (variant: 'reply')
export interface ReplyItemProps {
  reply: CivilReply;
}

type CivilDiscussionItemProps =
  | (CommentItemProps & { variant: 'comment' })
  | (ReplyItemProps & { variant: 'reply' });

function CivilDiscussionItem(props: CivilDiscussionItemProps) {
  const isReply = props.variant === 'reply';
  const commentForHook = isReply ? undefined : (props as CommentItemProps & { variant: 'comment' }).comment;

  // Hooks must run unconditionally (same order every render)
  const [storedReplies, setStoredReplies] = useState<CivilReply[]>(() =>
    commentForHook ? getStoredReplies(commentForHook.id) : []
  );
  const [visibleReplyCount, setVisibleReplyCount] = useState(0);
  const [showReplyInput, setShowReplyInput] = useState(false);

  if (props.variant === 'reply') {
    const { reply } = props;
    const badgeClass = stanceBadgeClass[reply.stance] ?? stanceBadgeClass.neutral;
    const label = stanceLabels[reply.stance] ?? '중립';
    const curveHeight = reply.curveHeight ?? 25;

    return (
      <div className="relative pl-10">
        <div
          className="thread-curve"
          style={{ height: curveHeight }}
        />
        <div className="bg-surface/80 p-5 rounded-lg border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-sm text-text-primary">{reply.authorName}</span>
            <span className={badgeClass}>{label}</span>
            <span className="text-xs text-text-muted">· {reply.timeAgo}</span>
          </div>
          <p className="text-sm text-text-secondary mb-4 break-keep">
            {reply.body}
          </p>
          <div className="flex items-center gap-6">
            <button type="button" className="cursor-pointer flex items-center gap-1 text-sm text-text-secondary font-medium hover:text-primary transition-colors" aria-label="좋아요">
              <span className="material-symbols-outlined text-base">thumb_up</span>
              좋아요
            </button>
            <button type="button" className="cursor-pointer flex items-center gap-1 text-sm text-text-secondary font-medium hover:text-primary transition-colors" aria-label="신고">
              <span className="material-symbols-outlined text-base">siren</span>
              신고
            </button>
          </div>
        </div>
      </div>
    );
  }

  // variant === 'comment' (narrowed by control flow)
  const { comment: commentData, showThreadLine = true, onReplyAdded, issueId } = props;
  const badgeClass = stanceBadgeClass[commentData.stance] ?? stanceBadgeClass.neutral;
  const label = stanceLabels[commentData.stance] ?? '중립';
  const avatarClass = commentData.avatarGradient ?? 'bg-gradient-to-br from-primary to-gray-brand';
  const initialReplies = commentData.replies ?? [];
  const repliesList = [...initialReplies, ...storedReplies];
  const hasReplies = repliesList.length > 0;

  const loadMoreReplies = () => {
    setVisibleReplyCount((prev) => Math.min(prev + REPLIES_PAGE_SIZE, repliesList.length));
  };
  const visibleReplies = repliesList.slice(0, visibleReplyCount);
  const remainingCount = repliesList.length - visibleReplyCount;
  const showMoreRepliesButton = hasReplies && visibleReplyCount < repliesList.length;

  const handleReplySubmit = (newReply: CivilReply) => {
    setStoredReplies((prev) => [...prev, newReply]);
    setVisibleReplyCount((prev) => Math.min(prev + 1, repliesList.length + 1));
    setShowReplyInput(false);
    onReplyAdded?.();
  };

  return (
    <div className={`comment-group relative ${showThreadLine && hasReplies ? '' : ''}`}>
      {showThreadLine && hasReplies && <div className="thread-line" />}

      <div className="flex gap-4 group relative z-10">
        <div className="flex flex-col items-center gap-2 pt-4">
          <div className={`w-10 h-10 rounded-full flex-shrink-0 ${avatarClass}`} />
        </div>

        <div className="flex-grow bg-bg p-6 rounded-lg shadow-md border border-border text-text-primary">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold">{commentData.authorName}</span>
            <span className={badgeClass}>{label}</span>
            <span className="text-xs text-text-muted">· {commentData.timeAgo}</span>
          </div>
          <p className="text-text-secondary leading-relaxed mb-4 break-keep">
            {commentData.body}
          </p>
          <div className="flex items-center gap-6">
            <button type="button" className="cursor-pointer flex items-center gap-1 text-sm text-text-secondary font-medium hover:text-primary transition-colors" aria-label="좋아요">
              <span className="material-symbols-outlined text-base">thumb_up</span>
              좋아요
            </button>
            <button
              type="button"
              onClick={() => setShowReplyInput((prev) => !prev)}
              className="cursor-pointer flex items-center gap-1 text-sm text-text-secondary font-medium hover:text-primary transition-colors"
              aria-label="답글 달기"
            >
              <span className="material-symbols-outlined text-base">chat_bubble</span>
              답글 달기
            </button>
            <button type="button" className="cursor-pointer flex items-center gap-1 text-sm text-text-secondary font-medium hover:text-primary transition-colors" aria-label="신고">
              <span className="material-symbols-outlined text-base">siren</span>
              신고
            </button>
          </div>
        </div>
      </div>

      {hasReplies && (
        <div className="ml-10 mt-4 space-y-4 relative">
          {visibleReplies.map((reply) => (
            <CivilDiscussionItem key={reply.id} variant="reply" reply={reply} />
          ))}
          {showMoreRepliesButton && (
            <div className="pl-10 relative">
              <div className="thread-curve" style={{ height: 15 }} />
              <button
                type="button"
                onClick={loadMoreReplies}
                className="flex items-center gap-2 text-primary font-bold text-sm hover:underline py-1 transition-colors"
              >
                <span className="w-6 h-[2px] bg-primary/30" />
                답글 {visibleReplyCount === 0 ? repliesList.length : remainingCount}개 더 보기...
              </button>
            </div>
          )}
        </div>
      )}

      {showReplyInput && (
        <ReplyInput
          commentId={commentData.id}
          issueId={issueId}
          onCancel={() => setShowReplyInput(false)}
          onSubmit={handleReplySubmit}
        />
      )}
    </div>
  );
}

export const CommentItem: React.FC<CommentItemProps> = (props) => (
  <CivilDiscussionItem variant="comment" {...props} />
);

export const ReplyItem: React.FC<ReplyItemProps> = (props) => (
  <CivilDiscussionItem variant="reply" {...props} />
);
