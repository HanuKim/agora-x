import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { IssueCard } from '../components/discussion/IssueCard';
import { NewsCard } from '../components/community/NewsCard';
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

export const Home: React.FC = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isPaused = useRef(false);
    const CARD_WIDTH = 236; // 220px card + 16px gap

    // Auto-scroll: 3초마다 카드 하나씩 오른쪽으로, 끝에 도달하면 처음으로
    useEffect(() => {
        const timer = setInterval(() => {
            if (isPaused.current || !scrollRef.current) return;
            const el = scrollRef.current;
            const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
            if (atEnd) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' });
            }
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const scroll = (dir: 'left' | 'right') => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === 'right' ? CARD_WIDTH : -CARD_WIDTH, behavior: 'smooth' });
        }
    };
    const navigate = useNavigate();
    // 홈에서는 9건만 처리 (3×3 그리드)
    const { items: newsItems } = useNewsWithAISummary(9);

    return (
        <div className="min-h-screen bg-bg font-sans">
            {/* ── Hero ─────────────────────────────── */}
            <header className="bg-[#1e2a3a] text-white px-xl pt-xxl pb-xxl text-center relative overflow-hidden rounded-b-[3rem]">
                {/* Decorative floating blobs */}
                <div className="hero-blob absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary opacity-20 blur-3xl rounded-full pointer-events-none" />
                <div className="hero-blob-2 absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500 opacity-20 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-[800px] mx-auto">
                    {/* Badge — delay 1 */}
                    <div className="hero-item hero-delay-1 inline-flex items-center gap-xs px-md py-xs rounded-full bg-white/15 border border-white/30 mb-lg">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-sm font-medium text-white">AI와 열어가는 시민의 광장</span>
                    </div>

                    {/* H1 — delay 2 */}
                    <h1 className="hero-item hero-delay-2 text-[3.5rem] font-extrabold leading-tight mb-lg text-white">
                        미래의 시민 담론을 <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-300 relative">만들어 갑니다</span>
                        {/* SVG underline — draws left-to-right via hero-underline class */}
                        <svg className="w-full h-3 text-primary opacity-90" fill="none" viewBox="0 0 200 9" xmlns="http://www.w3.org/2000/svg">
                            <path
                                className="hero-underline"
                                d="M2.00025 6.99997C25.7509 9.37523 78.9113 9.81705 112.604 7.40837C129.352 6.21115 136.138 6.55181 151.782 5.23438C161.731 4.39656 176.475 3.32839 198.004 2.03058"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                    </h1>

                    {/* Body text — delay 3 */}
                    <p className="hero-item hero-delay-3 text-lg text-white/80 mb-xl leading-relaxed">
                        K-Agora는 고도화된 AI를 활용해 우리사회가 당면한 문제를 포착하고 핵심 쟁점을 분석하여,<br />  협치를 도모하고 사회적 신뢰 회복을 위한 토론의 장을 제공합니다.
                        <br /> 모든 이의 의견이 존중받는 이곳에서 당신의 생각을 나누어 주세요.
                    </p>

                    {/* Buttons — delay 4 */}
                    <div className="hero-item hero-delay-4 flex justify-center gap-md">
                        <Button size="lg" className="text-white!" onClick={() => navigate('/community')}>
                            국민 토론 참여
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => navigate('/ai-discussion')}
                            className="bg-transparent! text-white! border-2 border-white/50 hover:bg-white/15! hover:border-white!"
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

                {/* Horizontal scroll container — auto-scrolls every 3s, pauses on hover */}
                <div
                    ref={scrollRef}
                    onMouseEnter={() => { isPaused.current = true; }}
                    onMouseLeave={() => { isPaused.current = false; }}
                    className="flex gap-lg overflow-x-auto pt-sm pb-md snap-x [&::-webkit-scrollbar]:h-[0px]"
                >
                    {issues.map((issue) => (
                        <IssueCard
                            key={issue.id}
                            issue={issue}
                            compact
                            onClick={() => navigate('/ai-discussion')}
                        />
                    ))}
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
                        <NewsCard
                            key={item.id}
                            article={item}
                            showAI
                            onClick={() => navigate('/community')}
                        />
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
