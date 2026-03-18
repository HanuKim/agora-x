import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { IssueCard } from '../components/discussion/IssueCard';
import { NewsCard } from '../components/community/NewsCard';
import type { NewsCardArticle } from '../components/community/NewsCard';
import { useHome } from '../features/home/useHome';
import { triggerConfetti } from '../utils/confetti';
import issuesData from '../data/koreanSocialIssues.json';

interface Issue {
    id: number;
    topic: string;
    category: string;
    pro: string[];
    con: string[];
}

const issues: Issue[] = (issuesData as { title: string; issues: Issue[] }).issues.slice(0, 10);

/* ── Inline mini-vote hook (localStorage per article) ──────── */
function useMiniPoll(articleId: number) {
    const key = `agora-home-poll-${articleId}`;
    const [voted, setVoted] = useState<'pro' | 'con' | null>(null);
    const [pro, setPro] = useState(0);
    const [con, setCon] = useState(0);

    // Re-initialize on articleId (key) change
    useEffect(() => {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const p = JSON.parse(raw);
                setVoted(p.voted);
                setPro(p.pro);
                setCon(p.con);
            } else {
                // No saved data → generate fresh random counts per article
                setVoted(null);
                setPro(Math.floor(Math.random() * 30) + 10);
                setCon(Math.floor(Math.random() * 30) + 10);
            }
        } catch {
            setVoted(null);
            setPro(Math.floor(Math.random() * 30) + 10);
            setCon(Math.floor(Math.random() * 30) + 10);
        }
    }, [key]);

    const vote = useCallback((side: 'pro' | 'con', btnEl?: HTMLElement) => {
        if (voted) return;
        const nextPro = side === 'pro' ? pro + 1 : pro;
        const nextCon = side === 'con' ? con + 1 : con;
        setPro(nextPro);
        setCon(nextCon);
        setVoted(side);
        localStorage.setItem(key, JSON.stringify({ voted: side, pro: nextPro, con: nextCon }));
        triggerConfetti(btnEl);
    }, [voted, pro, con, key]);

    const revote = useCallback(() => {
        setVoted(null);
        localStorage.removeItem(key);
    }, [key]);

    const total = pro + con;
    const proPercent = total > 0 ? Math.round((pro / total) * 100) : 50;
    const conPercent = total > 0 ? Math.round((con / total) * 100) : 50;

    return { voted, vote, revote, pro, con, proPercent, conPercent, total };
}

/* ── CountUp animation hook ────────────────────────────────── */
function useCountUp(target: number, duration = 800, active = false) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!active) { setValue(0); return; }
        let start: number | null = null;
        const step = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            setValue(Math.round(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, active]);
    return value;
}

/* ── Dummy comment pools for ticker ────────────────────────── */
const DUMMY_PRO = [
    '시민의 안전과 권익을 위해 반드시 필요한 정책입니다. 당장은 반작용이 있겠지만 장기적으로는 긍정적 효과가 클 것입니다.',
    '선진국 사례를 보면 장기적으로 긍정적 효과가 입증되었습니다. 예를 들어, 유럽의 경우 초기에는 반발이 심했지만 지금은 안정적으로 정착되었습니다.',
    '사회적 비용 절감 효과가 기대됩니다. 도입을 서둘러야 합니다. 초기에는 비용이 들겠지만 장기적으로는 비용 절감 효과가 클 것입니다.',
    '국민 대다수가 공감하는 방향이며 시대적 흐름에 부합합니다. 지금이 적기라고 생각합니다.',
    '전문가 의견을 종합하면 도입의 실익이 분명합니다. 빠르게 추진할수록 사회적 비용이 최소화될 것입니다.',
];
const DUMMY_CON = [
    '부작용에 대한 충분한 검토 없이 추진하면 안 됩니다. 시간을 두고 천천히 결정해야할 사안입니다.',
    '예산 대비 실효성에 대한 객관적 분석이 부족합니다. 전문가 검토를 먼저 거쳐야 할 것 같습니다.',
    '현실적 대안과 보완책 마련이 우선되어야 합니다. 당장은 현실적으로 추진에 어려움이 있을 것입니다.',
    '사회적 합의 없이 졸속 도입 시 갈등만 심화될 수 있습니다. 충분한 사회적 합의가 필요합니다.',
    '다른 시급한 현안에 자원을 집중하는 것이 바람직합니다. 예를 들어, 경제 위기 극복을 위한 정책에 자원을 집중하는 것이 바람직합니다.',
];

