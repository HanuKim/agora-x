import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const TRENDING = [
    {
        id: 1,
        tag: '#주4일제',
        tagColor: 'text-primary bg-primary/10',
        label: '주 4일 근무제 전면 도입',
        desc: '2026년까지 대기업 및 공공기관 주 4일제 의무화 법안 발의에 대한 논의.',
        participants: '+420',
    },
    {
        id: 2,
        tag: '#AI저작권',
        tagColor: 'text-blue-500 bg-blue-500/10',
        label: '생성형 AI 저작권법',
        desc: 'AI 학습 데이터 사용에 대한 보상 체계 마련과 창작자 보호 법안.',
        participants: '+1.2k',
    },
];

const FEATURED = [
    {
        id: 1,
        tag: '#주거지원',
        dotColor: 'bg-primary',
        title: '청년 공공임대 확대와 역차별 논란',
        ai: '청년층 주거 안정을 위한 역세권 공공임대 확대는 필수적이라는 의견과, 중장년층 소외 및 임대료 형평성 문제가 충돌하고 있습니다.',
        replies: '245',
    },
    {
        id: 2,
        tag: '#연금개혁',
        dotColor: 'bg-[#8b5cf6]',
        title: '정년 연장 및 국민연금 개혁',
        ai: '정년을 65세로 연장하고 보험료율을 인상하는 방안. 세대 간 부담 형평성과 연금 고갈 방지를 위한 최선의 대안인지 논의가 필요합니다.',
        replies: '892',
    },
    {
        id: 3,
        tag: '#의료',
        dotColor: 'bg-danger',
        title: '비대면 진료 법제화와 플랫폼 규제',
        ai: '의료 접근성을 높이는 비대면 진료의 전면 허용 요구와 약물 오남용 및 의료 영리화를 우려하는 의료계의 입장 차이.',
        replies: '342',
    },
];

export const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-bg font-sans">
            {/* ── Hero ─────────────────────────────── */}
            <header className="bg-dark-brand text-text-inverse px-xl pt-xxl pb-xxl text-center relative overflow-hidden rounded-b-[9999px]">
                <div className="relative z-10 max-w-[800px] mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-white/10 border border-white/20 mb-lg">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-sm font-medium">AI 기반 합의 시스템</span>
                    </div>

                    <h1 className="text-[3.5rem] font-extrabold leading-tight mb-lg">
                        미래의 시민 담론을 <br />
                        <span className="text-primary">만들어 갑니다</span>
                    </h1>

                    <p className="text-lg text-gray-brand mb-xl leading-relaxed">
                        K-Agora는 고도화된 AI를 활용해 복잡한 사회 이슈를 요약하고 핵심 논쟁을 분석하여, 우리 사회가 공통의 합의점을 찾도록 돕습니다. 지금 토론에 참여하세요.
                    </p>

                    <div className="flex justify-center gap-md">
                        <Button size="lg" onClick={() => navigate('/community')}>
                            이슈 탐색하기
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => navigate('/ai-discussion')}
                            className="bg-transparent! text-text-inverse! border-2 border-gray-brand hover:bg-white/10!"
                        >
                            AI 토론 연습
                        </Button>
                    </div>
                </div>
            </header>

            {/* ── Trending ─────────────────────────────── */}
            <section className="max-w-[1200px] mx-auto px-xl -mt-10 relative z-20">
                <h2 className="text-[1.75rem] font-bold mb-md flex items-center gap-sm">
                    <span className="text-danger">🔥</span> 지금 뜨는 이슈
                </h2>

                <div className="flex gap-lg overflow-x-auto pb-md">
                    {TRENDING.map((item) => (
                        <Card
                            key={item.id}
                            className="min-w-[300px] cursor-pointer hover:shadow-lg transition-shadow duration-200"
                            onClick={() => navigate('/community')}
                        >
                            <div className="flex justify-between mb-sm">
                                <span className={`text-xs font-bold px-sm py-[2px] rounded ${item.tagColor}`}>
                                    {item.tag}
                                </span>
                                <span className="text-sm text-gray-brand">N시간 전</span>
                            </div>
                            <h3 className="text-lg font-bold mb-xs">{item.label}</h3>
                            <p className="text-sm text-text-secondary">{item.desc}</p>
                            <div className="mt-md text-sm text-gray-brand font-medium">
                                {item.participants}명 참여 중
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ── Featured Grid ─────────────────────────────── */}
            <main className="max-w-[1200px] mx-auto px-xl my-xxl">
                <div className="flex justify-between items-end mb-xl">
                    <div>
                        <h2 className="text-[2.5rem] font-bold mb-xs">이슈 둘러보기</h2>
                        <p className="text-text-secondary">AI가 큐레이션하고 커뮤니티가 주도합니다.</p>
                    </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-lg">
                    {FEATURED.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col bg-bg rounded-lg border border-border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                            onClick={() => navigate('/community')}
                        >
                            {/* Image placeholder */}
                            <div className="h-[160px] bg-surface p-md">
                                <span className="inline-flex items-center px-sm py-[4px] rounded-full text-xs font-bold bg-white shadow-sm">
                                    <span className={`w-2 h-2 rounded-full mr-2 ${item.dotColor}`} />
                                    {item.tag}
                                </span>
                            </div>

                            <div className="p-lg flex flex-col flex-1">
                                <h3 className="text-[1.75rem] font-bold mb-md">{item.title}</h3>
                                <div className="p-md bg-surface rounded-md mb-lg">
                                    <div className="text-xs font-bold text-primary mb-xs">AI 요약</div>
                                    <p className="text-sm text-text-secondary leading-relaxed">{item.ai}</p>
                                </div>
                                <div className="mt-auto pt-md border-t border-border text-gray-brand text-sm font-medium">
                                    {item.replies}개 댓글
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-xl">
                    <Button variant="secondary" onClick={() => navigate('/community')}>
                        더 많은 이슈 보기
                    </Button>
                </div>
            </main>
        </div>
    );
};
