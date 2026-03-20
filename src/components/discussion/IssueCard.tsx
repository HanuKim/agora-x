/**
 * IssueCard — AI 토론 주제 카드
 *
 * 사용처:
 *  - Home.tsx        (가로 스크롤 "토론 연습하기" 섹션, compact 모드)
 *  - DiscussionAI.tsx (토픽 그리드 전체 목록)
 *
 * Props:
 *  - issue     : Issue 데이터 (topic, category, pro, con)
 *  - onClick   : 카드 클릭 핸들러
 *  - compact   : true → 홈에서 쓰는 좁은 카드 (w-[220px], 간소화된 액션)
 */
import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getCategoryBadgeClass } from '../../design/categoryColors';
import { useIssueSummary, type SocialIssue } from '../../features/discussion/useIssueWithAI';

export interface IssueCardData extends SocialIssue { }

interface IssueCardProps {
    issue: IssueCardData;
    onClick: () => void;
    /** compact=true: Home 가로 스크롤용 (좁은 고정 너비). false/undefined: DiscussionAI 그리드용 */
    compact?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onClick, compact }) => {
    const badgeClass = getCategoryBadgeClass(issue.category);
    const { summary, loading } = useIssueSummary(issue);

    if (compact) {
        return (
            <Card
                className={`snap-start flex-shrink-0 w-[300px] h-[215px] flex flex-col gap-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]`}
                onClick={onClick}
            >
                <span className={`self-start text-xs font-bold px-sm py-[2px] rounded-full ${badgeClass}`}>
                    {issue.category}
                </span>
                <h3 className="text-lg font-semibold text-text-primary leading-snug line-clamp-3">
                    {issue.topic}
                </h3>
                <p className="text-md text-text-secondary line-clamp-3 flex-1">
                    {loading ? (
                        <span className="animate-pulse">AI 요약 생성 중...</span>
                    ) : (
                        summary
                    )}
                </p>
                <span className="text-sm font-semibold text-primary mt-auto">
                    토론 시작하기 →
                </span>
            </Card>
        );
    }

    return (
        <Card
            className={`flex flex-col gap-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.5)]`}
            onClick={onClick}
        >
            <span className={`self-start text-xs font-bold px-sm py-[2px] rounded-full ${badgeClass}`}>
                {issue.category}
            </span>
            <h3 className="text-xl font-bold text-text-primary m-0">{issue.topic}</h3>
            <p className="text-md text-text-secondary flex-1 line-clamp-2 leading-relaxed">
                {loading ? (
                    <span className="animate-pulse">AI 요약 생성 중...</span>
                ) : (
                    summary
                )}
            </p>
            <Button variant="secondary" size="md" className="bg-transparent! self-end text-primary!">
                토론 시작하기 →
            </Button>
        </Card>
    );
};

