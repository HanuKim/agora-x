/**
 * Claude AI Service
 *
 * Handles all communication with the Claude API.
 * Centralized here to manage retry, error handling, and prompt engineering.
 *
 * v2: 지식 수준(KnowledgeLevel) 파라미터 지원 추가 — 응답 상세도 조절.
 */

import type { KnowledgeLevel } from '../../features/user/types';

export interface ClaudeMessageRequest {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    systemPrompt?: string;
    maxTokens?: number;
}

export interface ClaudeMessageResponse {
    reply: string;
}

export interface NewsAISummary {
    /** 기사 한 줄 개요 */
    overview: string;
    /** JSON topic 필드를 바탕으로 도출한 토론 주제 */
    debateTopic: string;
    /** 찬성 측 논거 2개 (150자 내외, 2~3문장) */
    proArguments: string[];
    /** 반대 측 논거 2개 (150자 내외, 2~3문장) */
    conArguments: string[];
    /** 찬성 논거별 핵심 요약 2개 (각 20자 내외) */
    proArgumentSummaries: string[];
    /** 반대 논거별 핵심 요약 2개 (각 20자 내외) */
    conArgumentSummaries: string[];
}

export interface IssueAIAnalysis {
    /** 이슈 배경 설명 (지식 수준에 따라 깊이 다름) */
    background: string;
    /** 핵심 쟁점 목록 */
    keyPoints: string[];
    /** 찬성 측 심화 논거 */
    proArguments: string[];
    /** 반대 측 심화 논거 */
    conArguments: string[];
}

export interface UserArgumentAnalysis {
    clarity: number;     // 명확성 0~100
    relevance: number;   // 관련성 0~100
    logicValid: number;  // 오류 검증(논리적 타당성) 0~100
    feedback: string;    // 사용자 의견에 대한 짧은 피드백이나 지적
}

export interface OpinionValidation {
    isValid: boolean;
    reason?: string;
}

// ─── 지식 수준 프롬프트 지시어 ─────────────────────────────────────────────────

const LEVEL_INSTRUCTIONS: Record<KnowledgeLevel, string> = {
    low: '중학생도 이해할 수 있도록 전문 용어 없이 쉬운 표현과 일상적인 예시를 사용하세요. 배경 설명을 충분히 포함하세요.',
    medium:
        '일반 성인 독자를 대상으로 핵심 내용 위주로 설명하되, 꼭 필요한 배경 지식만 간략히 포함하세요.',
    high: '전문가·정책 연구자 수준의 독자를 가정하고, 학술적·제도적 관점과 심층 분석을 포함하세요. 전문 용어를 적극 사용하세요.',
};

// ─── ClaudeService ─────────────────────────────────────────────────────────────

export class ClaudeService {
    private apiKey: string;
    private readonly apiUrl = 'https://api.anthropic.com/v1/messages';
    private readonly model = 'claude-haiku-4-5-20251001';

    constructor(apiKey?: string) {
        this.apiKey = apiKey ?? (import.meta.env.VITE_CLAUDE_API_KEY as string) ?? '';
    }

