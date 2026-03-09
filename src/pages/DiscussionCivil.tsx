import React from 'react';
import { useDetail } from '../features/detail/useDetail';

export const DiscussionCivil: React.FC = () => {
  const { id, debateTopic } = useDetail();

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

        {/* 시민 토론장 레이아웃(의견 입력·목록·더 보기)은 Detail 페이지 시민 토론장 섹션으로 이동됨. 동일 훅(useDetail) 사용. */}
      </main>
    </div>
  );
};
