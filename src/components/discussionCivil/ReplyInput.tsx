import React, { useState } from 'react';
import type { CivilReply } from './types';
import { appendStoredReply } from './replyStorage';
import './discussionCivil.css';

interface ReplyInputProps {
  commentId: string;
  onCancel?: () => void;
  onSubmit?: (reply: CivilReply) => void;
}

export const ReplyInput: React.FC<ReplyInputProps> = ({ commentId, onCancel, onSubmit }) => {
  const [body, setBody] = useState('');

  const handleSubmit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const reply: CivilReply = {
      id: `reply-${commentId}-${Date.now()}`,
      authorName: '나',
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
      <div className="bg-white/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm text-gray-800 dark:text-gray-200">나</span>
          <span className="text-xs text-gray-400">· 답글 작성</span>
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-transparent border-none rounded-lg p-2 text-sm text-gray-600 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 focus:outline-none min-h-[80px] resize-y"
          placeholder="답글을 입력하세요..."
        />
        <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs inline-block align-middle">info</span>
            비방이나 욕설은 제재 대상이 될 수 있습니다.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleCancel}
              className="cursor-pointer flex items-center gap-1 text-sm text-gray-500 font-medium hover:text-primary"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="cursor-pointer flex items-center gap-1 text-sm font-medium text-primary hover:opacity-90"
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
