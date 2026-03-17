/**
 * Detail / 시민 토론장 관련 타입 (useDetail에서 사용)
 * 단일 소스: features/detail/useCivilStance.ts
 */

/** Stance in civil discussion (찬성 / 반대 / 중립) */
export type CivilStance = 'pro' | 'con' | 'neutral';

export interface CivilComment {
  id: string;
  authorName: string;
  authorId?: string;
  stance: CivilStance;
  body: string;
  timeAgo: string;
  createdAt?: string;
  score: number;
  avatarGradient?: string;
  replies?: CivilReply[];
  moreRepliesCount?: number;
}

export interface CivilReply {
  id: string;
  authorName: string;
  authorId?: string;
  stance: CivilStance;
  body: string;
  timeAgo: string;
  createdAt?: string;
  curveHeight?: number;
}
