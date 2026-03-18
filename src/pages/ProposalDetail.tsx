import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useProposalDetail } from '../features/proposal/useProposals';
import { generateNickname } from '../utils/nicknameGenerator';
import { claudeService } from '../services/ai/claudeService';
import { useGamification } from '../features/user/hooks/useGamification';
import { useReport } from '../features/user/hooks/useReport';
import { useNotifications } from '../features/notification';
import { XP_REWARDS } from '../services/db/gamificationDB';

// Components
import { Button } from '../components/ui/Button';
import { OpinionItem } from '../components/proposal/OpinionItem';
import { NewsCard, type NewsCardArticle } from '../components/community/NewsCard';
import { EmptyState } from '../components/ui/EmptyState';
import { getActiveCategoryColorClass } from '../design/categoryColors';
import { ReportModal } from '../components/report/ReportModal';
import { LevelUpToast } from '../components/notification/LevelUpToast';
import { GlobalDialog } from '../components/common/GlobalDialog';
import type { ContentCategory } from '../features/common/types';

// Real mock data
import rawNewsData from '../data/selectedNews.json';

// Helper to extract mock articles
const allRawArticles = (rawNewsData as { selectedNews: Record<string, unknown>[] }).selectedNews;
function parseArticles(data: Record<string, unknown>[]): NewsCardArticle[] {
    return data.map((item, idx) => {
        const article = item.article as Record<string, unknown>;
        const summary = item.article_summary as Record<string, string>;
        const categories = item.categories as Array<Record<string, string>> | undefined;
        const images = item.images as Array<{ image_url: string }> | undefined;
        const comments = item.comments as unknown[] | undefined;

        return {
            id: idx + 1,
            title: (article?.title as string) ?? '',
            summary: summary?.summary ?? '',
            topic: (item.topic as string) ?? '',
            category: (categories?.[0]?.middle_code_nm as ContentCategory) ?? '기타',
            imageUrl: images?.[0]?.image_url ?? null,
            commentCount: comments?.length ?? 0,
            regDt: (article?.reg_dt as string) ?? '',
            url: (item.article_url as string) || (item.url as string) || '',
        };
    });
}
const allParsedArticles = parseArticles(allRawArticles);

