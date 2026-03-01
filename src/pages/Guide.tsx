import React from 'react';

export const Guide: React.FC = () => {
    return (
        <div className="max-w-[800px] mx-auto px-xl py-xl">
            <h1 className="text-[2.25rem] font-bold font-sans mb-lg">이용 가이드</h1>
            <p className="font-sans leading-relaxed text-text-secondary">
                Agora-X는 AI 요약과 큐레이팅을 기반으로 시민들이 사회적 안건에 대해 자유롭게 토론하고 합의점을 찾아가는 차세대 디지털 광장입니다.
                <br /><br />
                <b>주요 기능 가이드:</b>
                <ul className="pl-lg mt-md space-y-sm">
                    <li><strong className="text-primary">홈:</strong> AI가 요약한 오늘의 핵심 쟁점을 확인하고 투표에 참여하세요.</li>
                    <li><strong className="text-primary">커뮤니티:</strong> 선정된 뉴스 타임라인과 유저 간 열띤 토론 게시판을 지원합니다.</li>
                    <li><strong className="text-primary">AI와의 토론:</strong> 사회적 이슈에 대하여 객관적이고 중립적인 AI와 모의 토론을 진행하며 시야를 넓힙니다.</li>
                </ul>
            </p>
        </div>
    );
};
