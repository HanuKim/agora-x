import React, { useState } from 'react';
import { ReplyItem } from './ReplyItem';
import { ReplyInput } from './ReplyInput';
import { getStoredReplies } from './replyStorage';
import type { CivilComment, CivilReply } from './types';

const REPLIES_PAGE_SIZE = 5;

interface CommentItemProps {
  comment: CivilComment;
  showThreadLine?: boolean;
  onReplyAdded?: () => void;
}

const stanceStyles: Record<string, { bg: string; text: string }> = {
  pro: { bg: 'bg-green-100', text: 'text-green-600' },
  con: { bg: 'bg-red-100', text: 'text-red-600' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

const stanceLabels: Record<string, string> = {
  pro: '찬성',
  con: '반대',
  neutral: '중립',
};

export const CommentItem: React.FC<CommentItemProps> = ({ comment, showThreadLine = true, onReplyAdded }) => {
  const style = stanceStyles[comment.stance] ?? stanceStyles.neutral;
  const label = stanceLabels[comment.stance] ?? '중립';
  const avatarClass = comment.avatarGradient ?? 'bg-gradient-to-tr from-orange-400 to-red-500';
  const initialReplies = comment.replies ?? [];
  const [storedReplies, setStoredReplies] = useState<CivilReply[]>(() => getStoredReplies(comment.id));
  const repliesList = [...initialReplies, ...storedReplies];
  const hasReplies = repliesList.length > 0;
  const [visibleReplyCount, setVisibleReplyCount] = useState(0);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const loadMoreReplies = () => {
    setVisibleReplyCount((prev) => Math.min(prev + REPLIES_PAGE_SIZE, repliesList.length));
  };
  const visibleReplies = repliesList.slice(0, visibleReplyCount);
  const remainingCount = repliesList.length - visibleReplyCount;
  const showMoreRepliesButton = hasReplies && visibleReplyCount < repliesList.length;

  const handleReplySubmit = (reply: CivilReply) => {
    setStoredReplies((prev) => [...prev, reply]);
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
          {/* <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 rounded-full py-2 px-1">
            <button type="button" className="material-symbols-outlined text-sm hover:text-primary" aria-label="추천">
              expand_less
            </button>
            <span className="text-xs font-bold">{comment.score}</span>
            <button type="button" className="material-symbols-outlined text-sm hover:text-secondary" aria-label="비추천">
              expand_more
            </button>
          </div> */}
        </div>

        <div className="flex-grow bg-white dark:bg-[#1F2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold">{comment.authorName}</span>
            <span className={`px-2 py-0.5 ${style.bg} ${style.text} text-[10px] font-bold rounded`}>
              {label}
            </span>
            <span className="text-xs text-gray-400">· {comment.timeAgo}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {comment.body}
          </p>
          <div className="flex items-center gap-6">
            <button type="button" className="cursor-pointer flex items-center gap-1 text-sm text-gray-500 font-medium hover:text-primary" aria-label="좋아요">
              <span className="material-symbols-outlined text-base">thumb_up</span>
              좋아요
            </button>
            <button
              type="button"
              onClick={() => setShowReplyInput((prev) => !prev)}
              className="cursor-pointer flex items-center gap-1 text-sm text-gray-500 font-medium hover:text-primary"
              aria-label="답글 달기"
            >
              <span className="material-symbols-outlined text-base">chat_bubble</span>
              답글 달기
            </button>
            <button type="button" className="cursor-pointer flex items-center gap-1 text-sm text-gray-500 font-medium hover:text-primary" aria-label="신고">
              <span className="material-symbols-outlined text-base">siren</span>
              신고
            </button>
          </div>
        </div>
      </div>

      {hasReplies && (
        <div className="ml-10 mt-4 space-y-4 relative">
          {visibleReplies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
          {showMoreRepliesButton && (
            <div className="pl-10 relative">
              <div className="thread-curve" style={{ height: 15 }} />
              <button
                type="button"
                onClick={loadMoreReplies}
                className="flex items-center gap-2 text-primary font-bold text-sm hover:underline py-1"
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
          commentId={comment.id}
          onCancel={() => setShowReplyInput(false)}
          onSubmit={handleReplySubmit}
        />
      )}
    </div>
  );
};
