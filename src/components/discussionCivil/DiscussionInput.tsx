import React, { useState } from 'react';
import { theme } from '../../design/theme';
import { Button } from '../ui/Button';
import type { CivilStance } from './types';

interface DiscussionInputProps {
  onSubmit?: (stance: CivilStance, body: string) => void;
}

const stanceOptions: { value: CivilStance; label: string; badgeClass: string }[] = [
  { value: 'pro', label: '찬성', badgeClass: `${theme.badge.base} ${theme.badge.success}` },
  { value: 'con', label: '반대', badgeClass: `${theme.badge.base} ${theme.badge.danger}` },
  { value: 'neutral', label: '중립', badgeClass: `${theme.badge.base} ${theme.badge.muted}` },
];

export const DiscussionInput: React.FC<DiscussionInputProps> = ({ onSubmit }) => {
  const [stance, setStance] = useState<CivilStance>('pro');
  const [body, setBody] = useState('');

  const handleSubmit = () => {
    if (!body.trim()) return;
    onSubmit?.(stance, body.trim());
    setBody('');
  };

  return (
    <div className="bg-bg rounded-lg p-6 shadow-md border border-border text-text-primary">
      <div className="flex flex-wrap gap-3 mb-4">
        {stanceOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStance(opt.value)}
            className={`cursor-pointer transition-all duration-200 ${
              stance === opt.value ? 'ring-2 ring-offset-2 ring-primary' : 'opacity-90 hover:opacity-100'
            } ${opt.badgeClass}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary min-h-[120px] mb-4 text-gray-700 dark:text-gray-200"
        placeholder="당신의 의견을 자유롭게 공유해 주세요..."
      />
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleSubmit}
          className="whitespace-nowrap"
        >
          의견 남기기
          <span className="material-icons-round text-base ml-1">edit_note</span>
        </Button>
      </div>
    </div>
  );
};
