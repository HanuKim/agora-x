import React, { useState } from 'react';
import { Button } from '../ui/Button';
import type { CivilStance } from '../../features/detail/useCivilStance';

interface DiscussionInputProps {
  onSubmit?: (stance: CivilStance, body: string) => void;
}

/* ProposalList 카테고리 뱃지와 동일한 형태: base + 비선택/선택 색 (찬성=success, 반대=danger, 중립=surface) */
const STANCE_BADGE_BASE = 'whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all border cursor-pointer';
const stanceOptionConfig: { value: CivilStance; label: string; inactiveClass: string; activeClass: string }[] = [
  { value: 'pro', label: '찬성', inactiveClass: 'bg-success/10 text-success border-success/30 hover:border-success', activeClass: 'bg-success text-white border-success' },
  { value: 'con', label: '반대', inactiveClass: 'bg-danger/10 text-danger border-danger/30 hover:border-danger', activeClass: 'bg-danger text-white border-danger' },
  { value: 'neutral', label: '중립', inactiveClass: 'bg-surface text-text-secondary border-border hover:border-text-secondary', activeClass: 'bg-text-primary text-bg border-text-primary' },
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
    <div className="rounded-lg p-lg shadow-md border border-border bg-bg text-text-primary">
      <div className="flex flex-wrap gap-2 mb-4">
        {stanceOptionConfig.map((opt) => {
          const isActive = stance === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStance(opt.value)}
              className={`${STANCE_BADGE_BASE} ${isActive ? opt.activeClass : opt.inactiveClass}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full bg-bg border border-border rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-primary min-h-[120px] mb-4 text-text-primary placeholder-text-muted transition-colors"
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
