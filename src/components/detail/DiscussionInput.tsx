import React, { useState } from 'react';
import { Button } from '../ui/Button';
import type { CivilStance } from '../../features/detail/useCivilStance';
import { claudeService } from '../../services/ai/claudeService';
import { generateNickname } from '../../utils/nicknameGenerator';
import { useCivilStancePreference } from '../../features/detail/useCivilStance';

interface DiscussionInputProps {
  onSubmit?: (stance: CivilStance, body: string) => void;
  issueId?: string;
  currentUserId?: string;
  isAuthenticated?: boolean;
  openLoginModal?: () => void;
}

/* ProposalList 카테고리 뱃지와 동일한 형태: base + 비선택/선택 색 (찬성=success, 반대=danger, 중립=surface) */
const STANCE_BADGE_BASE =
  'whitespace-nowrap px-3 py-1 mb-1 rounded-full text-[9pt] font-bold transition-all border cursor-pointer';
const stanceOptionConfig: {
  value: CivilStance;
  label: string;
  inactiveClass: string;
  activeClass: string;
}[] = [
  {
    value: 'pro',
    label: '찬성',
    inactiveClass: 'bg-success/10 text-success border-success/30 hover:border-success',
    activeClass: 'bg-success text-white border-success',
  },
  {
    value: 'con',
    label: '반대',
    inactiveClass: 'bg-danger/10 text-danger border-danger/30 hover:border-danger',
    activeClass: 'bg-danger text-white border-danger',
  },
  {
    value: 'neutral',
    label: '중립',
    inactiveClass: 'bg-surface text-text-secondary border-border hover:border-text-secondary',
    activeClass: 'bg-text-primary text-bg border-text-primary',
  },
];

export const DiscussionInput: React.FC<DiscussionInputProps> = ({
  onSubmit,
  issueId,
  currentUserId,
  isAuthenticated = true,
  openLoginModal,
}) => {
  const { stance, setStance } = useCivilStancePreference({
    issueId,
    userId: currentUserId,
    defaultStance: 'neutral',
  });
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [opinionError, setOpinionError] = useState('');
  const nickname = issueId ? generateNickname(currentUserId ?? 'current-user', issueId) : '';

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    if (!onSubmit) return;

    setIsSubmitting(true);
    setOpinionError('');

    try {
      const validation = await claudeService.validateOpinion(trimmed);
      if (!validation.isValid) {
        setOpinionError(
          `🚫 앗, 표현을 수정해주세요: ${validation.reason ?? '공론장 원칙에 위배되는 내용이 감지되었습니다.'}`
        );
        return;
      }
      onSubmit(stance, trimmed);
      setBody('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showLoginPrompt = openLoginModal && isAuthenticated === false;

  return (
    <div className="bg-surface border border-border rounded-xl p-md pt-3 mb-lg">
      {showLoginPrompt ? (
        <div className="text-center py-xl">
          <p className="mb-md text-text-secondary font-medium">로그인 후 의견을 남길 수 있습니다.</p>
          <Button onClick={openLoginModal} size="sm">
            로그인
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-xs pt-1">
          <div className="flex items-center gap-sm flex-wrap pl-3">
            {nickname ? (
              <span className="font-bold text-[11pt] text-text-primary">{nickname}</span>
            ) : null}
            <div className="flex flex-wrap gap-1 pl-1">
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
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg p-md text-text-primary focus:outline-none focus:border-primary min-h-[100px] resize-none placeholder-text-muted"
            placeholder="상호 존중을 바탕으로 한 유익하고 생산적인 논의를 만들어주세요."
          />
          {opinionError && (
            <div className="text-danger text-sm font-bold bg-danger/10 px-md py-sm rounded-md border border-danger/20">
              {opinionError}
            </div>
          )}
          <div className="flex justify-between items-center gap-2 flex-wrap">
          <p className="text-[11px] text-text-muted flex items-center gap-1 m-0">
              <span className="material-symbols-outlined text-xs inline-block align-middle">info</span>
              AI가 부적절한 발언을 검사중입니다.
            </p>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !body.trim()}
              variant="primary"
              size="sm"
              className="text-sm"
            >
              {isSubmitting ? '안전성 검토 중...' : '등록하기'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
