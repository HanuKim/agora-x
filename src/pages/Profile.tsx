/**
 * Profile Page
 *
 * 사용자 정보 표시 및 분야별 지식 수준 설정 UI.
 * 지식 수준 변경 시 → UserPrefsContext를 통해 IndexedDB 캐시 무효화 → 다음 AI 호출 시 재요청.
 *
 * 규칙 준수:
 * - 인라인 스타일 금지 → design/theme.ts 전용
 * - 비즈니스 로직은 hooks/context에서 처리
 * - 페이지는 레이아웃 및 hook 호출만 담당
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../features/auth';
import {
    useUserPrefs,
    CONTENT_CATEGORIES,
    KNOWLEDGE_LEVEL_LABELS,
    type KnowledgeLevel,
    type ContentCategory,
} from '../features/user';
import { useProposals } from '../features/proposal/useProposals';
import { ProposalCard } from '../components/proposal/ProposalCard';
import { theme } from '../design/theme';
import type { Proposal } from '../services/db/proposalDB';

const LEVELS: KnowledgeLevel[] = ['low', 'medium', 'high'];

const CATEGORY_EMOJI: Record<ContentCategory, string> = {
    정치: '🏛️',
    경제: '💰',
    사회: '🤝',
    국제: '🌏',
    문화: '🎭',
    기술: '💻',
    기타: '📌',
};

export const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const { knowledgePrefs, setKnowledgeLevel } = useUserPrefs();
    const { fetchUserInteractions } = useProposals();
    const navigate = useNavigate();

    const [likedProposals, setLikedProposals] = useState<Proposal[]>([]);
    const [scrapedProposals, setScrapedProposals] = useState<Proposal[]>([]);

    useEffect(() => {
        if (user) {
            fetchUserInteractions(user.id).then(data => {
                setLikedProposals(data.liked);
                setScrapedProposals(data.scraped);
            });
        }
    }, [user, fetchUserInteractions]);

    return (
        <div className="px-xl py-xl max-w-[760px] mx-auto">
            {/* ── 헤더 ─────────────────────────────────────── */}
            <h1 className="text-[2rem] font-extrabold text-text-primary mb-sm">내 프로필</h1>
            <p className="text-text-secondary mb-xl">
                지식 수준을 설정하면 AI가 설명의 깊이를 맞춤 조정합니다.
            </p>

            {/* ── 사용자 정보 ───────────────────────────────── */}
            <Card className="p-xl mb-xl flex items-center gap-lg">
                {user?.picture ? (
                    <img
                        src={user.picture}
                        alt={user.name}
                        className="w-[64px] h-[64px] rounded-full object-cover border-2 border-border"
                    />
                ) : (
                    <div className="w-[64px] h-[64px] rounded-full bg-primary/10 flex items-center justify-center text-primary text-[1.75rem] font-bold select-none">
                        {user?.name?.[0] ?? '?'}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-text-primary truncate">
                        {user?.name ?? '게스트'}
                    </p>
                    <p className="text-sm text-text-secondary truncate">
                        {user?.email ?? '로그인이 필요합니다'}
                    </p>
                    {user?.provider && (
                        <span className={`${theme.badge.base} ${theme.badge.muted} mt-xs`}>
                            {user.provider}
                        </span>
                    )}
                </div>
                {user && (
                    <Button variant="outline" size="sm" onClick={logout}>
                        로그아웃
                    </Button>
                )}
            </Card>

            {/* ── 지식 수준 설정 ─────────────────────────────── */}
            <Card className="p-xl">
                <h2 className="text-xl font-bold text-text-primary mt-0 mb-sm">
                    분야별 지식 수준
                </h2>
                <p className="text-sm text-text-secondary mb-lg">
                    변경하면 해당 분야의 AI 요약이 새로 생성됩니다.
                </p>

                <div className="flex flex-col gap-md">
                    {CONTENT_CATEGORIES.map((category) => (
                        <CategoryLevelRow
                            key={category}
                            category={category}
                            currentLevel={knowledgePrefs[category]}
                            onSelect={(level) => setKnowledgeLevel(category, level)}
                        />
                    ))}
                </div>
            </Card>

            {/* ── 활동 내역 ─────────────────────────────── */}
            <div className="mt-xxl flex flex-col gap-xl">
                <div>
                    <h2 className="text-xl font-bold text-text-primary mb-md flex items-center gap-sm">
                        <span className="material-icons-round text-amber-500">bookmark</span>
                        스크랩한 국민 제안
                    </h2>
                    {scrapedProposals.length === 0 ? (
                        <Card className="p-xl text-center text-text-secondary border-dashed">
                            스크랩한 제안이 없습니다.
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                            {scrapedProposals.map(p => (
                                <ProposalCard key={p.id} proposal={p} onClick={() => navigate(`/proposals/${p.id}`)} />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-bold text-text-primary mb-md flex items-center gap-sm">
                        <span className="material-icons-round text-primary">thumb_up</span>
                        공감한 국민 제안
                    </h2>
                    {likedProposals.length === 0 ? (
                        <Card className="p-xl text-center text-text-secondary border-dashed">
                            공감한 제안이 없습니다.
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                            {likedProposals.map(p => (
                                <ProposalCard key={p.id} proposal={p} onClick={() => navigate(`/proposals/${p.id}`)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Sub-component ────────────────────────────────────────────────────────────

interface CategoryLevelRowProps {
    category: ContentCategory;
    currentLevel: KnowledgeLevel;
    onSelect: (level: KnowledgeLevel) => void;
}

const CategoryLevelRow: React.FC<CategoryLevelRowProps> = ({
    category,
    currentLevel,
    onSelect,
}) => {
    return (
        <div className="flex items-center gap-md flex-wrap">
            {/* 분야 이름 */}
            <div className="flex items-center gap-sm min-w-[120px]">
                <span className="text-lg" aria-hidden="true">
                    {CATEGORY_EMOJI[category]}
                </span>
                <span className="font-semibold text-text-primary text-sm">{category}</span>
            </div>

            {/* 수준 선택 버튼 */}
            <div className="flex gap-sm">
                {LEVELS.map((level) => {
                    const isActive = currentLevel === level;
                    return (
                        <button
                            key={level}
                            onClick={() => !isActive && onSelect(level)}
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
    );
};
