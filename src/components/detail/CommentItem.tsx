import React, { useState } from 'react';
import { ReplyInput } from './ReplyInput';
import { getStoredReplies } from '../../services/db/detailDB';
import type { CivilComment, CivilReply } from '../../features/detail/useCivilStance';
import { theme } from '../../design/theme';
import { formatCivilDate } from '../../utils/commentDate';
import { ReportModal } from '../report/ReportModal';
import { useReport } from '../../features/user/hooks/useReport';

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
  issueId?: string;
  currentUserId?: string;
}

// --- Reply props (variant: 'reply')
export interface ReplyItemProps {
  reply: CivilReply;
  currentUserId?: string;
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
  const [isReportOpen, setIsReportOpen] = useState(false);
  const { submitReport } = useReport();

  if (props.variant === 'reply') {
    const { reply, currentUserId: replyCurrentUserId } = props;
    const badgeClass = stanceBadgeClass[reply.stance] ?? stanceBadgeClass.neutral;
    const label = stanceLabels[reply.stance] ?? '중립';
    const dateStr = formatCivilDate(reply.createdAt) ?? reply.timeAgo;
    const isOwnReply = replyCurrentUserId && reply.authorId === replyCurrentUserId;
    const showReport = replyCurrentUserId && !isOwnReply;

    const handleReplyReport = async (reason: string, detail: string) => {
      if (!replyCurrentUserId) return;
      await submitReport({
        reporterId: replyCurrentUserId,
        targetType: 'opinion',
        targetId: reply.id,
        reason,
        detail,
      });
    };

    return (
      <>
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
              {showReport && (
                <button
                  type="button"
                  className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 hover:text-danger"
                  onClick={() => setIsReportOpen(true)}
                  aria-label="신고"
                >
                  <span className="material-icons-round text-[16px]">flag</span>
                  신고
                </button>
              )}
            </div>
          </div>
        </div>
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          onSubmit={handleReplyReport}
          targetLabel="답글"
        />
      </>
    );
  }

  const { comment: commentData, showThreadLine = true, onReplyAdded, issueId, currentUserId } = props;
  const badgeClass = stanceBadgeClass[commentData.stance] ?? stanceBadgeClass.neutral;
  const label = stanceLabels[commentData.stance] ?? '중립';
  const dateStr = formatCivilDate(commentData.createdAt) ?? commentData.timeAgo;
  const initialReplies = commentData.replies ?? [];
  const repliesList = [...initialReplies, ...storedReplies];
  const hasReplies = repliesList.length > 0;

  const handleReport = async (reason: string, detail: string) => {
    if (!currentUserId) return;
    await submitReport({
      reporterId: currentUserId,
      targetType: 'opinion',
      targetId: commentData.id,
      reason,
      detail,
    });
  };

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
            {currentUserId && commentData.authorId !== currentUserId && (
              <button
                type="button"
                className="flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0 hover:text-danger"
                onClick={() => setIsReportOpen(true)}
                aria-label="신고"
              >
                <span className="material-icons-round text-[16px]">flag</span>
                신고
              </button>
            )}
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleReport}
        targetLabel="댓글"
      />

      {hasReplies && (
        <div className="ml-10 mt-4 space-y-4 relative">
          {visibleReplies.map((reply) => (
            <CivilDiscussionItem
              key={reply.id}
              variant="reply"
              reply={reply}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {showReplyInput && (
        <ReplyInput
          commentId={commentData.id}
          issueId={issueId}
          currentUserId={currentUserId}
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
