/**
 * AI Cache — IndexedDB wrapper
 *
 * 외부 패키지 없이 브라우저 내장 IndexedDB API만 사용합니다.
 *
 * 캐시 키 규칙: "{type}:{contentId}:{knowledgeLevel}"
 *   예) "news:3:medium", "issue:7:high"
 *
 * TTL: 7일 (만료 항목은 조회 시 삭제 후 null 반환)
 */

const DB_NAME = 'agora-x-ai-cache';
const STORE_NAME = 'ai-responses';
const DB_VERSION = 1;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일

interface CacheEntry<T> {
    key: string;
    data: T;
    createdAt: number; // unix timestamp ms
}

// ─── DB 초기화 ────────────────────────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                store.createIndex('createdAt', 'createdAt', { unique: false });
            }
        };

        request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
        request.onerror = (event) => {
            console.error('[aiCacheDB] Failed to open IndexedDB:', (event.target as IDBOpenDBRequest).error);
            reject((event.target as IDBOpenDBRequest).error);
            // Reset so next call tries again
            dbPromise = null;
        };
    });

    return dbPromise;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * 캐시에서 값을 조회합니다.
 * TTL 만료된 항목은 삭제 후 null 반환.
 */
export async function getCachedAIResult<T>(key: string): Promise<T | null> {
    try {
        const db = await openDB();
        return new Promise<T | null>((resolve) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key);

            req.onsuccess = () => {
                const entry = req.result as CacheEntry<T> | undefined;
                if (!entry) {
                    resolve(null);
                    return;
                }
                // TTL 체크
                if (Date.now() - entry.createdAt > TTL_MS) {
                    store.delete(key);
                    resolve(null);
                    return;
                }
                resolve(entry.data);
            };

            req.onerror = () => resolve(null);
        });
    } catch (e) {
        console.warn('[aiCacheDB] getCachedAIResult error:', e);
        return null;
    }
}

/**
 * 캐시에 값을 저장합니다.
 */
export async function setCachedAIResult<T>(key: string, data: T): Promise<void> {
    try {
        const db = await openDB();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const entry: CacheEntry<T> = { key, data, createdAt: Date.now() };
            const req = store.put(entry);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        console.warn('[aiCacheDB] setCachedAIResult error:', e);
    }
}

/**
 * 특정 prefix로 시작하는 모든 캐시 키를 삭제합니다.
 * 지식 수준 변경 시 해당 분야 캐시 일괄 무효화에 사용.
 *
 * @example
 * // "news:3:medium", "news:5:medium" 등 모든 news 캐시를 삭제하려면:
 * await deleteCacheByPrefix('news:');
 */
export async function deleteCacheByPrefix(prefix: string): Promise<void> {
    try {
        const db = await openDB();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.openCursor();
            const toDelete: string[] = [];

            req.onsuccess = () => {
                const cursor = req.result as IDBCursorWithValue | null;
                if (cursor) {
                    if ((cursor.key as string).startsWith(prefix)) {
                        toDelete.push(cursor.key as string);
                    }
                    cursor.continue();
                } else {
                    // 커서 순회 끝 → 삭제 실행
                    toDelete.forEach((k) => store.delete(k));
                    resolve();
                }
            };

            req.onerror = () => reject(req.error);
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.warn('[aiCacheDB] deleteCacheByPrefix error:', e);
    }
}

/**
 * 분야(ContentCategory)에 해당하는 모든 캐시를 삭제합니다.
 * 뉴스와 토론 이슈 양쪽 모두 제거.
 *
 * @example
 * await invalidateCategoryCache('경제');
 * // "news:*:*"와 "issue:*:*" 중 해당 분야 키만 삭제하는 대신,
 * // 분야별 prefix 키(`news-경제:`, `issue-경제:`)를 사용하여 정밀 삭제.
 */
export async function invalidateCategoryCache(category: string): Promise<void> {
    await Promise.all([
        deleteCacheByPrefix(`news-${category}:`),
        deleteCacheByPrefix(`issue-${category}:`),
    ]);
}

/**
 * 캐시 키 빌더 헬퍼
 */
export const cacheKey = {
    news: (id: number | string, category: string, level: string) =>
        `news-${category}:${id}:${level}`,
    issue: (id: number | string, category: string, level: string) =>
        `issue-${category}:${id}:${level}`,
    chatSession: (issueId: number | string) =>
        `chat_session:${issueId}`,
};

export interface AIChatSession {
    messages: { role: 'user' | 'assistant', content: string }[];
    opinionAnalysis: {
        clarity: number;
        relevance: number;
        logicValid: number;
        feedback: string;
    };
}

/**
 * 특정 이슈의 채팅 세션을 조회합니다. (TTL과 동일한 생명주기)
 */
export async function getChatSession(issueId: number | string): Promise<AIChatSession | null> {
    const key = cacheKey.chatSession(issueId);
    return getCachedAIResult<AIChatSession>(key);
}

/**
 * 특정 이슈의 채팅 세션을 저장합니다.
 */
export async function setChatSession(issueId: number | string, sessionData: AIChatSession): Promise<void> {
    const key = cacheKey.chatSession(issueId);
    return setCachedAIResult<AIChatSession>(key, sessionData);
}

/**
 * 특정 이슈의 채팅 세션을 초기화(삭제)합니다.
 */
export async function clearChatSession(issueId: number | string): Promise<void> {
    const key = cacheKey.chatSession(issueId);
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}
