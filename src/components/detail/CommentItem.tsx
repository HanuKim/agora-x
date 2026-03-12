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

/** createdAt(ISO 또는 'YYYY-MM-DD HH:mm:ss') → 'oooo년 oo월 oo일' */
function formatCivilDate(createdAt?: string): string | null {
  if (!createdAt) return null;
  const d = new Date(createdAt.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}년 ${m}월 ${day}일`;
}

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

  const [storedReplies, setStoredReplies] = useState<CivilReply[]>(() =>
    commentForHook ? getStoredReplies(commentForHook.id) : []
  );
  const [visibleReplyCount, setVisibleReplyCount] = useState(0);
  const [showReplyInput, setShowReplyInput] = useState(false);

  if (props.variant === 'reply') {
    const { reply } = props;
    const badgeClass = stanceBadgeClass[reply.stance] ?? stanceBadgeClass.neutral;
    const label = stanceLabels[reply.stance] ?? '중립';
    const dateStr = formatCivilDate(reply.createdAt) ?? reply.timeAgo;

    return (
      <div className="relative pl-10">
        <div className="thread-curve" style={{ height: reply.curveHeight ?? 25 }} />
        <div className="flex flex-col gap-sm p-lg rounded-xl bg-surface/50 border border-border">
          <div className="flex items-center gap-sm">
            <span className="flex items-center font-bold text-sm text-text-primary">{reply.authorName}</span>
            <span className={badgeClass}>{label}</span>
            <span className="text-xs text-text-secondary">· {dateStr}</span>
          </div>
          <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap break-keep my-xs">
            {reply.body}
          </p>
          <div className="flex gap-md text-xs font-semibold text-text-secondary mt-xs">
            <button
              type="button"
              className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 hover:text-primary"
              aria-label="공감"
            >
              <span className="material-icons-round text-[16px]">thumb_up_off_alt</span>
              공감
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { comment: commentData, showThreadLine = true, onReplyAdded, issueId } = props;
  const badgeClass = stanceBadgeClass[commentData.stance] ?? stanceBadgeClass.neutral;
  const label = stanceLabels[commentData.stance] ?? '중립';
  const dateStr = formatCivilDate(commentData.createdAt) ?? commentData.timeAgo;
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

      <div className="group relative z-10">
        <div className="flex flex-col gap-sm p-lg rounded-xl bg-surface/50 border border-border">
          <div className="flex items-center gap-sm">
            <span className="flex items-center font-bold text-sm text-text-primary">{commentData.authorName}</span>
            <span className={badgeClass}>{label}</span>
            <span className="text-xs text-text-secondary">· {dateStr}</span>
          </div>
          <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap break-keep my-xs">
            {commentData.body}
          </p>
          <div className="flex gap-md text-xs font-semibold text-text-secondary mt-xs">
            <button
              type="button"
              className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 hover:text-primary"
              aria-label="공감"
            >
              <span className="material-icons-round text-[16px]">thumb_up_off_alt</span>
              공감 {commentData.score > 0 ? commentData.score : ''}
            </button>
            <button
              type="button"
              onClick={() => setShowReplyInput((prev) => !prev)}
              className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 hover:text-primary"
              aria-label="답글 달기"
            >
              <span className="material-icons-round text-[16px]">chat_bubble</span>
              답글 달기
            </button>
          </div>
        </div>
      </div>

      {hasReplies && (
        <div className="ml-10 mt-4 space-y-4 relative">
          {visibleReplies.map((reply) => (
            <CivilDiscussionItem key={reply.id} variant="reply" reply={reply} />
          ))}
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

      {hasReplies && showMoreRepliesButton && (
        <div className="ml-10 pl-10 relative mt-4">
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
  );
}

export const CommentItem: React.FC<CommentItemProps> = (props) => (
  <CivilDiscussionItem variant="comment" {...props} />
);

export const ReplyItem: React.FC<ReplyItemProps> = (props) => (
  <CivilDiscussionItem variant="reply" {...props} />
);
