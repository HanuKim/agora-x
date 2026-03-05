/**
 * DiscussionAI Page
 *
 * 토론 주제 목록 → 이슈 선택 → AI 심화 분석 상세 페이지
 *
 * v2: useIssueWithAI(캐시-퍼스트)를 통해 선택 시점에 on-demand AI 분석 표시.
 * 지식 수준은 UserPrefsContext에서 읽어 claudeService 프롬프트에 반영됩니다.
 */
import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { IssueCard } from '../components/discussion/IssueCard';
import { getCategoryBadgeClass } from '../design/categoryColors';
import { useIssueWithAI, type SocialIssue } from '../features/discussion/useIssueWithAI';

export const DiscussionAI: React.FC = () => {
    const { issues, analysisMap, loadingMap, fetchIssueAnalysis } = useIssueWithAI();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selectedIssue = selectedId !== null ? issues.find((i) => i.id === selectedId) : null;
    const analysis = selectedId !== null ? analysisMap[selectedId] : undefined;
    const isLoading = selectedId !== null ? (loadingMap[selectedId] ?? false) : false;

    // 이슈 선택 시 AI 분석 on-demand 로드
    useEffect(() => {
        if (selectedIssue) {
            fetchIssueAnalysis(selectedIssue);
        }
    }, [selectedIssue, fetchIssueAnalysis]);

    return (
        <div className="px-xl py-xl max-w-[1100px] mx-auto">
            <h1 className="text-[2.25rem] font-extrabold mb-sm">AI와의 토론</h1>
            <p className="text-text-secondary mb-xl">
                객관적인 시각의 AI와 함께 한국 사회의 주요 쟁점들을 깊게 파헤쳐 봅니다.
            </p>

            {!selectedIssue ? (
                /* ─── 주제 목록 ─── */
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
                /* ─── 상세 뷰 ─── */
                <div>
                    <Button variant="secondary" onClick={() => setSelectedId(null)} className="mb-lg">
                        ← 목록으로 돌아가기
                    </Button>

                    <Card className="p-xl">
                        {/* 헤더 */}
                        <div className="mb-lg">
                            <span
                                className={`inline-block text-xs font-bold px-sm py-[3px] rounded-full mb-sm ${getCategoryBadgeClass(selectedIssue.category)}`}
                            >
                                {selectedIssue.category}
                            </span>
                            <h2 className="text-[1.75rem] font-bold text-text-primary m-0">
                                {selectedIssue.topic}
                            </h2>
                        </div>

                        {/* AI 분석 패널 */}
                        {isLoading ? (
                            <AILoadingPanel />
                        ) : analysis ? (
                            <AIAnalysisPanel issue={selectedIssue} analysis={analysis} />
                        ) : (
                            /* API 없거나 실패 시 기본 찬반 표시 */
                            <BasicProConPanel issue={selectedIssue} />
                        )}

                        {/* 채팅 placeholder */}
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

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────────────────

const AILoadingPanel: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-xl gap-md text-text-secondary animate-pulse">
        <span className="text-2xl">🤖</span>
        <p className="text-sm font-medium">AI가 설정된 지식 수준으로 분석 중...</p>
    </div>
);

interface AIAnalysisPanelProps {
    issue: SocialIssue;
    analysis: NonNullable<ReturnType<typeof useIssueWithAI>['analysisMap'][number]>;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ analysis }) => (
    <div className="flex flex-col gap-lg mb-xl">
        {/* 배경 설명 */}
        <div className="p-md bg-surface rounded-md border border-border">
            <h4 className="text-sm font-bold text-text-secondary mt-0 mb-xs uppercase tracking-wide">
                🧠 AI 배경 설명
            </h4>
            <p className="text-sm text-text-primary leading-relaxed m-0">{analysis.background}</p>
        </div>

        {/* 핵심 쟁점 */}
        {analysis.keyPoints.length > 0 && (
            <div className="p-md bg-primary/5 rounded-md border border-primary/20">
                <h4 className="text-sm font-bold text-primary mt-0 mb-xs uppercase tracking-wide">
                    ⚡ 핵심 쟁점
                </h4>
                <ul className="m-0 pl-[18px] flex flex-col gap-xs">
                    {analysis.keyPoints.map((kp, i) => (
                        <li key={i} className="text-sm text-text-primary leading-relaxed">
                            {kp}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {/* 찬반 심화 논거 */}
        <div className="grid grid-cols-2 gap-lg">
            <div className="p-lg border-2 border-success rounded-md bg-success/5">
                <h4 className="text-success mt-0 mb-md text-base flex items-center gap-[6px] font-bold">
                    ✅ 찬성 심화 논거
                </h4>
                <ul className="m-0 pl-[18px] flex flex-col gap-sm">
                    {analysis.proArguments.map((point, idx) => (
                        <li key={idx} className="text-sm text-text-primary leading-relaxed">
                            {point}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-lg border-2 border-danger rounded-md bg-danger/5">
                <h4 className="text-danger mt-0 mb-md text-base flex items-center gap-[6px] font-bold">
                    ❌ 반대 심화 논거
                </h4>
                <ul className="m-0 pl-[18px] flex flex-col gap-sm">
                    {analysis.conArguments.map((point, idx) => (
                        <li key={idx} className="text-sm text-text-primary leading-relaxed">
                            {point}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

const BasicProConPanel: React.FC<{ issue: SocialIssue }> = ({ issue }) => (
    <div className="grid grid-cols-2 gap-lg mb-xl">
        <div className="p-lg border-2 border-success rounded-md bg-success/5">
            <h4 className="text-success mt-0 mb-md text-lg flex items-center gap-[6px]">✅ 찬성 입장</h4>
            <ul className="m-0 pl-[18px] flex flex-col gap-sm">
                {issue.pro.map((point, idx) => (
                    <li key={idx} className="text-sm text-text-primary leading-relaxed">{point}</li>
                ))}
            </ul>
        </div>
        <div className="p-lg border-2 border-danger rounded-md bg-danger/5">
            <h4 className="text-danger mt-0 mb-md text-lg flex items-center gap-[6px]">❌ 반대 입장</h4>
            <ul className="m-0 pl-[18px] flex flex-col gap-sm">
                {issue.con.map((point, idx) => (
                    <li key={idx} className="text-sm text-text-primary leading-relaxed">{point}</li>
                ))}
            </ul>
        </div>
    </div>
);
