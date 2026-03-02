import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useNewsWithAISummary } from '../features/news/useNewsWithAISummary';
import issuesData from '../data/koreanSocialIssues.json';

interface Issue {
    id: number;
    topic: string;
    category: string;
    pro: string[];
    con: string[];
}

const issues: Issue[] = (issuesData as { title: string; issues: Issue[] }).issues.slice(0, 10);

/** Map each category to a Tailwind color pair */
const CATEGORY_COLORS: Record<string, string> = {
    '사법/인권': 'bg-[#8b5cf6]/10 text-[#8b5cf6]',
    '여성/보건': 'bg-[#ec4899]/10 text-[#ec4899]',
    '성소수자/인권': 'bg-danger/10 text-danger',
    '노동/경제': 'bg-warning/10 text-warning',
    '교육': 'bg-success/10 text-success',
    '에너지/환경': 'bg-[#22c55e]/10 text-[#22c55e]',
    '다문화/인권': 'bg-[#06b6d4]/10 text-[#06b6d4]',
    '교육/디지털': 'bg-[#3b82f6]/10 text-[#3b82f6]',
    '복지/경제': 'bg-[#6366f1]/10 text-[#6366f1]',
    '안보/군사': 'bg-[#64748b]/10 text-[#64748b]',
    '젠더/행정': 'bg-[#d946ef]/10 text-[#d946ef]',
    '부동산/경제': 'bg-[#f97316]/10 text-[#f97316]',
    '의료/교육': 'bg-[#14b8a6]/10 text-[#14b8a6]',
    '디지털/인권': 'bg-[#0ea5e9]/10 text-[#0ea5e9]',
    '의료/복지': 'bg-[#84cc16]/10 text-[#84cc16]',
    '보건/법률': 'bg-[#a78bfa]/10 text-[#a78bfa]',
    '노동/고령화': 'bg-[#fb923c]/10 text-[#fb923c]',
    '기술/세금': 'bg-[#34d399]/10 text-[#34d399]',
    '생명윤리/의료': 'bg-danger/10 text-danger',
};
const DEFAULT_BADGE = 'bg-surface text-text-secondary';

