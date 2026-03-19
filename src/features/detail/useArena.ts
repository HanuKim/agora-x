/**
 * useArena.ts
 *
 * Hook managing the AI-mediated discussion arena flow:
 * 1. User selects stance and writes initial opinion
 * 2. AI presents opposing opinions from arenaDB
 * 3. User responds/rebuts → AI presents more opposing views
 * 4. User ends discussion → final vote + influence selection
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNewsWithAISummary } from '../news/useNewsWithAISummary';
import {
    getOpinionsForArticle,
    addOpinion,
    saveArenaSession,
    getArenaSession,
    recordStanceChange,
} from '../../services/db/arenaDB';
import { claudeService } from '../../services/ai/claudeService';
import { generateNickname } from '../../utils/nicknameGenerator';
import type { ArenaOpinion, ArenaSession } from '../common/types';

export type ArenaPhase = 'stance-select' | 'chatting' | 'final-vote' | 'completed';

export interface ArenaMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    /** Opposing opinions presented in this message */
    opposingOpinions?: ArenaOpinion[];
}

export function useArena(userId?: string) {
    const { id } = useParams<{ id: string }>();
    const numericId = id ? Number(id) : NaN;
    const isValidId = Number.isFinite(numericId);

    // Article data
    const { items } = useNewsWithAISummary(undefined, isValidId ? numericId : undefined);
    const article = items.find((item) => item.id === numericId);
    const debateTopic = article?.aiSummary?.debateTopic ?? article?.topic;
    const overview = article?.aiSummary?.overview;
    const articleUrl = article?.articleUrl ?? '';

    // Arena state
    const [phase, setPhase] = useState<ArenaPhase>('stance-select');
    const [stance, setStance] = useState<'pro' | 'con' | null>(null);
    const [messages, setMessages] = useState<ArenaMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [roundCount, setRoundCount] = useState(0);
    const [presentedOpinions, setPresentedOpinions] = useState<ArenaOpinion[]>([]);
    const [finalStance, setFinalStance] = useState<'pro' | 'con' | null>(null);
    const [selectedInfluentialOpinionId, setSelectedInfluentialOpinionId] = useState<string | null>(null);

    const usedOpinionIdsRef = useRef<Set<string>>(new Set());

    // Restore session on mount
    useEffect(() => {
        if (!isValidId || !userId) return;
        const session = getArenaSession(numericId, userId);
        if (session && !session.completed) {
            setStance(session.initialStance);
            setPhase('chatting');
            // Restore messages
            const restored: ArenaMessage[] = session.messages.map(m => ({
                role: m.role as ArenaMessage['role'],
                content: m.content,
            }));
            setMessages(restored);
        }
    }, [numericId, userId, isValidId]);

    /** Pick random opposing opinions that haven't been shown yet */
    const pickOpposingOpinions = useCallback((userStance: 'pro' | 'con', count = 2): ArenaOpinion[] => {
        if (!isValidId) return [];
        const allOpinions = getOpinionsForArticle(numericId);
        const oppositeStance = userStance === 'pro' ? 'con' : 'pro';
        const available = allOpinions.filter(
            o => o.stance === oppositeStance && !usedOpinionIdsRef.current.has(o.id)
        );
        // Shuffle and pick
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, count);
        picked.forEach(o => usedOpinionIdsRef.current.add(o.id));
        return picked;
    }, [numericId, isValidId]);

    /** Start the discussion after stance selection */
    const startDiscussion = useCallback(async (selectedStance: 'pro' | 'con', initialOpinion: string) => {
        if (!isValidId) return;
        setStance(selectedStance);
        setPhase('chatting');
        setIsLoading(true);

        // Save user's opinion as a new ArenaOpinion
        const authorId = userId ?? 'anonymous';
        const newOpinion: ArenaOpinion = {
            id: `arena-user-${numericId}-${Date.now()}`,
            articleId: numericId,
            authorId,
            authorName: generateNickname(authorId, String(numericId)),
            stance: selectedStance,
            body: initialOpinion,
            createdAt: Date.now(),
            influenceCount: 0,
            rebuttedBy: [],
            likes: 0,
        };
        addOpinion(newOpinion);

        // Add user message
        const userMsg: ArenaMessage = { role: 'user', content: initialOpinion };

        // Pick opposing opinions
        const opposing = pickOpposingOpinions(selectedStance, 2);
        setPresentedOpinions(prev => [...prev, ...opposing]);

        try {
            // Generate AI response with opposing opinions
            const opposingText = opposing.map((o, i) =>
                `[반대 의견 ${i + 1} - ${o.authorName}] ${o.body}`
            ).join('\n\n');

            const systemPrompt = `당신은 AI 중재 토론 진행자입니다. 사용자가 "${debateTopic ?? '토론 주제'}"에 대해 ${selectedStance === 'pro' ? '찬성' : '반대'} 입장을 밝혔습니다.

당신의 역할:
1. 사용자의 의견을 간단히 요약/인정합니다
2. 아래 제시된 반대 의견들을 자연스럽게 소개합니다
3. 사용자가 이 의견들에 대해 어떻게 생각하는지 물어봅니다
4. 공정하고 중립적인 태도를 유지합니다

다른 시민들의 반대 의견:
${opposingText}

위 의견들을 자연스러운 대화체로 소개해주세요. 각 의견의 핵심을 짧게 정리하고, 사용자에게 이에 대한 생각을 물어보세요.
반드시 한국어로 답변하세요. 200자 이내로 간결하게 답변하세요.`;

            const response = await claudeService.sendMessage({
                systemPrompt,
                messages: [{ role: 'user', content: initialOpinion }],
                maxTokens: 512,
            });

            const aiMsg: ArenaMessage = {
                role: 'assistant',
                content: response.reply,
                opposingOpinions: opposing,
            };

            setMessages([userMsg, aiMsg]);
            setRoundCount(1);
        } catch {
            const fallbackText = opposing.length > 0
                ? `다른 시민들이 이런 의견을 제시했습니다:\n\n${opposing.map((o, i) => `${i + 1}. "${o.body}" — ${o.authorName}`).join('\n\n')}\n\n이 의견들에 대해 어떻게 생각하시나요?`
                : '반대 의견을 불러오는 중 문제가 발생했습니다. 의견을 계속 공유해주세요.';

            const aiMsg: ArenaMessage = {
                role: 'assistant',
                content: fallbackText,
                opposingOpinions: opposing,
            };
            setMessages([userMsg, aiMsg]);
            setRoundCount(1);
        } finally {
            setIsLoading(false);
        }
    }, [numericId, isValidId, userId, debateTopic, pickOpposingOpinions]);

    /** Send a follow-up message */
    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || !stance || isLoading) return;

        const userMsg: ArenaMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsLoading(true);

        const opposing = pickOpposingOpinions(stance, 2);
        setPresentedOpinions(prev => [...prev, ...opposing]);

        try {
            const opposingText = opposing.length > 0
                ? opposing.map((o, i) => `[반대 의견 ${i + 1} - ${o.authorName}] ${o.body}`).join('\n\n')
                : '(추가 반대 의견이 없습니다)';

            const chatHistory = [...messages, userMsg].map(m => ({
                role: m.role === 'system' ? 'assistant' as const : m.role as 'user' | 'assistant',
                content: m.content,
            }));

            const systemPrompt = `당신은 AI 중재 토론 진행자입니다. 주제: "${debateTopic ?? '토론 주제'}". 
사용자 입장: ${stance === 'pro' ? '찬성' : '반대'}.

새로운 반대 의견:
${opposingText}

사용자의 답변을 인정하고, 위 새로운 반대 의견을 자연스럽게 소개하세요.
사용자가 깊이 생각할 수 있도록 질문하세요.
한국어로, 200자 이내로 간결하게 답변하세요.`;

            const response = await claudeService.sendMessage({
                systemPrompt,
                messages: chatHistory,
                maxTokens: 512,
            });

            const aiMsg: ArenaMessage = {
                role: 'assistant',
                content: response.reply,
                opposingOpinions: opposing,
            };
            setMessages(prev => [...prev, aiMsg]);
            setRoundCount(prev => prev + 1);
        } catch {
            const fallback = opposing.length > 0
                ? `다른 시민 의견을 소개합니다:\n${opposing.map((o, i) => `${i + 1}. "${o.body}"`).join('\n')}\n\n이에 대해 어떻게 생각하시나요?`
                : '토론을 계속해주세요. 의견을 더 공유해주시면 좋겠습니다.';
            setMessages(prev => [...prev, { role: 'assistant', content: fallback, opposingOpinions: opposing }]);
            setRoundCount(prev => prev + 1);
        } finally {
            setIsLoading(false);
        }
    }, [stance, isLoading, messages, debateTopic, pickOpposingOpinions]);

    /** Begin final vote phase */
    const startFinalVote = useCallback(() => {
        setPhase('final-vote');
    }, []);

    /** Submit final vote */
    const submitFinalVote = useCallback((
        chosenFinalStance: 'pro' | 'con',
        influentialOpinionId?: string
    ) => {
        if (!isValidId || !userId || !stance) return;

        setFinalStance(chosenFinalStance);
        setSelectedInfluentialOpinionId(influentialOpinionId ?? null);

        // Record stance change if changed
        if (chosenFinalStance !== stance && influentialOpinionId) {
            recordStanceChange(numericId, influentialOpinionId);
        }

        // Save session
        const session: ArenaSession = {
            articleId: numericId,
            userId,
            initialStance: stance,
            finalStance: chosenFinalStance,
            messages: messages.map(m => ({ role: m.role === 'system' ? 'assistant' as const : m.role, content: m.content })),
            influentialOpinionId,
            completed: true,
            createdAt: Date.now(),
        };
        saveArenaSession(session);

        setPhase('completed');
    }, [numericId, isValidId, userId, stance, messages]);

    return {
        // Article data
        article,
        debateTopic,
        overview,
        articleUrl,
        numericId,
        isValidId,

        // Arena state
        phase,
        stance,
        messages,
        inputMessage,
        setInputMessage,
        isLoading,
        roundCount,
        presentedOpinions,
        finalStance,
        selectedInfluentialOpinionId,
        setSelectedInfluentialOpinionId,

        // Actions
        startDiscussion,
        sendMessage,
        startFinalVote,
        submitFinalVote,
    };
}
