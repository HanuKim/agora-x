import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStoredReplies, getStoredComments, appendStoredComment } from '../../services/db/detailDB';
import { useNewsWithAISummary } from '../news/useNewsWithAISummary';
import type { ContentCategory } from '../common/types';
import { formatTimeAgo } from '../../utils/timeCalculate';
import { generateNickname } from '../../utils/nicknameGenerator';
import type { CivilComment, CivilStance } from './useCivilStance';
import rawNewsData from '../../data/selectedNews.json';

const DEFAULT_USER_ID = 'anonymous';
const CURRENT_USER_ID = 'current-user';

// 시민 토론장 타입 재내보내기 (컴포넌트에서 동일 타입 사용)
export type { CivilStance, CivilComment, CivilReply } from './useCivilStance';

/** selectedNews 댓글 원본 구조 (mapNewsCommentToCivil 입력) */
interface NewsCommentRaw {
  comment_id: number;
  parent_id?: number;
  author: string;
  created_at: string;
  content: string;
  like_count: number;
  hate_count?: number;
  /** 찬성(pro) / 반대(con) / 중립(neutral) — 없으면 neutral */
  stance?: 'pro' | 'con' | 'neutral';
}

const VALID_STANCE = new Set<string>(['pro', 'con', 'neutral']);

function mapNewsCommentToCivil(raw: NewsCommentRaw, issueId: string): CivilComment {
  const userId = (raw.author ?? '').trim() || DEFAULT_USER_ID;
  const stance = raw.stance && VALID_STANCE.has(raw.stance) ? raw.stance : 'neutral';
  return {
    id: String(raw.comment_id),
    authorName: generateNickname(userId, issueId),
    stance,
    body: raw.content,
    timeAgo: formatTimeAgo(raw.created_at),
    createdAt: raw.created_at,
    score: raw.like_count,
  };
}

const selectedNews = (rawNewsData as {
  selectedNews: Array<{
    comments?: Array<{
      comment_id: number;
      author?: string;
      created_at: string;
      content: string;
      like_count: number;
      stance?: 'pro' | 'con' | 'neutral';
    }>;
  }>;
}).selectedNews;

export const useDetail = () => {
  const { id } = useParams<{ id: string }>();

  /**
   * 기사 ID 처리 및 유효성 검사
   */
  const numericId = id ? Number(id) : NaN;
  const isValidId = Number.isFinite(numericId);

  /**
   * 기사 데이터 조회(데이터 페칭, 기존 훅 활용)
   */
  const { items } = useNewsWithAISummary(undefined, isValidId ? numericId : undefined);
  const article = items.find((item) => item.id === numericId);

  /**
   * 토론 주제: 기사 topic·내용 기반으로 AI가 추출한 debateTopic 우선 화면에 표시. 미적용 시 기사 topic 표시
   */
  const debateTopic = article?.aiSummary?.debateTopic ?? article?.topic;
  const overview = article?.issueAnalysis?.background ?? article?.aiSummary?.overview;

  /**
   * 찬성/반대 의견 논거 및 요약 표시
   */
  const proArguments = article?.aiSummary?.proArguments ?? [];
  const conArguments = article?.aiSummary?.conArguments ?? [];
  const proArgumentSummaries = article?.aiSummary?.proArgumentSummaries ?? [];
  const conArgumentSummaries = article?.aiSummary?.conArgumentSummaries ?? [];
  const aiLoading = article?.aiLoading ?? false;
  const category: ContentCategory = article?.category ?? '기타';

  // ---------- 시민 토론장 ----------
  const [sortBy] = useState<'popular' | 'latest'>('popular');
  const [visibleCommentCount, setVisibleCommentCount] = useState(5);
  const [, setRepliesVersion] = useState(0);
  /** 로컬 저장 댓글(issueId 기준) — 페이지 로드 시 getStoredComments와 merge */
  const [userComments, setUserComments] = useState<CivilComment[]>([]);

  useEffect(() => {
    if (!id) return;
    const stored = getStoredComments(id);
    queueMicrotask(() => setUserComments(stored));
  }, [id]);

  const commentsFromData = useMemo<CivilComment[]>(() => {
    const issueId = id ?? '';
    const articleIndex = Number.isFinite(numericId) ? numericId - 1 : -1;
    const raw =
      articleIndex >= 0 && selectedNews[articleIndex]
        ? selectedNews[articleIndex].comments ?? []
        : [];
    return raw.map((c) => mapNewsCommentToCivil(c as NewsCommentRaw, issueId));
  }, [numericId, id]);

  const allComments = useMemo<CivilComment[]>(
    () => [...commentsFromData, ...userComments],
    [commentsFromData, userComments]
  );

  const visibleComments = allComments.slice(0, visibleCommentCount);
  const hasMoreComments = allComments.length > 0 && visibleCommentCount < allComments.length;
  const hasComments = allComments.length > 0;

  /**
   * 현재 페이지의 총 Comment + Reply 개수 계산
   */
  const totalDisplayCount =
    visibleComments.length +
    visibleComments.reduce(
      (sum, c) => sum + (c.replies?.length ?? 0) + getStoredReplies(c.id).length,
      0
    );

  const handleSubmitOpinion = (stance: CivilStance, body: string) => {
    if (!id) return;
    const now = new Date();
    const newComment: CivilComment = {
      id: `user-${id}-${Date.now()}`,
      authorName: generateNickname(CURRENT_USER_ID, id),
      stance,
      body,
      timeAgo: '방금 전',
      createdAt: now.toISOString(),
      score: 0,
      replies: [],
    };
    appendStoredComment(id, newComment);
    setUserComments((prev) => [...prev, newComment]);
    setVisibleCommentCount((prev) => prev + 1);
  };

  const loadMoreComments = () => {
    setVisibleCommentCount((prev) => prev + 5);
  };

  const handleReplyAdded = () => {
    setRepliesVersion((prev) => prev + 1);
  };

  return {
    id,
    numericId,
    debateTopic,
    overview,
    category,
    proArguments,
    conArguments,
    proArgumentSummaries,
    conArgumentSummaries,
    aiLoading,
    // 시민 토론장
    sortBy,
    comments: visibleComments,
    hasComments,
    hasMoreComments,
    totalDisplayCount,
    handleSubmitOpinion,
    loadMoreComments,
    handleReplyAdded,
  };
};