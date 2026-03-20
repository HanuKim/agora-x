/**
 * GlobalFloatingButton — visible on all pages (except AI Discussion Detail & Detail)
 *
 * Tab 1: Trending topics (real data from selectedNews.json)
 * Tab 2: AI site assistant chatbot (with real data context)
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { claudeService } from '../../services/ai/claudeService';
import rawNewsData from '../../data/selectedNews.json';
import issuesData from '../../data/koreanSocialIssues.json';

/* ── Build real trending data from actual articles ──────────── */
interface TrendingItem {
    rank: number;
    topic: string;
    path: string;
    delta: 'up' | 'down' | 'new' | 'same';
    type: 'discussion' | 'practice';
}

const rawArticles = (rawNewsData as { selectedNews: Record<string, unknown>[] }).selectedNews;
const allIssues = (issuesData as { issues: { id: number; topic: string; category: string }[] }).issues;

function buildTrendingItems(): TrendingItem[] {
    const items: TrendingItem[] = [];
    const deltas: Array<'up' | 'down' | 'new' | 'same'> = ['up', 'up', 'new', 'same', 'down', 'up', 'same', 'new'];

    // Add articles from selectedNews (국민 토론)
    rawArticles.slice(0, 5).forEach((item, idx) => {
        const topic = (item.topic as string) ?? (item.article as Record<string, string>)?.title ?? '';
        items.push({
            rank: idx + 1,
            topic: topic.length > 30 ? topic.slice(0, 30) + '…' : topic,
            path: `/detail/${idx + 1}`,
            delta: deltas[idx % deltas.length],
            type: 'discussion',
        });
    });

    // Add issues from koreanSocialIssues (토론 연습)
    allIssues.slice(0, 3).forEach((issue, idx) => {
        items.push({
            rank: items.length + 1,
            topic: issue.topic.length > 30 ? issue.topic.slice(0, 30) + '…' : issue.topic,
            path: `/ai-discussion/${issue.id}`,
            delta: deltas[(idx + 5) % deltas.length],
            type: 'practice',
        });
    });

    return items;
}

/* ── Build real data context for AI assistant ──────────────── */
function buildDataContext(): string {
    const articleList = rawArticles.slice(0, 9).map((item, idx) => {
        const topic = (item.topic as string) ?? '';
        const article = item.article as Record<string, string>;
        const title = article?.title ?? '';
        return `  ${idx + 1}. [${topic}] ${title} → /detail/${idx + 1}`;
    }).join('\n');

    const issueList = allIssues.slice(0, 10).map((issue) => {
        return `  ${issue.id}. [${issue.category}] ${issue.topic} → /ai-discussion/${issue.id}`;
    }).join('\n');

    return `현재 등록된 국민 토론 기사:\n${articleList}\n\n현재 등록된 토론 연습 주제:\n${issueList}`;
}

interface ChatMsg {
    role: 'user' | 'assistant';
    content: string;
}

