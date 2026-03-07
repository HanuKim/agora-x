import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PollCard } from '../components/community/PollCard';
import { theme } from '../design/theme';
import { useNewsWithAISummary } from '../features/news/useNewsWithAISummary';

export const Detail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const numericId = id ? Number(id) : NaN;
    const issueAnalysisForId = Number.isFinite(numericId) ? numericId : undefined;
    const { items } = useNewsWithAISummary(undefined, issueAnalysisForId);
    const article = items.find((item) => item.id === numericId);

    // 토론 주제: 기사 topic·내용 기반으로 AI가 추출한 debateTopic 우선, 미적용 시 기사 topic
    const debateTopic =
        article?.aiSummary?.debateTopic ?? article?.topic;

    const overview = article?.issueAnalysis?.background ?? article?.aiSummary?.overview;
    const proArguments = article?.aiSummary?.proArguments ?? [];
    const conArguments = article?.aiSummary?.conArguments ?? [];
    const proArgumentSummaries = article?.aiSummary?.proArgumentSummaries ?? [];
    const conArgumentSummaries = article?.aiSummary?.conArgumentSummaries ?? [];
    const aiLoading = article?.aiLoading ?? false;

    return (
        <div className={theme.section.page}>
            <div className={`${theme.section.container} py-xl`}>
                {/* Header / Hero */}
                <header className="max-w-[900px] mx-auto text-center mb-xl">
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

                    {id && (
                        <p className="mt-sm text-xs text-text-secondary">
                            이슈 ID: <span className="font-semibold text-primary">{id}</span>
                        </p>
                    )}

                    <div className="mt-lg">
                        <Card variant="glass" padding="xl" className="relative">
                            <div className="flex items-center justify-center gap-xs mb-sm text-primary text-[11px] font-bold tracking-[0.16em] uppercase">
                                <span className="material-icons-round text-base">auto_awesome</span>
                                <span>AI 핵심 요약 (AI Summary)</span>
                            </div>
                            <p className="text-base md:text-lg text-text-secondary leading-relaxed break-keep">
                                {overview ?? 'AI 개요를 불러오는 중입니다.'}
                            </p>
                        </Card>
                    </div>
                </header>

                {/* Main grid: 찬성 / 여론 / 반대 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
                    {/* 찬성 의견 */}
                    <section className="lg:col-span-5 flex flex-col gap-md">
                        <div className="flex items-center justify-between mb-xs">
                            <h2 className="text-[1.75rem] font-bold flex items-center gap-sm text-text-primary">
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10 text-success">
                                    <span className="material-icons-round text-base">thumb_up</span>
                                </span>
                                찬성 의견
                            </h2>
                            <span className="text-xs font-medium text-text-secondary">12.4k 지지</span>
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
                                    <h3 className="font-bold text-lg mb-xs text-text-primary">—</h3>
                                    <p className="text-sm text-text-secondary mb-sm break-keep">—</p>
                                </Card>
                            </>
                        ) : (
                            proArguments.map((arg, i) => (
                                <Card key={i} padding="lg" className="border-l-4 border-success">
                                    <h3 className="font-bold text-lg mb-xs text-text-primary">
                                        {proArgumentSummaries[i] || `찬성 논거 ${i + 1}`}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-sm break-keep">{arg}</p>
                                    <div className="flex items-center gap-md text-xs text-text-secondary">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-[2px] text-text-secondary hover:text-success transition-colors"
                                        >
                                            <span className="material-icons-round text-[14px]">arrow_upward</span>
                                            추천
                                        </button>
                                    </div>
                                </Card>
                            ))
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="md"
                            fullWidth
                            className="border-dashed text-text-secondary hover:text-success hover:border-success"
                        >
                            <span className="material-icons-round text-base">add</span>
                            찬성 의견 추가하기
                        </Button>
                    </section>

                    {/* 현재 여론 현황 */}
                    <aside className="lg:col-span-2 flex justify-center lg:pt-xl mb-lg lg:mb-0">
                    <Card
                        variant="glass"
                        padding="lg"
                        className="w-full max-w-[260px] text-center relative overflow-hidden flex flex-col"
                    >
                        {/* 상단 그라데이션 라인 */}
                        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-success via-border to-danger" />
                        
                        {/* 타이틀 */}
                        <h3 className="mt-sm font-bold text-base mb-md text-text-primary">토론 참여하기</h3>

                        {/* 기존 차트(96px)와 하단 텍스트(약 20px) 영역의 높이를 맞추기 위해 
                        버튼 컨테이너에 flex-grow를 주거나 각 버튼의 높이를 고정(h-12)합니다.
                        */}
                        <div className="flex flex-col gap-2 mb-md justify-center flex-grow">
                        <button className="w-full h-[43px] rounded-xl border-2 border-success/30 bg-success/5 text-success font-bold text-sm hover:bg-success/10 transition-colors flex items-center justify-center">
                            찬성
                        </button>
                        <button className="w-full h-[43px] rounded-xl border-2 border-danger/30 bg-danger/5 text-danger font-bold text-sm hover:bg-danger/10 transition-colors flex items-center justify-center">
                            반대
                        </button>
                        <button className="w-full h-[43px] rounded-xl border-2 border-border bg-stone-100/5 text-text-secondary font-bold text-sm hover:bg-stone-100/10 transition-colors flex items-center justify-center">
                            관전 (보류)
                        </button>
                        </div>

                        {/* 하단 영역 (기존과 동일한 위치 고정) */}
                        <div className="mt-auto">
                        <Button type="button" variant="primary" size="md" fullWidth className="whitespace-nowrap">
                            투표하기
                            <span className="material-icons-round text-base ml-1">how_to_vote</span>
                        </Button>
                        <p className="mt-xs text-[11px] text-text-secondary font-medium">투표 마감까지 3일 남음</p>
                        </div>
                    </Card>
                    </aside>

                    {/* 반대 의견 */}
                    <section className="lg:col-span-5 flex flex-col gap-md">
                        <div className="flex items-center justify-between mb-xs lg:flex-row-reverse">
                            <h2 className="text-[1.75rem] font-bold flex items-center gap-sm text-text-primary">
                                반대 의견
                                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-danger/10 text-danger">
                                    <span className="material-icons-round text-base">thumb_down</span>
                                </span>
                            </h2>
                            <span className="text-xs font-medium text-text-secondary">8.1k 반대</span>
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
                                    <h3 className="font-bold text-lg mb-xs text-text-primary">—</h3>
                                    <p className="text-sm text-text-secondary mb-sm break-keep">—</p>
                                </Card>
                            </>
                        ) : (
                            conArguments.map((arg, i) => (
                                <Card key={i} padding="lg" className="border-r-4 border-danger">
                                    <h3 className="font-bold text-lg mb-xs text-text-primary">
                                        {conArgumentSummaries[i] || `반대 논거 ${i + 1}`}
                                    </h3>
                                    <p className="text-sm text-text-secondary mb-sm break-keep">{arg}</p>
                                    <div className="flex items-center gap-md text-xs text-text-secondary justify-end">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-[2px] text-text-secondary hover:text-danger transition-colors"
                                        >
                                            <span className="material-icons-round text-[14px]">arrow_upward</span>
                                            추천
                                        </button>
                                    </div>
                                </Card>
                            ))
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="md"
                            fullWidth
                            className="border-dashed text-text-secondary hover:text-danger hover:border-danger"
                        >
                            <span className="material-icons-round text-base">add</span>
                            반대 의견 추가하기
                        </Button>
                    </section>
                </div>

                {/* 시민 토론장 */}
                <section className="mt-xl pt-lg border-t border-border">
                    <h2 className="text-[1.5rem] font-bold mb-md flex items-center gap-sm text-text-primary">
                        <span className="material-icons-round text-primary">forum</span>
                        시민 토론장
                    </h2>

                    <Card padding="lg" className="flex gap-md items-start mb-md">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gray-brand flex-shrink-0" />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-xs">
                                <span className="font-bold text-text-primary">익명_시민_42</span>
                                <span className="text-[11px] text-text-secondary">2시간 전</span>
                            </div>
                            <p className="text-sm text-text-secondary mb-sm break-keep">
                                생산성이 오른다는 건 사무직 대기업 얘기 아닌가요? 제조업 기반 중소기업들은 납기 맞추려면
                                사람을 더 뽑아야 하는데 현실적으로 불가능합니다. 업종별 차이를 고려해야 합니다.
                            </p>
                            <div className="flex gap-md">
                                <button
                                    type="button"
                                    className="text-sm text-text-secondary hover:text-primary font-medium"
                                >
                                    답글
                                </button>
                                <button
                                    type="button"
                                    className="text-sm text-text-secondary hover:text-primary font-medium"
                                >
                                    추천 (24)
                                </button>
                            </div>
                        </div>
                    </Card>

                    <div className="text-center">
                        <button
                            type="button"
                            className="text-primary font-bold text-sm hover:underline underline-offset-[2px]"
                        >
                            전체 댓글 1,204개 보기
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
