import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { IssueCard } from '../components/discussion/IssueCard';
import { NewsCard } from '../components/community/NewsCard';
import { useHome } from '../features/home/useHome';
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
        newsItems,
    } = useHome();

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
                            일대일 토론 시작 →
                        </Button>
                    </div>
                </div>
            </header>


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
                        <div className="flex flex-col md:flex-row gap-xl min-h-[400px]">
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
                                <h3 className="text-[2.25rem] font-extrabold mb-lg leading-tight text-text-primary line-clamp-2 break-keep">
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
                                        토론 참여하기
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
                            일대일 토론하기
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
                <div className="w-full mx-auto px-xl py-[9rem] mt-[150px] my-xxl relative overflow-hidden">
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

            {/* ── 진행 중인 국민 토론 ──── */}
            <main className="max-w-[1200px] mx-auto px-xl my-xxl mt-[150px]">
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
                            onClick={() => navigate(`/detail/${item.id}`)}
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
