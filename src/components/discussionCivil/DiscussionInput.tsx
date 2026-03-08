import React, { useState } from 'react';
import type { CivilStance } from './types';

interface DiscussionInputProps {
  onSubmit?: (stance: CivilStance, body: string) => void;
}

const stanceOptions: { value: CivilStance; label: string; borderClass: string; textClass: string; hoverClass: string }[] = [
  { value: 'pro', label: '찬성', borderClass: 'border-2 border-green-500', textClass: 'text-green-600', hoverClass: 'hover:bg-green-50' },
  { value: 'con', label: '반대', borderClass: 'border-2 border-red-500', textClass: 'text-red-600', hoverClass: 'hover:bg-red-50' },
  { value: 'neutral', label: '중립', borderClass: 'border-2 border-gray-300', textClass: 'text-gray-500', hoverClass: 'hover:bg-gray-50' },
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
    <div className="bg-white dark:bg-[#1F2937] rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
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
        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary min-h-[120px] mb-4 text-gray-700 dark:text-gray-200"
        placeholder="당신의 의견을 자유롭게 공유해 주세요..."
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-neo hover:translate-y-[-2px] transition-all"
        >
          의견 남기기
        </button>
      </div>
    </div>
  );
};
