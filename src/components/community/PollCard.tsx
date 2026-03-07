import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface PollCardProps {
    /** 찬성 투표 수 */
    proCount: number;
    /** 보류 투표 수 */
    neutralCount: number;
    /** 반대 투표 수 */
    conCount: number;
    /** 투표 마감 안내 문구 */
    deadlineText?: string;
    /** 수정하기 버튼 클릭 핸들러 */
    onEdit: () => void;
}

export const PollCard: React.FC<PollCardProps> = ({
    proCount,
    neutralCount,
    conCount,
    deadlineText = '투표 마감까지 3일 남음',
    onEdit,
}) => {
    const total = proCount + neutralCount + conCount;
    const proPercent = total > 0 ? Math.round((proCount / total) * 100) : 0;
    const neutralPercent = total > 0 ? Math.round((neutralCount / total) * 100) : 0;
    const conPercent = total > 0 ? Math.round((conCount / total) * 100) : 0;

    // conic-gradient: green(찬성) → gray(보류) → red(반대), 순서대로
    const gradientStops = [
        `#10b981 0% ${proPercent}%`,
        `#9ca3af ${proPercent}% ${proPercent + neutralPercent}%`,
        `#ef4444 ${proPercent + neutralPercent}% 100%`,
    ].join(', ');

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
                    <div
                        className="w-full h-full rounded-full"
                        style={{
                            background: `conic-gradient(${gradientStops})`,
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[55%] h-[55%] rounded-full bg-bg" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center">
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
                    onClick={onEdit}
                >
                    수정하기
                    <span className="material-icons-round text-base ml-1">how_to_vote</span>
                </Button>
                <p className="mt-xs text-[11px] text-text-secondary">{deadlineText}</p>
            </Card>
        </aside>
    );
};