    async sendMessage(request: ClaudeMessageRequest): Promise<ClaudeMessageResponse> {
        if (!this.apiKey) {
            console.warn('ClaudeService: No API key provided.');
            return { reply: '[API 키 없음] ClaudeService에 API 키가 설정되지 않았습니다.' };
        }

        try {
            const controller = new AbortController();
            const timeoutMs = 12_000;
            const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

            const body = {
                model: this.model,
                max_tokens: request.maxTokens ?? 512,
                system: request.systemPrompt,
                messages: request.messages,
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true',
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            }).finally(() => window.clearTimeout(timeoutId));

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Claude API error ${response.status}: ${errText}`);
            }

            const data = await response.json();
            const reply: string = data?.content?.[0]?.text ?? '';
            return { reply };
        } catch (e) {
            console.error('[ClaudeService] sendMessage failed:', e);
            throw e;
        }
    }

    /**
     * 응답 텍스트에서 JSON 객체를 추출해 NewsAISummary 형식으로 반환.
     * 코드 블록·앞뒤 설명이 있어도 첫 번째 { } 쌍을 찾아 파싱.
     */
    private parseNewsSummaryJson(
        reply: string,
        fallback: NewsAISummary,
    ): {
        overview?: string;
        debateTopic?: string;
        proArguments?: string[];
        conArguments?: string[];
        proArgumentSummaries?: string[];
        conArgumentSummaries?: string[];
    } {
        let raw = reply.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const firstBrace = raw.indexOf('{');
        if (firstBrace !== -1) {
            const lastBrace = raw.lastIndexOf('}');
            if (lastBrace > firstBrace) {
                raw = raw.slice(firstBrace, lastBrace + 1);
            }
        }
        try {
            const parsed = JSON.parse(raw) as Record<string, unknown>;
            return {
                overview: typeof parsed.overview === 'string' ? parsed.overview : fallback.overview,
                debateTopic: typeof parsed.debateTopic === 'string' ? parsed.debateTopic : fallback.debateTopic,
                proArguments: Array.isArray(parsed.proArguments)
                    ? parsed.proArguments.map((s) => String(s))
                    : fallback.proArguments,
                conArguments: Array.isArray(parsed.conArguments)
                    ? parsed.conArguments.map((s) => String(s))
                    : fallback.conArguments,
                proArgumentSummaries: Array.isArray(parsed.proArgumentSummaries)
                    ? parsed.proArgumentSummaries.map((s) => String(s))
                    : fallback.proArgumentSummaries,
                conArgumentSummaries: Array.isArray(parsed.conArgumentSummaries)
                    ? parsed.conArgumentSummaries.map((s) => String(s))
                    : fallback.conArgumentSummaries,
            };
        } catch {
            return fallback;
        }
    }

    /**
     * 뉴스 기사의 한 줄 개요와 토론 주제를 생성합니다.
     * (지식 수준에 따라 표현 난이도 조절)
     *
     * @param topic   selectedNews.json의 `topic` 필드
     * @param summary selectedNews.json의 `article_summary.summary` 필드
     * @param knowledgeLevel 사용자 분야별 지식 수준 (기본값: 'medium')
     */
    async generateNewsAISummary(
        topic: string,
        summary: string,
        knowledgeLevel: KnowledgeLevel = 'medium',
    ): Promise<NewsAISummary> {
        const fallback: NewsAISummary = {
            overview: summary.slice(0, 80) || topic,
            debateTopic: topic,
            proArguments: [],
            conArguments: [],
            proArgumentSummaries: [],
            conArgumentSummaries: [],
        };

        if (!this.apiKey) return fallback;

        const levelInstruction = LEVEL_INSTRUCTIONS[knowledgeLevel];

        try {
            const userPrompt = `다음 뉴스 기사 정보를 분석해주세요.

토론 주제 키워드: ${topic}
기사 요약: ${summary}

응답 지침: ${levelInstruction}

논거 추출 규칙:
- 찬성 논거 2개, 반대 논거 2개만 추출하세요.
- 각 논거는 150자 내외, 2~3문장으로 작성하세요.
- 각 논거마다 핵심 요약을 15자 내외 한 문장으로 작성하세요 (proArgumentSummaries, conArgumentSummaries).

아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "overview": "기사 핵심 내용을 한 문장으로 요약 (60~70자 이내, 지식 수준에 맞는 표현)",
  "debateTopic": "이 기사를 바탕으로 시민이 토론할 수 있는 구체적인 질문 (50자 이내)",
  "proArguments": ["찬성 논거 1 (150자 내외)", "찬성 논거 2 (150자 내외)"],
  "conArguments": ["반대 논거 1 (150자 내외)", "반대 논거 2 (150자 내외)"],
  "proArgumentSummaries": ["찬성 논거 1 핵심 요약 (15자 내외)", "찬성 논거 2 핵심 요약 (15자 내외)"],
  "conArgumentSummaries": ["반대 논거 1 핵심 요약 (15자 내외)", "반대 논거 2 핵심 요약 (15자 내외)"]
}`;

            const { reply } = await this.sendMessage({
                messages: [{ role: 'user', content: userPrompt }],
                systemPrompt:
                    '당신은 한국 사회 이슈를 분석하는 AI입니다. 반드시 유효한 JSON만 반환하세요. 다른 설명 없이 JSON 객체만 출력하세요.',
                maxTokens: 1024,
            });

            const parsed = this.parseNewsSummaryJson(reply, fallback);
            return {
                overview: parsed.overview?.trim() || fallback.overview,
                debateTopic: parsed.debateTopic?.trim() || fallback.debateTopic,
                proArguments: Array.isArray(parsed.proArguments) && parsed.proArguments.length > 0
                    ? parsed.proArguments.slice(0, 2).map((s) => String(s).trim())
                    : fallback.proArguments,
                conArguments: Array.isArray(parsed.conArguments) && parsed.conArguments.length > 0
                    ? parsed.conArguments.slice(0, 2).map((s) => String(s).trim())
                    : fallback.conArguments,
                proArgumentSummaries:
                    Array.isArray(parsed.proArgumentSummaries) && parsed.proArgumentSummaries.length > 0
                        ? parsed.proArgumentSummaries.slice(0, 2).map((s) => String(s).trim())
                        : fallback.proArgumentSummaries,
                conArgumentSummaries:
                    Array.isArray(parsed.conArgumentSummaries) && parsed.conArgumentSummaries.length > 0
                        ? parsed.conArgumentSummaries.slice(0, 2).map((s) => String(s).trim())
                        : fallback.conArgumentSummaries,
            };
        } catch (e) {
            console.warn('[ClaudeService] generateNewsAISummary fallback. Error:', e);
            return fallback;
        }
    }

    /**
     * 특정 토론 이슈에 대해 50자 내외의 짧은 설명을 생성합니다.
     * IssueCard에서 찬성 의견 대신 출력할 때 사용됩니다.
     */
    async generateIssueSummary(
        issueTopic: string,
        issueCategory: string
    ): Promise<string> {
        const fallback = "이 이슈에 대한 의견이 팽팽하게 대립하고 있습니다.";

        if (!this.apiKey) return fallback;

        try {
            const userPrompt = `"${issueTopic}" (분야: ${issueCategory})에 대한 찬반 논쟁의 핵심을 50자 내외의 한 문장으로 매우 짧게 요약해 주세요. 추가 설명이나 인사말 없이 요약된 문장만 반환하세요.`;

            const { reply } = await this.sendMessage({
                messages: [{ role: 'user', content: userPrompt }],
                systemPrompt: '당신은 토론 이슈를 짧고 명확하게 요약하는 AI입니다. 반드시 50자 내외의 한 문장만 리턴하세요.',
                maxTokens: 100,
            });

            return reply.trim() || fallback;
        } catch (e) {
            console.warn('[ClaudeService] generateIssueSummary fallback. Error:', e);
            return fallback;
        }
    }

    /**
     * 한국 사회 토론 이슈에 대한 심화 AI 분석을 생성합니다.
     * 배경 설명, 핵심 쟁점, 찬반 심화 논거를 지식 수준에 맞게 제공합니다.
     *
     * @param issueTopic  koreanSocialIssues.json의 `topic` 필드
     * @param issueCategory koreanSocialIssues.json의 `category` 필드
     * @param pro  기존 찬성 논거 배열 (심화 설명의 기반)
     * @param con  기존 반대 논거 배열 (심화 설명의 기반)
     * @param knowledgeLevel 사용자 분야별 지식 수준
     */
    async generateIssueAIAnalysis(
        issueTopic: string,
        issueCategory: string,
        pro: string[],
        con: string[],
        knowledgeLevel: KnowledgeLevel = 'medium',
    ): Promise<IssueAIAnalysis> {
        const fallback: IssueAIAnalysis = {
            background: `${issueTopic}에 관한 한국 사회의 주요 쟁점입니다.`,
            keyPoints: [issueTopic],
            proArguments: pro,
            conArguments: con,
        };

        if (!this.apiKey) return fallback;

        const levelInstruction = LEVEL_INSTRUCTIONS[knowledgeLevel];

        try {
            const userPrompt = `한국 사회 쟁점 "${issueTopic}" (분야: ${issueCategory})에 대해 분석해주세요.

기존 찬성 논거:
${pro.map((p, i) => `${i + 1}. ${p}`).join('\n')}

기존 반대 논거:
${con.map((c, i) => `${i + 1}. ${c}`).join('\n')}

응답 지침: ${levelInstruction}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "background": "이 이슈의 배경과 사회적 맥락 설명 (500자 이내, 지식 수준에 맞게)",
  "keyPoints": ["핵심 쟁점 1", "핵심 쟁점 2", "핵심 쟁점 3"],
"proArguments": ["찬성 논거 1 (40자 이내)", "찬성 논거 2 (40자 이내)", "찬성 논거 3 (40자 이내)"],
  "conArguments": ["반대 논거 1 (40자 이내)", "반대 논거 2 (40자 이내)", "반대 논거 3 (40자 이내)"]
}`;

            const { reply } = await this.sendMessage({
                messages: [{ role: 'user', content: userPrompt }],
                systemPrompt:
                    '당신은 한국 사회 이슈를 균형 있게 분석하는 AI입니다. 반드시 유효한 JSON만 반환하세요.',
                maxTokens: 768,
            });

            const cleaned = reply.replace(/```json?/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned) as Partial<IssueAIAnalysis>;

            return {
                background: parsed.background?.trim() || fallback.background,
                keyPoints:
                    Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0
                        ? parsed.keyPoints
                        : fallback.keyPoints,
                proArguments:
                    Array.isArray(parsed.proArguments) && parsed.proArguments.length > 0
                        ? parsed.proArguments
                        : fallback.proArguments,
                conArguments:
                    Array.isArray(parsed.conArguments) && parsed.conArguments.length > 0
                        ? parsed.conArguments
                        : fallback.conArguments,
            };
        } catch (e) {
            console.warn('[ClaudeService] generateIssueAIAnalysis fallback. Error:', e);
            return fallback;
        }
    }

    /**
     * 사용자의 발언에 대한 AI 반론 또는 토론 응답을 생성합니다.
     */
    async generateChatReply(
        issueTopic: string,
        chatHistory: { role: 'user' | 'assistant', content: string }[],
        knowledgeLevel: KnowledgeLevel = 'medium'
    ): Promise<string> {
        if (!this.apiKey) return "AI 오류: 응답을 생성할 수 없습니다.";

        const levelInstruction = LEVEL_INSTRUCTIONS[knowledgeLevel];

        try {
            const systemPrompt = `당신은 한국 사회 이슈 "${issueTopic}"에 대해 사용자와 1:1 토론을 하는 'K-아고라 AI'입니다.
목적: 사용자의 주장에 대해 건설적이고 논리적인 반론을 제기하여 토론을 심화시킵니다.
태도: 객관적, 논리적, 존중하는 태도.
응답 지침: ${levelInstruction}
제한: 한 번에 너무 길게 말하지 마세요. (300자 내외로 짧게 끊어서 질문이나 핵심 반론만 전달할 것). 자연스러운 대화체로 답변하세요.`;

            const { reply } = await this.sendMessage({
                messages: chatHistory,
                systemPrompt,
                maxTokens: 500,
            });

            return reply.trim();
        } catch (e) {
            console.error('[ClaudeService] generateChatReply failed:', e);
            return "죄송합니다. 서버 통신 중 오류가 발생하여 답변할 수 없습니다.";
        }
    }

    /**
     * 사용자의 최신 주장을 분석하여 논리적 일관성 그래프 데이터를 제공합니다.
     */
    async analyzeUserArgument(
        issueTopic: string,
        userMessage: string
    ): Promise<UserArgumentAnalysis> {
        const fallback: UserArgumentAnalysis = { clarity: 0, relevance: 0, logicValid: 0, feedback: "분석 불가" };

        if (!this.apiKey) return fallback;

        try {
            const userPrompt = `토론 주제: "${issueTopic}"
사용자 주장: "${userMessage}"

이 사용자의 주장을 분석하여 다음 3가지 항목에 대해 0에서 100 사이의 점수를 채점해 주세요.
1. clarity (명확성): 주장이 얼마나 명확하게 전달되는가?
2. relevance (관련성): 주제와 얼마나 밀접한가?
3. logicValid (오류 검증): 논리적 비약이나 오류 없이 타당한가?
그리고 4. feedback 에 짧은(50자 내외) 피드백을 적어주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "clarity": 85,
  "relevance": 90,
  "logicValid": 70,
  "feedback": "주장의 명확성은 좋으나, 일부 논리적 도약이 보입니다."
}`;

            const { reply } = await this.sendMessage({
                messages: [{ role: 'user', content: userPrompt }],
                systemPrompt: '당신은 토론 논리를 냉철하게 분석하는 채점관입니다. 유효한 JSON만 반환하세요.',
                maxTokens: 300,
            });

            const cleaned = reply.replace(/```json?/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned) as Partial<UserArgumentAnalysis>;

            return {
                clarity: typeof parsed.clarity === 'number' ? parsed.clarity : 50,
                relevance: typeof parsed.relevance === 'number' ? parsed.relevance : 50,
                logicValid: typeof parsed.logicValid === 'number' ? parsed.logicValid : 50,
                feedback: parsed.feedback || "의견에 대한 분석을 완료했습니다.",
            };
        } catch (e) {
            console.error('[ClaudeService] analyzeUserArgument failed:', e);
            return fallback;
        }
    }

    /**
     * 사용자의 발언에 대한 AI 반론 또는 토론 응답을 생성합니다.
     */
    async validateOpinion(content: string): Promise<OpinionValidation> {
        const fallback: OpinionValidation = { isValid: true };
        if (!this.apiKey) return fallback;

        try {
            const systemPrompt = `당신은 공공 토론 플랫폼의 중재자 AI입니다. 
사용자의 의견을 분석하고 비속어, 혐오 표현, 혹은 명백히 공격적이거나 부적절한 내용이 포함되어 있는지 검토하세요.
비판적 의견은 허용하되, 모욕적인 언사나 공론장에 부적절한 언어는 차단해야 합니다. 
반드시 아래 JSON 형식으로만 응답하세요:
{
  "isValid": true 또는 false,
  "reason": "만약 false인 경우 거절 사유를 짧게 적어주세요. true인 경우 비워두거나 안전함으로 적어주세요."
}`;

            const userPrompt = `다음 의견을 검토해주세요: "${content}"`;

            const { reply } = await this.sendMessage({
                messages: [{ role: 'user', content: userPrompt }],
                systemPrompt,
                maxTokens: 150,
            });

            const cleaned = reply.replace(/```json?/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned) as Partial<OpinionValidation>;

            return {
                isValid: typeof parsed.isValid === 'boolean' ? parsed.isValid : true,
                reason: parsed.reason,
            };
        } catch (e) {
            console.error('[ClaudeService] validateOpinion failed:', e);
            return fallback;
        }
    }

    /**
     * 사용자 프롬프트로부터 커스텀 토론 주제를 생성합니다.
     */
    async generateCustomIssueSummary(prompt: string): Promise<{
        topic: string;
        category: string;
        pro: string[];
        con: string[];
        background: string;
        keyPoints: string[];
    }> {
        const fallback = {
            topic: prompt,
            category: '사회',
            pro: ['찬성 의견을 생성할 수 없습니다.'],
            con: ['반대 의견을 생성할 수 없습니다.'],
            background: `"${prompt}"에 관한 토론 주제입니다.`,
            keyPoints: [prompt],
        };

        if (!this.apiKey) return fallback;

        try {
            const { reply } = await this.sendMessage({
                messages: [{
                    role: 'user',
                    content: `사용자가 다음 주제로 토론하고 싶어합니다: "${prompt}"

이 주제를 한국 사회 맥락에서 토론 가능한 형태로 구조화해주세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "topic": "토론 주제 (명확한 질문 형태, 50자 이내)",
  "category": "정치|경제|사회|국제|문화|기술|기타 중 하나",
  "pro": ["찬성 논거 1", "찬성 논거 2", "찬성 논거 3"],
  "con": ["반대 논거 1", "반대 논거 2", "반대 논거 3"],
  "background": "이슈 배경 설명 (200자 이내)",
  "keyPoints": ["핵심 쟁점 1", "핵심 쟁점 2", "핵심 쟁점 3"]
}`
                }],
                systemPrompt: '당신은 한국 사회 이슈를 구조화하는 AI입니다. 유효한 JSON만 반환하세요.',
                maxTokens: 768,
            });

            const cleaned = reply.replace(/```json?/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            return {
                topic: parsed.topic || prompt,
                category: parsed.category || '사회',
                pro: Array.isArray(parsed.pro) ? parsed.pro : fallback.pro,
                con: Array.isArray(parsed.con) ? parsed.con : fallback.con,
                background: parsed.background || fallback.background,
                keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : fallback.keyPoints,
            };
        } catch (e) {
            console.warn('[ClaudeService] generateCustomIssueSummary fallback:', e);
            return fallback;
        }
    }

    /**
     * 토론 연습 중 사용자에게 도움을 제공합니다.
     */
    async generateDebateHelp(
        topic: string,
        chatHistory: { role: 'user' | 'assistant'; content: string }[],
        helpType: 'organize' | 'argument' | 'counter' | 'free',
        freeInput?: string
    ): Promise<string> {
        if (!this.apiKey) return 'AI 도움 기능을 사용할 수 없습니다. API 키를 확인해주세요.';

        const helpInstructions: Record<string, string> = {
            organize: '사용자가 지금까지 한 발언들을 정리하여 핵심 주장을 명확하게 요약해주세요. 구조화된 형태로 제시하세요.',
            argument: '이 토론 주제에 대해 사용자가 사용할 수 있는 강력한 논거 3개를 제시해주세요. 근거와 함께 설명하세요.',
            counter: '상대방(AI)이 제시할 수 있는 예상 반론을 3개 분석하고, 각 반론에 대한 대응 전략을 제안해주세요.',
            free: freeInput ? `사용자의 요청: "${freeInput}"` : '사용자의 토론 능력 향상을 위한 조언을 제공하세요.',
        };

        try {
            const recentContext = chatHistory.slice(-6).map(m => `[${m.role}] ${m.content}`).join('\n');

            const { reply } = await this.sendMessage({
                messages: [{
                    role: 'user',
                    content: `토론 주제: "${topic}"

최근 대화 맥락:
${recentContext}

도움 요청: ${helpInstructions[helpType]}

300자 이내로 간결하고 실용적인 도움을 제공하세요.`
                }],
                systemPrompt: '당신은 토론 코치입니다. 사용자의 토론 역량을 높이기 위한 실질적 도움을 제공하세요. 자연스러운 한국어로 답변하세요.',
                maxTokens: 500,
            });

            return reply.trim();
        } catch (e) {
            console.error('[ClaudeService] generateDebateHelp failed:', e);
            return '도움을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.';
        }
    }

    /**
     * 사이트 이용 안내 AI 챗봇
     */
    async siteAssistantChat(
        userMessage: string,
        chatHistory: { role: 'user' | 'assistant'; content: string }[]
    ): Promise<string> {
        if (!this.apiKey) return 'AI 어시스턴트를 사용할 수 없습니다.';

        try {
            const { reply } = await this.sendMessage({
                messages: [...chatHistory, { role: 'user', content: userMessage }],
                systemPrompt: `당신은 "Agora-X" 시민 토론 플랫폼의 안내 AI "아곰이"입니다.

플랫폼 구조:
- 홈(/) : 메인 페이지, 인기 토론/제안 미리보기
- 국민 토론(/community) : 뉴스 기반 시민 토론. 찬/반/중립 투표 및 의견 등록. 상세페이지(/detail/:id)
- 국민 제안(/proposals) : 시민이 직접 사회 문제 제안. 새 제안(/proposals/new). 상세페이지(/proposals/:id)
- 토론 연습(/ai-discussion) : AI "아곰이"와 1:1 토론 연습. 상세페이지(/ai-discussion/:id)
- 마이페이지(/mypage) : 내 활동, 레벨, 스크랩, 알림, 지식수준 설정

규칙:
- 200자 이내로 간결하게 답변
- 관련 페이지 경로를 [페이지명](경로) 형태로 안내
- 게시물 검색 요청 시 키워드를 파악하여 관련 섹션 안내
- 플랫폼 외 질문은 정중히 거절`,
                maxTokens: 300,
            });

            return reply.trim();
        } catch (e) {
            console.error('[ClaudeService] siteAssistantChat failed:', e);
            return '죄송합니다. 일시적인 오류가 발생했습니다.';
        }
    }
}

/** Singleton instance for app-wide use */
export const claudeService = new ClaudeService();
