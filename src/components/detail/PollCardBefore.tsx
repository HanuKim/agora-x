import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export type PollVote = 'pro' | 'neutral' | 'con';

export interface PollCardBeforeProps {
    /** 현재 선택된 투표 (없으면 null) */
    selectedVote: PollVote | null;
    /** 투표 선택 핸들러 */
    onSelect: (vote: PollVote) => void;
    /** 투표하기 버튼 클릭 핸들러 (선택 후에만 활성화) */
    onSubmit: () => void;
    /** 투표 마감 안내 문구 */
    deadlineText?: string;
}

export const PollCardBefore: React.FC<PollCardBeforeProps> = ({
    selectedVote,
    onSelect,
    onSubmit,
    deadlineText = '투표 마감까지 3일',
}) => {
    return (
        <aside className="flex justify-center lg:pt-xl mb-lg lg:mb-0">
            <Card
                variant="glass"
                padding="lg"
                className="pb-[12px] w-full max-w-[260px] text-center relative overflow-hidden flex flex-col"
            >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-success via-border to-danger" />

                <h3 className="mt-sm font-bold text-base mb-md text-text-primary">토론 참여하기</h3>

                <div className="flex flex-col gap-2 mb-md justify-center flex-grow">
                    <button
                        type="button"
                        onClick={() => onSelect('pro')}
                        className={`w-full h-[43px] rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer ${selectedVote === 'pro'
                            ? 'border-success bg-success/20 text-success ring-2 ring-success/40'
                            : 'border-success/30 bg-success/5 text-success hover:bg-success/10'
                            }`}
                    >
                        찬성
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelect('con')}
                        className={`w-full h-[43px] rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer ${selectedVote === 'con'
                            ? 'border-danger bg-danger/20 text-danger ring-2 ring-danger/40'
                            : 'border-danger/30 bg-danger/5 text-danger hover:bg-danger/10'
                            }`}
                    >
                        반대
                    </button>
                    <button
                        type="button"
                        onClick={() => onSelect('neutral')}
                        className={`w-full h-[43px] rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer ${selectedVote === 'neutral'
                            ? 'border-border bg-surface text-text-primary ring-2 ring-border'
                            : 'border-border bg-stone-100/5 text-text-secondary hover:bg-stone-100/10'
                            }`}
                    >
                        보류
                    </button>
                </div>

                <div className="mt-auto">
                    <Button
                        type="button"
                        variant="primary"
                        size="md"
                        fullWidth
                        className="whitespace-nowrap"
                        onClick={onSubmit}
                        disabled={selectedVote === null}
                    >
                        투표하기
                        <span className="material-icons-round text-base ml-1">how_to_vote</span>
                    </Button>
                    <p className="mt-sm text-sm text-text-secondary font-medium">{deadlineText}</p>
                </div>
            </Card>
        </aside>
    );
};