export const GlobalFloatingButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'trending' | 'chat'>('trending');
    const [trendingIndex, setTrendingIndex] = useState(0);
    const [showGuide, setShowGuide] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const trendingItems = useMemo(() => buildTrendingItems(), []);
    const dataContext = useMemo(() => buildDataContext(), []);

    // Chat state
    const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
        { role: 'assistant', content: '안녕하세요! Agora-X 안내 AI 아곰이입니다 🐻\n\n국민 토론, 제안, 토론 연습 등 궁금한 점을 물어보세요!\n주제를 말씀해주시면 관련 게시물을 찾아드릴게요.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Hide on AI discussion detail pages & detail pages (they have their own assistant)
    const isAIDetail = location.pathname.startsWith('/ai-discussion/');
    const isArenaDetail = location.pathname.endsWith('/arena');

    // Auto-rotate trending
    useEffect(() => {
        if (!isOpen || activeTab !== 'trending') return;
        const timer = setInterval(() => {
            setTrendingIndex(prev => (prev + 1) % trendingItems.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [isOpen, activeTab, trendingItems.length]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isSending]);

    // First-visit guide tooltip — show on every home page visit for prototype demo
    const isHomePage = location.pathname === '/';
    useEffect(() => {
        if (isHomePage && !isOpen) {
            const timer = setTimeout(() => setShowGuide(true), 1500);
            return () => clearTimeout(timer);
        } else {
            setShowGuide(false);
        }
    }, [isHomePage, isOpen]);

    // Auto-hide guide after 8s
    useEffect(() => {
        if (!showGuide) return;
        const timer = setTimeout(() => setShowGuide(false), 8000);
        return () => clearTimeout(timer);
    }, [showGuide]);

    const dismissGuide = () => {
        setShowGuide(false);
    };

    const handleSendChat = async () => {
        if (!chatInput.trim() || isSending) return;
        const userMsg = chatInput.trim();
        setChatInput('');
        const newMessages: ChatMsg[] = [...chatMessages, { role: 'user', content: userMsg }];
        setChatMessages(newMessages);
        setIsSending(true);

        try {
            // Enhanced system prompt with real data injected
            const reply = await claudeService.sendMessage({
                messages: [...newMessages.map(m => ({ role: m.role, content: m.content }))],
                systemPrompt: `당신은 "Agora-X" 시민 토론 플랫폼의 안내 AI "아곰이"입니다.

플랫폼 구조:
- 홈(/) : 메인 페이지, 인기 토론/제안 미리보기
- 국민 토론(/community) : 뉴스 기반 시민 토론. 찬/반/중립 투표 및 의견 등록. 상세페이지(/detail/:id)
- 국민 제안(/proposals) : 시민이 직접 사회 문제 제안. 새 제안(/proposals/new). 상세페이지(/proposals/:id)
- 토론 연습(/ai-discussion) : AI "아곰이"와 1:1 토론 연습. 상세페이지(/ai-discussion/:id)
- 마이페이지(/mypage) : 내 활동, 레벨, 스크랩, 알림, 지식수준 설정

${dataContext}

규칙:
- 200자 이내로 간결하게 답변
- 사용자가 주제를 언급하면 위 목록에서 관련도 높은 게시물을 찾아 제목과 경로를 안내
- 관련 페이지 경로를 [페이지명](경로) 형태로 안내
- 게시물 검색 요청 시 위 데이터에서 키워드를 매칭하여 실제 존재하는 게시물을 안내
- 플랫폼 외 질문은 정중히 거절`,
                maxTokens: 400,
            });
            setChatMessages([...newMessages, { role: 'assistant', content: reply.reply.trim() }]);
        } catch {
            setChatMessages([...newMessages, { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해주세요.' }]);
        } finally {
            setIsSending(false);
        }
    };

    // Don't render on detail pages or AI practice detail pages (they have AssistantModal)
    if (isAIDetail || isArenaDetail) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none" aria-live="polite">
            {/* Panel */}
            <div
                className={[
                    'w-full max-w-[380px] h-[680px] bg-bg rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden',
                    'transform-gpu transition-all duration-200 ease-out origin-bottom-right',
                    isOpen ? 'opacity-100 scale-100 translate-y-0 mb-4 pointer-events-auto' : 'opacity-0 scale-95 translate-y-2 pointer-events-none mb-0',
                ].join(' ')}
            >
                {/* Tab Header */}
                <div className="flex border-b border-border bg-surface shrink-0">
                    <button
                        onClick={() => setActiveTab('trending')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors border-none cursor-pointer ${activeTab === 'trending' ? 'text-primary border-b-2 border-primary bg-bg' : 'text-text-secondary bg-transparent hover:text-text-primary'}`}
                    >
                        <span className="material-icons-round text-base! align-middle mr-2">trending_up</span>
                        실시간 인기
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors border-none cursor-pointer ${activeTab === 'chat' ? 'text-primary border-b-2 border-primary bg-bg' : 'text-text-secondary bg-transparent hover:text-text-primary'}`}
                    >
                        <span className="material-icons-round text-base! align-middle mr-2">smart_toy</span>
                        AI 도우미
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-3 text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer"
                    >
                        <span className="material-icons-round text-base">close</span>
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'trending' ? (
                    /* ── Trending Tab ────────────── */
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                        <div className="flex items-center justify-between mb-3 ml-3">
                            <h3 className="text-md font-bold text-text-primary flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                실시간 인기 토론 주제
                            </h3>
                            <span className="text-[12px] text-text-secondary">
                                {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준
                            </span>
                        </div>

                        {trendingItems.map((item, idx) => (
                            <button
                                key={item.rank}
                                onClick={() => { navigate(item.path); setIsOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer border-none text-left ${idx === trendingIndex ? 'bg-primary/5 border border-primary/20' : 'bg-transparent hover:bg-surface'}`}
                            >
                                <span className={`w-6 h-6 flex items-center justify-center text-sm font-extrabold shrink-0 ${item.rank <= 3 ? 'text-primary' : 'text-text-secondary'}`}>
                                    {item.rank}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <span className={`text-[${idx === trendingIndex ? '14px' : '12px'}] transition-all duration-300 ease-in-out text-text-primary font-medium block truncate`}>{item.topic}</span>
                                    <span className={`text-[${idx === trendingIndex ? '11px' : '10px'}] transition-all duration-300 ease-in-out text-text-secondary`}>
                                        {item.type === 'discussion' ? '국민 토론' : '토론 연습'}
                                    </span>
                                </div>
                                <span className={`text-xs flex-shrink-0 ${item.delta === 'up' ? 'text-red-500' : item.delta === 'down' ? 'text-blue-500' : item.delta === 'new' ? 'text-primary font-bold' : 'text-text-secondary'}`}>
                                    {item.delta === 'up' ? '▲' : item.delta === 'down' ? '▼' : item.delta === 'new' ? 'NEW' : '-'}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    /* ── Chat Tab ─────────────────── */
                    <>
                        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
                            {chatMessages.map((m, i) => (
                                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                                    {m.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                                            <span className="text-sm">🐻</span>
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-keep ${m.role === 'user'
                                        ? 'bg-primary/10 text-text-primary rounded-tr-none'
                                        : 'bg-surface border border-border text-text-primary rounded-tl-none'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{m.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex gap-2">
                                    <div className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                                        <span className="text-sm animate-spin">🐻</span>
                                    </div>
                                    <div className="px-3 py-2 rounded-2xl rounded-tl-none bg-surface border border-border flex gap-1 items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-3 border-t border-border shrink-0">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    disabled={isSending}
                                    placeholder="무엇이든 물어보세요!"
                                    className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || isSending}
                                    className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 cursor-pointer border-none hover:bg-primary-hover transition-colors shrink-0"
                                >
                                    <span className="material-icons-round text-[16px] transform -rotate-45 translate-x-px -translate-y-px">send</span>
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>

            {/* Onboarding Tooltip */}
            {showGuide && !isOpen && (
                <div className="absolute bottom-[70px] right-0 w-[260px] bg-[#2B2E34] text-white rounded-2xl p-4 shadow-2xl animate-[fadeSlideUp_300ms_ease-out] pointer-events-auto"
                    style={{ animation: 'fadeSlideUp 300ms ease-out' }}
                >
                    <button onClick={dismissGuide} className="absolute top-2 right-2 text-white/50 hover:text-white bg-transparent border-none cursor-pointer">
                        <span className="material-icons-round text-md!">close</span>
                    </button>
                    <p className="text-sm font-bold mb-2 leading-snug"><span className='material-icons-round text-[20px]! text-primary'>campaign</span> 실시간 인기 주제를 조회하고,<br />챗봇과 대화를 시작해보세요!</p>
                    <p className="text-xs text-white/70 leading-relaxed">지금 가장 뜨거운 토론 주제를 확인하고, <br />AI 아곰이에게 궁금한 점을 물어보세요.</p>
                    {/* Arrow */}
                    <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#2B2E34]" />
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => { setIsOpen(!isOpen); if (showGuide) dismissGuide(); }}
                className="relative w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform border-none cursor-pointer pointer-events-auto mt-2"
                aria-label={isOpen ? '패널 닫기' : '패널 열기'}
            >
                {!isOpen && !showGuide && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-bg animate-bounce">
                        !
                    </span>
                )}
                <span className="material-icons-round text-[25px]!">
                    {isOpen ? 'close' : 'rocket_launch'}
                </span>
            </button>
        </div>
    );
};
