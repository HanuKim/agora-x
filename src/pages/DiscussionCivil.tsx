import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CommentItem,
  DiscussionInput,
  type CivilComment,
  type CivilStance,
} from '../components/discussionCivil';
import { useNewsWithAISummary } from '../features/news/useNewsWithAISummary';
import '../components/discussionCivil/discussionCivil.css';

const MOCK_COMMENTS: CivilComment[] = [
  {
    id: '1',
    authorName: '시민운동가_K',
    stance: 'pro',
    body: '주 4일제는 단순히 쉬는 날을 늘리는 것이 아니라, 압축 성장을 해온 우리 사회가 지속 가능성을 확보하는 길입니다. 번아웃을 줄이면 장기적인 건강보험 재정 건전성에도 도움이 될 거예요.',
    timeAgo: '3시간 전',
    score: 142,
    avatarGradient: 'bg-gradient-to-tr from-orange-400 to-red-500',
    replies: [
      {
        id: '1-1',
        authorName: '제조업대표_Park',
        stance: 'con',
        body: '취지는 좋으나 제조업 현장은 \'압축 성향\'이 아니라 기계 가동률이 핵심입니다. 사람이 없으면 기계가 섭니다. 중소기업에 대한 인건비 보전 대책 없이는 고사할 수밖에 없습니다.',
        timeAgo: '2시간 전',
      },
    ],
    moreRepliesCount: 5,
  },
  {
    id: '2',
    authorName: '미래학자_Vision',
    stance: 'neutral',
    body: '업종별로 도입 시기를 다르게 가져가는 \'단계적 도입\' 모델이 필요해 보입니다. IT 서비스업부터 시범 도입 후 효과를 검증하는 게 어떨까요?',
    timeAgo: '5시간 전',
    score: 89,
    avatarGradient: 'bg-gradient-to-tr from-blue-400 to-indigo-500',
  },
  {
    id: '3',
    authorName: '노동연구원_Lee',
    stance: 'pro',
    body: '해외 사례를 보면 주 4일제 도입 후 생산성 지표가 오른 경우가 많습니다. 시범 사업을 확대해 데이터를 쌓는 것이 우선입니다.',
    timeAgo: '6시간 전',
    score: 67,
    avatarGradient: 'bg-gradient-to-tr from-emerald-400 to-teal-500',
  },
  {
    id: '4',
    authorName: '중소상공인_Kim',
    stance: 'con',
    body: '인력이 부족한데 근무일만 줄이면 납기 지키기 어렵습니다. 정부 지원이 선행돼야 합니다.',
    timeAgo: '7시간 전',
    score: 54,
    avatarGradient: 'bg-gradient-to-tr from-amber-400 to-orange-500',
  },
  {
    id: '5',
    authorName: '청년대표_Choi',
    stance: 'neutral',
    body: '일과 삶의 균형이 중요하지만, 임금 보전 없이는 생활이 어렵습니다. 도입 방식에 따라 의견이 갈릴 것 같습니다.',
    timeAgo: '8시간 전',
    score: 41,
    avatarGradient: 'bg-gradient-to-tr from-violet-400 to-purple-500',
  },
  {
    id: '6',
    authorName: '경제학자_Park',
    stance: 'pro',
    body: '장기적으로는 소비 확대와 서비스업 성장으로 일자리가 늘어날 수 있다는 연구 결과가 있습니다.',
    timeAgo: '9시간 전',
    score: 38,
    avatarGradient: 'bg-gradient-to-tr from-rose-400 to-pink-500',
  },
  {
    id: '7',
    authorName: '제조업_Worker',
    stance: 'con',
    body: '현장은 이미 인력 부족으로 초과근무가 많습니다. 주 4일제는 현실과 동떨어진 논의입니다.',
    timeAgo: '10시간 전',
    score: 32,
    avatarGradient: 'bg-gradient-to-tr from-cyan-400 to-blue-500',
  },
  {
    id: '8',
    authorName: '정책연구_Jung',
    stance: 'neutral',
    body: '업종·규모별 차등 도입과 이행 기간을 두는 법안이 필요합니다. 한 번에 전면 적용은 리스크가 큽니다.',
    timeAgo: '11시간 전',
    score: 28,
    avatarGradient: 'bg-gradient-to-tr from-lime-400 to-green-500',
  },
];

const TOTAL_COUNT = 1204;

export const DiscussionCivil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : NaN;
  const issueAnalysisForId = Number.isFinite(numericId) ? numericId : undefined;
  const { items } = useNewsWithAISummary(undefined, issueAnalysisForId);
  const article = items.find((item) => item.id === numericId);

  // 토론 주제: 기사 topic·내용 기반으로 AI가 추출한 debateTopic 우선, 미적용 시 기사 topic (Detail.tsx와 동일)
  const debateTopic = article?.aiSummary?.debateTopic ?? article?.topic;

  const [sortBy] = useState<'popular' | 'latest'>('popular');
  const [comments] = useState<CivilComment[]>(MOCK_COMMENTS);
  const [visibleCommentCount, setVisibleCommentCount] = useState(5);
  const visibleComments = comments.slice(0, visibleCommentCount);
  const hasMoreComments = visibleCommentCount < comments.length;

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
              시민 토론장 <span className="text-gray-400 font-normal">{TOTAL_COUNT.toLocaleString()}</span>
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

          <div className="space-y-8">
            {visibleComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                showThreadLine={Boolean(comment.replies?.length)}
              />
            ))}
          </div>
        </section>

        {hasMoreComments && (
          <div className="mt-16 text-center">
            <button
              type="button"
              onClick={() => setVisibleCommentCount((prev) => prev + 5)}
              className="bg-white dark:bg-gray-800 border-2 border-primary text-primary font-bold py-3 px-10 rounded-full hover:bg-primary hover:text-white transition shadow-neo"
            >
              토론 의견 더 불러오기
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
