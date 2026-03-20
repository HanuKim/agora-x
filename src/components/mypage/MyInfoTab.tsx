/**
 * MyInfoTab.tsx
 *
 * "내 정보 관리" tab content: knowledge level settings, manner score detail, XP/level detail.
 * Uses material icons exclusively (no emoji).
 */

import React from 'react';
import { Card } from '../ui/Card';
import {
    CONTENT_CATEGORIES,
    KNOWLEDGE_LEVEL_LABELS,
    type KnowledgeLevel,
    type ContentCategory,
} from '../../features/user';
import { LEVEL_THRESHOLDS, XP_REWARDS } from '../../services/db/gamificationDB';
import type { UserLevel } from '../../services/db/gamificationDB';
import type { UserKnowledgePrefs } from '../../features/user';

const LEVELS: KnowledgeLevel[] = ['low', 'medium', 'high'];

const CATEGORY_ICONS: Record<ContentCategory, string> = {
    정치: 'account_balance',
    경제: 'trending_up',
    사회: 'groups',
    국제: 'public',
    문화: 'palette',
    기술: 'memory',
    기타: 'more_horiz',
};

interface MyInfoTabProps {
    knowledgePrefs: UserKnowledgePrefs;
    onKnowledgeLevelChange: (category: ContentCategory, level: KnowledgeLevel) => void;
    userLevel: UserLevel | null;
}

