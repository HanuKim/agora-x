import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface PollCardProps {
    /** 찬성 비율 (%) */
    proPercent?: number;
    /** 보류 비율 (%) */
    neutralPercent?: number;
    /** 반대 비율 (%) */
    conPercent?: number;
    /** 투표 마감 안내 문구 */
    deadlineText?: string;
    /** 투표하기 버튼 클릭 핸들러 */
    onVote?: () => void;
}

export const PollCard: React.FC<PollCardProps> = ({
    proPercent = 55,
    neutralPercent = 20,
    conPercent = 25,
    deadlineText = '투표 마감까지 3일 남음',
    onVote,
}) => {
    return (
        <aside className="lg:col-span-2 flex justify-center lg:pt-xl mb-lg lg:mb-0">
            <Card
                variant="glass"
                padding="lg"
                className="w-full max-w-[260px] text-center relative overflow-hidden"
            >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-success via-border to-danger" />
                <h3 className="mt-sm font-bold text-base mb-md text-text-primary">현재 여론 현황</h3>

                <div className="relative w-24 h-24 mx-auto mb-md">
                    <div className="w-full h-full rounded-full border-[6px] border-border flex items-center justify-center">
                        <div className="w-[70%] h-[70%] rounded-full bg-success/10 flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-text-primary">{proPercent}%</span>
                            <span className="text-[10px] font-bold uppercase text-text-secondary">찬성</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between text-[11px] font-bold text-text-secondary mb-md px-xs">
                    <span className="text-success">{proPercent}% 찬성</span>
                    <span>{neutralPercent}% 보류</span>
                    <span className="text-danger">{conPercent}% 반대</span>
                </div>

                <Button
                    type="button"
                    variant="primary"
                    size="md"
                    fullWidth
                    className="whitespace-nowrap"
                    onClick={onVote}
                >
                    투표하기
                    <span className="material-icons-round text-base">how_to_vote</span>
                </Button>
                <p className="mt-xs text-[11px] text-text-secondary">{deadlineText}</p>
            </Card>
        </aside>
    );
};
