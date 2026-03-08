import React from 'react';
import type { CivilReply } from './types';

interface ReplyItemProps {
  reply: CivilReply;
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

export const ReplyItem: React.FC<ReplyItemProps> = ({ reply }) => {
  const style = stanceStyles[reply.stance] ?? stanceStyles.neutral;
  const label = stanceLabels[reply.stance] ?? '중립';
  const curveHeight = reply.curveHeight ?? 25;

  return (
    <div className="relative pl-10">
      <div
        className="thread-curve"
        style={{ height: curveHeight }}
      />
      <div className="bg-white/50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm">{reply.authorName}</span>
          <span className={`px-2 py-0.5 ${style.bg} ${style.text} text-[10px] font-bold rounded`}>
            {label}
          </span>
          <span className="text-xs text-gray-400">· {reply.timeAgo}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {reply.body}
        </p>
      </div>
    </div>
  );
};
