/**
 * proposalDB.ts
 *
 * IndexedDB wrapper for "People's Proposal" feature.
 * Stores proposals and opinions (comments).
 */

import { type ContentCategory } from '../../features/user';

const DB_NAME = 'agora-x-proposals';
const DB_VERSION = 1;

export interface Proposal {
    id: string; // generate UUID/timestamp string
    title: string;
    description: string; // Optional or legacy field
    problem?: string;
    reason?: string;
    currentSituation?: string;
    solution?: string;
    category?: ContentCategory;
    authorId: string;
    authorNickname: string; // Generated explicitly at creation
    createdAt: number;
    upvotes: number; // legacy alias for likes? keeping for compat but adding likes
    likes?: number;
    likedBy?: string[];
    scraps?: number;
    scrapedBy?: string[];
    opinionCount?: number;
    relatedArticleCount?: number;
}

export interface Opinion {
    id: string; // generate UUID/timestamp string
    proposalId: string;
    authorId: string;
    authorNickname: string;
    content: string;
    createdAt: number;
    likes?: number;
    likedBy?: string[];
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains('proposals')) {
                const store = db.createObjectStore('proposals', { keyPath: 'id' });
                store.createIndex('createdAt', 'createdAt', { unique: false });
            }
            if (!db.objectStoreNames.contains('opinions')) {
                const store = db.createObjectStore('opinions', { keyPath: 'id' });
                store.createIndex('proposalId', 'proposalId', { unique: false });
                store.createIndex('createdAt', 'createdAt', { unique: false });
            }
        };

        request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
        request.onerror = (event) => {
            console.error('[proposalDB] Failed to open IndexedDB:', (event.target as IDBOpenDBRequest).error);
            reject((event.target as IDBOpenDBRequest).error);
            dbPromise = null;
        };
    });

    return dbPromise;
}

// ─── Proposals ─────────────────────────────────────────────────────────────

export async function createProposal(proposal: Proposal): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('proposals', 'readwrite');
        const store = tx.objectStore('proposals');
        const req = store.add(proposal);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function getProposals(): Promise<Proposal[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('proposals', 'readonly');
        const store = tx.objectStore('proposals');
        const index = store.index('createdAt');
        // Fetch all, ordered by createdAt (oldest first). We reverse it later or sort.
        const req = index.getAll();
        req.onsuccess = () => {
            // Newest first
            const results = req.result as Proposal[];
            resolve(results.reverse());
        };
        req.onerror = () => reject(req.error);
    });
}

export async function getProposalById(id: string): Promise<Proposal | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('proposals', 'readonly');
        const store = tx.objectStore('proposals');
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as Proposal) || null);
        req.onerror = () => reject(req.error);
    });
}

// ─── Opinions ──────────────────────────────────────────────────────────────

export async function createOpinion(opinion: Opinion): Promise<void> {
    const db = await openDB();

    // Ensure default arrays
    const newOpinion = { ...opinion };
    if (newOpinion.likes === undefined) newOpinion.likes = 0;
    if (!newOpinion.likedBy) newOpinion.likedBy = [];

    return new Promise((resolve, reject) => {
        const tx = db.transaction(['opinions', 'proposals'], 'readwrite');
        const opinionsStore = tx.objectStore('opinions');
        const proposalsStore = tx.objectStore('proposals');

        const request = opinionsStore.add(newOpinion); // Use add for new opinions

        request.onsuccess = () => {
            // After successfully creating an opinion, update the proposal's opinion count
            const propRequest = proposalsStore.get(opinion.proposalId);
            propRequest.onsuccess = () => {
                const doc = propRequest.result;
                if (doc) {
                    doc.opinionCount = (doc.opinionCount || 0) + 1;
                    proposalsStore.put(doc); // Update the proposal
                }
            };
            resolve();
        };
        request.onerror = (event) => {
            console.error('[proposalDB] Failed to create opinion:', (event.target as IDBRequest).error);
            reject((event.target as IDBRequest).error);
        };
    });
}

// ----------------------------------------------------------------------------
// Interactions (Likes / Scraps)
// ----------------------------------------------------------------------------

export async function toggleProposalLike(proposalId: string, userId: string): Promise<Proposal> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('proposals', 'readwrite');
        const store = tx.objectStore('proposals');
        const request = store.get(proposalId);

        request.onsuccess = () => {
            const doc = request.result;
            if (!doc) return reject(new Error('Proposal not found'));

            if (!doc.likedBy) doc.likedBy = [];
            if (doc.likes === undefined) doc.likes = doc.upvotes || 0;

            const index = doc.likedBy.indexOf(userId);
            if (index === -1) {
                // Like
                doc.likedBy.push(userId);
                doc.likes += 1;
                doc.upvotes += 1;
            } else {
                // Unlike
                doc.likedBy.splice(index, 1);
                doc.likes = Math.max(0, doc.likes - 1);
                doc.upvotes = Math.max(0, doc.upvotes - 1);
            }

            const putRequest = store.put(doc);
            putRequest.onsuccess = () => resolve(doc);
            putRequest.onerror = (e) => reject((e.target as IDBRequest).error);
        };
        request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
}

export async function toggleProposalScrap(proposalId: string, userId: string): Promise<Proposal> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('proposals', 'readwrite');
        const store = tx.objectStore('proposals');
        const request = store.get(proposalId);

        request.onsuccess = () => {
            const doc = request.result;
            if (!doc) return reject(new Error('Proposal not found'));

            if (!doc.scrapedBy) doc.scrapedBy = [];
            if (doc.scraps === undefined) doc.scraps = 0;

            const index = doc.scrapedBy.indexOf(userId);
            if (index === -1) {
                // Scrap
                doc.scrapedBy.push(userId);
                doc.scraps += 1;
            } else {
                // Unscrap
                doc.scrapedBy.splice(index, 1);
                doc.scraps = Math.max(0, doc.scraps - 1);
            }

            const putRequest = store.put(doc);
            putRequest.onsuccess = () => resolve(doc);
            putRequest.onerror = (e) => reject((e.target as IDBRequest).error);
        };
        request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
}

export async function toggleOpinionLike(opinionId: string, userId: string): Promise<Opinion> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('opinions', 'readwrite');
        const store = tx.objectStore('opinions');
        const request = store.get(opinionId);

        request.onsuccess = () => {
            const doc = request.result;
            if (!doc) return reject(new Error('Opinion not found'));

            if (!doc.likedBy) doc.likedBy = [];
            if (doc.likes === undefined) doc.likes = 0;

            const index = doc.likedBy.indexOf(userId);
            if (index === -1) {
                // Like
                doc.likedBy.push(userId);
                doc.likes += 1;
            } else {
                // Unlike
                doc.likedBy.splice(index, 1);
                doc.likes = Math.max(0, doc.likes - 1);
            }

            const putRequest = store.put(doc);
            putRequest.onsuccess = () => resolve(doc);
            putRequest.onerror = (e) => reject((e.target as IDBRequest).error);
        };
        request.onerror = (e) => reject((e.target as IDBRequest).error);
    });
}

export async function getOpinionsByProposalId(proposalId: string): Promise<Opinion[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('opinions', 'readonly');
        const store = tx.objectStore('opinions');
        const index = store.index('proposalId');

        // Use a cursor or IDBKeyRange to get items for this proposal
        const range = IDBKeyRange.only(proposalId);
        const req = index.getAll(range);

        req.onsuccess = () => {
            const results = (req.result as Opinion[]).sort((a, b) => b.createdAt - a.createdAt); // newest first
            resolve(results);
        };
        req.onerror = () => reject(req.error);
    });
}
