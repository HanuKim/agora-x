/** Stance in civil discussion (찬성 / 반대 / 중립) */
export type CivilStance = 'pro' | 'con' | 'neutral';

export interface CivilComment {
  id: string;
  authorName: string;
  stance: CivilStance;
  body: string;
  timeAgo: string;
  score: number;
  avatarGradient?: string;
  replies?: CivilReply[];
  moreRepliesCount?: number;
}

export interface CivilReply {
  id: string;
  authorName: string;
  stance: CivilStance;
  body: string;
  timeAgo: string;
  curveHeight?: number;
}
