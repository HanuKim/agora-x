import React, { useState } from 'react';
import type { CivilReply } from '../../features/detail/useCivilStance';
import { appendStoredReply } from '../../services/db/detailDB';
import { generateNickname } from '../../utils/nicknameGenerator';
import './discussionCivil.css';

const CURRENT_USER_ID = 'current-user';
const FALLBACK_REPLY_NAME = '익명';

interface ReplyInputProps {
  commentId: string;
  /** 기사 issueId — 동일 기사 내 익명 닉네임 생성 (없으면 FALLBACK_REPLY_NAME) */
  issueId?: string;
  onCancel?: () => void;
  onSubmit?: (reply: CivilReply) => void;
}

export const ReplyInput: React.FC<ReplyInputProps> = ({ commentId, issueId, onCancel, onSubmit }) => {
  const [body, setBody] = useState('');

  const replyAuthorName = issueId ? generateNickname(CURRENT_USER_ID, issueId) : FALLBACK_REPLY_NAME;

  const handleSubmit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const reply: CivilReply = {
      id: `reply-${commentId}-${Date.now()}`,
      authorName: replyAuthorName,
      stance: 'neutral',
      body: trimmed,
      timeAgo: '방금 전',
    };
    appendStoredReply(commentId, reply);
    onSubmit?.(reply);
    setBody('');
  };

  const handleCancel = () => {
    setBody('');
    onCancel?.();
  };

  return (
    <div className="ml-10 relative pl-10 mt-4 mb-6 reply-input-enter">
      <div className="thread-curve" style={{ height: 25 }} />
      <div className="bg-surface/80 p-5 rounded-lg border border-border shadow-sm text-text-primary">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm text-text-primary">{replyAuthorName}</span>
          <span className="text-xs text-text-muted">· 답글 작성</span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-bg/50 border border-border rounded-lg p-3 text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none min-h-[80px] resize-y transition-colors"
          placeholder="답글을 입력하세요..."
        />
        <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-border">
          <p className="text-[11px] text-text-muted flex items-center gap-1">
            <span className="material-symbols-outlined text-xs inline-block align-middle">info</span>
            비방이나 욕설은 제재 대상이 될 수 있습니다.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleCancel}
              className="cursor-pointer flex items-center gap-1 text-sm text-text-secondary font-medium hover:text-primary transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="cursor-pointer flex items-center gap-1 text-sm font-medium text-primary hover:opacity-90 transition-colors"
            >
              <span className="material-symbols-outlined text-base">send</span>
              답글 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
