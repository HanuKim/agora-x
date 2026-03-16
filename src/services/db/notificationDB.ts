/**
 * notificationDB.ts
 *
 * IndexedDB wrapper for the notification system.
 * Stores in-app notifications for likes, scraps, comments, and level-ups.
 */

const DB_NAME = 'agora-x-notifications';
const DB_VERSION = 1;

// ─── Types ──────────────────────────────────────────────────────────────────

export type NotificationType = 'like' | 'scrap' | 'comment' | 'level_up' | 'report';

export interface AppNotification {
    id: string;
    userId: string;
    type: NotificationType;
    message: string;
    targetUrl?: string;
    isRead: boolean;
    createdAt: number;
}

// ─── DB Open ──────────────────────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('notifications')) {
                const store = db.createObjectStore('notifications', { keyPath: 'id' });
                store.createIndex('userId', 'userId', { unique: false });
                store.createIndex('createdAt', 'createdAt', { unique: false });
            }
        };

        request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
        request.onerror = (event) => {
            console.error('[notificationDB] Failed to open:', (event.target as IDBOpenDBRequest).error);
            reject((event.target as IDBOpenDBRequest).error);
            dbPromise = null;
        };
    });

    return dbPromise;
}

// ─── CRUD ──────────────────────────────────────────────────────────────────

export async function createNotification(notification: AppNotification): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('notifications', 'readwrite');
        const store = tx.objectStore('notifications');
        const req = store.add(notification);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function getNotifications(userId: string): Promise<AppNotification[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('notifications', 'readonly');
        const store = tx.objectStore('notifications');
        const index = store.index('userId');
        const req = index.getAll(IDBKeyRange.only(userId));

        req.onsuccess = () => {
            const results = (req.result as AppNotification[]).sort(
                (a, b) => b.createdAt - a.createdAt
            );
            resolve(results);
        };
        req.onerror = () => reject(req.error);
    });
}

export async function getUnreadCount(userId: string): Promise<number> {
    const all = await getNotifications(userId);
    return all.filter((n) => !n.isRead).length;
}

export async function markAsRead(notificationId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('notifications', 'readwrite');
        const store = tx.objectStore('notifications');
        const req = store.get(notificationId);

        req.onsuccess = () => {
            const doc = req.result;
            if (doc) {
                doc.isRead = true;
                store.put(doc);
            }
            tx.oncomplete = () => resolve();
        };
        req.onerror = () => reject(req.error);
    });
}

export async function markAllAsRead(userId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('notifications', 'readwrite');
        const store = tx.objectStore('notifications');
        const index = store.index('userId');
        const req = index.openCursor(IDBKeyRange.only(userId));

        req.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
            if (cursor) {
                const doc = cursor.value;
                if (!doc.isRead) {
                    doc.isRead = true;
                    cursor.update(doc);
                }
                cursor.continue();
            }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

export async function deleteNotification(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('notifications', 'readwrite');
        const store = tx.objectStore('notifications');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}
