import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KnowledgeLevel } from '../user/types';
import { claudeService } from '../../services/ai/claudeService';

export type AssistantRole = 'user' | 'assistant';

export interface AssistantMessage {
  id: string;
  role: AssistantRole;
  content: string;
  createdAt: number;
}

interface UseAssistantParams {
  issueTopic: string;
  knowledgeLevel?: KnowledgeLevel;
  initialOpen?: boolean;
}

type AssistantExternalListener = (payload: { issueTopic: string; content: string }) => void;

const externalListeners = new Set<AssistantExternalListener>();

/**
 * Detail 페이지의 DiscussionInput 등 "외부 입력"을 AssistantModal로 전달하는 브릿지.
 * - UI 컴포넌트/페이지는 이 함수를 호출만 하고, 채팅 상태 관리는 useAssistant가 담당합니다.
 */
export function sendAssistantUserMessage(issueTopic: string, content: string) {
  const trimmedTopic = issueTopic.trim();
  const trimmedContent = content.trim();
  if (!trimmedTopic || !trimmedContent) return;
  externalListeners.forEach((fn) => fn({ issueTopic: trimmedTopic, content: trimmedContent }));
}

export function useAssistant({ issueTopic, knowledgeLevel = 'medium', initialOpen = false }: UseAssistantParams) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [hasUnread, setHasUnread] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [
    {
      id: `m_${Date.now()}_welcome`,
      role: 'assistant',
      content: `안녕하세요! "${issueTopic}" 토론을 도와드리는 AI 어시스턴트입니다. 궁금한 점이 있으신가요?`,
      createdAt: Date.now(),
    },
  ]);
  const [isResponding, setIsResponding] = useState(false);
  const lastIssueTopicRef = useRef(issueTopic);

  // issueTopic이 바뀌면 대화 맥락을 리셋 (페이지별 토픽 분리)
  if (lastIssueTopicRef.current !== issueTopic) {
    lastIssueTopicRef.current = issueTopic;
    // setState는 렌더 중 호출하면 안 되므로, 다음 tick에서 처리
    queueMicrotask(() => {
      setMessages([
        {
          id: `m_${Date.now()}_welcome`,
          role: 'assistant',
          content: `안녕하세요! "${issueTopic}" 토론을 도와드리는 AI 어시스턴트입니다. 궁금한 점이 있으신가요?`,
          createdAt: Date.now(),
        },
      ]);
      setInput('');
      setIsResponding(false);
      setHasUnread(false);
    });
  }

  const chatHistoryForClaude = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setHasUnread(false);
      return next;
    });
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => {
    setHasUnread(false);
    setIsOpen(true);
  }, []);

  const sendText = useCallback(
    async (text: string, opts?: { clearInput?: boolean }) => {
      const trimmed = text.trim();
      if (!trimmed || isResponding) return;

      const userMsg: AssistantMessage = {
        id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      if (opts?.clearInput) setInput('');
      setIsResponding(true);

      try {
        const reply = await claudeService.generateChatReply(
          issueTopic,
          [...chatHistoryForClaude, { role: 'user', content: trimmed }],
          knowledgeLevel
        );
        const aiMsg: AssistantMessage = {
          id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          role: 'assistant',
          content: reply,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setIsResponding(false);
      }
    },
    [isResponding, issueTopic, knowledgeLevel, chatHistoryForClaude]
  );

  const send = useCallback(async () => {
    await sendText(input, { clearInput: true });
  }, [input, sendText]);

  // 외부(DiscussionInput 등)에서 들어온 메시지를 현재 토픽의 Assistant에 주입
  const issueTopicRef = useRef(issueTopic);
  issueTopicRef.current = issueTopic;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const sendTextRef = useRef(sendText);
  sendTextRef.current = sendText;
  const isRespondingRef = useRef(isResponding);
  isRespondingRef.current = isResponding;

  // subscription (mount/unmount)
  useEffect(() => {
    const listener: AssistantExternalListener = ({ issueTopic: incomingTopic, content }) => {
      if (incomingTopic !== issueTopicRef.current.trim()) return;
      if (isRespondingRef.current) return;
      if (!isOpenRef.current) setHasUnread(true);
      void sendTextRef.current(content);
    };
    externalListeners.add(listener);
    return () => {
      externalListeners.delete(listener);
    };
  }, []);

  const clear = useCallback(() => {
    setMessages([
      {
        id: `m_${Date.now()}_welcome`,
        role: 'assistant',
        content: `안녕하세요! "${issueTopic}" 토론을 도와드리는 AI 어시스턴트입니다. 궁금한 점이 있으신가요?`,
        createdAt: Date.now(),
      },
    ]);
    setInput('');
  }, [issueTopic]);

  return {
    isOpen,
    open,
    close,
    toggle,
    input,
    setInput,
    messages,
    isResponding,
    hasUnread,
    send,
    clear,
  };
}

