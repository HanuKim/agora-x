import React, { useState } from 'react';
import {
  CommentItem,
  DiscussionInput,
  type CivilComment,
  type CivilStance,
} from '../components/discussionCivil';
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
];

const TOTAL_COUNT = 1204;

export const DiscussionCivil: React.FC = () => {
  const [sortBy] = useState<'popular' | 'latest'>('popular');
  const [comments] = useState<CivilComment[]>(MOCK_COMMENTS);

  const handleSubmitOpinion = (stance: CivilStance, body: string) => {
    void { stance, body };
    // TODO: integrate with proposal/opinion or civil discussion API
  };

  return (
    <div data-page="discussion-civil" className="min-h-screen bg-bg text-text-primary font-sans antialiased transition-colors duration-200">
      <main className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase text-gray-500">실시간 시민 토론</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
            주 4일 근무제 도입,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-primary">시기상조인가, 필수 변화인가?</span>
          </h1>
        </header>

        <section className="mb-12">
          <DiscussionInput onSubmit={handleSubmitOpinion} />
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">forum</span>
              시민 토론 스레드 <span className="text-gray-400 font-normal">{TOTAL_COUNT.toLocaleString()}</span>
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

          <div className="space-y-12">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                showThreadLine={Boolean(comment.replies?.length)}
              />
            ))}
          </div>
        </section>

        <div className="mt-16 text-center">
          <button
            type="button"
            className="bg-white dark:bg-gray-800 border-2 border-primary text-primary font-bold py-3 px-10 rounded-full hover:bg-primary hover:text-white transition shadow-neo"
          >
            토론 의견 더 불러오기
          </button>
        </div>
      </main>
    </div>
  );
};
