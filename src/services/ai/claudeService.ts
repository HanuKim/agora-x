/**
 * Claude AI Service
 *
 * Handles all communication with the Claude API.
 * Centralized here to manage retry, error handling, and prompt engineering.
 */

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
}

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
     * 뉴스 기사의 한 줄 개요와 토론 주제를 생성합니다.
     *
     * @param topic   selectedNews.json의 `topic` 필드 (기사 토론 주제 키워드)
     * @param summary selectedNews.json의 `article_summary.summary` 필드 (기사 요약)
     * @returns { overview: string, debateTopic: string }
     *          실패 시 원본 summary/topic을 fallback으로 반환
     */
    async generateNewsAISummary(topic: string, summary: string): Promise<NewsAISummary> {
        const fallback: NewsAISummary = {
            overview: summary.slice(0, 80) || topic,
            debateTopic: topic,
        };

        if (!this.apiKey) return fallback;

        try {
            const userPrompt = `다음 뉴스 기사 정보를 분석해주세요.

토론 주제 키워드: ${topic}
기사 요약: ${summary}

아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "overview": "기사 핵심 내용을 한 문장으로 요약 (50자 이내)",
  "debateTopic": "이 기사를 바탕으로 시민이 토론할 수 있는 구체적인 질문 한 가지 (30자 이내)"
}`;

            const { reply } = await this.sendMessage({
                messages: [{ role: 'user', content: userPrompt }],
                systemPrompt:
                    '당신은 한국 사회 이슈를 분석하는 AI입니다. 반드시 유효한 JSON만 반환하세요.',
                maxTokens: 256,
            });

            // JSON 파싱 — 코드블록 제거 후 시도
            const cleaned = reply.replace(/```json?/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned) as { overview?: string; debateTopic?: string };

            return {
                overview: parsed.overview?.trim() || fallback.overview,
                debateTopic: parsed.debateTopic?.trim() || fallback.debateTopic,
            };
        } catch (e) {
            console.warn('[ClaudeService] generateNewsAISummary fallback. Error:', e);
            return fallback;
        }
    }
}

/** Singleton instance for app-wide use */
export const claudeService = new ClaudeService();