/* ── Argument Ticker — shows 2 items, always slides upward ── */
const ArgumentTicker: React.FC<{ items: string[]; stance: 'pro' | 'con'; debateKey?: string | number }> = ({ items, stance, debateKey }) => {
    const [topIndex, setTopIndex] = useState(0);
    const pool = stance === 'pro' ? DUMMY_PRO : DUMMY_CON;
    // Merge real + dummy so there are always 4+ items for visible shuffle
    const displayItems = items.length > 0
        ? [...items, ...pool.filter(d => !items.includes(d)).slice(0, Math.max(0, 4 - items.length))]
        : pool;

    // Reset index when debate changes
    useEffect(() => {
        setTopIndex(0);
    }, [debateKey]);

    useEffect(() => {
        if (displayItems.length <= 2) return;
        const timer = setInterval(() => {
            setTopIndex(prev => (prev + 1) % displayItems.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [displayItems.length, debateKey]);

    const borderClass = stance === 'pro' ? 'border-l-3 border-emerald-500/50' : 'border-r-3 border-red-500/50';
    const visibleIndices = [
        topIndex % displayItems.length,
        (topIndex + 1) % displayItems.length,
    ];
    // The item that just left the top slot
    const exitingIndex = (topIndex - 1 + displayItems.length) % displayItems.length;

    return (
        <div className="relative h-[180px] overflow-hidden rounded-lg">
            {displayItems.map((arg, i) => {
                const slot = visibleIndices.indexOf(i);
                const isVisible = slot !== -1;
                const isExiting = i === exitingIndex && !isVisible;
                let translateY = '200px'; // default: below, waiting to enter
                if (isVisible) translateY = `${slot * 95}px`;
                else if (isExiting) translateY = '-100px'; // exits upward
                return (
                    <div
                        key={i}
                        className={`absolute inset-x-0 bg-bg rounded-lg p-md ${borderClass} transition-all duration-700 ease-in-out`}
                        style={{
                            transform: `translateY(${translateY})`,
                            opacity: isVisible ? 1 : 0,
                        }}
                    >
                        <p className="text-md text-text-primary leading-relaxed line-clamp-2 break-keep">{arg}</p>
                    </div>
                );
            })}
        </div>
    );
};

/* ── DebateCardRow — auto-scrolling row, no stopping ─────── */
const DEBATE_CARD_WIDTH = 296; // 280px card + 16px gap
const DebateCardRow = React.forwardRef<HTMLDivElement, { debates: NewsCardArticle[]; onNavigate: (id: number) => void }>(
    ({ debates, onNavigate }, ref) => {
        const innerRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const el = innerRef.current;
            if (!el || debates.length <= 2) return;
            const timer = setInterval(() => {
                if (!el) return;
                const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
                if (atEnd) {
                    el.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    el.scrollBy({ left: DEBATE_CARD_WIDTH, behavior: 'smooth' });
                }
            }, 10000);
            return () => clearInterval(timer);
        }, [debates.length]);

        // Merge refs
        const setRefs = useCallback((node: HTMLDivElement | null) => {
            (innerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }, [ref]);

        return (
            <div
                ref={setRefs}
                className="flex gap-md overflow-x-auto py-sm pb-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {debates.map((item) => (
                    <div key={item.id} className="flex-shrink-0 w-[280px]">
                        <NewsCard
                            article={item}
                            onClick={() => onNavigate(item.id)}
                        />
                    </div>
                ))}
            </div>
        );
    }
);

