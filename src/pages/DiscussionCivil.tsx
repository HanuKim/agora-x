import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CommentItem,
  DiscussionInput,
  type CivilComment,
  type CivilStance,
} from '../components/discussionCivil';
import { mapNewsCommentToCivil } from '../components/discussionCivil/newsComments';
import { Button } from '../components/ui/Button';
import { getStoredReplies } from '../components/discussionCivil/replyStorage';
import rawNewsData from '../data/selectedNews.json';
import { useNewsWithAISummary } from '../features/news/useNewsWithAISummary';
import '../components/discussionCivil/discussionCivil.css';

const selectedNews = (rawNewsData as { selectedNews: Array<{ comments?: Array<{ comment_id: number; author: string; created_at: string; content: string; like_count: number }> }> }).selectedNews;

export const DiscussionCivil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : NaN;
  const issueAnalysisForId = Number.isFinite(numericId) ? numericId : undefined;
  const { items } = useNewsWithAISummary(undefined, issueAnalysisForId);
  const article = items.find((item) => item.id === numericId);

  // 토론 주제: 기사 topic·내용 기반으로 AI가 추출한 debateTopic 우선, 미적용 시 기사 topic (Detail.tsx와 동일)
  const debateTopic = article?.aiSummary?.debateTopic ?? article?.topic;

  const [sortBy] = useState<'popular' | 'latest'>('popular');
  const [visibleCommentCount, setVisibleCommentCount] = useState(5);
  const [, setRepliesVersion] = useState(0);

  // 해당 기사 댓글: selectedNews[articleIndex].comments (id는 1-based → index = numericId - 1)
  const comments = useMemo<CivilComment[]>(() => {
    const articleIndex = Number.isFinite(numericId) ? numericId - 1 : -1;
    const raw = articleIndex >= 0 && selectedNews[articleIndex] ? selectedNews[articleIndex].comments ?? [] : [];
    return raw.map((c) => mapNewsCommentToCivil(c as Parameters<typeof mapNewsCommentToCivil>[0]));
  }, [numericId]);

  const visibleComments = comments.slice(0, visibleCommentCount);
  const hasMoreComments = comments.length > 0 && visibleCommentCount < comments.length;
  const hasComments = comments.length > 0;

  // 현재 페이지에 표시된 CommentItem + ReplyItem 총 개수 (localStorage 포함)
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

  return (
    <div data-page="discussion-civil" className="min-h-screen bg-bg text-text-primary font-sans antialiased transition-colors duration-200">
      <main className="max-w-[1200px] mx-auto px-xl py-xl">
        <header className="max-w-[900px] mx-auto text-center mb-xl">
          <div className="flex justify-center mb-md">
            <div className="inline-flex items-center gap-xs px-sm py-[4px] rounded-full bg-surface border border-border shadow-sm">
              <span className="w-[6px] h-[6px] rounded-full bg-success animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-text-secondary">
                정책 토론 • 진행 중
              </span>
            </div>
          </div>
          <h1 className="text-[2.25rem] md:text-[3rem] font-extrabold leading-tight text-text-primary break-keep">
            {debateTopic ?? '토론 주제를 불러오는 중입니다.'}
          </h1>
          {id && (
            <p className="mt-sm text-xs text-text-secondary">
              이슈 ID: <span className="font-semibold text-primary">{id}</span>
            </p>
          )}
        </header>

        <section className="mb-12">
          <DiscussionInput onSubmit={handleSubmitOpinion} />
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">forum</span>
              시민 토론장 <span className="text-gray-400 font-normal">{totalDisplayCount.toLocaleString()}</span>
            </h2>
            <div className="flex gap-4 text-sm font-medium">
              <button
                type="button"
                className={sortBy === 'popular' ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-500 pb-1'}
              >
                인기순
              </button>
              <button
                type="button"
                className={sortBy === 'latest' ? 'text-primary border-b-2 border-primary pb-1' : 'text-gray-500 pb-1'}
              >
                최신순
              </button>
            </div>
          </div>

          {hasComments && (
            <div className="space-y-8">
              {visibleComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  showThreadLine={Boolean(comment.replies?.length)}
                  onReplyAdded={() => setRepliesVersion((prev) => prev + 1)}
                />
              ))}
            </div>
          )}
        </section>

        {hasComments && hasMoreComments && (
          <div className="mt-16 text-center">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setVisibleCommentCount((prev) => prev + 5)}
              className="whitespace-nowrap"
            >
              토론 의견 더 불러오기
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
