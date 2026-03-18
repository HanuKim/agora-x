import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../design/theme';
import guideProposalImg from '../../assets/images/guide-proposal.png';
import guideDiscussionImg from '../../assets/images/guide-discussion.png';
import guideAiDebateImg from '../../assets/images/guide-aiDebate.png';
import type { AccordionId } from '../../features/guide/useGuide';

const ACCORDION_STYLES = `
/* Accordion: fixed-size grid, smooth column transition */
.guide-accordion-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  transition: grid-template-columns 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.guide-accordion-container--expanded-0 { grid-template-columns: 1fr 0fr 0fr; }
.guide-accordion-container--expanded-1 { grid-template-columns: 0fr 1fr 0fr; }
.guide-accordion-container--expanded-2 { grid-template-columns: 0fr 0fr 1fr; }
.guide-accordion-item {
  transition: background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border-bottom: 4px solid transparent;
  background-color: var(--color-bg);
  min-width: 0;
}
.guide-accordion-container:not([class*="expanded"]) .guide-accordion-item:hover {
  background-color: var(--color-surface);
  border-bottom-color: var(--color-primary);
}
.guide-accordion-item h2 { transition: color 0.3s ease; }
.guide-accordion-container:not([class*="expanded"]) .guide-accordion-item:hover h2 { color: var(--color-primary); }
.guide-accordion-item--expanded h2 { color: var(--color-primary); }
.guide-accordion-item--expanded {
  background-color: var(--color-surface);
  border-bottom-color: var(--color-primary);
}
.guide-content-fade { opacity: 0; transition: opacity 0.3s ease-in-out; }
.guide-content-fade--visible,
.guide-accordion-container:not([class*="expanded"]) .guide-accordion-item:hover .guide-content-fade { opacity: 1; }
.guide-accordion-item .guide-preview {
  opacity: 0.3;
  transition: opacity 0.3s ease-in-out, transform 0.5s ease;
  overflow: hidden;
}
.guide-accordion-item--expanded .guide-preview,
.guide-accordion-container:not([class*="expanded"]) .guide-accordion-item:hover .guide-preview { opacity: 1; }
.guide-accordion-item--expanded .guide-preview img,
.guide-accordion-container:not([class*="expanded"]) .guide-accordion-item:hover .guide-preview img {
  transform: translateY(0) scale(1.05);
}
.guide-accordion-item .guide-preview img {
  transition: transform 0.5s ease;
  transform: translateY(1rem);
  transform-origin: top center;
  object-position: top;
}
`;

export interface PageInformationProps {
  expandedId: AccordionId;
  handleAccordionClick: (id: AccordionId) => void;
  containerClass: string;
}

