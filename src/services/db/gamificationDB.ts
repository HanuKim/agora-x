/**
 * gamificationDB.ts
 *
 * IndexedDB wrapper for gamification features:
 * - User XP / Level tracking
 * - Manner score
 * - User reports
 * - Article scraps (for 국민토론 / 일대일토론 news articles)
 */

const DB_NAME = 'agora-x-gamification';
const DB_VERSION = 1;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UserLevel {
    userId: string;
    xp: number;
    level: number;
    mannerScore: number;
}

export interface Report {
    id: string;
    reporterId: string;
    targetType: 'proposal' | 'opinion' | 'article';
    targetId: string;
    reason: string;
    detail: string;
    createdAt: number;
}

export interface ArticleScrap {
    id: string;           // `${userId}_${articleId}`
    articleId: number;
    userId: string;
    source: '국민토론' | '일대일토론';
    createdAt: number;
}

// ─── Level Thresholds ──────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [
    { level: 1, minXP: 0, maxXP: 99, label: '새싹 시민' },
    { level: 2, minXP: 100, maxXP: 299, label: '참여 시민' },
    { level: 3, minXP: 300, maxXP: 599, label: '적극 시민' },
    { level: 4, minXP: 600, maxXP: 999, label: '모범 시민' },
    { level: 5, minXP: 1000, maxXP: Infinity, label: '시민 리더' },
] as const;

export const XP_REWARDS = {
    COMMENT: 30,
    PROPOSAL: 50,
    RECEIVED_LIKE: 5,
} as const;

export const DEFAULT_MANNER_SCORE = 100;
export const MANNER_PENALTY = 5;

// ─── DB Open ──────────────────────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains('userLevel')) {
                db.createObjectStore('userLevel', { keyPath: 'userId' });
            }
            if (!db.objectStoreNames.contains('reports')) {
                const store = db.createObjectStore('reports', { keyPath: 'id' });
                store.createIndex('createdAt', 'createdAt', { unique: false });
            }
            if (!db.objectStoreNames.contains('articleScraps')) {
                const store = db.createObjectStore('articleScraps', { keyPath: 'id' });
                store.createIndex('userId', 'userId', { unique: false });
            }
        };

        request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
        request.onerror = (event) => {
            console.error('[gamificationDB] Failed to open:', (event.target as IDBOpenDBRequest).error);
            reject((event.target as IDBOpenDBRequest).error);
            dbPromise = null;
        };
    });

    return dbPromise;
}

// ─── User Level / XP ──────────────────────────────────────────────────────

function computeLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (xp >= LEVEL_THRESHOLDS[i].minXP) return LEVEL_THRESHOLDS[i].level;
    }
    return 1;
}

export async function getUserLevel(userId: string): Promise<UserLevel> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('userLevel', 'readonly');
        const store = tx.objectStore('userLevel');
        const req = store.get(userId);
        req.onsuccess = () => {
            if (req.result) {
                resolve(req.result as UserLevel);
            } else {
                // Return defaults — will be persisted on first XP gain
                resolve({
                    userId,
                    xp: 70, // Near level-up boundary for demo
                    level: 1,
                    mannerScore: DEFAULT_MANNER_SCORE,
                });
            }
        };
        req.onerror = () => reject(req.error);
    });
}

export async function initUserLevelIfNeeded(userId: string): Promise<UserLevel> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('userLevel', 'readwrite');
        const store = tx.objectStore('userLevel');
        const req = store.get(userId);
        req.onsuccess = () => {
            if (req.result) {
                resolve(req.result as UserLevel);
            } else {
                const initial: UserLevel = {
                    userId,
                    xp: 70,
                    level: 1,
                    mannerScore: DEFAULT_MANNER_SCORE,
                };
                store.add(initial);
                resolve(initial);
            }
        };
        req.onerror = () => reject(req.error);
    });
}

export async function addXP(
    userId: string,
    amount: number
): Promise<{ userLevel: UserLevel; leveledUp: boolean; previousLevel: number }> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('userLevel', 'readwrite');
        const store = tx.objectStore('userLevel');
        const req = store.get(userId);

        req.onsuccess = () => {
            const doc: UserLevel = req.result ?? {
                userId,
                xp: 70,
                level: 1,
                mannerScore: DEFAULT_MANNER_SCORE,
            };

            const previousLevel = doc.level;
            doc.xp += amount;
            doc.level = computeLevel(doc.xp);

            store.put(doc);
            tx.oncomplete = () =>
                resolve({
                    userLevel: doc,
                    leveledUp: doc.level > previousLevel,
                    previousLevel,
                });
        };
        req.onerror = () => reject(req.error);
    });
}

// ─── Manner Score ──────────────────────────────────────────────────────────

export async function decreaseMannerScore(userId: string): Promise<number> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('userLevel', 'readwrite');
        const store = tx.objectStore('userLevel');
        const req = store.get(userId);

        req.onsuccess = () => {
            const doc: UserLevel = req.result ?? {
                userId,
                xp: 0,
                level: 1,
                mannerScore: DEFAULT_MANNER_SCORE,
            };
            doc.mannerScore = Math.max(0, doc.mannerScore - MANNER_PENALTY);
            store.put(doc);
            tx.oncomplete = () => resolve(doc.mannerScore);
        };
        req.onerror = () => reject(req.error);
    });
}

// ─── Reports ──────────────────────────────────────────────────────────────

export async function createReport(report: Report): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('reports', 'readwrite');
        const store = tx.objectStore('reports');
        const req = store.add(report);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

// ─── Article Scraps ───────────────────────────────────────────────────────

export async function toggleArticleScrap(
    articleId: number,
    userId: string,
    source: '국민토론' | '일대일토론'
): Promise<{ scraped: boolean }> {
    const db = await openDB();
    const id = `${userId}_${articleId}`;

    return new Promise((resolve, reject) => {
        const tx = db.transaction('articleScraps', 'readwrite');
        const store = tx.objectStore('articleScraps');
        const req = store.get(id);

        req.onsuccess = () => {
            if (req.result) {
                store.delete(id);
                tx.oncomplete = () => resolve({ scraped: false });
            } else {
                store.add({
                    id,
                    articleId,
                    userId,
                    source,
                    createdAt: Date.now(),
                } as ArticleScrap);
                tx.oncomplete = () => resolve({ scraped: true });
            }
        };
        req.onerror = () => reject(req.error);
    });
}

export async function getScrapedArticles(userId: string): Promise<ArticleScrap[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('articleScraps', 'readonly');
        const store = tx.objectStore('articleScraps');
        const index = store.index('userId');
        const req = index.getAll(IDBKeyRange.only(userId));
        req.onsuccess = () => resolve(req.result as ArticleScrap[]);
        req.onerror = () => reject(req.error);
    });
}

export async function isArticleScraped(articleId: number, userId: string): Promise<boolean> {
    const db = await openDB();
    const id = `${userId}_${articleId}`;
    return new Promise((resolve, reject) => {
        const tx = db.transaction('articleScraps', 'readonly');
        const store = tx.objectStore('articleScraps');
        const req = store.get(id);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => reject(req.error);
    });
}