export const Home: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === 'right' ? 600 : -600, behavior: 'smooth' });
        }
    };
    const navigate = useNavigate();
    // 홈에서는 9건만 처리 (3×3 그리드)
    const { items: newsItems } = useNewsWithAISummary(9);

    return (
        <div className="min-h-screen bg-bg font-sans">
            {/* ── Hero ─────────────────────────────── */}
            <header className="bg-dark-brand text-text-inverse px-xl pt-xxl pb-xxl text-center relative overflow-hidden rounded-b-[3rem]">
                {/* decorative blobs */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary opacity-20 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500 opacity-20 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-[800px] mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-white/10 border border-white/20 mb-lg">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-sm font-medium">AI와 열어가는 시민의 광장</span>
                    </div>

                    <h1 className="text-[3.5rem] font-extrabold leading-tight mb-lg">
                        미래의 시민 담론을 <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-300 relative">만들어 갑니다</span>
                        <svg className="w-full h-3 -bottom-1 left-0 text-primary opacity-80" fill="none" viewBox="0 0 200 9" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7509 9.37523 78.9113 9.81705 112.604 7.40837C129.352 6.21115 136.138 6.55181 151.782 5.23438C161.731 4.39656 176.475 3.32839 198.004 2.03058" stroke="currentColor" stroke-width="3"></path></svg>
                    </h1>

                    <p className="text-lg text-[#D1D5DB] mb-xl leading-relaxed">
                        K-Agora는 고도화된 AI를 활용해 우리사회가 당면한 문제를 포착하고 핵심 쟁점을 분석하여,<br />  협치를 도모하고 사회적 신뢰 회복을 위한 토론의 장을 제공합니다.
                        <br /> 모든 이의 의견이 존중받는 이곳에서 당신의 생각을 나누어 주세요.
                    </p>

                    <div className="flex justify-center gap-md">
                        <Button size="lg" onClick={() => navigate('/community')}>
                            국민 토론 참여
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => navigate('/ai-discussion')}
                            className="bg-transparent! text-text-inverse! border-2 border-gray-brand hover:bg-white/10!"
                        >
                            일대일 토론 시작 →
                        </Button>
                    </div>
                </div>
            </header>

            {/* ── 1:1 토론하기 (구 "지금 뜨는 이슈") ────────── */}
            <section className="max-w-[1200px] mx-auto px-xl mt-xxl">
                <div className="flex items-center justify-between mb-md">
                    <div>
                        <h2 className="text-[2.5rem] font-bold mb-xs">
                            일대일 토론하기
                        </h2>
                        <p className="text-text-secondary">
                            AI와 자유롭게 소통하며 한국 사회의 주요 쟁점을 깊이 파헤쳐 봅니다.
                        </p>
                    </div>
                    {/* Scroll arrow buttons */}
                    <div className="flex gap-sm">
                        <button
                            onClick={() => scroll('left')}
                            className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg hover:bg-surface hover:border-primary transition-all duration-200 text-text-secondary hover:text-primary"
                            aria-label="왼쪽으로 스크롤"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg hover:bg-surface hover:border-primary transition-all duration-200 text-text-secondary hover:text-primary"
                            aria-label="오른쪽으로 스크롤"
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* Horizontal scroll container — 5 cards visible, snap */}
                <div
                    ref={scrollRef}
                    className="flex gap-lg overflow-x-auto pt-sm pb-md snap-x [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:bg-surface [&::-webkit-scrollbar-thumb]:bg-gray-brand/40 [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                    {issues.map((issue) => {
                        const badgeClass = CATEGORY_COLORS[issue.category] ?? DEFAULT_BADGE;
                        return (
                            <Card
                                key={issue.id}
                                className="snap-start flex-shrink-0 w-[220px] flex flex-col gap-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                                onClick={() => navigate('/ai-discussion')}
                            >
                                <span className={`self-start text-xs font-bold px-sm py-[2px] rounded-full ${badgeClass}`}>
                                    {issue.category}
                                </span>
                                <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-3">
                                    {issue.topic}
                                </h3>
                                <p className="text-xs text-text-secondary line-clamp-2 flex-1">
                                    <span className="text-success font-semibold">찬성</span>
                                    {' · '}{issue.pro[0].substring(0, 28)}…
                                </p>
                                <span className="text-xs font-semibold text-primary mt-auto">
                                    토론 시작하기 →
                                </span>
                            </Card>
                        );
                    })}
                </div>

                <div className="text-center mt-md">
                    <Button variant="secondary" onClick={() => navigate('/ai-discussion')}>
                        토론 주제 더보기
                    </Button>
                </div>
            </section>

            {/* ── 진행 중인 국민 토론 (구 "이슈 둘러보기") ──── */}
            <main className="max-w-[1200px] mx-auto px-xl my-xxl">
                <div className="flex justify-between items-end mb-xl">
                    <div>
                        <h2 className="text-[2.5rem] font-bold mb-xs">진행 중인 국민 토론</h2>
                        <p className="text-text-secondary">AI의 모니터링을 통해 상호존중을 기반으로 토론이 진행됩니다.</p>
                    </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-lg">
                    {newsItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col bg-bg rounded-[1.25rem] border border-border overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                            onClick={() => navigate('/community')}
                        >
                            {/* Image */}
                            {item.imageUrl ? (
                                <div className="relative h-[160px] w-full overflow-hidden">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Category badge over image */}
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-flex items-center px-sm py-[4px] rounded-full text-xs font-bold bg-white shadow-sm">
                                            <span className="w-2 h-2 rounded-full mr-2 bg-primary" />
                                            #{item.category}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative h-[160px] bg-surface flex items-center justify-center">
                                    <span className="inline-flex items-center px-sm py-[4px] rounded-full text-xs font-bold bg-white shadow-sm absolute top-3 left-3">
                                        <span className="w-2 h-2 rounded-full mr-2 bg-primary" />
                                        #{item.category}
                                    </span>
                                    <span className="text-4xl opacity-20">📰</span>
                                </div>
                            )}

                            <div className="p-lg flex flex-col flex-1">
                                <h3 className="text-lg font-bold mb-md leading-snug line-clamp-2">
                                    {item.title}
                                </h3>

                                {/* AI Summary Box */}
                                <div className="p-md bg-surface rounded-lg mb-md border border-border">
                                    <div className="flex items-center gap-xs mb-xs">
                                        <span className="text-xs font-bold text-primary uppercase tracking-wide">
                                            ✦ AI 개요
                                        </span>
                                        {item.aiLoading && (
                                            <span className="text-[10px] text-gray-brand animate-pulse">
                                                생성 중...
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                                        {item.aiSummary.overview}
                                    </p>
                                </div>

                                {/* Debate Topic Box */}
                                <div className="p-md bg-primary/5 rounded-lg border border-primary/20 mb-md">
                                    <div className="text-xs font-bold text-primary mb-xs">
                                        💬 토론 주제
                                    </div>
                                    <p className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
                                        {item.aiSummary.debateTopic}
                                    </p>
                                </div>

                                <div className="mt-auto pt-md border-t border-border flex justify-between items-center text-gray-brand text-sm font-medium">
                                    <span>{item.commentCount}개 댓글</span>
                                    <span>{new Date(item.regDt).toLocaleDateString('ko-KR')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-xl">
                    <Button variant="secondary" onClick={() => navigate('/community')}>
                        국민 토론 더보기
                    </Button>
                </div>
            </main>
        </div>
    );
};
