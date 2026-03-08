import type { CivilReply } from './types';

const STORAGE_KEY = 'agora-civil-replies';

type StoredReplies = Record<string, CivilReply[]>;

function getStorage(): StoredReplies {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredReplies) : {};
  } catch {
    return {};
  }
}

function setStorage(data: StoredReplies): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getStoredReplies(commentId: string): CivilReply[] {
  return getStorage()[commentId] ?? [];
}

export function appendStoredReply(commentId: string, reply: CivilReply): void {
  const data = getStorage();
  const list = data[commentId] ?? [];
  data[commentId] = [...list, reply];
  setStorage(data);
}
