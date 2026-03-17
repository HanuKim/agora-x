import type { CivilComment, CivilReply } from '../../features/detail/useCivilStance';

const COMMENTS_STORAGE_KEY = 'agora-civil-comments';
const REPLIES_STORAGE_KEY = 'agora-civil-replies';

type StoredComments = Record<string, CivilComment[]>;
type StoredReplies = Record<string, CivilReply[]>;

function getRepliesStorage(): StoredReplies {
  try {
    const raw = localStorage.getItem(REPLIES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredReplies) : {};
  } catch {
    return {};
  }
}

function setRepliesStorage(data: StoredReplies): void {
  try {
    localStorage.setItem(REPLIES_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function getCommentsStorage(): StoredComments {
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredComments) : {};
  } catch {
    return {};
  }
}

function setCommentsStorage(data: StoredComments): void {
  try {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// ─── 댓글 (Root Comments, issueId 기준) ────────────────────────────────────

export function getStoredComments(issueId: string): CivilComment[] {
  return getCommentsStorage()[issueId] ?? [];
}

export function appendStoredComment(issueId: string, comment: CivilComment): void {
  const data = getCommentsStorage();
  const list = data[issueId] ?? [];
  data[issueId] = [...list, comment];
  setCommentsStorage(data);
}

export function updateStoredComment(
  issueId: string,
  commentId: string,
  updates: Partial<Pick<CivilComment, 'body' | 'stance'>>
): void {
  const data = getCommentsStorage();
  const list = data[issueId] ?? [];
  const next = list.map((c) => (c.id === commentId ? { ...c, ...updates } : c));
  data[issueId] = next;
  setCommentsStorage(data);
}

export function removeStoredComment(issueId: string, commentId: string): void {
  const data = getCommentsStorage();
  const list = data[issueId] ?? [];
  data[issueId] = list.filter((c) => c.id !== commentId);
  setCommentsStorage(data);
}

// ─── 답글 (Replies, commentId 기준) ────────────────────────────────────────

export function getStoredReplies(commentId: string): CivilReply[] {
  return getRepliesStorage()[commentId] ?? [];
}

export function appendStoredReply(commentId: string, reply: CivilReply): void {
  const data = getRepliesStorage();
  const list = data[commentId] ?? [];
  data[commentId] = [...list, reply];
  setRepliesStorage(data);
}

export function updateStoredReply(
  commentId: string,
  replyId: string,
  updates: Partial<Pick<CivilReply, 'body' | 'stance'>>
): void {
  const data = getRepliesStorage();
  const list = data[commentId] ?? [];
  const next = list.map((r) => (r.id === replyId ? { ...r, ...updates } : r));
  data[commentId] = next;
  setRepliesStorage(data);
}

export function removeStoredReply(commentId: string, replyId: string): void {
  const data = getRepliesStorage();
  const list = data[commentId] ?? [];
  data[commentId] = list.filter((r) => r.id !== replyId);
  setRepliesStorage(data);
}