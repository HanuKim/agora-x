import type { CivilComment, CivilReply } from '../../features/detail/useCivilStance';

const COMMENTS_STORAGE_KEY = 'agora-civil-comments';
const REPLIES_STORAGE_KEY = 'agora-civil-replies';
const LIKED_DISCUSSIONS_STORAGE_KEY = 'agora-liked-discussions';
const LIKE_COUNT_DELTA_KEY = 'agora-discussion-like-count-delta';

/** 시민 토론장에서 공감한 댓글/답글 한 건 (LikedOpinionsTab 표시용) */
export interface Discussion {
  id: string;
  issueId: string;
  type: 'comment' | 'reply';
  targetId: string;
  authorName: string;
  body: string;
  stance: 'pro' | 'con' | 'neutral';
  createdAt: number;
  articleTitle?: string;
  scoreAtLike?: number;
}

type StoredLikedDiscussions = Record<string, Discussion[]>;

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

// ─── 공감한 시민 토론 (댓글/답글) — userId 기준 ─────────────────────────────

function getLikedDiscussionsStorage(): StoredLikedDiscussions {
  try {
    const raw = localStorage.getItem(LIKED_DISCUSSIONS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredLikedDiscussions) : {};
  } catch {
    return {};
  }
}

function setLikedDiscussionsStorage(data: StoredLikedDiscussions): void {
  try {
    localStorage.setItem(LIKED_DISCUSSIONS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getLikedDiscussions(userId: string): Discussion[] {
  return getLikedDiscussionsStorage()[userId] ?? [];
}

export function addLikedDiscussion(userId: string, discussion: Discussion): void {
  const data = getLikedDiscussionsStorage();
  const list = data[userId] ?? [];
  if (list.some((d) => d.targetId === discussion.targetId)) return;
  data[userId] = [...list, discussion];
  setLikedDiscussionsStorage(data);
}

export function removeLikedDiscussion(userId: string, targetId: string): void {
  const data = getLikedDiscussionsStorage();
  const list = data[userId] ?? [];
  data[userId] = list.filter((d) => d.targetId !== targetId);
  setLikedDiscussionsStorage(data);
}

// ─── 공감 시 like_count 증분 (댓글/답글별 +1 반영, selectedNews.json 대신 저장) ─────

type LikeCountDelta = Record<string, number>;

function getLikeCountDeltaStorage(): LikeCountDelta {
  try {
    const raw = localStorage.getItem(LIKE_COUNT_DELTA_KEY);
    return raw ? (JSON.parse(raw) as LikeCountDelta) : {};
  } catch {
    return {};
  }
}

function setLikeCountDeltaStorage(data: LikeCountDelta): void {
  try {
    localStorage.setItem(LIKE_COUNT_DELTA_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getLikeCountDelta(targetId: string): number {
  return getLikeCountDeltaStorage()[targetId] ?? 0;
}

export function incrementLikeCount(targetId: string): void {
  const data = getLikeCountDeltaStorage();
  data[targetId] = (data[targetId] ?? 0) + 1;
  setLikeCountDeltaStorage(data);
}

export function decrementLikeCount(targetId: string): void {
  const data = getLikeCountDeltaStorage();
  const current = data[targetId] ?? 0;
  if (current <= 1) {
    delete data[targetId];
  } else {
    data[targetId] = current - 1;
  }
  setLikeCountDeltaStorage(data);
}