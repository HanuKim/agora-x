import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingDots } from '../components/ui/LoadingDots';
import { Card } from '../components/ui/Card';
import { PollSection } from '../components/detail/PollSection';
import { Button } from '../components/ui/Button';
import { theme } from '../design/theme';
import { useDetail } from '../features/detail/useDetail';
import { useAuth } from '../features/auth';
import { getBestOpinions, getStanceChangeCount, getOpinionsForArticle } from '../services/db/arenaDB';
import { OpinionListPanel } from '../components/detail/OpinionListPanel';
import type { ArenaOpinion } from '../features/common/types';
import '../components/detail/discussionCivil.css';

export const Detail: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, openLoginModal } = useAuth();
    const [showPostVoteModal, setShowPostVoteModal] = useState(false);
    const [isOpinionPanelOpen, setIsOpinionPanelOpen] = useState(false);
    const {
        numericId,
        article,
        articleUrl,
        debateTopic,
        overview,
        aiLoading,
        articleScraped,
        toggleArticleScrap,
    } = useDetail(user?.id);

    // ── Arena best opinions ──
    const [bestPro, setBestPro] = useState<ArenaOpinion[]>([]);
    const [bestCon, setBestCon] = useState<ArenaOpinion[]>([]);
    const [stanceChanges, setStanceChanges] = useState(0);
    const totalOpinionCount = useMemo(() => {
        if (!Number.isFinite(numericId)) return 0;
        return getOpinionsForArticle(numericId).length;
    }, [numericId]);

    useEffect(() => {
        if (!Number.isFinite(numericId)) return;
        setBestPro(getBestOpinions(numericId, 'pro', 3));
        setBestCon(getBestOpinions(numericId, 'con', 3));
        setStanceChanges(getStanceChangeCount(numericId));
    }, [numericId]);

    // Shuffle AI PICK opinions periodically to simulate real-time updates
    const shuffleArray = useCallback(<T,>(arr: T[]): T[] => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }, []);

    const [displayedPro, setDisplayedPro] = useState<typeof bestPro>([]);
    const [displayedCon, setDisplayedCon] = useState<typeof bestCon>([]);

    useEffect(() => {
        setDisplayedPro(bestPro);
        setDisplayedCon(bestCon);
    }, [bestPro, bestCon]);

    useEffect(() => {
        if (bestPro.length === 0 && bestCon.length === 0) return;
        const interval = setInterval(() => {
            setDisplayedPro(prev => shuffleArray(prev));
            setDisplayedCon(prev => shuffleArray(prev));
        }, 5000);
        return () => clearInterval(interval);
    }, [bestPro, bestCon, shuffleArray]);

    const handlePostVoteAction = () => {
        setShowPostVoteModal(false);
        if (!Number.isFinite(numericId)) return;
        navigate(`/detail/${numericId}/arena`);
    };

    return (
        <div className={theme.section.page}>
            <div className={`${theme.section.container} py-xl`}>
                {/* Header / Hero */}
                <header className="max-w-[900px] mx-auto text-center mb-xxl">
                    <div className="flex justify-center mb-md">
                        <div className="inline-flex items-center gap-xs px-sm py-[4px] rounded-full bg-surface border border-border shadow-sm">
                            <span className="w-[6px] h-[6px] rounded-full bg-success animate-pulse" />
                            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-text-secondary">
                                정책 토론 • 진행 중
                            </span>
                        </div>
                    </div>

                    <h1 className="text-[2.25rem] md:text-[3rem] font-extrabold leading-tight text-text-primary break-keep">
                        {debateTopic ?? '토론 주제를 불러오는 중입니다.'}
                    </h1>

                    {/* Interactions — 스크랩 */}
                    <div className="flex items-center justify-end gap-md mt-sm border-border pt-md">
                        <button
                            type="button"
                            className={`flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors text-sm font-bold ${articleScraped ? 'text-amber-500' : 'text-text-secondary hover:text-amber-500'}`}
                            onClick={() => {
                                if (!isAuthenticated || !user) {
                                    openLoginModal();
                                    return;
                                }
                                toggleArticleScrap();
                            }}
                        >
                            <span className="material-icons-round text-[15px]! transition-all">
                                {articleScraped ? 'bookmark' : 'bookmark_border'}
                            </span>
                            스크랩
                        </button>
                    </div>

                    <div className="mt-md">
                        <Card variant="glass" padding="xl" className="relative pb-lg">
                            <div className="flex items-center justify-center gap-xs mb-sm text-primary text-[11px] font-bold tracking-[0.16em] uppercase">
                                <span className="material-icons-round text-base">auto_awesome</span>
                                <span>AI 핵심 요약 (AI Summary)</span>
                            </div>
                            {aiLoading ? (
                                <div className="flex flex-col items-center justify-center gap-md py-lg">
                                    <LoadingDots size="lg" label="AI가 기사를 분석하고 있습니다" />
                                    <p className="text-sm text-text-muted">기사 내용과 핵심 쟁점을 파악 중입니다...</p>
                                </div>
                            ) : (
                                <p className="text-base md:text-lg text-text-secondary leading-relaxed break-keep">
                                    {overview ?? 'AI 개요를 불러오는 중입니다.'}
                                </p>
                            )}
                            {!aiLoading && articleUrl ? (
                                <a
                                    href={articleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-md inline-flex items-center text-sm font-medium text-primary hover:text-primary-hover transition-colors group"
                                >
                                    <span className="inline-flex items-center gap-xs border-b border-transparent group-hover:border-primary-hover pb-px transition-all">
                                        <span className="material-icons-round text-base leading-none">open_in_new</span>
                                        <span className="leading-none text-xs">매일경제 뉴스 기사 바로가기</span>
                                    </span>
                                </a>
                            ) : null}
                        </Card>
                    </div>
                </header>

                {/* Main grid: 찬성 / 여론 / 반대 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start mb-xxl">
                    {/* 반대 의견 (AI PICK) */}
                    <section className="lg:col-span-5 flex flex-col gap-sm">
                        <div className="flex items-center justify-between mb-xs">
                            <h2 className="text-[1.1rem] font-bold flex items-center gap-sm text-text-primary">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-success/10 text-success">
                                    <span className="material-icons-round text-sm">auto_awesome</span>
                                </span>
                                AI PICK · 입장 변화를 이끈 찬성 의견 TOP 3
                            </h2>
                        </div>

                        {displayedPro.length === 0 ? (
                            <Card padding="lg" className="border-l-4 border-success min-h-[120px] flex items-center">
                                <p className="text-sm text-text-secondary break-keep">
                                    아직 충분한 토론 데이터가 없습니다.
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-md relative min-h-[400px]">
                                <AnimatePresence>
                                    {displayedPro.map((op, i) => (
                                        <motion.div
                                            key={op.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95, x: 20 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                            transition={{ type: "spring", stiffness: 350, damping: 25, mass: 1 }}
                                            className="will-change-transform"
                                        >
                                            <Card padding="md" className="border-l-4 border-success h-[130px] relative bg-bg shadow-sm">
                                                <div className="flex items-start gap-sm h-full">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                                                    <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                                                        <p className="text-md text-text-primary break-keep leading-relaxed line-clamp-3">{op.body}</p>
                                                        <div className="flex items-center gap-md text-[11px] text-text-muted mt-auto pt-2 border-t border-border/50">
                                                            <span className="font-bold text-text-secondary tracking-wide">{op.authorName}</span>
                                                            <span className="flex items-center gap-0.5 text-primary font-medium">
                                                                <span className="material-icons-round text-[11px]">swap_horiz</span>
                                                                {op.influenceCount}명 영향
                                                            </span>
                                                            <span className="flex items-center gap-0.5">
                                                                <span className="material-icons-round text-[11px]">thumb_up</span>
                                                                {op.likes}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>

                    {/* 현재 여론 현황 */}
                    <div className="lg:col-span-2 flex flex-col items-center gap-md">
                        <PollSection
                            key={Number.isFinite(numericId) ? numericId : 'none'}
                            articleId={Number.isFinite(numericId) ? numericId : 0}
                            onVoteComplete={() => setShowPostVoteModal(true)}
                        />
                        <Card variant="glass" padding="md" className="w-[98%] text-center relative overflow-hidden">
                            <div className="flex items-center justify-center">
                                {/* <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-sm" /> */}
                                <span className="text-sm text-center font-bold text-text-primary mr-xs">토론을 통해 <br />입장이 변화한 시민</span>
                            </div>
                            <div className="flex items-center justify-center">
                                <span className="text-primary font-extrabold text-lg ">
                                    {stanceChanges + 20}
                                </span>
                                <span className="text-sm font-bold text-text-primary">&nbsp;명</span>
                            </div>

                        </Card>
                    </div>

                    {/* 반대 의견 (AI PICK) */}
                    <section className="lg:col-span-5 flex flex-col gap-sm">
                        <div className="flex items-center justify-between mb-xs lg:flex-row-reverse">
                            <h2 className="text-[1.1rem] font-bold flex items-center gap-sm text-text-primary">
                                AI PICK · 입장 변화를 이끌었던 반대 의견 TOP 3
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-danger/10 text-danger">
                                    <span className="material-icons-round text-sm">auto_awesome</span>
                                </span>
                            </h2>
                        </div>

                        {displayedCon.length === 0 ? (
                            <Card padding="lg" className="border-r-4 border-danger min-h-[120px] flex items-center justify-end text-right">
                                <p className="text-sm text-text-secondary break-keep">
                                    아직 충분한 토론 데이터가 없습니다.
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-md relative min-h-[400px]">
                                <AnimatePresence>
                                    {displayedCon.map((op, i) => (
                                        <motion.div
                                            key={op.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95, x: -20 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, x: 20 }}
                                            transition={{ type: "spring", stiffness: 350, damping: 25, mass: 1 }}
                                            className="will-change-transform"
                                        >
                                            <Card padding="md" className="border-r-4 border-danger h-[130px] relative bg-bg shadow-sm">
                                                <div className="flex items-start gap-sm h-full flex-row-reverse text-right">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-danger/10 text-danger flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                                                    <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                                                        <p className="text-md text-text-primary break-keep leading-relaxed line-clamp-2">{op.body}</p>
                                                        <div className="flex items-center justify-end gap-md text-[11px] text-text-muted mt-auto pt-2 border-t border-border/50">
                                                            <span className="flex items-center gap-0.5">
                                                                {op.likes}
                                                                <span className="material-icons-round text-[11px]">thumb_up</span>
                                                            </span>
                                                            <span className="flex items-center gap-0.5 text-primary font-medium">
                                                                {op.influenceCount}명 영향
                                                                <span className="material-icons-round text-[11px]">swap_horiz</span>
                                                            </span>
                                                            <span className="font-bold text-text-secondary tracking-wide">{op.authorName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>
                </div>

                {/* AI PICK — Best 시민 의견 */}
                <section className="mt-xl pt-lg">
                    {/* Arena CTA */}
                    <Card variant="glass" padding="xl" className="text-center relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-success via-primary to-danger" />
                        <div className="flex flex-col items-center gap-md">
                            <div className="flex items-center gap-sm">
                                <span className="material-icons-round text-3xl! text-primary">psychology</span>
                                <h3 className="text-xl font-bold text-text-primary">AI와 함께 토론하기</h3>
                            </div>
                            <p className="text-md text-text-secondary break-keep leading-relaxed">
                                AI가 다른 시민들이 작성한 반대 의견을 제시하며 토론을 함께 진행합니다.<br />
                                당신의 의견을 발전시키고, 최종 투표에서 입장 변화에 영향을 준 의견을 선택하세요.
                            </p>
                            <Button
                                type="button"
                                variant="primary"
                                size="lg"
                                className="px-xxl mt-sm"
                                onClick={() => {
                                    if (!isAuthenticated || !user) {
                                        openLoginModal();
                                        return;
                                    }
                                    navigate(`/detail/${numericId}/arena`);
                                }}
                            >
                                <span className="material-icons-round text-base mr-2">forum</span>
                                토론장 참여하기
                            </Button>
                            <p className="text-md text-text-muted">
                                총 {totalOpinionCount}개의 시민 의견이 수집되어 있습니다
                            </p>
                            <button
                                type="button"
                                className="text-md text-primary hover:text-primary-hover underline underline-offset-2 bg-transparent border-none font-medium mt-xs"
                                onClick={() => setIsOpinionPanelOpen(true)}
                            >
                                전체 의견 목록 보기 →
                            </button>
                        </div>
                    </Card>
                </section>

                {/* Post-vote modal */}
                {showPostVoteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <Card variant="glass" padding="xl" className="mx-md text-center relative animate-in">
                            <button
                                type="button"
                                className="absolute top-md right-md text-text-muted hover:text-text-primary bg-transparent border-none"
                                onClick={() => setShowPostVoteModal(false)}
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                            <span className="material-icons-round text-5xl text-primary mb-md">how_to_vote</span>
                            <h3 className="text-xl font-bold text-text-primary mb-sm">투표해주셔서 감사합니다!</h3>
                            <p className="text-sm text-text-secondary mb-lg break-keep leading-relaxed">
                                소중한 의견을 AI 토론장에서 공유해주시겠어요?<br />
                                AI가 다른 시민들의 반대 의견을 보여드리며<br />
                                토론을 도와드립니다.
                            </p>
                            <div className="flex gap-sm justify-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="md"
                                    onClick={() => setShowPostVoteModal(false)}
                                >
                                    나중에 할게요
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="md"
                                    onClick={handlePostVoteAction}
                                >
                                    <span className="material-icons-round text-base mr-1">forum</span>
                                    토론 참여하기
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>


            {/* Opinion List Side Panel */}
            <OpinionListPanel
                articleId={Number.isFinite(numericId) ? numericId : 0}
                isOpen={isOpinionPanelOpen}
                onClose={() => setIsOpinionPanelOpen(false)}
            />
        </div>
    );
};
