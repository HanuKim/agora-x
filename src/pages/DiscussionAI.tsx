import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import issuesData from '../data/koreanSocialIssues.json';

interface Issue {
    id: number;
    topic: string;
    category: string;
    pro: string[];
    con: string[];
}

const issues: Issue[] = (issuesData as { title: string; issues: Issue[] }).issues;

/** Map each category to a Tailwind color pair: [bg, text] */
const CATEGORY_COLORS: Record<string, string> = {
    '사법/인권': 'bg-[#8b5cf6]/10 text-[#8b5cf6]',
    '여성/보건': 'bg-[#ec4899]/10 text-[#ec4899]',
    '성소수자/인권': 'bg-danger/10 text-danger',
    '노동/경제': 'bg-warning/10 text-warning',
    '교육': 'bg-success/10 text-success',
    '에너지/환경': 'bg-[#22c55e]/10 text-[#22c55e]',
    '다문화/인권': 'bg-[#06b6d4]/10 text-[#06b6d4]',
    '교육/디지털': 'bg-[#3b82f6]/10 text-[#3b82f6]',
    '복지/경제': 'bg-[#6366f1]/10 text-[#6366f1]',
    '안보/군사': 'bg-[#64748b]/10 text-[#64748b]',
    '젠더/행정': 'bg-[#d946ef]/10 text-[#d946ef]',
    '부동산/경제': 'bg-[#f97316]/10 text-[#f97316]',
    '의료/교육': 'bg-[#14b8a6]/10 text-[#14b8a6]',
    '디지털/인권': 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
    '의료/복지': 'bg-[#84cc16]/10 text-[#84cc16]',
    '보건/법률': 'bg-[#a78bfa]/10 text-[#a78bfa]',
    '노동/고령화': 'bg-[#fb923c]/10 text-[#fb923c]',
    '기술/세금': 'bg-[#34d399]/10 text-[#34d399]',
    '생명윤리/의료': 'bg-danger/10 text-danger',
};

const DEFAULT_BADGE = 'bg-surface text-text-secondary';

export const DiscussionAI: React.FC = () => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selectedIssue = selectedId !== null ? issues.find((i) => i.id === selectedId) : null;

    return (
        <div className="px-xl py-xl max-w-[1100px] mx-auto">
            <h1 className="text-[2.25rem] font-extrabold mb-sm">AI와의 토론</h1>
            <p className="text-text-secondary mb-xl">
                객관적인 시각의 AI와 함께 한국 사회의 주요 쟁점들을 깊게 파헤쳐 봅니다.
            </p>

            {!selectedIssue ? (
                /* ─── Topic List ─── */
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-lg">
                    {issues.map((issue) => {
                        const badgeClass = CATEGORY_COLORS[issue.category] ?? DEFAULT_BADGE;
                        return (
                            <Card
                                key={issue.id}
                                className="flex flex-col gap-sm cursor-pointer hover:shadow-lg transition-shadow duration-200"
                                onClick={() => setSelectedId(issue.id)}
                            >
                                <span className={`self-start text-xs font-bold px-sm py-[2px] rounded-full ${badgeClass}`}>
                                    {issue.category}
                                </span>
                                <h3 className="text-lg font-semibold text-text-primary m-0">{issue.topic}</h3>
                                <p className="text-xs text-text-secondary flex-1">
                                    <span className="text-success font-semibold">찬성</span>
                                    {' · '}{issue.pro[0].substring(0, 30)}…
                                </p>
                                <Button variant="secondary" size="sm" className="self-end">
                                    토론 시작하기 →
                                </Button>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                /* ─── Detail View ─── */
                <div>
                    <Button variant="secondary" onClick={() => setSelectedId(null)} className="mb-lg">
                        ← 목록으로 돌아가기
                    </Button>

                    <Card className="p-xl">
                        {/* Header */}
                        <div className="mb-lg">
                            <span className={`inline-block text-xs font-bold px-sm py-[3px] rounded-full mb-sm ${CATEGORY_COLORS[selectedIssue.category] ?? DEFAULT_BADGE}`}>
                                {selectedIssue.category}
                            </span>
                            <h2 className="text-[1.75rem] font-bold text-text-primary m-0">
                                {selectedIssue.topic}
                            </h2>
                        </div>

                        {/* Pro / Con */}
                        <div className="grid grid-cols-2 gap-lg mb-xl">
                            {/* Pro */}
                            <div className="p-lg border-2 border-success rounded-md bg-success/5">
                                <h4 className="text-success mt-0 mb-md text-lg flex items-center gap-[6px]">
                                    ✅ 찬성 입장
                                </h4>
                                <ul className="m-0 pl-[18px] flex flex-col gap-sm">
                                    {selectedIssue.pro.map((point, idx) => (
                                        <li key={idx} className="text-sm text-text-primary leading-relaxed">
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* Con */}
                            <div className="p-lg border-2 border-danger rounded-md bg-danger/5">
                                <h4 className="text-danger mt-0 mb-md text-lg flex items-center gap-[6px]">
                                    ❌ 반대 입장
                                </h4>
                                <ul className="m-0 pl-[18px] flex flex-col gap-sm">
                                    {selectedIssue.con.map((point, idx) => (
                                        <li key={idx} className="text-sm text-text-primary leading-relaxed">
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Chat placeholder */}
                        <div className="pt-lg border-t border-border text-center">
                            <p className="text-text-secondary mb-md">
                                이곳에 AI 기반 대화창이 구현될 예정입니다.
                            </p>
                            <Button disabled>채팅 입력창 (준비 중)</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
