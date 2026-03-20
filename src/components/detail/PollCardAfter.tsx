import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface PollCardAfterProps {
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

export const PollCardAfter: React.FC<PollCardAfterProps> = ({
    proCount,
    neutralCount,
    conCount,
    deadlineText = '투표 마감까지 3일',
    onEdit,
}) => {
    const total = proCount + neutralCount + conCount;
    const proPercent = total > 0 ? Math.round((proCount / total) * 100) : 0;
    const neutralPercent = total > 0 ? Math.round((neutralCount / total) * 100) : 0;
    const conPercent = total > 0 ? Math.round((conCount / total) * 100) : 0;

    // 비중이 가장 높은 결과(동률이면 찬성 → 보류 → 반대 순)
    const leading =
        proPercent >= neutralPercent && proPercent >= conPercent
            ? { label: '찬성', percent: proPercent }
            : neutralPercent >= conPercent
                ? { label: '보류', percent: neutralPercent }
                : { label: '반대', percent: conPercent };

    // total=0이면 회색 빈 차트, 그 외 conic-gradient: green(찬성) → gray(보류) → red(반대)
    const gradientStops =
        total === 0
            ? '#e5e5e5 0% 100%'
            : [
                `#10b981 0% ${proPercent}%`,
                `#9ca3af ${proPercent}% ${proPercent + neutralPercent}%`,
                `#ef4444 ${proPercent + neutralPercent}% 100%`,
            ].join(', ');

    return (
        <aside className="flex justify-center lg:pt-xl mb-lg lg:mb-0">
            <Card
                variant="glass"
                padding="lg"
                className="pb-[12px] w-full max-w-[260px] text-center relative overflow-hidden"
            >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-success via-border to-danger" />
                <h3 className="mt-sm font-bold text-base mb-md text-text-primary">현재 여론 현황</h3>

                <div className="relative w-28 h-28 mx-auto mb-sm">
                    <div
                        className="poll-chart-reveal w-full h-full rounded-full"
                        style={{
                            background: `conic-gradient(${gradientStops})`,
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[55%] h-[55%] rounded-full bg-bg" />
                    </div>
                    {/* 투표 결과 텍스트: 비중이 가장 높은 결과와 퍼센트 */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-text-primary">{leading.percent}%</span>
                            <span className="text-[10px] font-bold uppercase text-text-secondary">{leading.label}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between text-[11px] font-bold text-text-secondary mb-sm px-xs">
                    <span className="flex-1 text-center text-success">{proPercent}%<br />찬성</span>
                    <span className="flex-1 text-center">{neutralPercent}%<br />보류</span>
                    <span className="flex-1 text-center text-danger">{conPercent}%<br />반대</span>
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
                <p className="mt-sm text-sm text-text-secondary">{deadlineText}</p>
            </Card>
        </aside>
    );
};
