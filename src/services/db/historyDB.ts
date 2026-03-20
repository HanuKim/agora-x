// History DB for user's AI arguments & Discussions

export interface ChatHistoryEntry {
    id: string; // unique conversation ID (could be 'ai-discussion-custom-1234' or 'arena-7')
    type: 'ai_discussion' | 'arena';
    title: string;
    topic: string;
    category?: string;
    lastMessageAt: number;
    // For custom AI discussions, we save the full custom topic data
    customIssueData?: {
        id: number;
        topic: string;
        category: string;
        pro: string[];
        con: string[];
        background: string;
        keyPoints: string[];
    };
    // For Arena, we can save articleId
    articleId?: number;
    // chat messages
    messages: { role: 'user' | 'assistant', content: string }[];
}

const HISTORY_KEY = 'agora_x_user_chat_history';

export function getChatHistories(): ChatHistoryEntry[] {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        // ignore
    }
    return [];
}

export function saveChatHistory(entry: ChatHistoryEntry) {
    const list = getChatHistories();
    const existingIndex = list.findIndex(e => e.id === entry.id);
    if (existingIndex >= 0) {
        list[existingIndex] = { ...list[existingIndex], ...entry, lastMessageAt: Date.now() };
    } else {
        list.push({ ...entry, lastMessageAt: Date.now() });
    }
    
    // Sort by last message descending
    list.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch {
        // quota limit
    }
}

export function getChatHistory(id: string): ChatHistoryEntry | undefined {
    return getChatHistories().find(e => e.id === id);
}

export function deleteChatHistory(id: string) {
    const list = getChatHistories().filter(e => e.id !== id);
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch {
        // ignore
    }
}