/* ── Live Participant Counter ──────────────────────────────── */
const LiveCounter: React.FC = () => {
    const [count, setCount] = useState(Math.floor(Math.random() * 50) + 120);
    useEffect(() => {
        const timer = setInterval(() => {
            setCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);
    return (
        <span className="inline-flex items-center gap-xs text-md font-bold text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            현재 {count}명 참여 중
        </span>
    );
};

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════════ */
export const Home: React.FC = () => {
    const navigate = useNavigate();
    const {
        issueScrollRef,
        isPaused,
        centerIssueIndex,
        handleIssueScroll,
        scrollIssues,
        proposalScrollRef,
        activeProposals,
        currentProposal,
        activeProposalIndex,
        scrollProposals,
        handleProposalClick,
        activeDebateIndex,
        setActiveDebateIndex,
        featuredDebates,
        remainingDebates,
        currentDebate,
    } = useHome();

    // Mini poll for the featured debate
    const poll = useMiniPoll(currentDebate?.id ?? 0);
    const displayedPro = useCountUp(poll.proPercent, 800, !!poll.voted);
    const displayedCon = useCountUp(poll.conPercent, 800, !!poll.voted);

    const proRef = useRef<HTMLButtonElement>(null);
    const conRef = useRef<HTMLButtonElement>(null);
    const cardRowRef = useRef<HTMLDivElement>(null);

    const scrollCardRow = (dir: 'left' | 'right') => {
        const el = cardRowRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-bg font-sans">
            {/* ── Hero ─────────────────────────────── */}
            <header className="bg-[#2B2E34] text-white px-xl pt-xxl pb-xxl text-center relative overflow-hidden rounded-b-[3rem]">
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
                        Agora-X는 고도화된 AI를 활용해 우리사회가 당면한 문제를 포착하고 핵심 쟁점을 분석하여,<br /> 사회적 합의를 도모하고 우리 사회의 신뢰 회복을 위한 토론의 장을 제공합니다.
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
                            토론 연습 시작 →
                        </Button>
                    </div>
                </div>
            </header>


            {/* ═══════════════════════════════════════════════════════════
               국민 토론 · Featured Section (배너 바로 아래)
               ═══════════════════════════════════════════════════════════ */}
            <section className="max-w-[1200px] mx-auto px-xl mt-[100px]">
                <div className="flex items-center justify-between mb-xl">
                    <div>
                        <div className="flex items-center gap-sm mb-xs">
                            <h2 className="text-[2.5rem] font-bold">논쟁이 활발한 국민 토론</h2>
                            {/* LIVE badge */}
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                LIVE
                            </span>
                        </div>
                        <div className="flex items-center gap-lg">
                            <p className="text-text-secondary">현재 가장 뜨거운 논쟁이 오가고 있는 국민 토론입니다.</p>
                            <LiveCounter />
                        </div>
                    </div>

                </div>

                {currentDebate ? (
                    <div className="flex flex-col gap-xl">
                        {/* Featured debate card — Detail.tsx style */}
                        <div className="bg-surface border border-border rounded-[1.0rem] p-lg md:p-xl overflow-hidden relative">
                            {/* Top gradient line */}
                            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 via-primary to-red-500" />

                            {/* Header */}
                            <div className="text-center mb-xl pt-sm">
                                <div className="flex justify-center mb-lg">
                                    <div className="inline-flex items-center gap-sm px-sm py-[4px] rounded-full bg-bg border border-border shadow-sm">
                                        <span className="w-[6px] h-[6px] rounded-full bg-success animate-pulse" />
                                        <span className="text-[13px] font-bold tracking-[0.12em] uppercase text-text-secondary">
                                            정책 토론 • 진행 중
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-[2rem] font-extrabold leading-tight text-text-primary break-keep">
                                    {currentDebate.aiSummary?.debateTopic ?? currentDebate.topic}
                                </h3>
                            </div>

                            {/* AI Summary */}
                            {/* <div className="bg-bg/80 border border-border rounded-xl p-md mb-lg text-center">
                                <div className="flex items-center justify-center gap-xs mb-xs text-primary text-md font-bold tracking-[0.12em] uppercase">
                                    <span className="material-icons-round text-base">auto_awesome</span>
                                    <span>AI 핵심 요약</span>
                                </div>
                                <p className="text-lg text-text-secondary leading-relaxed break-keep">
                                    {currentDebate.aiLoading ? (
                                        <span className="animate-pulse">AI 개요를 분석하고 있습니다...</span>
                                    ) : (
                                        currentDebate.aiSummary?.overview ?? currentDebate.summary
                                    )}
                                </p>
                                {currentDebate.articleUrl && (
                                    <a
                                        href={currentDebate.articleUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-sm inline-flex items-center text-md font-medium text-primary hover:text-primary-hover transition-colors group"
                                    >
                                        <span className="inline-flex items-center gap-xs border-b border-transparent group-hover:border-primary-hover pb-px">
                                            <span className="material-icons-round text-md! leading-none">open_in_new</span>
                                            <span className="leading-none">매일경제 뉴스 기사 바로가기</span>
                                        </span>
                                    </a>
                                )}
                            </div> */}

                            {/* Pro/Con + Vote grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                                {/* Pro Arguments — shuffling */}
                                <div className="flex flex-col gap-md">
                                    <h4 className="text-md font-bold flex items-center gap-xs text-emerald-500">
                                        <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <span className="material-icons-round">thumb_up</span>
                                        </span>
                                        찬성 의견
                                    </h4>
                                    <ArgumentTicker
                                        items={currentDebate.aiSummary?.proArguments ?? []}
                                        stance="pro"
                                        debateKey={currentDebate.id}
                                    />
                                </div>

                                {/* Center: Vote with Donut Chart */}
                                <div className="flex flex-col gap-md items-center justify-center">
                                    <div className="w-full max-w-[270px] text-center h-[260px] flex flex-col items-center justify-center">
                                        <h4 className="text-xl font-bold text-text-primary mb-md">당신의 생각은?</h4>
                                        {!poll.voted ? (
                                            <div className="flex gap-sm mt-md w-full">
                                                <button
                                                    ref={proRef}
                                                    onClick={() => poll.vote('pro', proRef.current ?? undefined)}
                                                    className="flex-1 h-12 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 text-emerald-500 font-bold text-base hover:bg-emerald-500/15 hover:border-emerald-500 transition-all cursor-pointer"
                                                >
                                                    <span className="material-icons-round mr-1">thumb_up</span> 찬성
                                                </button>
                                                <button
                                                    ref={conRef}
                                                    onClick={() => poll.vote('con', conRef.current ?? undefined)}
                                                    className="flex-1 h-12 rounded-xl border-2 border-red-500/30 bg-red-500/5 text-red-500 font-bold text-base hover:bg-red-500/15 hover:border-red-500 transition-all cursor-pointer"
                                                >
                                                    <span className="material-icons-round mr-1">thumb_down</span> 반대
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-sm">
                                                {/* conic-gradient donut (matches PollCardAfter) */}
                                                <div className="relative w-30 h-30">
                                                    <div
                                                        className="poll-chart-reveal w-full h-full rounded-full"
                                                        style={{
                                                            background: `conic-gradient(#10b981 0% ${displayedPro}%, #ef4444 ${displayedPro}% 100%)`,
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-[55%] h-[55%] rounded-full bg-bg" />
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-xl font-bold text-text-primary">{displayedPro}%</span>
                                                            <span className="text-[10px] font-bold uppercase text-text-secondary">찬성</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Legend */}
                                                <div className="flex justify-between text-sm font-bold text-text-secondary px-xs w-full">
                                                    <span className="flex-1 text-center text-emerald-500">{displayedPro}%<br />찬성</span>
                                                    <span className="flex-1 text-center text-red-500">{displayedCon}%<br />반대</span>
                                                </div>
                                                <div className="flex gap-3 items-center justify-center w-full">
                                                    <p className="text-sm text-text-secondary">총 {poll.total}명 참여</p>
                                                    <button
                                                        onClick={poll.revote}
                                                        className="text-sm text-text-secondary hover:text-primary font-medium bg-transparent border-none cursor-pointer flex items-center gap-0.5 transition-colors"
                                                    >
                                                        <span className="material-icons-round">refresh</span>
                                                        다시 투표
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Con Arguments — shuffling */}
                                <div className="flex flex-col gap-md">
                                    <h4 className="text-md font-bold flex items-center gap-xs text-red-500 justify-end">
                                        반대 의견
                                        <span className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <span className="material-icons-round">thumb_down</span>
                                        </span>
                                    </h4>
                                    <ArgumentTicker
                                        items={currentDebate.aiSummary?.conArguments ?? []}
                                        stance="con"
                                        debateKey={currentDebate.id}
                                    />
                                </div>
                            </div>

                            {/* Go to detail */}
                            <div className="mt-lg pt-md border-t border-border flex items-center justify-center">
                                <button
                                    onClick={() => navigate(`/detail/${currentDebate.id}`)}
                                    className="inline-flex  items-center gap-xs font-bold text-primary hover:text-primary-hover transition-colors duration-200 group text-md cursor-pointer bg-transparent border-none"
                                >
                                    토론 상세보기
                                    <span className="material-icons-round text-primary transition-transform group-hover:translate-x-1 duration-200 text-base">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Carousel indicators */}
                        {featuredDebates.length > 1 && (
                            <div className="flex justify-center gap-sm">
                                {featuredDebates.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveDebateIndex(idx)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer border-none ${idx === activeDebateIndex ? 'bg-primary scale-125' : 'bg-border hover:bg-text-secondary'}`}
                                        aria-label={`토론 ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Row of smaller discussion cards */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-[2rem] font-bold text-text-primary">더 많은 국민 토론</h3>
                            <div className="flex items-center gap-sm">
                                <button
                                    onClick={() => scrollCardRow('left')}
                                    className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg hover:bg-surface hover:border-primary transition-all duration-200 text-text-secondary hover:text-primary cursor-pointer"
                                    aria-label="왼쪽으로 스크롤"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={() => scrollCardRow('right')}
                                    className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg hover:bg-surface hover:border-primary transition-all duration-200 text-text-secondary hover:text-primary cursor-pointer"
                                    aria-label="오른쪽으로 스크롤"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                        <DebateCardRow ref={cardRowRef} debates={remainingDebates} onNavigate={(id) => navigate(`/detail/${id}`)} />

                        <div className="text-center mt-lg">
                            <Button variant="secondary" onClick={() => navigate('/community')}>
                                국민 토론 더보기
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center py-xxl bg-surface rounded-2xl border border-border">
                        <span className="text-text-secondary flex items-center gap-xs">
                            <span className="material-icons-round">hourglass_empty</span>
                            토론 데이터를 불러오는 중입니다...
                        </span>
                    </div>
                )}
            </section>


            {/* ── 논의가 활발한 국민 제안 ────────── */}
            <section className="max-w-[1200px] mx-auto px-xl mt-[150px]">
                <div className="flex items-center justify-between mb-xl">
                    <div>
                        <h2 className="text-[2.5rem] font-bold mb-xs">
                            논의가 활발한 국민 제안
                        </h2>
                        <p className="text-text-secondary">
                            시민들이 직접 제안하고 활발하게 논의 중인 안건들을 확인해 보세요.
                        </p>
                    </div>
                    {/* Scroll arrow buttons */}
                    {activeProposals.length > 1 && (
                        <div className="flex gap-sm">
                            <button
                                onClick={() => scrollProposals('left')}
                                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg hover:bg-surface hover:border-primary transition-all duration-200 text-text-secondary hover:text-primary cursor-pointer"
                                aria-label="왼쪽으로 스크롤"
                            >
                                ‹
                            </button>
                            <button
                                onClick={() => scrollProposals('right')}
                                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg hover:bg-surface hover:border-primary transition-all duration-200 text-text-secondary hover:text-primary cursor-pointer"
                                aria-label="오른쪽으로 스크롤"
                            >
                                ›
                            </button>
                        </div>
                    )}
                </div>

                {activeProposals.length > 0 && currentProposal ? (
                    <div className="flex flex-col gap-xl">
                        {/* Featured Proposal Area (Hero) */}
                        <div className="flex flex-col md:flex-row gap-[80px] min-h-[400px]">
                            {/* Left Image Side */}
                            <div className="w-full md:w-1/2 relative bg-gray-100 rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-border shadow-md">
                                <img
                                    src={`/src/assets/images/banner${(activeProposalIndex % 9) + 1}.png`}
                                    alt="Proposal Illustration"
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20" />
                            </div>

                            {/* Right Content Side */}
                            <div className="w-full md:w-1/2 py-xl flex flex-col justify-center bg-transparent mt-xs md:mt-0 flex-1 relative z-10 min-h-[300px] md:min-h-auto text-left">
                                <div className="mb-md">
                                    <span className="text-lg font-bold text-primary">
                                        {currentProposal.category || '국민 제안'}
                                    </span>
                                </div>
                                <h3 className="text-[2rem] min-h-[80px] font-extrabold mb-lg leading-tight text-text-primary line-clamp-2 break-keep">
                                    {currentProposal.title}
                                </h3>
                                <p className="text-lg text-text-secondary leading-relaxed line-clamp-3 mb-xl break-keep">
                                    {currentProposal.problem || currentProposal.description}
                                </p>

                                <div className="mt-auto pt-lg border-t border-border flex items-center">
                                    <button
                                        onClick={() => navigate(`/proposals/${currentProposal.id}`)}
                                        className="inline-flex items-center gap-xs font-bold text-text-primary hover:text-primary transition-colors duration-200 group text-lg cursor-pointer"
                                    >
                                        논의 참여하기
                                        <span className="material-icons-round text-primary transition-transform group-hover:translate-x-1 duration-200">arrow_forward</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Carousel Thumbnails / Indicators */}
                        {activeProposals.length > 1 && (
                            <div className="relative mt-md group">
                                <div ref={proposalScrollRef} className="flex gap-md overflow-x-auto py-sm snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {activeProposals.map((proposal, idx) => {
                                        const isActive = idx === activeProposalIndex;
                                        return (
                                            <button
                                                key={proposal.id}
                                                onClick={() => handleProposalClick(idx)}
                                                className={`group flex flex-col p-md rounded-[1.25rem] border transition-all duration-300 min-w-[280px] max-w-[320px] flex-shrink-0 snap-center cursor-pointer ${isActive
                                                    ? 'bg-primary/5 border-primary shadow-[0_4px_16px_rgba(243,111,33,0.15)]'
                                                    : 'bg-surface border-border hover:-translate-y-1 hover:shadow-lg'
                                                    }`}
                                            >
                                                <div className="flex gap-md h-full w-full">
                                                    <div className="w-[100px] h-[100px] rounded-lg overflow-hidden flex-shrink-0 border border-border">
                                                        <img
                                                            src={`/src/assets/images/banner${(idx % 9) + 1}.png`}
                                                            alt=""
                                                            className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-105'
                                                                }`}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col text-left overflow-hidden flex-1 h-full pt-xs">
                                                        <span className={`text-xs font-bold mb-xs ${isActive ? 'text-primary' : 'text-text-secondary'}`}>
                                                            {proposal.category || '국민 제안'}
                                                        </span>
                                                        <span className={`text-base font-bold line-clamp-4 w-full leading-snug break-keep ${isActive ? 'text-text-primary' : 'text-text-primary/70 group-hover:text-text-primary'}`}>
                                                            {proposal.title}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>


                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center py-xxl bg-surface rounded-2xl border border-border">
                        <span className="text-text-secondary flex items-center gap-xs">
                            <span className="material-icons-round">hourglass_empty</span>
                            활발한 제안을 불러오는 중입니다...
                        </span>
                    </div>
                )}
            </section>

            {/* ── 1:1 토론하기 ────────── */}
            <section className="max-w-[1200px] mx-auto px-xl mt-[150px]">
                <div className="flex items-center justify-between mb-md">
                    <div>
                        <h2 className="text-[2.5rem] font-bold mb-xs">
                            토론 연습하기
                        </h2>
                        <p className="text-text-secondary">
                            Agora-X의 AI, 아곰이와 대화하며 한국 사회의 주요 쟁점을 깊이 파헤쳐 봅니다.
                        </p>
                    </div>
                    {/* Scroll arrow buttons */}
                    <div className="flex gap-sm">
                        <button
                            onClick={() => scrollIssues('left')}
                            className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg hover:bg-surface hover:border-primary transition-all duration-200 text-text-secondary hover:text-primary cursor-pointer"
                            aria-label="왼쪽으로 스크롤"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => scrollIssues('right')}
                            className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg hover:bg-surface hover:border-primary transition-all duration-200 text-text-secondary hover:text-primary cursor-pointer"
                            aria-label="오른쪽으로 스크롤"
                        >
                            ›
                        </button>
                    </div>
                </div>

                {/* Horizontal scroll container — auto-scrolls every 3s, pauses on hover */}
                <div
                    ref={issueScrollRef}
                    onScroll={handleIssueScroll}
                    onMouseEnter={() => { isPaused.current = true; }}
                    onMouseLeave={() => { isPaused.current = false; }}
                    className="relative flex gap-lg overflow-x-auto pt-[2rem] pb-xl snap-x items-center  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
                >
                    {issues.map((issue, idx) => {
                        const isCenter = centerIssueIndex === idx;
                        return (
                            <div
                                key={issue.id}
                                className={`transition-all duration-500 snap-center flex-shrink-0 ${isCenter ? 'scale-110 opacity-100 z-10' : 'scale-[0.85] opacity-50 z-0 hover:opacity-80'
                                    } origin-center`}
                            >
                                <IssueCard
                                    issue={issue}
                                    compact
                                    onClick={() => navigate(`/ai-discussion/${issue.id}`)}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-md">
                    <Button variant="secondary" onClick={() => navigate('/ai-discussion')}>
                        토론 주제 더보기
                    </Button>
                </div>
            </section>

            <section>
                {/* '신뢰할 수 있는 사회, 함께 만들어 갑니다.' 배너 */}
                <div className="w-full mx-auto px-xl py-[9rem] mb-[-100px] mt-[150px] my-xxl relative overflow-hidden">
                    <div className="flex justify-center text-center">
                        <div>
                            <div className="relative z-2">
                                <h2 className="text-[2.5rem] text-[#fff] font-bold mb-xs">
                                    신뢰할 수 있는 사회, 함께 만들어 갑니다.
                                </h2>
                                <p className="text-[#fff] text-lg">
                                    우리사회의 신뢰 회복은 단절과 배제가 아니라 소통과 상호 존중에서 출발할 수 있습니다,
                                </p>
                            </div>

                            {/*배너 이미지로 넣고 투명도 조절 박스로 덮기 */}
                            <div className="absolute bottom-0 left-0 w-full h-[100%] bg-[#000] opacity-50 z-1"></div>
                            <img src='/src/assets/images/banner.jpg' className='absolute bottom-[-100%] left-0 z-0' />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
