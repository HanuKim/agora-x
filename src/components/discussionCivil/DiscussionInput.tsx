import React, { useState } from 'react';
import { Button } from '../ui/Button';
import type { CivilStance } from '../../features/detail/useCivilStance';

interface DiscussionInputProps {
  onSubmit?: (stance: CivilStance, body: string) => void;
}

const stanceOptions: { value: CivilStance; label: string; borderClass: string; textClass: string; hoverClass: string }[] = [
  { value: 'pro', label: '찬성', borderClass: 'border-2 border-success', textClass: 'text-success', hoverClass: 'hover:bg-success/10' },
  { value: 'con', label: '반대', borderClass: 'border-2 border-danger', textClass: 'text-danger', hoverClass: 'hover:bg-danger/10' },
  { value: 'neutral', label: '중립', borderClass: 'border-2 border-border', textClass: 'text-text-secondary', hoverClass: 'hover:bg-surface' },
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
      <div className="flex flex-wrap gap-3 mb-4">
        {stanceOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStance(opt.value)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition ${opt.borderClass} ${opt.textClass} ${opt.hoverClass}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full bg-surface border border-border rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-primary min-h-[120px] mb-4 text-text-primary placeholder-text-muted transition-colors"
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
