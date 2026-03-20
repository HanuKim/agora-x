import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArena } from '../features/detail/useArena';
import { useAuth } from '../features/auth';
import { claudeService, type UserArgumentAnalysis } from '../services/ai/claudeService';
import type { ArenaOpinion } from '../features/common/types';
import { GlobalDialog } from '../components/common/GlobalDialog';
import { saveChatHistory } from '../services/db/historyDB';
import { Button } from '../components/ui/Button';

/* ── AI Help Types (same as DiscussionAIDetail) ────────── */
type HelpType = 'organize' | 'argument' | 'counter' | 'free';
const HELP_BUTTONS: { type: HelpType; label: string; icon: string }[] = [
    { type: 'organize', label: '의견 정리', icon: 'sort' },
    { type: 'argument', label: '논거 추천', icon: 'tips_and_updates' },
    { type: 'counter', label: '반론 예상', icon: 'shield' },
];

export const DiscussionArena: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, openLoginModal } = useAuth();
    const arena = useArena(user?.id);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [initialOpinion, setInitialOpinion] = useState('');
    const [selectedStance, setSelectedStance] = useState<'pro' | 'con' | null>(null);

    // Opinion analysis (from DiscussionAIDetail pattern)
    const [opinionAnalysis, setOpinionAnalysis] = useState<UserArgumentAnalysis>({
        clarity: 0, relevance: 0, logicValid: 0, feedback: "대기 중"
    });

    // AI Help state
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [helpRemaining, setHelpRemaining] = useState(10);
    const [helpLoading, setHelpLoading] = useState(false);
    const [helpResponse, setHelpResponse] = useState('');
    const [freeHelpInput, setFreeHelpInput] = useState('');

    // Reset dialog
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [arena.messages, arena.isLoading]);

    // Analyze user argument when messages change
    useEffect(() => {
        const userMsgs = arena.messages.filter(m => m.role === 'user');
        if (userMsgs.length === 0) return;
        const lastMsg = userMsgs[userMsgs.length - 1];
        claudeService.analyzeUserArgument(arena.debateTopic ?? '토론', lastMsg.content)
            .then(setOpinionAnalysis)
            .catch(() => { /* ignore */ });
    }, [arena.messages, arena.debateTopic]);

    // Save Chat History for MyPage
    useEffect(() => {
        if (arena.messages.length > 0 && arena.article) {
            saveChatHistory({
                id: `arena-${arena.numericId}`,
                type: 'arena',
                title: arena.debateTopic || '토론장 참여',
                topic: arena.debateTopic || '',
                category: arena.article.category,
                articleId: arena.numericId,
                lastMessageAt: Date.now(),
                messages: arena.messages.map(m => ({
                    role: m.role === 'system' ? 'assistant' : m.role as 'user' | 'assistant',
                    content: m.content
                }))
            });
        }
    }, [arena.messages, arena.article, arena.debateTopic, arena.numericId]);

    // AI Help handler
    const handleAIHelp = async (helpType: HelpType) => {
        if (helpRemaining <= 0 || helpLoading) return;
        setHelpLoading(true);
        setHelpResponse('');
        try {
            const chatHistory = arena.messages.map(m => ({
                role: m.role === 'system' ? 'assistant' as const : m.role as 'user' | 'assistant',
                content: m.content,
            }));
            const response = await claudeService.generateDebateHelp(
                arena.debateTopic ?? '토론',
                chatHistory,
                helpType,
                helpType === 'free' ? freeHelpInput : undefined
            );
            setHelpResponse(response);
            setHelpRemaining(prev => prev - 1);
            setFreeHelpInput('');
        } catch {
            setHelpResponse('도움 생성에 실패했습니다.');
        } finally {
            setHelpLoading(false);
        }
    };

    const insertHelpToInput = () => {
        if (helpResponse) {
            arena.setInputMessage(prev => prev + (prev ? '\n' : '') + helpResponse);
            setHelpResponse('');
            setIsHelpOpen(false);
        }
    };

    const handleResetChat = () => {
        setIsResetDialogOpen(false);
        // Reset the page by reloading
        window.location.reload();
    };

    if (!arena.isValidId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-bg min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-text-primary mb-4">잘못된 접근입니다</h1>
                    <button onClick={() => navigate('/community')}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold cursor-pointer border-none hover:bg-primary-hover transition-colors">
                        목록으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative w-full h-full bg-bg font-sans">
            {/* ═══ Left Sidebar: Context & Analysis ═══ */}
            <aside className="w-full md:w-[35%] lg:w-[30%] bg-surface border-r border-border flex flex-col h-full z-0 overflow-y-auto">
                <div className="p-6 md:p-8 space-y-8">
                    {/* Back button & Topic */}
                    <div>
                        <button onClick={() => navigate(`/detail/${arena.numericId}`)}
                            className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-md font-bold mb-6">
                            <span className="material-icons-round">arrow_back</span>
                            상세페이지로 이동
                        </button>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-icons-round text-primary text-lg!">psychology</span>
                            <span className="text-md font-bold uppercase tracking-widest text-text-secondary">AI 중재 토론장</span>
                        </div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight text-text-primary mb-4 break-keep">
                            {arena.debateTopic ?? '토론 주제를 불러오는 중...'}
                        </h1>
                        {arena.stance && (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-md font-bold border ${arena.stance === 'pro'
                                ? 'bg-success/10 text-success border-success/20'
                                : 'bg-danger/10 text-danger border-danger/20'
                                }`}>
                                {arena.stance === 'pro' ? '찬성' : '반대'} 입장
                            </span>
                        )}
                    </div>

                    {/* Issue Summary */}
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold uppercase tracking-wide text-text-secondary flex items-center justify-between">
                            쟁점 요약
                            <button
                                onClick={() => setIsResetDialogOpen(true)}
                                className="flex items-center gap-1 text-md! bg-surface-variant hover:bg-danger/10 hover:text-danger px-2 py-1 rounded transition-colors border border-border cursor-pointer"
                                title="대화 내용 초기화"
                            >
                                <span className="material-icons-round text-md!">restart_alt</span>
                                초기화
                            </button>
                        </h3>
                        <div className="p-4 rounded-xl bg-bg border border-border hover:border-primary/30 transition-colors">
                            <p className="text-md text-text-primary leading-relaxed break-keep">
                                {arena.overview ?? 'AI가 기사 분석 중...'}
                            </p>
                        </div>
                        {arena.articleUrl && (
                            <a href={arena.articleUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-md! text-primary hover:text-primary-hover transition-colors font-medium">
                                <span className="material-icons-round">open_in_new</span>
                                원문 기사 보기
                            </a>
                        )}
                    </div>

                    {/* Discussion Guide */}
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold uppercase tracking-wide text-text-secondary">토론 안내</h3>
                        {[
                            { icon: 'check_circle', color: 'text-success', text: 'AI가 다른 시민들의 반대 의견을 제시합니다' },
                            { icon: 'check_circle', color: 'text-success', text: '의견을 주고받으며 논점을 발전시키세요' },
                            { icon: 'check_circle', color: 'text-success', text: '토론 종료 후 최종 입장을 투표합니다' },
                            { icon: 'swap_horiz', color: 'text-primary', text: '입장 변화 시 가장 영향을 준 의견을 선택합니다' },
                        ].map((item, i) => (
                            <div key={i} className="p-3 rounded-xl bg-bg border border-border text-md flex items-center gap-3">
                                <span className={`material-icons-round mt-0.5 ${item.color}`}>{item.icon}</span>
                                <p className="text-text-primary leading-relaxed break-keep">{item.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Argument Analysis Dashboard (same as DiscussionAIDetail) */}
                    {arena.phase === 'chatting' && (
                        <div className="hidden md:block mt-auto pt-6 border-t border-border">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-[#25282e] dark:to-[#1a1c20] rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary blur-[50px] opacity-10 rounded-full pointer-events-none" />
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div>
                                        <h3 className="font-bold text-lg text-white">논리적 일관성 분석</h3>
                                        <p className="text-sm text-gray-400 mt-1">최근 발언 기준으로 주장을 분석합니다.</p>
                                    </div>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                                        <span className="material-icons-round text-primary text-sm">analytics</span>
                                    </div>
                                </div>
                                <div className="space-y-3 relative z-10 mb-4">
                                    {[
                                        { label: '명확성', value: opinionAnalysis.clarity, color: 'bg-green-400', textColor: 'text-green-400' },
                                        { label: '관련성', value: opinionAnalysis.relevance, color: 'bg-primary', textColor: 'text-primary' },
                                        { label: '오류 검증', value: opinionAnalysis.logicValid, color: 'bg-blue-400', textColor: 'text-blue-400' },
                                    ].map((metric) => (
                                        <div key={metric.label}>
                                            <div className="flex justify-between text-sm font-medium text-gray-400 mb-1">
                                                <span>{metric.label}</span>
                                                <span className={metric.textColor}>{metric.value}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                                <div className={`h-full ${metric.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${metric.value}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {opinionAnalysis.feedback !== "대기 중" && (
                                    <div className="mt-3 pt-3 border-t border-gray-700 relative z-10">
                                        <p className="text-sm text-gray-300 leading-relaxed break-keep">
                                            💡 {opinionAnalysis.feedback}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Round counter */}
                            <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
                                <span>토론 라운드</span>
                                <span className="text-lg font-bold text-primary">{arena.roundCount}</span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* ═══ Right Main: Chat Interface ═══ */}
            <section className="flex-1 flex flex-col relative h-full">

                {/* ── Phase: Stance Selection ── */}
                {arena.phase === 'stance-select' && (
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
                        <div className="w-full text-center space-y-8">
                            <div>
                                <span className="material-icons-round text-4xl! text-primary mb-4 block">how_to_vote</span>
                                <h2 className="text-2xl font-bold text-text-primary mb-2">입장을 선택하고 의견을 작성해주세요</h2>
                                <p className="text-md text-text-secondary break-keep leading-relaxed">
                                    선택한 입장에서 의견을 작성하면, AI가 반대 입장의 시민 의견을 제시하며 토론을 진행합니다.
                                </p>
                            </div>

                            {/* Stance buttons */}
                            <div className="flex gap-4 justify-center">
                                <button type="button"
                                    className={`flex items-center gap-3 px-8 py-4 rounded-xl border-2 transition-all font-bold text-base cursor-pointer ${selectedStance === 'pro'
                                        ? 'border-success bg-success/10 text-success scale-105 shadow-md'
                                        : 'border-border bg-surface text-text-secondary hover:border-success/50 hover:text-success'
                                        }`}
                                    onClick={() => setSelectedStance('pro')}>
                                    <span className="material-icons-round">thumb_up</span>
                                    찬성
                                </button>
                                <button type="button"
                                    className={`flex items-center gap-3 px-8 py-4 rounded-xl border-2 transition-all font-bold text-base cursor-pointer ${selectedStance === 'con'
                                        ? 'border-danger bg-danger/10 text-danger scale-105 shadow-md'
                                        : 'border-border bg-surface text-text-secondary hover:border-danger/50 hover:text-danger'
                                        }`}
                                    onClick={() => setSelectedStance('con')}>
                                    <span className="material-icons-round">thumb_down</span>
                                    반대
                                </button>
                            </div>

                            {/* Opinion textarea */}
                            {selectedStance && (
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full min-h-[220px] p-4 rounded-xl border border-border bg-bg text-text-primary text-md resize-none focus:outline-none focus:border-primary transition-all placeholder-text-secondary"
                                        placeholder="이 주제에 대한 당신의 의견을 자유롭게 작성해주세요..."
                                        value={initialOpinion}
                                        onChange={(e) => setInitialOpinion(e.target.value)}
                                    />
                                    <div className='flex justify-end'>
                                        <Button
                                            variant="primary"

                                            disabled={!initialOpinion.trim()}
                                            onClick={() => {
                                                if (!isAuthenticated || !user) { openLoginModal(); return; }
                                                arena.startDiscussion(selectedStance, initialOpinion);
                                            }}>
                                            <span className="material-icons-round mr-2 text-lg">send</span>
                                            토론 시작하기
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Phase: Chatting ── */}
                {arena.phase === 'chatting' && (
                    <>
                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col scroll-smooth">
                            <div className="flex justify-center my-4">
                                <span className="text-xs font-medium text-text-secondary bg-surface px-3 py-1 rounded-full border border-border">
                                    AI 중재 토론 시작
                                </span>
                            </div>

                            {arena.messages.map((msg, idx) => {
                                const isUser = msg.role === 'user';
                                return (
                                    <div key={idx} className={`flex gap-4 max-w-3xl ${isUser ? 'self-end flex-row-reverse' : ''}`}>
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-border shadow-sm ${isUser
                                            ? 'bg-gradient-to-br from-primary to-orange-400 text-white'
                                            : 'bg-surface text-text-primary'
                                            }`}>
                                            {isUser
                                                ? <span className="text-xs font-bold">ME</span>
                                                : <span className="text-2xl">🐻</span>}
                                        </div>
                                        <div className={`flex flex-col gap-1 w-full ${isUser ? 'items-end' : ''}`}>
                                            <span className={`text-xs font-bold text-text-secondary ${isUser ? 'mr-1' : 'ml-1'}`}>
                                                {isUser ? '나' : '아곰이'}
                                            </span>
                                            <div className={`p-5 shadow-sm text-sm md:text-base leading-relaxed break-keep ${isUser
                                                ? 'bg-primary/10 text-text-primary border border-primary/20 rounded-2xl rounded-tr-none'
                                                : 'bg-surface border border-border rounded-2xl rounded-tl-none text-text-primary'
                                                }`}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                            {/* Opposing opinions shown as cards */}
                                            {!isUser && msg.opposingOpinions && msg.opposingOpinions.length > 0 && (
                                                <div className="space-y-2 mt-2 ml-1">
                                                    {msg.opposingOpinions.map((op) => (
                                                        <div key={op.id} className="flex items-start gap-2 p-3 rounded-xl bg-bg border border-border text-left">
                                                            <span className="material-icons-round text-xs text-danger mt-0.5">record_voice_over</span>
                                                            <div>
                                                                <p className="text-md text-text-primary break-keep leading-relaxed">{op.body}</p>
                                                                <span className="text-sm text-text-muted mt-1 block">— {op.authorName}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {arena.isLoading && (
                                <div className="flex gap-4 max-w-3xl">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface text-text-primary flex items-center justify-center border-2 border-border shadow-sm">
                                        <span className="text-lg animate-spin">🐻</span>
                                    </div>
                                    <div className="flex flex-col gap-1 w-full">
                                        <span className="text-xs font-bold text-text-secondary ml-1">아곰이</span>
                                        <div className="p-4 bg-surface border border-border rounded-2xl rounded-tl-none shadow-sm flex gap-1 w-20 items-center justify-center">
                                            <span className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* AI Help Panel */}
                        {isHelpOpen && (
                            <div className="border-t border-border bg-surface/90 backdrop-blur-sm p-4 md:p-6 shrink-0 z-10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">🐻</span>
                                        <h4 className="text-sm font-bold text-text-primary">AI에게 도움받기</h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${helpRemaining > 3 ? 'bg-emerald-500/10 text-emerald-500' : helpRemaining > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {helpRemaining}/10회 남음
                                        </span>
                                    </div>
                                    <button onClick={() => setIsHelpOpen(false)} className="text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-1">
                                        <span className="material-icons-round text-base">close</span>
                                    </button>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {HELP_BUTTONS.map((btn) => (
                                        <button key={btn.type} onClick={() => handleAIHelp(btn.type)}
                                            disabled={helpLoading || helpRemaining <= 0}
                                            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-bg border border-border text-sm font-bold text-text-primary hover:border-primary hover:text-primary transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                                            <span className="material-icons-round text-sm">{btn.icon}</span>
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={freeHelpInput}
                                        onChange={(e) => setFreeHelpInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && freeHelpInput.trim() && handleAIHelp('free')}
                                        placeholder="자유 질문: 예) 이 주장의 약점은?"
                                        disabled={helpLoading || helpRemaining <= 0}
                                        className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary disabled:opacity-40" />
                                    <button onClick={() => freeHelpInput.trim() && handleAIHelp('free')}
                                        disabled={!freeHelpInput.trim() || helpLoading || helpRemaining <= 0}
                                        className="px-3 py-2 bg-primary text-white rounded-xl text-sm font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-none hover:bg-primary-hover transition-colors">
                                        질문
                                    </button>
                                </div>
                                {helpLoading && (
                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                        <span className="animate-spin text-base">🐻</span>
                                        도움을 생성하고 있습니다...
                                    </div>
                                )}
                                {helpResponse && (
                                    <div className="bg-bg border border-primary/20 rounded-xl p-4 space-y-2">
                                        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-keep">{helpResponse}</p>
                                        <button onClick={insertHelpToInput}
                                            className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover transition-colors bg-transparent border-none cursor-pointer">
                                            <span className="material-icons-round">content_paste</span>
                                            채팅에 붙여넣기
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Chat Input (same style as DiscussionAIDetail) */}
                        <div className="p-4 md:p-6 bg-surface border-t border-border shrink-0 z-10">
                            <div className="max-w-4xl mx-auto relative">
                                <div className="flex items-center gap-4 px-2 mb-2">
                                    <button onClick={() => setIsHelpOpen(!isHelpOpen)}
                                        className={`flex items-center gap-1 text-md font-bold transition-colors bg-transparent border-none cursor-pointer ${isHelpOpen ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}>
                                        <span className="material-icons-round">psychology</span>
                                        AI 도움받기
                                        {helpRemaining < 10 && <span className="text-[10px] text-text-secondary">({helpRemaining})</span>}
                                    </button>
                                    <span className="text-border">|</span>
                                    <button onClick={arena.startFinalVote}
                                        className="flex items-center gap-1 text-md font-bold text-text-secondary hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
                                        <span className="material-icons-round">how_to_vote</span>
                                        토론 종료 &amp; 최종 투표
                                    </button>
                                    <span className="text-sm text-text-muted ml-auto">{arena.roundCount}라운드 진행 중</span>
                                </div>
                                <div className={`relative bg-bg rounded-2xl border transition-all shadow-sm ${arena.isLoading ? 'border-border opacity-70' : 'border-border focus-within:border-primary'}`}>
                                    <textarea
                                        ref={textareaRef}
                                        value={arena.inputMessage}
                                        onChange={(e) => arena.setInputMessage(e.target.value)}
                                        disabled={arena.isLoading}
                                        className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-4 pb-14 min-h-[60px] max-h-[150px] resize-none text-text-primary placeholder-text-secondary cursor-text"
                                        placeholder={arena.isLoading ? "AI가 답변을 작성 중입니다..." : "의견을 입력해주세요."}
                                        rows={2}
                                    />
                                    <div className="absolute bottom-2 right-1 flex items-center gap-2 px-2">
                                        <button onClick={() => arena.sendMessage(arena.inputMessage)}
                                            disabled={!arena.inputMessage.trim() || arena.isLoading}
                                            className="h-9 w-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors border-none cursor-pointer">
                                            <span className="material-icons-round text-lg transform -rotate-45 translate-x-0.5 -translate-y-0.5">send</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Phase: Final Vote ── */}
                {arena.phase === 'final-vote' && (
                    <FinalVoteView
                        initialStance={arena.stance!}
                        presentedOpinions={arena.presentedOpinions}
                        selectedInfluentialOpinionId={arena.selectedInfluentialOpinionId}
                        setSelectedInfluentialOpinionId={arena.setSelectedInfluentialOpinionId}
                        onSubmit={arena.submitFinalVote}
                    />
                )}

                {/* ── Phase: Completed ── */}
                {arena.phase === 'completed' && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <span className="material-icons-round text-4xl! text-success mb-4">celebration</span>
                        <h2 className="text-2xl font-bold text-text-primary mb-2">토론이 완료되었습니다!</h2>
                        <p className="text-md text-text-secondary mb-6 break-keep">
                            {arena.finalStance !== arena.stance
                                ? '토론을 통해 입장이 변화했습니다. 선택하신 의견이 영향력 순위에 반영됩니다.'
                                : '기존 입장을 유지하셨습니다. 소중한 의견 감사합니다!'}
                        </p>
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`px-4 py-2 rounded-full text-sm font-bold ${arena.stance === 'pro' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                토론 전 : {arena.stance === 'pro' ? '찬성' : '반대'}
                            </div>
                            {arena.finalStance !== arena.stance && (
                                <>
                                    <span className="material-icons-round text-primary">arrow_forward</span>
                                    <div className={`px-4 py-2 rounded-full text-sm font-bold ${arena.finalStance === 'pro' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                                        토론 후 : {arena.finalStance === 'pro' ? '찬성' : '반대'}
                                    </div>
                                </>
                            )}
                        </div>
                        <button onClick={() => navigate(`/detail/${arena.numericId}`)}
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold cursor-pointer border-none hover:bg-primary-hover transition-colors flex items-center gap-2">
                            <span className="material-icons-round">arrow_back</span>
                            상세페이지로 돌아가기
                        </button>
                    </div>
                )}
            </section>

            <GlobalDialog
                isOpen={isResetDialogOpen}
                title="토론 내역 초기화"
                message={"지금까지의 AI와의 대화 내역이 모두 삭제됩니다.\n정말로 초기화하시겠습니까?"}
                confirmText="초기화"
                isDestructive={true}
                onConfirm={handleResetChat}
                onCancel={() => setIsResetDialogOpen(false)}
            />
        </div>
    );
};

/* ── Final Vote Sub-component ─────────────────────────────── */

const FinalVoteView: React.FC<{
    initialStance: 'pro' | 'con';
    presentedOpinions: ArenaOpinion[];
    selectedInfluentialOpinionId: string | null;
    setSelectedInfluentialOpinionId: (id: string | null) => void;
    onSubmit: (stance: 'pro' | 'con', influentialOpinionId?: string) => void;
}> = ({ initialStance, presentedOpinions, selectedInfluentialOpinionId, setSelectedInfluentialOpinionId, onSubmit }) => {
    const [chosenStance, setChosenStance] = useState<'pro' | 'con'>(initialStance);
    const stanceChanged = chosenStance !== initialStance;
    const oppositeOpinions = presentedOpinions.filter(o => o.stance !== initialStance);

    return (
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center">
            <div className="w-full">
                <div className="text-center mb-8">
                    <span className="material-icons-round text-4xl! text-primary mb-4 block">how_to_vote</span>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">최종 투표</h2>
                    <p className="text-md text-text-secondary">토론을 통해 최종 입장을 선택해주세요.</p>
                </div>

                <div className="flex gap-4 mb-8 justify-center">
                    <button type="button"
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all font-bold cursor-pointer ${chosenStance === 'pro' ? 'border-success bg-success/10 text-success shadow-md' : 'border-border bg-surface text-text-secondary hover:border-success/50'
                            }`}
                        onClick={() => setChosenStance('pro')}>
                        <span className="material-icons-round">thumb_up</span> 찬성
                    </button>
                    <button type="button"
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all font-bold cursor-pointer ${chosenStance === 'con' ? 'border-danger bg-danger/10 text-danger shadow-md' : 'border-border bg-surface text-text-secondary hover:border-danger/50'
                            }`}
                        onClick={() => setChosenStance('con')}>
                        <span className="material-icons-round">thumb_down</span> 반대
                    </button>
                </div>

                {stanceChanged && oppositeOpinions.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-md font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="material-icons-round text-lg! text-primary">star</span>
                            입장 변화에 가장 큰 영향을 준 의견을 선택해주세요
                        </h3>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {oppositeOpinions.map((op) => (
                                <button key={op.id} type="button"
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedInfluentialOpinionId === op.id
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'border-border bg-surface hover:border-primary/30'
                                        }`}
                                    onClick={() => setSelectedInfluentialOpinionId(op.id)}>
                                    <p className="text-md text-text-primary break-keep">{op.body}</p>
                                    <span className="text-sm text-text-muted mt-2 block">— {op.authorName}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-center">
                    <button type="button"
                        className="w-[200px] py-3 bg-primary text-white rounded-xl font-bold text-base cursor-pointer border-none hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={stanceChanged && !selectedInfluentialOpinionId}
                        onClick={() => onSubmit(chosenStance, selectedInfluentialOpinionId ?? undefined)}>
                        <span className="material-icons-round">check_circle</span>
                        {stanceChanged ? '입장 변화 확정하기' : '입장 유지 확정하기'}
                    </button>
                </div>

                {stanceChanged && !selectedInfluentialOpinionId && (
                    <p className="text-md text-text-muted text-center mt-3">
                        입장이 변화한 경우, 영향을 준 의견을 반드시 선택해주세요.
                    </p>
                )}
            </div>
        </div>
    );
};
