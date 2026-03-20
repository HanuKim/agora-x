import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { getFilteredOpinions } from '../../services/db/arenaDB';
import type { ArenaOpinion } from '../../features/common/types';

type StanceFilter = 'all' | 'pro' | 'con';
type SortOption = 'latest' | 'oldest' | 'likes';

const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
    { value: 'latest', label: '최신순', icon: 'schedule' },
    { value: 'oldest', label: '오래된순', icon: 'history' },
    { value: 'likes', label: '공감순', icon: 'thumb_up' },
];

interface OpinionListPanelProps {
    articleId: number;
    isOpen: boolean;
    onClose: () => void;
}

export const OpinionListPanel: React.FC<OpinionListPanelProps> = ({ articleId, isOpen, onClose }) => {
    const [stanceFilter, setStanceFilter] = useState<StanceFilter>('all');
    const [sort, setSort] = useState<SortOption>('latest');

    const opinions = useMemo(() => {
        const stanceParam = stanceFilter === 'all' ? undefined : stanceFilter;
        return getFilteredOpinions(articleId, { stance: stanceParam, sort });
    }, [articleId, stanceFilter, sort]);

    const proCount = useMemo(() => getFilteredOpinions(articleId, { stance: 'pro' }).length, [articleId]);
    const conCount = useMemo(() => getFilteredOpinions(articleId, { stance: 'con' }).length, [articleId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full bg-bg border-l border-border shadow-xl flex flex-col animate-in" style={{ animationName: 'slideInRight', animationDuration: '0.3s' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-lg border-b border-border">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-sm">
                        <span className="material-icons-round text-primary">forum</span>
                        전체 시민 의견
                        <span className="text-text-muted font-normal text-base">({opinions.length})</span>
                    </h2>
                    <button
                        type="button"
                        className="text-text-muted hover:text-text-primary bg-transparent border-none"
                        onClick={onClose}
                    >
                        <span className="material-icons-round">close</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="p-md border-b border-border space-y-sm">
                    {/* Stance filter */}
                    <div className="flex gap-xs">
                        <FilterChip
                            active={stanceFilter === 'all'}
                            onClick={() => setStanceFilter('all')}
                        >
                            전체 ({proCount + conCount})
                        </FilterChip>
                        <FilterChip
                            active={stanceFilter === 'pro'}
                            onClick={() => setStanceFilter('pro')}
                            className="text-success"
                        >
                            찬성 ({proCount})
                        </FilterChip>
                        <FilterChip
                            active={stanceFilter === 'con'}
                            onClick={() => setStanceFilter('con')}
                            className="text-danger"
                        >
                            반대 ({conCount})
                        </FilterChip>
                    </div>

                    {/* Sort */}
                    <div className="flex gap-xs">
                        {SORT_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`flex items-center gap-1 px-sm py-1 rounded-md text-xs border transition-all ${sort === option.value
                                        ? 'bg-primary/10 border-primary/30 text-primary font-bold'
                                        : 'bg-transparent border-border text-text-muted hover:text-text-secondary'
                                    }`}
                                onClick={() => setSort(option.value)}
                            >
                                <span className="material-icons-round text-xs">{option.icon}</span>
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Opinions list */}
                <div className="flex-1 overflow-y-auto p-md space-y-sm">
                    {opinions.map((op) => (
                        <OpinionCard key={op.id} opinion={op} />
                    ))}
                    {opinions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-xxl">
                            <span className="material-icons-round text-4xl text-text-muted mb-sm">search_off</span>
                            <p className="text-sm text-text-muted">해당 조건의 의견이 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

/* ── Helper components ─────────────────────────────────────── */

const FilterChip: React.FC<{
    active: boolean;
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
}> = ({ active, onClick, className = '', children }) => (
    <button
        type="button"
        className={`px-md py-1 rounded-full text-xs font-bold border transition-all ${active
                ? 'bg-primary/10 border-primary/30 text-primary'
                : `bg-transparent border-border text-text-muted hover:border-primary/20 ${className}`
            }`}
        onClick={onClick}
    >
        {children}
    </button>
);

const OpinionCard: React.FC<{ opinion: ArenaOpinion }> = ({ opinion }) => {
    const isPro = opinion.stance === 'pro';
    const borderClass = isPro ? 'border-l-4 border-success/50' : 'border-r-4 border-danger/50';
    const timeDiff = Date.now() - opinion.createdAt;
    const daysAgo = Math.floor(timeDiff / 86_400_000);
    const timeText = daysAgo === 0 ? '오늘' : daysAgo === 1 ? '어제' : `${daysAgo}일 전`;

    return (
        <Card padding="md" className={`${borderClass} hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between mb-xs">
                <div className="flex items-center gap-xs">
                    <span className={`text-[10px] font-bold px-sm py-0.5 rounded-full ${isPro ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {isPro ? '찬성' : '반대'}
                    </span>
                    <span className="text-xs font-medium text-text-secondary">{opinion.authorName}</span>
                </div>
                <span className="text-[10px] text-text-muted">{timeText}</span>
            </div>
            <p className="text-sm text-text-primary break-keep leading-relaxed">{opinion.body}</p>
            <div className="flex items-center gap-md mt-sm text-[11px] text-text-muted">
                <span className="flex items-center gap-1">
                    <span className="material-icons-round text-[11px]">thumb_up</span>
                    {opinion.likes}
                </span>
                <span className="flex items-center gap-1">
                    <span className="material-icons-round text-[11px]">swap_horiz</span>
                    {opinion.influenceCount}명 영향
                </span>
            </div>
        </Card>
    );
};
