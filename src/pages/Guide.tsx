import React from 'react';
import { useGuide } from '../features/guide/useGuide';
import { theme } from '../design/theme';
import { PageInformation } from '../components/guide/PageInformation';
import './guide.css';

export const Guide: React.FC = () => {
  const { expandedId, handleAccordionClick, containerClass } = useGuide();

  return (
    <div className={`${theme.section.container} py-xl w-full`}>
      <div className="flex-1">
        <h1 className="text-[2.25rem] font-extrabold mb-sm">이용 가이드</h1>
        <p className="text-text-secondary mb-lg">
          Agora-x는 건강한 토론 문화를 지향합니다.
          모든 참여자가 안전하게 의견을 나눌 수 있도록 아래 규칙을 준수해 주세요.
        </p>
      </div>

      <PageInformation
        expandedId={expandedId}
        handleAccordionClick={handleAccordionClick}
        containerClass={containerClass}
      />

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
