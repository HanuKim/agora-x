import type { CivilComment } from './types';

export interface NewsCommentRaw {
  comment_id: number;
  parent_id: number;
  author: string;
  created_at: string;
  content: string;
  like_count: number;
  hate_count: number;
}

function formatTimeAgo(createdAt: string): string {
  try {
    const date = new Date(createdAt.replace(' ', 'T'));
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
  } catch {
    return createdAt.slice(0, 10);
  }
}

export function mapNewsCommentToCivil(raw: NewsCommentRaw): CivilComment {
  return {
    id: String(raw.comment_id),
    authorName: raw.author,
    stance: 'neutral',
    body: raw.content,
    timeAgo: formatTimeAgo(raw.created_at),
    score: raw.like_count,
  };
}
