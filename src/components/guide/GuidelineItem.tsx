import React from 'react';
import { theme } from '../../design/theme';

const GUIDELINE_STYLES = `
.guide-guideline-card {
  transition: transform 0.2s ease;
}
.guide-guideline-card:hover {
  transform: translateY(-4px);
}
`;

const GUIDELINE_ITEMS = [
  {
    id: 'respect',
    title: '상호 존중 (Mutual Respect)',
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-300',
    numberColor: 'text-blue-500',
    rules: [
      { label: '비방 및 혐오 표현 금지', text: '인종, 성별, 종교 등 특정 집단에 대한 차별적 발언은 엄격히 금지됩니다.' },
      { label: '건설적인 비판', text: "인격 모독이 아닌 상대방의 '주장'에 대해 논리적으로 반박해 주세요." },
    ],
    iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    id: 'anonymity',
    title: '익명성 정책 (Anonymity Policy)',
    iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-300',
    numberColor: 'text-purple-500',
    rules: [
      { label: '개인정보 보호', text: '본인 및 타인의 실명, 연락처, 주소 등 민감한 개인정보를 게시하지 마세요.' },
      { label: '신상 털기 금지', text: '익명성을 악용하여 타인의 신상을 추적하거나 공개하는 행위는 금지됩니다.' },
    ],
    iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    id: 'debate',
    title: '논리적 토론 (Logical Debate)',
    iconBg: 'bg-green-50 dark:bg-success/20',
    iconColor: 'text-success dark:text-success',
    numberColor: 'text-success',
    rules: [
      { label: '근거 제시', text: '단순한 주장이 아닌 객관적인 데이터나 사례를 바탕으로 의견을 나누어 주세요.' },
      { label: '주제 집중', text: '토론의 본질에서 벗어난 지엽적인 논쟁보다는 핵심 쟁점에 집중해 주세요.' },
    ],
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 'responsibility',
    title: '책임 있는 참여 (Responsible Action)',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    numberColor: 'text-primary',
    rules: [
      { label: '허위 사실 유포 금지', text: '확인되지 않은 정보를 사실인 양 게시하여 혼란을 야기하지 마세요.' },
      { label: '클린 신고 활용', text: '부적절한 게시물을 발견하면 AI 중재자에게 신고 기능을 통해 알려주세요.' },
    ],
    iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
] as const;

export const GuidelineItem: React.FC = () => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GUIDELINE_STYLES }} />
      <section className="py-24 px-4 mt-20" data-purpose="community-guidelines">
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
          <h2 className="text-3xl font-bold text-text-primary mb-4">Agora-X 이용 가이드라인</h2>
          <p className="text-lg text-text-secondary">
            건강하고 생산적인 토론 문화를 위해 다음의 수칙을 준수해 주세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {GUIDELINE_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`guide-guideline-card pb-9 pl-8 ${theme.card.base} ${theme.card.variants.default} ${theme.card.padding.lg} flex flex-col`}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d={item.iconPath}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-text-primary">{item.title}</h3>
              </div>
              <ul className="space-y-4 pl-3">
                {item.rules.map((rule, i) => (
                  <li key={i} className="flex gap-4">
                    <span className={`${item.numberColor} font-bold`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      <strong className="text-text-primary">{rule.label}</strong><br/>
                      {rule.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
