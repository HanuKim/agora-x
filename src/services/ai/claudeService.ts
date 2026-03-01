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

export class ClaudeService {
    private apiKey: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey ?? (import.meta.env.VITE_CLAUDE_API_KEY as string) ?? '';
    }

    async sendMessage(request: ClaudeMessageRequest): Promise<ClaudeMessageResponse> {
        if (!this.apiKey) {
            console.warn('ClaudeService: No API key provided. Returning stub response.');
        }

        // Stub implementation — replace with actual Anthropic SDK call
        console.log(`[ClaudeService] Sending message (key: ${this.apiKey.substring(0, 4)}...):`, request);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return {
            reply: 'This is a stubbed response from ClaudeService. Implement with actual Anthropic SDK.',
        };
    }
}

/** Singleton instance for app-wide use */
export const claudeService = new ClaudeService();