export const ProposalDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated, openLoginModal } = useAuth();

    const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
    const [dialogConfig, setDialogConfig] = useState<{
        isOpen: boolean;
        type: 'alert' | 'confirm' | 'prompt';
        title: string;
        message: string;
        confirmText?: string;
        isDestructive?: boolean;
        defaultValue?: string;
        onConfirm: (val?: string) => void;
    }>({
        isOpen: false,
        type: 'confirm',
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const closeDialog = () => setDialogConfig(prev => ({ ...prev, isOpen: false }));

    const {
        proposal,
        opinions,
        loading,
        error,
        fetchDetail,
        addOpinion,
        editOpinion,
        removeOpinion,
        removeProposal,
        toggleProposalLike,
        toggleProposalScrap,
        toggleOpinionLike
    } = useProposalDetail(id);

    const { addXP } = useGamification();
    const { submitReport } = useReport();
    const { addNotification } = useNotifications();

    // Form states
    const [newOpinion, setNewOpinion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [opinionError, setOpinionError] = useState('');
    const [isReportOpen, setIsReportOpen] = useState(false);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    // Simple keyword extraction vs Mock related news selection.
    // In a real scenario, API would handle fuzzy matching or AI embedding search.
    const relatedNews = useMemo(() => {
        if (!proposal) return [];
        // If the proposal has explicitly defined targetArticles (from our dummy seed), use them
        if (proposal.targetArticles && proposal.targetArticles.length > 0) {
            return proposal.targetArticles.map((ta: any) => ({
                id: ta.article_id || ta.id || Math.random(),
                title: ta.title || '',
                summary: ta.summary || '',
                topic: proposal.topic || '', // Fallback to proposal topic
                category: (proposal.category as ContentCategory) || '기타',
                imageUrl: ta.image_url || null,
                commentCount: 0,
                regDt: ta.pub_date || new Date().toISOString(),
                url: ta.article_url || '',
            })) as NewsCardArticle[];
        }

        const words = proposal.title.split(' '); // pseudo keyword generator

        const matched = allParsedArticles.filter(n => {
            return words.some(w => w.length > 1 && (n.title.includes(w) || n.summary.includes(w)));
        });

        // if there's no match just return standard top 3 stories so demo looks full
        return matched.length >= 3 ? matched.slice(0, 3) : allParsedArticles.slice(0, 3);
    }, [proposal]);

    const handleOpinionSubmit = async () => {
        if (!isAuthenticated || !user) {
            openLoginModal();
            return;
        }

        if (!newOpinion.trim()) return;

        setIsSubmitting(true);
        setOpinionError('');

        try {
            // AI Validator call
            const validation = await claudeService.validateOpinion(newOpinion);

            if (!validation.isValid) {
                setOpinionError(`🚫 앗, 표현을 수정해주세요: ${validation.reason || '공론장 원칙에 위배되는 내용이 감지되었습니다.'}`);
                return;
            }

            const nickname = generateNickname(user.id, proposal!.id);

            await addOpinion({
                id: `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                proposalId: proposal!.id,
                authorId: user.id,
                authorNickname: nickname,
                content: newOpinion.trim(),
                createdAt: Date.now()
            });

            // XP gain + level-up check
            const xpResult = await addXP(user.id, XP_REWARDS.COMMENT);
            if (xpResult.leveledUp) {
                setLevelUpLevel(xpResult.userLevel.level);
                await addNotification(
                    'level_up',
                    `축하합니다! 레벨 ${xpResult.userLevel.level}로 승급했습니다!`,
                    '/mypage'
                );
            }

            // Notification logic:
            // 1) Notify proposal author (if not me) that a new opinion was posted
            if (proposal!.authorId && proposal!.authorId !== user.id) {
                await addNotification(
                    'comment',
                    `"${proposal!.title}" 제안에 새로운 의견이 등록되었습니다.`,
                    `/proposals/${proposal!.id}`
                );
            }

            // 2) Notify fellow commenters (other users who already commented on this proposal)
            // In a real app this would be per-user notifications; for prototype we create one
            const otherCommenters = new Set(
                opinions
                    .filter((op) => op.authorId !== user.id && op.authorId !== proposal!.authorId)
                    .map((op) => op.authorId)
            );
            if (otherCommenters.size > 0) {
                await addNotification(
                    'comment',
                    `"${proposal!.title}" 제안에 새로운 의견이 등록되었습니다.`,
                    `/proposals/${proposal!.id}`
                );
            }

            setNewOpinion('');
        } catch (err) {
            console.error(err);
            setOpinionError('의견 등록 시스템에 문제가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && !proposal) {
        return (
            <div className="flex justify-center py-xl min-h-[50vh] items-center">
                <span className="text-3xl animate-spin text-primary">🐻</span>
            </div>
        );
    }

    if (error || !proposal) {
        return (
            <div className="max-w-[800px] mx-auto px-xl py-xxl text-center">
                <h1 className="text-2xl font-bold mb-md">안건을 찾을 수 없습니다.</h1>
                <Button onClick={() => navigate('/proposals')}>목록으로 돌아가기</Button>
            </div>
        );
    }

    // Is the viewer the author?
    const currentViewerNickname = isAuthenticated && user ? generateNickname(user.id, proposal.id) : null;
    const isViewerAuthor = currentViewerNickname === proposal.authorNickname;

    const handleProposalReport = async (reason: string, detail: string) => {
        if (!user || !proposal) return;
        await submitReport({
            reporterId: user.id,
            targetType: 'proposal',
            targetId: proposal.id,
            reason,
            detail,
        });
    };

    return (
        <div className="px-xl py-xl max-w-[1200px] mx-auto">
            {/* Level Up Toast */}
            {levelUpLevel !== null && (
                <LevelUpToast
                    level={levelUpLevel}
                    onClose={() => setLevelUpLevel(null)}
                />
            )}
            {/* 1. Header & Breadcrumb */}
            <button onClick={() => navigate('/proposals')} className="bg-transparent border-0 flex items-center gap-xs text-text-secondary hover:text-primary transition-colors cursor-pointer text-sm font-bold mb-lg">
                <span className="material-icons-round text-sm">arrow_back</span>
                국민 제안 목록
            </button>

            {/* 2. Proposal Body & Hero */}
            <div className="mb-xxl">
                <div className="flex flex-col gap-sm mb-xl py-lg">
                    {proposal.category ? (
                        <span className={`inline-flex max-w-max items-center px-4 py-1.5 rounded-full text-xs font-bold border ${getActiveCategoryColorClass(proposal.category)} mb-xs`}>
                            {proposal.category}
                        </span>
                    ) : (
                        <span className="inline-flex max-w-max items-center px-sm py-[4px] rounded-full text-xs font-bold bg-primary/10 text-primary mb-xs">
                            시민의 목소리
                        </span>
                    )}
                    <h1 className="text-[2rem] font-bold text-text-primary leading-tight break-keep">
                        {proposal.title}
                    </h1>
                    <div className="flex justify-between items-center text-sm font-medium text-text-secondary mt-sm">
                        <div className="flex items-center gap-xs">
                            <span className="material-icons-round text-[20px]!">person</span>
                            <span className="text-text-primary font-bold">{proposal.authorNickname} {isViewerAuthor && "(나)"}</span>
                        </div>
                        <div className="flex items-center gap-sm">
                            {isViewerAuthor && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/proposals/${proposal.id}/edit`)}
                                        className="w-8 h-8 rounded-full bg-surface border border-border text-text-secondary flex items-center justify-center hover:text-primary transition-colors cursor-pointer"
                                        title="수정"
                                    >
                                        <span className="material-icons-round text-sm">edit</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setDialogConfig({
                                                isOpen: true,
                                                type: 'confirm',
                                                title: '게시물 삭제',
                                                message: '정말로 이 게시물을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
                                                confirmText: '삭제',
                                                isDestructive: true,
                                                onConfirm: async () => {
                                                    await removeProposal();
                                                    navigate('/proposals');
                                                }
                                            });
                                        }}
                                        className="w-8 h-8 rounded-full bg-surface border border-border text-text-secondary flex items-center justify-center hover:text-danger transition-colors cursor-pointer"
                                        title="삭제"
                                    >
                                        <span className="material-icons-round text-sm">delete</span>
                                    </button>
                                </div>
                            )}
                            <span className="ml-sm">
                                {new Date(proposal.createdAt).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Interactions */}
                    <div className="flex items-center gap-md mt-sm border-t border-border pt-md">
                        <button
                            className={`flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors text-sm font-bold ${isAuthenticated && user && proposal.likedBy?.includes(user.id) ? 'text-primary' : 'text-text-secondary hover:text-primary'
                                }`}
                            onClick={() => {
                                if (!isAuthenticated || !user) {
                                    openLoginModal();
                                    return;
                                }
                                toggleProposalLike(user.id);
                            }}
                        >
                            <span className="material-icons-round text-[15px]! transition-all">
                                {isAuthenticated && user && proposal.likedBy?.includes(user.id) ? 'thumb_up' : 'thumb_up_off_alt'}
                            </span>
                            공감 {proposal.likes || 0}
                        </button>
                        <button
                            className={`flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors text-sm font-bold ${isAuthenticated && user && proposal.scrapedBy?.includes(user.id) ? 'text-amber-500' : 'text-text-secondary hover:text-amber-500'
                                }`}
                            onClick={() => {
                                if (!isAuthenticated || !user) {
                                    openLoginModal();
                                    return;
                                }
                                toggleProposalScrap(user.id);
                            }}
                        >
                            <span className="material-icons-round text-[15px]! transition-all">
                                {isAuthenticated && user && proposal.scrapedBy?.includes(user.id) ? 'bookmark' : 'bookmark_border'}
                            </span>
                            스크랩 {proposal.scraps || 0}
                        </button>
                        {/* Report Button */}
                        {isAuthenticated && user && proposal.authorId !== user.id && (
                            <button
                                className="flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors text-sm font-bold text-text-secondary hover:text-danger"
                                onClick={() => setIsReportOpen(true)}
                            >
                                <span className="material-icons-round text-[15px]!">flag</span>
                                신고
                            </button>
                        )}
                    </div>
                </div>

                {/* Structured Content (Medium Style) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
                    <div className="lg:col-span-2 flex flex-col gap-xl">
                        {/* Problem */}
                        {(proposal.problem || (!proposal.problem && proposal.description)) && (
                            <div className="bg-surface border border-border rounded-2xl p-lg md:p-xl hover:border-primary/30 transition-colors">
                                <h3 className="text-sm font-bold text-primary mb-md inline-flex items-center gap-xs bg-primary/10 px-3 py-1 rounded-full">
                                    <span className="material-icons-round text-lg!">error</span>
                                    문제 정의
                                </h3>
                                <p className="text-lg leading-relaxed text-text-primary whitespace-pre-wrap break-keep font-medium">
                                    {proposal.problem || proposal.description}
                                </p>
                            </div>
                        )}

                        {/* Reason */}
                        {proposal.reason && (
                            <div className="bg-surface border border-border rounded-2xl p-lg md:p-xl hover:border-primary/30 transition-colors">
                                <h3 className="text-sm font-bold text-blue-500 mb-md inline-flex items-center gap-xs bg-blue-500/10 px-3 py-1 rounded-full">
                                    <span className="material-icons-round text-lg!">help_outline</span>
                                    제안 이유
                                </h3>
                                <p className="text-lg leading-relaxed text-text-primary whitespace-pre-wrap break-keep font-medium">
                                    {proposal.reason}
                                </p>
                            </div>
                        )}

                        {/* Current Situation */}
                        {proposal.currentSituation && (
                            <div className="bg-surface border border-border rounded-2xl p-lg md:p-xl hover:border-primary/30 transition-colors">
                                <h3 className="text-sm font-bold text-amber-500 mb-md inline-flex items-center gap-xs bg-amber-500/10 px-3 py-1 rounded-full">
                                    <span className="material-icons-round text-lg!">info</span>
                                    현재 상황
                                </h3>
                                <p className="text-lg leading-relaxed text-text-primary whitespace-pre-wrap break-keep font-medium">
                                    {proposal.currentSituation}
                                </p>
                            </div>
                        )}

                        {/* Solution */}
                        {proposal.solution && (
                            <div className="bg-surface border border-border rounded-2xl p-lg md:p-xl hover:border-primary/30 transition-colors">
                                <h3 className="text-sm font-bold text-green-500 mb-md inline-flex items-center gap-xs bg-green-500/10 px-3 py-1 rounded-full">
                                    <span className="material-icons-round text-lg!">lightbulb</span>
                                    해결책 제시
                                </h3>
                                <p className="text-lg leading-relaxed text-text-primary whitespace-pre-wrap break-keep font-medium">
                                    {proposal.solution}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-xl">
                        {/* 3. Related News (Sidebar / Right column) */}
                        {relatedNews.length > 0 && (
                            <div className="bg-surface/50 p-lg rounded-[1.25rem] border border-border h-fit">
                                <h2 className="text-lg font-bold mb-md flex items-center gap-xs">
                                    <span className="text-primary text-xl">📰</span>
                                    관련 매경 기사
                                </h2>
                                <div className="flex flex-col gap-md">
                                    {relatedNews.slice(0, 3).map((news) => (
                                        <NewsCard key={news.id} article={news} onClick={() => {
                                            if (news.url) window.open(news.url, '_blank', 'noopener,noreferrer');
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Discussion (Opinions) below the content grid */}
                <div className="mt-xxl border-t border-border pt-xl">
                    <div className="flex items-center justify-between pb-sm mb-lg">
                        <h2 className="text-xl font-bold flex items-center gap-sm m-0">
                            의견 {opinions.length}개
                        </h2>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-md mb-lg max-w-[800px]">
                        {!isAuthenticated ? (
                            <div className="text-center py-xl">
                                <p className="mb-md text-text-secondary font-medium">로그인 후 의견을 남길 수 있습니다.</p>
                                <Button onClick={openLoginModal} size="sm">로그인</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-sm">
                                <div className="flex items-center gap-sm">
                                    <span className="text-sm font-bold text-primary">임시 닉네임: {currentViewerNickname}</span>
                                    <span className="flex items-center gap-1 text-[10px] bg-bg py-[2px] px-sm rounded text-text-secondary"><span className='material-icons'>warning</span> AI가 부적절한 발언을 검사 중입니다.</span>
                                </div>
                                <textarea
                                    value={newOpinion}
                                    onChange={(e) => setNewOpinion(e.target.value)}
                                    className="w-full bg-bg border border-border rounded-lg p-md text-text-primary focus:outline-none focus:border-primary min-h-[100px] resize-none"
                                    placeholder="상호 존중을 바탕으로 한 유익하고 생산적인 논의를 만들어주세요."
                                />
                                {opinionError && (
                                    <div className="text-danger text-sm font-bold bg-danger/10 px-md py-sm rounded-md border border-danger/20">
                                        {opinionError}
                                    </div>
                                )}
                                <div className="flex justify-end">
                                    <Button onClick={handleOpinionSubmit} disabled={isSubmitting || !newOpinion.trim()} className='text-sm'>
                                        {isSubmitting ? '안전성 검토 중...' : '등록하기'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* List opinions */}
                    <div className="flex flex-col gap-md max-w-[800px]">
                        {opinions.length === 0 ? (
                            <EmptyState
                                message="첫 번째 의견을 남겨주세요."
                                icon="chat_bubble_outline"
                                description="당신의 소중한 의견이 문제 해결의 단초가 됩니다."
                            />
                        ) : (
                            opinions.map((op) => (
                                <OpinionItem
                                    key={op.id}
                                    opinion={op}
                                    isAuthor={op.authorNickname === proposal.authorNickname}
                                    currentUserId={user?.id}
                                    onLike={(opinionId) => toggleOpinionLike(opinionId, user?.id || '')}
                                    onEdit={(opinion) => {
                                        setDialogConfig({
                                            isOpen: true,
                                            type: 'prompt',
                                            title: '의견 수정',
                                            message: '의견 내용을 수정해주세요.',
                                            confirmText: '수정',
                                            defaultValue: opinion.content,
                                            onConfirm: (val) => {
                                                if (val) editOpinion({ ...opinion, content: val });
                                                closeDialog();
                                            }
                                        });
                                    }}
                                    onDelete={(opinionId) => {
                                        setDialogConfig({
                                            isOpen: true,
                                            type: 'confirm',
                                            title: '의견 삭제',
                                            message: '정말로 이 의견을 삭제하시겠습니까?',
                                            confirmText: '삭제',
                                            isDestructive: true,
                                            onConfirm: () => {
                                                removeOpinion(opinionId);
                                                closeDialog();
                                            }
                                        });
                                    }}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div >

            {/* Report Modal */}
            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                onSubmit={handleProposalReport}
                targetLabel="국민 제안"
            />

            {/* Global Dialog */}
            <GlobalDialog
                isOpen={dialogConfig.isOpen}
                type={dialogConfig.type}
                title={dialogConfig.title}
                message={dialogConfig.message}
                confirmText={dialogConfig.confirmText}
                defaultValue={dialogConfig.defaultValue}
                isDestructive={dialogConfig.isDestructive}
                onConfirm={dialogConfig.onConfirm}
                onCancel={closeDialog}
            />
        </div >
    );
};
