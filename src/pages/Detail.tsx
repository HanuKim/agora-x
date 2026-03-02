import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { theme } from '../design/theme';

export const Detail: React.FC = () => {
    const { id } = useParams<{ id: string }>();

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
                        주 4일 근무제 도입,
                        <br />
                        <span className="text-primary">
                            시기상조인가, 필수 변화인가?
                        </span>
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
                                이 제안은 현재의 주 5일 근무제를 주 4일로 단축하여 근로자의 삶의 질을 높이고 생산성을
                                향상시키자는 취지입니다. 찬성 측은 업무 효율성 증대와 소비 활성화를 주장하는 반면, 반대 측은
                                기업의 인건비 부담 증가와 국가 경쟁력 약화를 우려하며 치열하게 대립하고 있습니다.
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

                        <Card padding="lg" className="border-l-4 border-success">
                            <h3 className="font-bold text-lg mb-xs text-text-primary">생산성 및 효율성 증대</h3>
                            <p className="text-sm text-text-secondary mb-sm break-keep">
                                충분한 휴식이 보장되면 집중도가 높아져 업무 효율이 오릅니다. 마이크로소프트 일본 지사의 실험
                                결과 생산성이 40% 증가했다는 사례가 이를 뒷받침합니다.
                            </p>
                            <div className="flex items-center gap-md text-xs text-text-secondary">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-[2px] text-text-secondary hover:text-success transition-colors"
                                >
                                    <span className="material-icons-round text-[14px]">arrow_upward</span>
                                    2.1k
                                </button>
                                <span>•</span>
                                <span>출처: 경제연구소 보고서</span>
                            </div>
                        </Card>

                        <Card padding="lg" className="border-l-4 border-success">
                            <h3 className="font-bold text-lg mb-xs text-text-primary">워라밸 개선 및 내수 활성화</h3>
                            <p className="text-sm text-text-secondary mb-sm break-keep">
                                여가 시간이 늘어나면 자기 계발과 소비 활동이 활발해져 내수 경제에도 긍정적인 영향을
                                미칩니다. 근로자의 삶의 만족도가 높아져 이직률 또한 감소합니다.
                            </p>
                            <div className="flex items-center gap-md text-xs text-text-secondary">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-[2px] text-text-secondary hover:text-success transition-colors"
                                >
                                    <span className="material-icons-round text-[14px]">arrow_upward</span>
                                    1.8k
                                </button>
                                <span>•</span>
                                <span>출처: 2023 노동동향</span>
                            </div>
                        </Card>

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
                            className="w-full max-w-[260px] text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-success via-border to-danger" />
                            <h3 className="mt-sm font-bold text-base mb-md text-text-primary">현재 여론 현황</h3>

                            <div className="relative w-24 h-24 mx-auto mb-md">
                                {/* Simple circle representation */}
                                <div className="w-full h-full rounded-full border-[6px] border-border flex items-center justify-center">
                                    <div className="w-[70%] h-[70%] rounded-full bg-success/10 flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-text-primary">55%</span>
                                        <span className="text-[10px] font-bold uppercase text-text-secondary">찬성</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between text-[11px] font-bold text-text-secondary mb-md px-xs">
                                <span className="text-success">55% 찬성</span>
                                <span>20% 보류</span>
                                <span className="text-danger">25% 반대</span>
                            </div>

                            <Button type="button" variant="primary" size="md" fullWidth className="whitespace-nowrap">
                                투표하기
                                <span className="material-icons-round text-base">how_to_vote</span>
                            </Button>
                            <p className="mt-xs text-[11px] text-text-secondary">투표 마감까지 3일 남음</p>
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

                        <Card padding="lg" className="border-r-4 border-danger">
                            <h3 className="font-bold text-lg mb-xs text-text-primary">기업 비용 부담 증가</h3>
                            <p className="text-sm text-text-secondary mb-sm break-keep">
                                근무 시간이 줄어도 급여를 유지할 경우, 기업의 인건비 부담이 급격히 늘어나며 이는 자금력이
                                부족한 중소기업에게 치명적일 수 있습니다.
                            </p>
                            <div className="flex items-center gap-md text-xs text-text-secondary justify-end">
                                <span>출처: 중소기업중앙회</span>
                                <span>•</span>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-[2px] text-text-secondary hover:text-danger transition-colors"
                                >
                                    <span className="material-icons-round text-[14px]">arrow_upward</span>
                                    3.4k
                                </button>
                            </div>
                        </Card>

                        <Card padding="lg" className="border-r-4 border-danger">
                            <h3 className="font-bold text-lg mb-xs text-text-primary">시기상조 및 경쟁력 약화</h3>
                            <p className="text-sm text-text-secondary mb-sm break-keep">
                                아직 한국의 노동 생산성은 주요 선진국 대비 낮은 수준입니다. 준비 없는 섣부른 도입은 국가
                                산업 경쟁력을 약화시키고 물가 상승을 초래할 수 있습니다.
                            </p>
                            <div className="flex items-center gap-md text-xs text-text-secondary justify-end">
                                <span>출처: 한국경영자총협회</span>
                                <span>•</span>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-[2px] text-text-secondary hover:text-danger transition-colors"
                                >
                                    <span className="material-icons-round text-[14px]">arrow_upward</span>
                                    1.2k
                                </button>
                            </div>
                        </Card>

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
