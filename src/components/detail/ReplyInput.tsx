import React, { useState } from 'react';
import type { CivilReply } from '../../features/detail/useCivilStance';
import { appendStoredReply } from '../../services/db/detailDB';
import { generateNickname } from '../../utils/nicknameGenerator';
import { claudeService } from '../../services/ai/claudeService';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');

  const replyAuthorName = issueId ? generateNickname(CURRENT_USER_ID, issueId) : FALLBACK_REPLY_NAME;

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setReplyError('');

    try {
      const validation = await claudeService.validateOpinion(trimmed);
      if (!validation.isValid) {
        setReplyError(
          `🚫 앗, 표현을 수정해주세요: ${validation.reason ?? '공론장 원칙에 위배되는 내용이 감지되었습니다.'}`
        );
        return;
      }
      const reply: CivilReply = {
        id: `reply-${commentId}-${Date.now()}`,
        authorName: replyAuthorName,
        stance: 'neutral',
        body: trimmed,
        timeAgo: '방금 전',
        createdAt: new Date().toISOString(),
      };
      appendStoredReply(commentId, reply);
      onSubmit?.(reply);
      setBody('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setBody('');
    setReplyError('');
    onCancel?.();
  };

  return (
    <div className="ml-10 relative pl-10 mt-4 mb-6 reply-input-enter">
      <div className="thread-curve" style={{ height: 25 }} />
      <div className="flex flex-col gap-sm p-lg rounded-xl bg-surface/50 border border-border text-text-primary">
        <div className="flex items-center gap-sm">
          <span className="font-bold text-sm text-text-primary">{replyAuthorName}</span>
          <span className="flex items-center gap-1 text-[10px] bg-bg py-[2px] px-sm rounded text-text-secondary">
            <span className="material-icons">warning</span> AI가 부적절한 발언을 검사 중입니다.
          </span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-bg border border-border rounded-lg p-md text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary min-h-[80px] resize-y"
          placeholder="상호 존중을 바탕으로 한 유익한 답글을 남겨주세요."
        />
        {replyError && (
          <div className="text-danger text-sm font-bold bg-danger/10 px-md py-sm rounded-md border border-danger/20">
            {replyError}
          </div>
        )}
        <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-border">
          <p className="text-[11px] text-text-muted flex items-center gap-1">
            <span className="material-symbols-outlined text-xs inline-block align-middle">info</span>
            AI가 부적절한 발언을 검사중입니다.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="cursor-pointer flex items-center gap-1 text-sm text-text-secondary font-medium hover:text-primary transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !body.trim()}
              className="cursor-pointer flex items-center gap-1 text-sm font-medium text-primary hover:opacity-90 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">send</span>
              {isSubmitting ? '안전성 검토 중...' : '답글 등록'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
