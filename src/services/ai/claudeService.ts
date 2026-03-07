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
            });

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
}

/** Singleton instance for app-wide use */
export const claudeService = new ClaudeService();
