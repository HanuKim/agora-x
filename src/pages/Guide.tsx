import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../design/theme';
import guideProposalImg from '../assets/images/guide-proposal.png';
import guideDiscussionImg from '../assets/images/guide-discussion.png';
import guideAiDebateImg from '../assets/images/guide-aiDebate.png';
import './guide.css';

type AccordionId = 'proposal' | 'discussion' | 'ai-chat' | null;

const ACCORDION_IDS: AccordionId[] = ['proposal', 'discussion', 'ai-chat'];

export const Guide: React.FC = () => {
  const [expandedId, setExpandedId] = useState<AccordionId>(null);

  const handleAccordionClick = useCallback((id: AccordionId) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const containerClass =
    expandedId === null
      ? 'guide-accordion-container'
      : `guide-accordion-container guide-accordion-container--expanded-${ACCORDION_IDS.indexOf(expandedId)}`;

  return (
    <div className={`${theme.section.container} py-xl w-full`}>
      {/* Hero */}
      {/* <section className="py-16 px-4 bg-gradient-to-b from-bg to-surface border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[2.25rem] font-bold mb-sm tracking-[0.02em] text-text-primary">
            이용 가이드
          </h1>
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
            아고라-X와 함께 건강하고 안전한 토론 문화를 경험하세요. 참여자 모두를 위한
            가이드라인을 확인해 주세요.
          </p>
        </div>
      </section> */}
      <div className="flex-1">
            <h1 className="text-[2.25rem] font-extrabold mb-sm">
                이용 가이드
            </h1>
            <p className="text-text-secondary mb-lg">
                Agora-x는 건강한 토론 문화를 지향합니다.
                모든 참여자가 안전하게 의견을 나눌 수 있도록 아래 규칙을 준수해 주세요.
            </p>
        </div>

      {/* Service accordion */}
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
              <h2 className="text-2xl font-bold text-text-primary">일대일 토론</h2>
            </div>
            {expandedId === 'ai-chat' && (
              <div className="guide-preview mb-4 shrink-0">
                <img
                  src={guideAiDebateImg}
                  alt="일대일 토론 미리보기"
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
                    일대일 토론에서는 선택한 이슈에 대해 AI가 반대 입장을 맡아 대화합니다.
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

      {/* Community guidelines */}
      <section className="py-24 px-4" data-purpose="community-guidelines">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 mb-6 border border-primary/20">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-4">커뮤니티 가이드라인</h2>
          <p className="text-text-secondary">
            건강하고 생산적인 토론 문화를 위해 다음의 수칙을 준수해 주세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className={`guide-guideline-card ${theme.card.base} ${theme.card.variants.default} ${theme.card.padding.lg} flex flex-col`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary">상호 존중 (Mutual Respect)</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="text-blue-500 font-bold">01</span>
                <p className="text-text-secondary text-sm leading-relaxed">
                  <strong className="text-text-primary">비방 및 혐오 표현 금지:</strong> 인종,
                  성별, 종교 등 특정 집단에 대한 차별적 발언은 엄격히 금지됩니다.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="text-blue-500 font-bold">02</span>
                <p className="text-text-secondary text-sm leading-relaxed">
                  <strong className="text-text-primary">건설적인 비판:</strong> 인격 모독이 아닌
                  상대방의 &apos;주장&apos;에 대해 논리적으로 반박해 주세요.
                </p>
              </li>
            </ul>
          </div>

          <div className={`guide-guideline-card ${theme.card.base} ${theme.card.variants.default} ${theme.card.padding.lg} flex flex-col`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary">익명성 정책 (Anonymity Policy)</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="text-purple-500 font-bold">01</span>
                <p className="text-text-secondary text-sm leading-relaxed">
                  <strong className="text-text-primary">개인정보 보호:</strong> 본인 및 타인의
                  실명, 연락처, 주소 등 민감한 개인정보를 게시하지 마세요.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="text-purple-500 font-bold">02</span>
                <p className="text-text-secondary text-sm leading-relaxed">
                  <strong className="text-text-primary">신상 털기 금지:</strong> 익명성을 악용하여
                  타인의 신상을 추적하거나 공개하는 행위는 금지됩니다.
                </p>
              </li>
            </ul>
          </div>

          <div className={`guide-guideline-card ${theme.card.base} ${theme.card.variants.default} ${theme.card.padding.lg} flex flex-col`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-success dark:bg-success/20 dark:text-success">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary">논리적 토론 (Logical Debate)</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="text-success font-bold">01</span>
                <p className="text-text-secondary text-sm leading-relaxed">
                  <strong className="text-text-primary">근거 제시:</strong> 단순한 주장이 아닌
                  객관적인 데이터나 사례를 바탕으로 의견을 나누어 주세요.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="text-success font-bold">02</span>
                <p className="text-text-secondary text-sm leading-relaxed">
                  <strong className="text-text-primary">주제 집중:</strong> 토론의 본질에서 벗어난
                  지엽적인 논쟁보다는 핵심 쟁점에 집중해 주세요.
                </p>
              </li>
            </ul>
          </div>

          <div className={`guide-guideline-card ${theme.card.base} ${theme.card.variants.default} ${theme.card.padding.lg} flex flex-col`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary">책임 있는 참여 (Responsible Action)</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <span className="text-primary font-bold">01</span>
                <p className="text-text-secondary text-sm leading-relaxed">
                  <strong className="text-text-primary">허위 사실 유포 금지:</strong> 확인되지 않은
                  정보를 사실인 양 게시하여 혼란을 야기하지 마세요.
                </p>
              </li>
              <li className="flex gap-4">
                <span className="text-primary font-bold">02</span>
                <p className="text-text-secondary text-sm leading-relaxed">
                  <strong className="text-text-primary">클린 신고 활용:</strong> 부적절한 게시물을
                  발견하면 AI 중재자에게 신고 기능을 통해 알려주세요.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