export const PageInformation: React.FC<PageInformationProps> = ({
  expandedId,
  handleAccordionClick,
  containerClass,
}) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ACCORDION_STYLES }} />
      <section
        className={`${containerClass} w-full h-[800px] bg-surface/50 gap-4 pt-lg`}
        data-purpose="service-guide-accordion"
      >
        {/* Proposal */}
        <div
          role="button"
          tabIndex={0}
          className={`guide-accordion-item relative group cursor-pointer rounded-2xl shadow-sm border border-border flex flex-col min-w-0 ${expandedId === 'proposal' ? 'guide-accordion-item--expanded' : ''}`}
          data-purpose="guide-section-proposal"
          onClick={() => handleAccordionClick('proposal')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAccordionClick('proposal');
            }
          }}
        >
          <div className="relative z-20 h-full min-h-0 p-8 flex flex-col overflow-auto">
            <div className="mb-4">
              <span className={`${theme.badge.base} ${theme.badge.primary} mb-4 uppercase tracking-wider`}>
                Proposal
              </span>
              <h2 className="text-2xl font-bold text-text-primary">국민 제안</h2>
            </div>
            {expandedId === 'proposal' && (
              <div className="guide-preview mb-4 shrink-0">
                <img
                  src={guideProposalImg}
                  alt="국민 제안 미리보기"
                  className="rounded-lg shadow-xl w-full min-w-0 object-contain bg-surface"
                />
              </div>
            )}
            <div className="mt-4 guide-content-fade--visible">
              <p className="text-text-secondary mb-6 leading-relaxed">
                사회의 다양한 문제를 정의하고, 해결을 위한 혁신적인 제안을 남겨보세요.
                시민들의 공감을 얻으면 정책으로 발전합니다.
              </p>
              {expandedId === 'proposal' && (
                <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="text-sm font-bold text-primary mb-2">상세 설명</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    국민 제안은 시민이 직접 사회 문제를 제기하고 해결 방안을 제시하는 공간입니다.
                    문제 정의와 배경을 명확히 작성한 뒤, 관련 뉴스나 이미지를 첨부하면 다른 시민들의
                    공감과 피드백을 받을 수 있습니다. 공감 수가 일정 기준을 넘으면 정책 검토 단계로
                    이어질 수 있습니다.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {[
                  '문제 정의 및 배경 작성',
                  '이미지 및 관련 뉴스 첨부',
                  '시민 공감 및 피드백 수렴',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-text-secondary">{text}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/proposals/new"
                onClick={(e) => e.stopPropagation()}
                className={`mt-8 inline-flex justify-center items-center rounded-lg font-medium hover:brightness-110 transition-all min-w-[9rem] ${theme.button.base} ${theme.button.variants.primary} ${theme.button.sizes.md}`}
              >
                제안하러 가기
              </Link>
            </div>
          </div>
        </div>

        {/* Discussion */}
        <div
          role="button"
          tabIndex={0}
          className={`guide-accordion-item relative group cursor-pointer rounded-2xl shadow-sm border border-border flex flex-col min-w-0 ${expandedId === 'discussion' ? 'guide-accordion-item--expanded' : ''}`}
          data-purpose="guide-section-discussion"
          onClick={() => handleAccordionClick('discussion')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAccordionClick('discussion');
            }
          }}
        >
          <div className="relative z-20 h-full min-h-0 p-8 flex flex-col overflow-auto">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold mb-4 uppercase tracking-wider dark:bg-blue-900/30 dark:text-blue-300">
                Discussion
              </span>
              <h2 className="text-2xl font-bold text-text-primary">국민 토론</h2>
            </div>
            {expandedId === 'discussion' && (
              <div className="guide-preview mb-4 shrink-0">
                <img
                  src={guideDiscussionImg}
                  alt="국민 토론 미리보기"
                  className="rounded-lg shadow-xl w-full min-w-0 object-contain bg-surface"
                />
              </div>
            )}
            <div className="mt-4 guide-content-fade--visible">
              <p className="text-text-secondary mb-6 leading-relaxed">
                주요 쟁점에 대해 찬성과 반대 의견을 나누고, AI가 요약한 핵심 정보를 통해
                더 깊이 있는 토론에 참여하세요.
              </p>
              {expandedId === 'discussion' && (
                <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">상세 설명</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    국민 토론에서는 뉴스 기사별로 AI가 생성한 핵심 요약을 먼저 확인할 수 있습니다.
                    찬성·반대 의견을 작성하고 투표에 참여하면, 실시간 여론 현황을 한눈에 볼 수 있습니다.
                    다른 시민의 의견을 읽고 논리적으로 반박하거나 공감하는 과정을 통해 건설적인 대화가 이어집니다.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {[
                  'AI 핵심 요약 리포트 확인',
                  '찬반 의견 작성 및 투표',
                  '실시간 여론 현황 분석 확인',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-text-secondary">{text}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/community"
                onClick={(e) => e.stopPropagation()}
                className={`mt-8 inline-flex justify-center items-center bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors min-w-[9rem] ${theme.button.base} ${theme.button.sizes.md}`}
              >
                토론 광장으로
              </Link>
            </div>
          </div>
        </div>

        {/* AI Debate */}
        <div
          role="button"
          tabIndex={0}
          className={`guide-accordion-item relative group cursor-pointer rounded-2xl shadow-sm border border-border flex flex-col min-w-0 ${expandedId === 'ai-chat' ? 'guide-accordion-item--expanded' : ''}`}
          data-purpose="guide-section-ai-chat"
          onClick={() => handleAccordionClick('ai-chat')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleAccordionClick('ai-chat');
            }
          }}
        >
          <div className="relative z-20 h-full min-h-0 p-8 flex flex-col overflow-auto">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-xs font-bold mb-4 uppercase tracking-wider dark:bg-purple-900/30 dark:text-purple-300">
                AI Debate
              </span>
              <h2 className="text-2xl font-bold text-text-primary">토론 연습</h2>
            </div>
            {expandedId === 'ai-chat' && (
              <div className="guide-preview mb-4 shrink-0">
                <img
                  src={guideAiDebateImg}
                  alt="토론 연습 미리보기"
                  className="rounded-lg shadow-xl w-full min-w-0 object-contain bg-surface"
                />
              </div>
            )}
            <div className="mt-4 guide-content-fade--visible">
              <p className="text-text-secondary mb-6 leading-relaxed">
                AI와 1:1로 대화하며 논리적 일관성을 점검하고, 반대편의 시각에서 쟁점을
                다각도로 분석해볼 수 있습니다.
              </p>
              {expandedId === 'ai-chat' && (
                <div className="mb-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-2">상세 설명</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    토론 연습에서는 선택한 이슈에 대해 AI가 반대 입장을 맡아 대화합니다.
                    토론 주제와 AI 페르소나를 설정한 뒤 대화를 시작하면, 실시간으로 논리적 일관성 수치를
                    확인할 수 있습니다. 세션 종료 후에는 요약 리포트로 자신의 주장을 점검하고 보완할 수 있습니다.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {[
                  '토론 주제 및 AI 페르소나 설정',
                  '실시간 논리 일관성 수치 확인',
                  '토론 세션 종료 후 요약 리포트',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-text-secondary">{text}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/ai-discussion"
                onClick={(e) => e.stopPropagation()}
                className={`mt-8 inline-flex justify-center items-center bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors min-w-[9rem] ${theme.button.base} ${theme.button.sizes.md}`}
              >
                AI 토론 시작
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
