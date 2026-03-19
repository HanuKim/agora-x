import React, { useState } from 'react';
import { CommentItem } from '../components/detail/CommentItem';
import { DiscussionInput } from '../components/detail/DiscussionInput';
import { Card } from '../components/ui/Card';
import { PollSection } from '../components/detail/PollSection';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { theme } from '../design/theme';
import { useDetail } from '../features/detail/useDetail';
import { useAuth } from '../features/auth';
import { useReport } from '../features/user/hooks/useReport';
import { ReportModal } from '../components/report/ReportModal';
import { AssistantModal } from '../components/detail/AssistantModal';
import { sendAssistantUserMessage } from '../features/detail/useAssistant';
import '../components/detail/discussionCivil.css';

export const Detail: React.FC = () => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { submitReport } = useReport();
  const [isArticleLiked, setIsArticleLiked] = useState(false);
  const [articleLikeCount, setArticleLikeCount] = useState(0);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const {
    id,
    numericId,
    article,
    articleUrl,
    debateTopic,
    overview,
    proArguments,
    conArguments,
    proArgumentSummaries,
    conArgumentSummaries,
    aiLoading,
    sortOrder,
    setSortOrder,
    stanceFilter,
    setStanceFilter,
    comments: visibleComments,
    hasComments,
    hasMoreComments,
    totalDisplayCount,
    handleSubmitOpinion,
    loadMoreComments,
    handleReplyAdded,
    editComment,
    deleteComment,
    toggleLikeDiscussion,
    isLikedDiscussion,
    articleScraped,
    toggleArticleScrap,
  } = useDetail(user?.id);

  const articleTitle = article?.title ?? debateTopic ?? '';
  const assistantTopic = debateTopic ?? article?.topic ?? '토론 주제';

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

                    {/* Interactions — 공감 / 스크랩 / 신고 (우측 정렬) */}
                    <div className="flex items-center justify-end gap-md mt-sm border-border pt-md">
                        <button
                            type="button"
                            className={`flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors text-sm font-bold ${isArticleLiked ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
                            onClick={() => {
                                if (!isAuthenticated || !user) {
                                    openLoginModal();
                                    return;
                                }
                                setIsArticleLiked((prev) => !prev);
                                setArticleLikeCount((prev) => (isArticleLiked ? prev - 1 : prev + 1));
                            }}
                        >
                            <span className="material-icons-round text-[15px]! transition-all">
                                {isArticleLiked ? 'thumb_up' : 'thumb_up_off_alt'}
                            </span>
                            공감 {articleLikeCount}
                        </button>
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
                        {isAuthenticated && user && (
                            <button
                                type="button"
                                className="flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors text-sm font-bold text-text-secondary hover:text-danger"
                                onClick={() => setIsReportOpen(true)}
                            >
                                <span className="material-icons-round text-[15px]!">flag</span>
                                신고
                            </button>
                        )}
                    </div>

                    <div className="mt-md">
                        <Card variant="glass" padding="xl" className="relative pb-lg">
                            <div className="flex items-center justify-center gap-xs mb-sm text-primary text-[11px] font-bold tracking-[0.16em] uppercase">
                                <span className="material-icons-round text-base">auto_awesome</span>
                                <span>AI 핵심 요약 (AI Summary)</span>
                            </div>
                            <p className="text-base md:text-lg text-text-secondary leading-relaxed break-keep">
                                {overview ?? 'AI 개요를 불러오는 중입니다.'}
                            </p>
                            {articleUrl ? (
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
                    {/* 찬성 의견 */}
                    <section className="lg:col-span-5 flex flex-col gap-md">
                        <div className="flex items-center justify-between mb-xs">
                            <h2 className="text-[1.75rem] font-bold flex items-center gap-sm text-text-primary">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10 text-success">
                                    <span className="material-icons-round text-base">thumb_up</span>
                                </span>
                                찬성 의견
                            </h2>
                            {/* <span className="text-xs font-medium text-text-secondary">12.4k 지지</span> */}
                        </div>

                        {proArguments.length === 0 ? (
                            <>
                                <Card padding="lg" className="border-l-4 border-success">
                                    <h3 className="font-bold text-lg mb-xs text-text-primary">
                                        {aiLoading ? '찬성 논거 불러오는 중' : '찬성 논거'}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-sm break-keep">
                                        {aiLoading ? '지식 수준에 맞는 찬성 논거를 생성하고 있습니다.' : '아직 논거가 없습니다.'}
                                    </p>
                                </Card>
                                <Card padding="lg" className="border-l-4 border-success">
                                    <h3 className="font-bold text-lg mb-xs text-text-primary">
                                        {aiLoading ? '찬성 논거 불러오는 중' : '찬성 논거'}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-sm break-keep">
                                        {aiLoading ? '지식 수준에 맞는 찬성 논거를 생성하고 있습니다.' : '아직 논거가 없습니다.'}
                                    </p>
                                </Card>
                            </>
                        ) : (
                            proArguments.map((arg, i) => (
                                <Card key={i} padding="lg" className="border-l-4 border-success">
                                    <h3 className="font-bold text-lg mb-xs text-text-primary">
                                        {proArgumentSummaries[i] || `찬성 논거 ${i + 1}`}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-sm break-keep">{arg}</p>
                                </Card>
                            ))
                        )}

                        {/* <Button
                            type="button"
                            variant="outline"
                            size="md"
                            fullWidth
                            className="border-dashed text-text-secondary hover:text-success hover:border-success"
                        >
                            <span className="material-icons-round text-base">add</span>
                            찬성 의견 추가하기
                        </Button> */}
                    </section>

                    {/* 현재 여론 현황 */}
                    <PollSection
                        key={Number.isFinite(numericId) ? numericId : 'none'}
                        articleId={Number.isFinite(numericId) ? numericId : 0}
                    />

                    {/* 반대 의견 */}
                    <section className="lg:col-span-5 flex flex-col gap-md">
                        <div className="flex items-center justify-between mb-xs lg:flex-row-reverse">
                            <h2 className="text-[1.75rem] font-bold flex items-center gap-sm text-text-primary">
                                반대 의견
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-danger/10 text-danger">
                                    <span className="material-icons-round text-base">thumb_down</span>
                                </span>
                            </h2>
                            {/* <span className="text-xs font-medium text-text-secondary">8.1k 반대</span> */}
                        </div>

                        {conArguments.length === 0 ? (
                            <>
                                <Card padding="lg" className="border-r-4 border-danger">
                                    <h3 className="font-bold text-lg mb-xs text-text-primary">
                                        {aiLoading ? '반대 논거 불러오는 중' : '반대 논거'}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-sm break-keep">
                                        {aiLoading ? '지식 수준에 맞는 반대 논거를 생성하고 있습니다.' : '아직 논거가 없습니다.'}
                                    </p>
                                </Card>
                                <Card padding="lg" className="border-r-4 border-danger">
                                    <h3 className="font-bold text-lg mb-xs text-text-primary">
                                        {aiLoading ? '반대 논거 불러오는 중' : '반대 논거'}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-sm break-keep">
                                        {aiLoading ? '지식 수준에 맞는 반대 논거를 생성하고 있습니다.' : '아직 논거가 없습니다.'}
                                    </p>
                                </Card>
                            </>
                        ) : (
                            conArguments.map((arg, i) => (
                                <Card key={i} padding="lg" className="border-r-4 border-danger">
                                    <h3 className="font-bold text-lg mb-xs text-text-primary">
                                        {conArgumentSummaries[i] || `반대 논거 ${i + 1}`}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-sm break-keep">{arg}</p>
                                </Card>
                            ))
                        )}

                        {/* <Button
                            type="button"
                            variant="outline"
                            size="md"
                            fullWidth
                            className="border-dashed text-text-secondary hover:text-danger hover:border-danger"
                        >
                            <span className="material-icons-round text-base">add</span>
                            반대 의견 추가하기
                        </Button> */}
                    </section>
                </div>


                {/* 시민 토론장 — index.css 디자인 토큰 사용 */}
                <section className="mt-xl pt-lg border-border">
                    <section className="space-y-lg">
                        <div className="flex flex-wrap items-center justify-between gap-md border-b border-border pb-md">
                            <h2 className="text-2xl font-bold flex items-center gap-sm text-text-primary">
                                <span className="material-icons-round text-primary">forum</span>
                                시민 토론장 <span className="text-text-muted font-normal">{totalDisplayCount.toLocaleString()}</span>
                            </h2>
                            <div className="flex items-center gap-sm ml-auto">
                                <Select<'oldest' | 'newest' | 'popular'>
                                    value={sortOrder}
                                    options={[
                                        { value: 'oldest', label: '오래된순' },
                                        { value: 'newest', label: '최신순' },
                                        { value: 'popular', label: '인기순' },
                                    ]}
                                    onChange={(v) => setSortOrder(v)}
                                    aria-label="정렬"
                                />
                                <Select<'all' | 'pro' | 'con' | 'neutral'>
                                    value={stanceFilter}
                                    options={[
                                        { value: 'all', label: '전체 의견' },
                                        { value: 'pro', label: '찬성 의견' },
                                        { value: 'con', label: '반대 의견' },
                                        { value: 'neutral', label: '중립 의견' },
                                    ]}
                                    onChange={(v) => setStanceFilter(v)}
                                    aria-label="의견 필터"
                                />
                            </div>
                        </div>

                        <section className="mb-xl">
                            <DiscussionInput
                              onSubmit={(stance, body) => {
                                if (!isAuthenticated || !user) {
                                  openLoginModal();
                                  return;
                                }
                                sendAssistantUserMessage(assistantTopic, `[${stance === 'pro' ? '찬성' : stance === 'con' ? '반대' : '중립'}] ${body}`);
                                handleSubmitOpinion(stance, body, user.id);
                              }}
                              issueId={id}
                              currentUserId={user?.id}
                              isAuthenticated={isAuthenticated}
                              openLoginModal={openLoginModal}
                            />
                        </section>

                        {hasComments ? (
                            <div className="space-y-md">
                                {visibleComments.map((comment) => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        showThreadLine={Boolean(comment.replies?.length)}
                                        onReplyAdded={handleReplyAdded}
                                        issueId={id}
                                        currentUserId={user?.id}
                                        onEdit={
                                          id
                                            ? (commentId, updates) => editComment(id, commentId, updates)
                                            : undefined
                                        }
                                        onDelete={
                                          id ? (commentId) => deleteComment(id, commentId) : undefined
                                        }
                                        onLike={
                                          user?.id && id
                                            ? (payload) =>
                                                toggleLikeDiscussion(user.id, payload, articleTitle)
                                            : undefined
                                        }
                                        isLiked={isLikedDiscussion}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-xxl px-lg mt-md rounded-lg transition-all">
                                <div className="relative mb-lg">
                                    <span className="material-symbols-outlined text-7xl text-text-muted">
                                        chat_bubble_outline
                                    </span>
                                    <span className="material-symbols-outlined absolute -top-1 -right-1 text-2xl text-primary/40 animate-bounce">
                                        lightbulb
                                    </span>
                                </div>
                                <div className="text-center space-y-sm">
                                    <h3 className="text-xl font-bold text-text-primary">
                                        아직 도착한 의견이 없어요
                                    </h3>
                                    <p className="text-text-muted text-sm max-w-[280px] mx-auto leading-relaxed">
                                        이 주제에 대해 가장 먼저 <br />
                                        당신의 소중한 생각을 공유해 보시겠어요?
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="mt-xl flex items-center gap-sm px-lg py-sm rounded-full bg-surface border border-border text-sm font-bold text-primary shadow-sm hover:shadow-md hover:border-primary/50 transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-base">add_comment</span>
                                    첫 의견 작성하기
                                </button>
                            </div>
                        )}
                    </section>

                    {hasComments && hasMoreComments && (
                        <div className="mt-xxl text-center">
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                onClick={loadMoreComments}
                                className="whitespace-nowrap"
                            >
                                토론 의견 더 불러오기
                            </Button>
                        </div>
                    )}
                </section>
            </div>

            {/* Floating AI assistant (always bottom-right on scroll) */}
            <AssistantModal issueTopic={assistantTopic} />

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                onSubmit={async (reason, detail) => {
                    if (!user || !id) return;
                    await submitReport({
                        reporterId: user.id,
                        targetType: 'article',
                        targetId: id,
                        reason,
                        detail,
                    });
                }}
                targetLabel="기사"
            />
        </div>
    );
};
