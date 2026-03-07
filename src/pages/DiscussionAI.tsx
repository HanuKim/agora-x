/**
 * DiscussionAI Page
 *
 * 토론 주제 목록 페이지
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IssueCard } from '../components/discussion/IssueCard';
import { useIssueWithAI } from '../features/discussion/useIssueWithAI';

export const DiscussionAI: React.FC = () => {
    const { issues } = useIssueWithAI();
    const navigate = useNavigate();

    return (
        <div className="px-xl py-xl max-w-[1100px] mx-auto">
            <h1 className="text-[2.25rem] font-extrabold mb-sm">일대일 토론</h1>
            <p className="text-text-secondary mb-xl">
                Agora-X의 AI, 아곰이와 함께 한국 사회의 주요 쟁점들을 깊게 파헤쳐 봅니다.
            </p>

            {/* 주제 목록 */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-lg">
                {issues.map((issue) => (
                    <IssueCard
                        key={issue.id}
                        issue={issue}
                        onClick={() => navigate(`/ai-discussion/${issue.id}`)}
                    />
                ))}
            </div>
        </div>
    );
};

