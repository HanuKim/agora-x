import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIssueWithAI } from '../features/discussion/useIssueWithAI';
import { claudeService, type UserArgumentAnalysis } from '../services/ai/claudeService';
import { getChatSession, setChatSession } from '../services/ai/aiCacheDB';
import { useUserPrefs } from '../features/user/hooks/useUserPrefs';

export const DiscussionAIDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { issues, analysisMap, loadingMap, fetchIssueAnalysis } = useIssueWithAI();
    const { getLevelForCategory } = useUserPrefs();

    const issueId = Number(id);
    const issue = issues.find((i) => i.id === issueId);
    const analysis = analysisMap[issueId];
    const isLoading = loadingMap[issueId] ?? true;

    // Chat State
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Analysis State
    const [opinionAnalysis, setOpinionAnalysis] = useState<UserArgumentAnalysis>({
        clarity: 0,
        relevance: 0,
        logicValid: 0,
        feedback: "대기 중"
    });

    const [isRecording, setIsRecording] = useState(false);

    // Recognition instance reference
    const recognitionRef = useRef<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initial setup & Restore Chat History
    useEffect(() => {
        const loadSession = async () => {
            if (!issue) return;

            fetchIssueAnalysis(issue);

            const savedSession = await getChatSession(issue.id);
            if (savedSession && savedSession.messages.length > 0) {
                setMessages(savedSession.messages);
                setOpinionAnalysis(savedSession.opinionAnalysis);
            } else {
                // Initialize default chat with AI greeting if no saved history
                setMessages([{
                    role: 'assistant',
                    content: `안녕하세요! **'${issue.topic}'** 주제에 대해 토론할 준비가 되었습니다.\n\n저는 객관적인 관점에서 사용자의 논리를 분석하고 반대편의 입장을 제시하겠습니다.\n\n어느 입장에 서서 발제하시겠습니까?`
                }]);
            }
        };

        if (issue) {
            loadSession();
        } else if (!isLoading && !issue) {
            navigate('/ai-discussion', { replace: true });
        }
    }, [issue, fetchIssueAnalysis, isLoading, navigate]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatLoading]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !issue) return;

        const userText = inputMessage.trim();
        const newHistory: { role: 'user' | 'assistant', content: string }[] = [
            ...messages,
            { role: 'user', content: userText }
        ];

        setMessages(newHistory);
        setInputMessage('');
        setIsChatLoading(true);

        try {
            // 병렬로 AI 응답과 사용자 주장 분석을 요청합니다.
            const knowledgeLevel = getLevelForCategory(issue.category as any);
            const [replyResponse, analysisResponse] = await Promise.all([
                claudeService.generateChatReply(issue.topic, newHistory, knowledgeLevel),
                claudeService.analyzeUserArgument(issue.topic, userText)
            ]);

            const finalMessages: { role: 'user' | 'assistant', content: string }[] = [...newHistory, { role: 'assistant', content: replyResponse }];

            setMessages(finalMessages);
            setOpinionAnalysis(analysisResponse);

            await setChatSession(issue.id, {
                messages: finalMessages,
                opinionAnalysis: analysisResponse
            });

        } catch (error) {
            console.error("Chat Error:", error);
        } finally {
            setIsChatLoading(false);
        }
    };

    // Voice Input Toggle
    const toggleRecording = () => {
        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("현재 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해 주세요.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.interimResults = true; // Show results while recording
        recognition.continuous = true;

        recognition.onresult = (event: any) => {
            let newlyFinalized = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    newlyFinalized += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            // Temporarily replace/append to inputMessage (in a real app, might want to handle existing text carefully)
            setInputMessage((prev) => {
                // To avoid clearing previous manual text, we ideally only append. 
                // For simplicity here, we assume user is purely dictating or we append to end.
                const basePath = prev.replace(/\[음성 입력 중\.\.\.\].*$/g, '').trim();
                return basePath + (basePath && newlyFinalized ? ' ' : '') + newlyFinalized + (interimTranscript ? ` [음성 입력 중...] ${interimTranscript}` : '');
            });
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
            setInputMessage(prev => prev.replace(/\[음성 입력 중\.\.\.\].*$/g, '').trim());
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsRecording(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            // "엔터 말고 해당 버튼으로만 보내지도록 해주세요" 요청 반영
            // 아무 기능도 안 함. 브라우저 기본 동작으로 줄바꿈만 일어남.
            return;
        }
    };

    const insertFormatting = (prefix: string, suffix: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = inputMessage;

        const selectedText = currentText.substring(start, end);
        const newText = currentText.substring(0, start) + prefix + selectedText + suffix + currentText.substring(end);

        setInputMessage(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    if (!issue) return null;

    return (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative w-full h-full bg-bg font-sans">
            {/* Left Sidebar: Issue Analysis ────────────────────────────────────────────── */}
            <aside className="w-full md:w-[35%] lg:w-[30%] bg-surface border-r border-border flex flex-col h-full z-0 overflow-y-auto">
                <div className="p-6 md:p-8 space-y-8">
                    {/* Header Back Button & Topic Header */}
                    <div>
                        <button onClick={() => navigate('/ai-discussion')} className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-sm font-bold mb-6">
                            <span className="material-icons-round text-lg">arrow_back</span>
                            이슈 목록으로
                        </button>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-icons-round text-primary text-sm">public</span>
                            <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">토론 주제</span>
                        </div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight text-text-primary mb-4 break-keep">
                            {issue.topic}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/20`}>
                                {issue.category}
                            </span>
                        </div>
                    </div>

                    {/* AI Background / Subpoints */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary flex items-center justify-between">
                            AI 배경 분석
                        </h3>

                        <div className="p-4 rounded-xl bg-bg border border-border hover:border-primary/30 transition-colors cursor-default">
                            <p className="text-sm text-text-primary leading-relaxed break-keep">
                                {isLoading ? (
                                    <span className="animate-pulse">배경 분석 중...</span>
                                ) : (
                                    analysis?.background || '배경 설명 데이터가 없습니다.'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Key Points */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary flex items-center justify-between">
                            핵심 논점
                        </h3>

                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 bg-bg rounded-xl border border-border animate-pulse mb-3"></div>
                            ))
                        ) : (
                            // Render key points OR fallback to pro/con if keyPoints array is empty
                            (analysis?.keyPoints?.length ? analysis.keyPoints : [...(analysis?.proArguments || []), ...(analysis?.conArguments || [])].slice(0, 3)).map((kp, idx) => {
                                const palettes = [
                                    { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
                                    { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
                                    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
                                ];
                                const bColor = palettes[idx % palettes.length];
                                return (
                                    <div key={idx} className="p-4 rounded-xl bg-bg border border-border hover:border-primary/30 transition-colors cursor-default group">
                                        <div className="flex items-start gap-3">
                                            <span className={`flex-shrink-0 w-6 h-6 rounded-full ${bColor.bg} ${bColor.text} flex items-center justify-center text-xs font-bold mt-0.5`}>
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm text-text-primary leading-relaxed break-keep">{kp}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Analysis Dashboard Placeholder (from prototype) */}
                    <div className="hidden md:block mt-auto pt-6 border-t border-border">
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-[#25282e] dark:to-[#1a1c20] rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary blur-[50px] opacity-10 rounded-full pointer-events-none"></div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <h3 className="font-display font-bold text-sm text-white">논리적 일관성 분석</h3>
                                    <p className="text-[10px] text-gray-400 mt-1">최근 발언 기준으로 주장을 분석합니다.</p>
                                </div>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                                    <span className="material-icons-round text-primary text-sm">analytics</span>
                                </div>
                            </div>
                            <div className="space-y-3 relative z-10 mb-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-medium text-gray-400 mb-1">
                                        <span>명확성</span>
                                        <span className="text-green-400">{opinionAnalysis.clarity}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${opinionAnalysis.clarity}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-medium text-gray-400 mb-1">
                                        <span>관련성</span>
                                        <span className="text-primary">{opinionAnalysis.relevance}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${opinionAnalysis.relevance}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] font-medium text-gray-400 mb-1">
                                        <span>오류 검증</span>
                                        <span className="text-blue-400">{opinionAnalysis.logicValid}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${opinionAnalysis.logicValid}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            {opinionAnalysis.feedback !== "대기 중" && (
                                <div className="mt-3 pt-3 border-t border-gray-700 relative z-10">
                                    <p className="text-xs text-gray-300 leading-relaxed break-keep">
                                        💡 {opinionAnalysis.feedback}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Right Sidebar: Chat Interface ───────────────────────────────────────────── */}
            <section className="flex-1 flex flex-col relative h-full">

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col scroll-smooth">
                    <div className="flex justify-center my-4">
                        <span className="text-xs font-medium text-text-secondary bg-surface px-3 py-1 rounded-full border border-border">
                            오늘의 세션 시작
                        </span>
                    </div>

                    {messages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div key={idx} className={`flex gap-4 max-w-3xl ${isUser ? 'self-end flex-row-reverse' : ''}`}>
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-border shadow-sm ${isUser
                                    ? 'bg-gradient-to-br from-primary to-orange-400 text-white'
                                    : 'bg-surface dark:bg-surface-dark text-text-primary'
                                    }`}>
                                    {isUser ? (
                                        <span className="text-xs font-bold font-sans">ME</span>
                                    ) : (
                                        <span className="text-2xl">🐻</span>
                                    )}
                                </div>
                                <div className={`flex flex-col gap-1 w-full ${isUser ? 'items-end' : ''}`}>
                                    <span className={`text-xs font-bold text-text-secondary ${isUser ? 'mr-1' : 'ml-1'}`}>
                                        {isUser ? '나' : '아곰이'}
                                    </span>
                                    <div className={`p-5 shadow-sm text-sm md:text-base leading-relaxed break-keep ${isUser
                                        ? 'bg-primary/10 text-text-primary border border-primary/20 rounded-2xl rounded-tr-none'
                                        : 'bg-surface dark:bg-surface-dark border border-border rounded-2xl rounded-tl-none text-text-primary'
                                        }`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isChatLoading && (
                        <div className="flex gap-4 max-w-3xl">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface dark:bg-surface-dark text-text-primary flex items-center justify-center border-2 border-border shadow-sm">
                                <span className="text-lg animate-spin">🐻</span>
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <span className="text-xs font-bold text-text-secondary ml-1">아곰이</span>
                                <div className="p-4 bg-surface border border-border rounded-2xl rounded-tl-none shadow-sm flex gap-1 w-20 items-center justify-center">
                                    <span className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-4 md:p-6 bg-surface border-t border-border shrink-0 z-10">
                    <div className="max-w-4xl mx-auto relative">
                        <div className="flex items-center gap-4 px-2 mb-2">
                            <button
                                onClick={() => insertFormatting('[', '](url)')}
                                className="text-text-secondary hover:text-text-primary transition-colors text-xs font-medium flex items-center gap-1"
                            >
                                <span className="material-icons-round text-sm">link</span> 링크
                            </button>
                            <button
                                onClick={() => insertFormatting('- ')}
                                className="text-text-secondary hover:text-text-primary transition-colors text-xs font-medium flex items-center gap-1"
                            >
                                <span className="material-icons-round text-sm">list</span> 목록
                            </button>
                        </div>
                        <div className={`relative bg-bg rounded-2xl border transition-all shadow-sm ${isChatLoading ? 'border-border opacity-70' : 'border-border focus-within:border-primary'
                            }`}>
                            <textarea
                                ref={textareaRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isChatLoading}
                                id={`opinion-${id}`}
                                className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-4 pb-14 min-h-[60px] max-h-[150px] resize-none text-text-primary placeholder-text-secondary cursor-text"
                                placeholder={isChatLoading ? "AI가 답변을 작성 중입니다..." : "의견을 입력해주세요."}
                                rows={2}
                            ></textarea>
                            <div className="absolute bottom-2 right-1 flex items-center gap-2 px-2">
                                <button
                                    onClick={toggleRecording}
                                    disabled={isChatLoading}
                                    className={`h-10 w-10 flex items-center justify-center transition-colors rounded-xl ${isRecording ? 'text-danger animate-pulse bg-danger/10' : 'text-text-secondary hover:text-text-primary'}`}
                                >
                                    <span className="material-icons-round text-lg">mic</span>
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isChatLoading}
                                    className="h-9 w-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
                                >
                                    <span className="material-icons-round text-lg transform -rotate-45 translate-x-0.5 -translate-y-0.5">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
