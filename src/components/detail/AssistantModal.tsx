import React, { useEffect, useRef } from 'react';
import { useAssistant } from '../../features/detail/useAssistant';

interface AssistantModalProps {
  /** 토론 주제/기사 쟁점 */
  issueTopic: string;
  /** 우측 하단 플로팅 여부 (기본 true) */
  floating?: boolean;
}

export const AssistantModal: React.FC<AssistantModalProps> = ({ issueTopic, floating = true }) => {
  const { isOpen, toggle, close, input, setInput, messages, isResponding, hasUnread, send } = useAssistant({
    issueTopic,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canRender = Boolean(issueTopic?.trim());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isOpen, isResponding]);

  if (!canRender) return null;

  const containerClass = floating
    ? 'fixed bottom-6 right-6 z-50 flex flex-col items-end'
    : 'w-full flex flex-col items-end';

  return (
    <div className={containerClass} aria-live="polite">
      {/* Chat Modal — 부드러운 open/close 모션 */}
      <div
        className={[
          'w-full max-w-[380px] h-[550px] bg-bg rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden',
          'transform-gpu transition-all duration-200 ease-out origin-bottom-right',
          isOpen ? 'opacity-100 scale-100 translate-y-0 mb-4' : 'opacity-0 scale-95 translate-y-2 pointer-events-none mb-0',
        ].join(' ')}
        role="dialog"
        aria-label="AI 토론 어시스턴트"
        aria-hidden={!isOpen}
      >
          {/* Header */}
          <header className="p-4 border-b border-border flex items-center justify-between bg-bg shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                <span className="material-icons-round text-[18px]">bolt</span>
              </div>
              <h3 className="font-bold text-text-primary truncate">AI 토론 어시스턴트</h3>
            </div>
            <button
              type="button"
              className="text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer p-1"
              onClick={close}
              aria-label="닫기"
            >
              <span className="material-icons-round">close</span>
            </button>
          </header>

          {/* Chat History — DiscussionAIDetail과 동일 레이아웃 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scroll-smooth min-h-0">
            <div className="flex justify-center">
              <span className="text-[8pt] font-medium text-text-secondary bg-surface px-3 py-1 rounded-full border border-border">
                오늘의 세션 시작
              </span>
            </div>

            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 max-w-full ${isUser ? 'self-end flex-row-reverse' : ''}`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-border shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-br from-primary to-orange-400 text-white'
                        : 'bg-surface text-text-primary'
                    }`}
                  >
                    {isUser ? (
                      <span className="text-xs font-bold font-sans">ME</span>
                    ) : (
                      <span className="text-lg">🐻</span>
                    )}
                  </div>
                  <div className={`flex flex-col gap-1 w-full min-w-0 ${isUser ? 'items-end' : ''}`}>
                    <span className={`text-[8pt] font-bold text-text-secondary ${isUser ? 'mr-1' : 'ml-1'}`}>
                      {isUser ? '나' : '아곰이'}
                    </span>
                    <div
                      className={`px-4 py-3 shadow-sm text-sm leading-relaxed break-keep min-w-0 max-w-[90%] ${
                        isUser
                          ? 'bg-primary/10 text-text-primary border border-primary/20 rounded-2xl rounded-tr-none'
                          : 'bg-surface border border-border rounded-2xl rounded-tl-none text-text-primary'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {isResponding && (
              <div className="flex gap-4 max-w-full">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface text-text-primary flex items-center justify-center border-2 border-border shadow-sm">
                  <span className="text-lg animate-spin">🐻</span>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <span className="text-xs font-bold text-text-secondary ml-1">아곰이</span>
                  <div className="p-4 bg-surface border border-border rounded-2xl rounded-tl-none shadow-sm flex gap-1 w-20 items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-text-secondary animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-text-secondary animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-text-secondary animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input — DiscussionAIDetail과 동일 */}
          <footer className="p-4 bg-surface border-t border-border shrink-0">
            <div className="relative">
              <form
                className={`relative bg-bg rounded-2xl border transition-all shadow-sm ${
                  isResponding ? 'border-border opacity-70' : 'border-border focus-within:border-primary'
                }`}
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isResponding}
                  rows={2}
                  className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-4 pr-18 min-h-[60px] max-h-[70px] resize-none text-text-primary placeholder-text-secondary cursor-text"
                  placeholder={isResponding ? 'AI가 답변을 작성 중입니다...' : '의견을 입력해주세요.'}
                />
                <div className="absolute bottom-2 right-1 flex items-center gap-2 px-2">
                  <button
                    type="button"
                    disabled={isResponding}
                    className="h-10 w-10 flex items-center justify-center transition-colors rounded-xl text-text-secondary hover:text-text-primary disabled:opacity-50 bg-transparent border-none cursor-pointer"
                    aria-label="음성 입력"
                  >
                    <span className="material-icons-round text-lg">mic</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!input.trim() || isResponding}
                    className="h-9 w-9 bg-primary text-white rounded-xl flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors border-none cursor-pointer"
                    aria-label="전송"
                  >
                    <span className="material-icons-round text-lg transform -rotate-45 translate-x-0.5 -translate-y-0.5">send</span>
                  </button>
                </div>
              </form>
            </div>
          </footer>
      </div>

      {/* Toggle Button */}
      <button
        type="button"
        className="relative w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform border-none cursor-pointer"
        onClick={toggle}
        aria-label={isOpen ? '챗봇 닫기' : '챗봇 열기'}
      >
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-bg">
            N
          </span>
        )}
        <span className="material-icons-round text-[28px]">{isOpen ? 'close' : 'chat_bubble'}</span>
      </button>
    </div>
  );
};

