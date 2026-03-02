import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { IssueCard } from '../components/discussion/IssueCard';
import { getCategoryBadgeClass } from '../design/categoryColors';
import issuesData from '../data/koreanSocialIssues.json';

interface Issue {
    id: number;
    topic: string;
    category: string;
    pro: string[];
    con: string[];
}

const issues: Issue[] = (issuesData as { title: string; issues: Issue[] }).issues;



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
                    {issues.map((issue) => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            onClick={() => setSelectedId(issue.id)}
                        />
                    ))}
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
                            <span className={`inline-block text-xs font-bold px-sm py-[3px] rounded-full mb-sm ${getCategoryBadgeClass(selectedIssue.category)}`}>
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
