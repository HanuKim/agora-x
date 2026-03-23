/**
 * DiscussionAI Page
 *
 * 토론 주제 목록 페이지 + 사용자 커스텀 주제 생성
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IssueCard } from '../components/discussion/IssueCard';
import { useIssueWithAI } from '../features/discussion/useIssueWithAI';
import { SearchFilter } from '../components/common/SearchFilter';
import { CONTENT_CATEGORIES } from '../features/common/types';
import { EmptyState } from '../components/ui/EmptyState';
import { claudeService } from '../services/ai/claudeService';
import { getChatHistories, saveChatHistory } from '../services/db/historyDB';

export const DiscussionAI: React.FC = () => {
    const { issues } = useIssueWithAI();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('전체');

    // Custom prompt state
    const [customPrompt, setCustomPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Custom history state
    const [customHistories] = useState(getChatHistories().filter(h => h.type === 'ai_discussion'));

    const tabs = ['전체', ...CONTENT_CATEGORIES];

    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.topic.includes(searchQuery) || issue.pro.some(p => p.includes(searchQuery)) || issue.con.some(c => c.includes(searchQuery));
        const matchesCategory = activeTab === '전체' || issue.category === activeTab;
        return matchesSearch && matchesCategory;
    });

    const handleCustomGenerate = async () => {
        if (!customPrompt.trim() || isGenerating) return;
        setIsGenerating(true);
        try {
            const result = await claudeService.generateCustomIssueSummary(customPrompt.trim());
            const newId = Date.now();
            const newCustomIssue = {
                id: newId,
                topic: result.topic,
                category: result.category,
                pro: result.pro,
                con: result.con,
                background: result.background,
                keyPoints: result.keyPoints,
            };

            // Save to history so it appears in the list
            saveChatHistory({
                id: `ai-discussion-custom-${newId}`,
                type: 'ai_discussion',
                title: result.topic,
                topic: result.topic,
                category: result.category,
                lastMessageAt: Date.now(),
                customIssueData: newCustomIssue,
                messages: []
            });

            // Navigate to detail page with custom issue data via state
            navigate(`/ai-discussion/custom/${newId}`, {
                state: { customIssue: newCustomIssue }
            });
        } catch (err) {
            console.error('Custom issue generation failed:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="px-xl py-xl max-w-[1200px] mx-auto w-full">
            <div className="mb-xl">
                <h1 className="text-[2.25rem] font-extrabold mb-sm">토론 연습</h1>
                <p className="text-text-secondary mb-lg">
                    Agora-X의 AI, 아곰이와 함께 한국 사회의 주요 쟁점들을 깊게 파헤쳐 봅니다.
                </p>

                {/* ── Custom Topic Prompt ────────────── */}
                <div className="mb-xl bg-gradient-to-r from-primary/5 to-amber-500/5 border border-primary/20 rounded-2xl p-lg">
                    <div className="flex items-center gap-md mb-md">
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-icons-round text-primary text-base">add_circle</span>
                        </span>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">나만의 토론 주제 만들기</h3>
                            <p className="text-md text-text-secondary">원하는 주제를 입력하면 아곰이가 토론 쟁점을 구조화 하여 토론을 시작합니다.</p>
                        </div>
                    </div>
                    <div className="flex gap-md">
                        <input
                            type="text"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCustomGenerate()}
                            placeholder="예: 주 4일제 도입에 대해 토론하고 싶어요"
                            className="flex-1 bg-bg border border-border rounded-xl px-md py-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
                            disabled={isGenerating}
                        />
                        <button
                            onClick={handleCustomGenerate}
                            disabled={!customPrompt.trim() || isGenerating}
                            className="px-md py-sm bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-sm border-none"
                        >
                            {isGenerating ? (
                                <>
                                    <span className="animate-spin">🐻</span>
                                    생성 중...
                                </>
                            ) : (
                                <>
                                    <span className="material-icons-round">auto_awesome</span>
                                    아곰이와 토론 시작
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {customHistories.length > 0 && (
                    <div className="mb-xl">
                        <h3 className="text-xl font-bold text-text-primary mb-md flex items-center gap-xs">
                            <span className="material-icons-round text-primary">history</span>
                            내가 생성한 토론 주제
                        </h3>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-md">
                            {customHistories.map((history) => (
                                <IssueCard
                                    key={history.id}
                                    issue={{
                                        id: history.customIssueData?.id || 0,
                                        topic: history.topic,
                                        category: (history.category || '기타') as any,
                                        pro: history.customIssueData?.pro || [],
                                        con: history.customIssueData?.con || []
                                    }}
                                    onClick={() => navigate(`/ai-discussion/custom/${history.customIssueData?.id}`, {
                                        state: { customIssue: history.customIssueData }
                                    })}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <SearchFilter
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabs={tabs}
                />
            </div>

            {/* 주제 목록 */}
            {filteredIssues.length === 0 ? (
                <EmptyState
                    message="검색 결과가 없습니다."
                    icon="search_off"
                    description="검색어나 필터를 변경해 보세요."
                />
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-lg">
                    {filteredIssues.map((issue) => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            onClick={() => navigate(`/ai-discussion/${issue.id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