export const MyInfoTab: React.FC<MyInfoTabProps> = ({
    knowledgePrefs,
    onKnowledgeLevelChange,
    userLevel,
}) => {
    return (
        <div className="flex flex-col gap-xl">
            {/* Level & XP Detail */}
            <Card className="p-xl">
                <h2 className="text-xl font-bold text-text-primary mt-0 mb-md flex items-center gap-sm">
                    <span className="material-icons-round text-primary">emoji_events</span>
                    사용자 레벨 & 경험치
                </h2>

                {userLevel ? (
                    <div className="flex flex-col gap-md">
                        <div className="grid grid-cols-2 gap-md">
                            <div className="bg-surface rounded-xl p-md text-center border border-border">
                                <p className="text-3xl font-bold text-primary mb-xs">
                                    Lv.{userLevel.level}
                                </p>
                                <p className="text-sm text-text-secondary">
                                    {LEVEL_THRESHOLDS.find((t) => t.level === userLevel.level)?.label}
                                </p>
                            </div>
                            <div className="bg-surface rounded-xl p-md text-center border border-border">
                                <p className="text-3xl font-bold text-amber-500 mb-xs">
                                    {userLevel.xp}
                                </p>
                                <p className="text-sm text-text-secondary">총 경험치 (XP)</p>
                            </div>
                        </div>

                        <div className="bg-surface/50 rounded-lg p-md border border-border">
                            <p className="text-md font-bold text-text-primary mb-md ml-xs">경험치 획득 방법</p>
                            <div className="flex flex-col gap-sm mb-sm ml-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary flex items-center gap-xs">
                                        <span className="material-icons-round text-[16px]">chat_bubble</span>
                                        의견 작성
                                    </span>
                                    <span className="font-bold text-primary mr-2">+{XP_REWARDS.COMMENT} XP</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary flex items-center gap-xs">
                                        <span className="material-icons-round text-[16px]">edit_note</span>
                                        제안 작성
                                    </span>
                                    <span className="font-bold text-primary mr-2">+{XP_REWARDS.PROPOSAL} XP</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary flex items-center gap-xs">
                                        <span className="material-icons-round text-[16px]">thumb_up</span>
                                        공감 받기
                                    </span>
                                    <span className="font-bold text-primary mr-2">+{XP_REWARDS.RECEIVED_LIKE} XP</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface/50 rounded-lg p-md border border-border">
                            <p className="text-md font-bold text-text-primary mb-md ml-xs">레벨 기준</p>
                            <div className="flex flex-col gap-sm ml-2">
                                {LEVEL_THRESHOLDS.map((t) => (
                                    <div
                                        key={t.level}
                                        className={`flex justify-between text-sm mr-2 ${userLevel.level === t.level ? 'text-primary font-bold' : 'text-text-secondary'
                                            }`}
                                    >
                                        <span>Lv.{t.level} {t.label}</span>
                                        <span>{t.minXP} XP ~</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-text-secondary">로딩 중...</p>
                )}
            </Card>

            {/* Manner Score */}
            <Card className="p-xl">
                <h2 className="text-xl font-bold text-text-primary mt-0 mb-md flex items-center gap-sm">
                    <span className="material-icons-round text-green-500">verified</span>
                    매너 점수
                </h2>
                {userLevel ? (
                    <div className="flex flex-col gap-md">
                        <div className="text-center bg-surface rounded-xl p-lg border border-border">
                            <p
                                className={`text-4xl font-bold mb-xs ${userLevel.mannerScore >= 80
                                    ? 'text-green-500'
                                    : userLevel.mannerScore >= 50
                                        ? 'text-amber-500'
                                        : 'text-danger'
                                    }`}
                            >
                                {userLevel.mannerScore}점
                            </p>
                            <p className="text-md text-text-secondary flex items-center justify-center gap-xs">
                                {userLevel.mannerScore >= 90 ? (
                                    <>
                                        <span className="material-icons-round text-green-500 text-[16px]">star</span>
                                        모범적인 토론 참여자입니다!
                                    </>
                                ) : userLevel.mannerScore >= 70 ? (
                                    <>
                                        <span className="material-icons-round text-blue-500 text-[16px]">thumb_up</span>
                                        좋은 매너를 유지하고 있습니다.
                                    </>
                                ) : userLevel.mannerScore >= 50 ? (
                                    <>
                                        <span className="material-icons-round text-amber-500 text-[16px]">warning</span>
                                        건전한 토론 문화를 지켜주세요.
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons-round text-danger text-[16px]">error</span>
                                        매너 개선이 필요합니다.
                                    </>
                                )}
                            </p>
                        </div>
                        <p className="text-sm text-text-secondary">
                            매너 점수는 다른 사용자의 신고에 따라 감소할 수 있습니다. 초기 점수는 100점입니다.
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-text-secondary">로딩 중...</p>
                )}
            </Card>

            {/* Knowledge Level Settings */}
            <Card className="p-xl">
                <h2 className="text-xl font-bold text-text-primary mt-0 mb-sm flex items-center gap-sm">
                    <span className="material-icons-round text-blue-500">school</span>
                    분야별 지식 수준
                </h2>
                <p className="text-md text-text-secondary mb-lg">
                    변경하면 해당 분야의 AI 요약이 새로 생성됩니다.
                </p>

                <div className="flex flex-col gap-md">
                    {CONTENT_CATEGORIES.map((category) => (
                        <div key={category} className="flex items-center gap-md flex-wrap">
                            <div className="flex items-center gap-sm min-w-[120px]">
                                <span className="material-icons-round text-lg text-text-secondary" aria-hidden="true">
                                    {CATEGORY_ICONS[category]}
                                </span>
                                <span className="font-semibold text-text-primary text-md ml-1">
                                    {category}
                                </span>
                            </div>
                            <div className="flex gap-sm">
                                {LEVELS.map((level) => {
                                    const isActive = knowledgePrefs[category] === level;
                                    return (
                                        <button
                                            key={level}
                                            onClick={() => !isActive && onKnowledgeLevelChange(category, level)}
                                            className={[
                                                'px-md py-xs text-sm font-semibold rounded-full transition-all duration-200',
                                                'border cursor-pointer',
                                                isActive
                                                    ? 'bg-primary text-white border-primary shadow-sm'
                                                    : 'bg-bg text-text-secondary border-border hover:border-primary hover:text-primary',
                                            ].join(' ')}
                                            aria-pressed={isActive}
                                            aria-label={`${category} 지식 수준 ${KNOWLEDGE_LEVEL_LABELS[level]} 선택`}
                                        >
                                            {KNOWLEDGE_LEVEL_LABELS[level]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
