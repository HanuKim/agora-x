import React from 'react';
import { useGuide } from '../features/guide/useGuide';
import { theme } from '../design/theme';
import { PageInformation } from '../components/guide/PageInformation';
import { GuidelineItem } from '../components/guide/GuidelineItem';

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

      <GuidelineItem />
    </div>
  );
};
