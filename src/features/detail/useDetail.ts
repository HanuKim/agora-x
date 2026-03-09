import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStoredReplies } from '../../components/discussionCivil/replyStorage';
import { useNewsWithAISummary } from '../news/useNewsWithAISummary';
import { formatTimeAgo } from '../../utils/timeCalculate';
import type { CivilComment, CivilStance } from './useCivilStance';
import rawNewsData from '../../data/selectedNews.json';

// 시민 토론장 타입 재내보내기 (컴포넌트에서 동일 타입 사용)
export type { CivilStance, CivilComment, CivilReply } from './useCivilStance';

/** selectedNews 댓글 원본 구조 (mapNewsCommentToCivil 입력) */
interface NewsCommentRaw {
  comment_id: number;
  parent_id: number;
  author: string;
  created_at: string;
  content: string;
  like_count: number;
  hate_count: number;
}

function mapNewsCommentToCivil(raw: NewsCommentRaw): CivilComment {
  return {
    id: String(raw.comment_id),
    authorName: raw.author,
    stance: 'neutral',
    body: raw.content,
    timeAgo: formatTimeAgo(raw.created_at),
    score: raw.like_count,
  };
}

const selectedNews = (rawNewsData as {
  selectedNews: Array<{
    comments?: Array<{
      comment_id: number;
      author: string;
      created_at: string;
      content: string;
      like_count: number;
    }>;
  }>;
}).selectedNews;

export const useDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  /**
   * DiscussionCivil 페이지로 이동하는 이벤트 핸들러 (추후 삭제)
   */
  const goToCivilDiscussion = () => {
    if (id) navigate(`/discussion-civil/${id}`);
  };


  // ---------- 시민 토론장 ----------
  const [sortBy] = useState<'popular' | 'latest'>('popular');
  const [visibleCommentCount, setVisibleCommentCount] = useState(5);
  const [, setRepliesVersion] = useState(0);

  const comments = useMemo<CivilComment[]>(() => {
    const articleIndex = Number.isFinite(numericId) ? numericId - 1 : -1;
    const raw =
      articleIndex >= 0 && selectedNews[articleIndex]
        ? selectedNews[articleIndex].comments ?? []
        : [];
    return raw.map((c) => mapNewsCommentToCivil(c as NewsCommentRaw));
  }, [numericId]);

  const visibleComments = comments.slice(0, visibleCommentCount);
  const hasMoreComments = comments.length > 0 && visibleCommentCount < comments.length;
  const hasComments = comments.length > 0;

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
    void { stance, body };
    // TODO: integrate with proposal/opinion or civil discussion API
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
    proArguments,
    conArguments,
    proArgumentSummaries,
    conArgumentSummaries,
    aiLoading,
    goToCivilDiscussion,
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