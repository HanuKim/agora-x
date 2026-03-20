/**
 * MyPostsTab.tsx
 *
 * "내가 작성한 게시물/의견" tab: shows user's own proposals and opinions
 * with category filters and sort options.
 * Includes category ratio visualization.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { ProposalCard } from '../proposal/ProposalCard';
import { GlobalDialog, type DialogType } from '../common/GlobalDialog';
import { useProposals } from '../../features/proposal/useProposals';
import { useMyDiscussions } from '../../features/detail/useDetail';
import type { Proposal, Opinion } from '../../services/db/proposalDB';

type PostCategory = '전체' | '국민제안' | '국민제안 의견' | '국민토론 의견' | 'AI 토론 기록';
type SortOption = 'newest' | 'oldest' | 'likes';

const CATEGORIES: PostCategory[] = ['전체', '국민제안', '국민제안 의견', '국민토론 의견', 'AI 토론 기록'];
const SORT_OPTIONS: { key: SortOption; label: string }[] = [
    { key: 'newest', label: '최신순' },
    { key: 'oldest', label: '과거순' },
    { key: 'likes', label: '공감순' },
];

// Content category colors for the ratio chart (국민 제안·국민제안 의견·국민토론 의견 공통 분류)
const CATEGORY_COLORS: Record<string, string> = {
    정치: 'bg-red-500',
    경제: 'bg-blue-500',
    사회: 'bg-green-500',
    국제: 'bg-purple-500',
    문화: 'bg-amber-500',
    기술: 'bg-cyan-500',
    기타: 'bg-gray-400',
};

/** 국민제안 의견 한 건 (proposalDB 기준, myOpinions 전용) */
export interface MyOpinionItem {
    opinion: Opinion;
    proposal: Proposal | null;
}

import type { ChatHistoryEntry } from '../../services/db/historyDB';

interface MyPostsTabProps {
    myProposals: Proposal[];
    myOpinions: MyOpinionItem[];
    myHistories?: ChatHistoryEntry[];
    /** 내 게시물/의견 로드와 동일하게 훅에서 사용하기 위한 userId (useMyDiscussions용) */
    userId?: string;
}

export const MyPostsTab: React.FC<MyPostsTabProps> = ({
    myProposals,
    myOpinions,
    myHistories = [],
    userId,
}) => {
    const navigate = useNavigate();
    const { editProposal, removeProposal, editOpinion, removeOpinion } = useProposals();
    const { myDiscussions, editDiscussion, deleteDiscussion } = useMyDiscussions(userId);
    
    const [activeCategory, setActiveCategory] = useState<PostCategory>('전체');
    const [sortOption, setSortOption] = useState<SortOption>('newest');

    // Dialog state
    const [dialogConfig, setDialogConfig] = useState<{
        isOpen: boolean;
        type: DialogType;
        title: string;
        message: string;
        confirmText?: string;
        isDestructive?: boolean;
        placeholder?: string;
        defaultValue?: string;
        onConfirm: (val?: string) => void;
    }>({
        isOpen: false,
        type: 'confirm',
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const closeDialog = () => setDialogConfig(prev => ({ ...prev, isOpen: false }));

    // 데이터 소스별 구분 (myProposals / myOpinions / myDiscussions 동일 패턴)
    const proposalOpinions = myOpinions;
    const discussionList = myDiscussions;

    // Sort function
    const sortItems = <T extends { createdAt: number; likes?: number }>(items: T[]): T[] => {
        const sorted = [...items];
        if (sortOption === 'newest') sorted.sort((a, b) => b.createdAt - a.createdAt);
        else if (sortOption === 'oldest') sorted.sort((a, b) => a.createdAt - b.createdAt);
        else if (sortOption === 'likes') sorted.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
        return sorted;
    };

    const showProposals = activeCategory === '전체' || activeCategory === '국민제안';
    const showProposalOpinions = activeCategory === '전체' || activeCategory === '국민제안 의견';
    const showDiscussionOpinions = activeCategory === '전체' || activeCategory === '국민토론 의견';
    const showHistories = activeCategory === '전체' || activeCategory === 'AI 토론 기록';

    const sortedProposals = sortItems(myProposals);
    const sortedProposalOpinions = sortItems(
        proposalOpinions.map((o) => ({ ...o, createdAt: o.opinion.createdAt, likes: o.opinion.likes }))
    );
    const sortedDiscussionOpinions = sortItems(
        discussionList.map((d) => ({ ...d, createdAt: d.createdAt, likes: d.likes ?? 0 }))
    );
    const sortedHistories = sortItems(
        myHistories.map(h => ({ ...h, createdAt: h.lastMessageAt, likes: 0 }))
    );

    const totalCount =
        (showProposals ? sortedProposals.length : 0) +
        (showProposalOpinions ? sortedProposalOpinions.length : 0) +
        (showDiscussionOpinions ? sortedDiscussionOpinions.length : 0) +
        (showHistories ? sortedHistories.length : 0);

    // Category ratio calculation
    const categoryStats = useMemo(() => {
        const counts: Record<string, number> = {};
        let total = 0;

        myProposals.forEach((p) => {
            const cat = p.category ?? '기타';
            counts[cat] = (counts[cat] ?? 0) + 1;
            total++;
        });
        myOpinions.forEach((item) => {
            const cat = item.proposal?.category ?? '기타';
            counts[cat] = (counts[cat] ?? 0) + 1;
            total++;
        });
        myDiscussions.forEach((d) => {
            const cat = d.category ?? '기타';
            counts[cat] = (counts[cat] ?? 0) + 1;
            total++;
        });
        myHistories.forEach((h) => {
            const cat = h.category || '기타';
            counts[cat] = (counts[cat] ?? 0) + 1;
            total++;
        });

        return Object.entries(counts)
            .map(([category, count]) => ({
                category,
                count,
                ratio: total > 0 ? Math.round((count / total) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);
    }, [myProposals, myOpinions, myDiscussions]);

    return (
        <div className="flex flex-col gap-lg">
            <h2 className="text-2xl font-bold text-text-primary m-0 flex items-center gap-sm">
                <span className="material-icons-round text-blue-500">edit_note</span>
                내가 작성한 게시물/의견
            </h2>

            {/* Category Ratio Chart */}
            {categoryStats.length > 0 && (
                <Card className="p-lg mb-4">
                    <p className="text-md font-bold text-text-primary mb-md flex items-center gap-xs">
                        <span className="material-icons-round text-[16px] text-primary">pie_chart</span>
                        카테고리별 활동 비율
                    </p>
                    {/* Bar chart */}
                    <div className="flex h-[8px] rounded-full overflow-hidden mb-md">
                        {categoryStats.map(({ category, ratio }) => (
                            <div
                                key={category}
                                className={`${CATEGORY_COLORS[category] ?? 'bg-gray-400'} transition-all duration-500`}
                                style={{ width: `${ratio}%` }}
                                title={`${category}: ${ratio}%`}
                            />
                        ))}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-md ml-1">
                        {categoryStats.map(({ category, count, ratio }) => (
                            <div key={category} className="flex items-center gap-xs">
                                <span
                                    className={`w-[10px] h-[10px] rounded-full ${CATEGORY_COLORS[category] ?? 'bg-gray-400'}`}
                                />
                                <span className="text-xs text-text-secondary">
                                    {category} {ratio}% ({count})
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Filters */}
            <div className="flex items-center justify-between flex-wrap gap-sm">
                <div className="flex gap-xs flex-wrap">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-md py-xs text-sm font-semibold rounded-full transition-all duration-200 border cursor-pointer ${
                                activeCategory === cat
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-bg text-text-secondary border-border hover:border-primary hover:text-primary'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex gap-xs">
                    {SORT_OPTIONS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setSortOption(key)}
                            className={`px-sm py-xs text-sm font-medium rounded-md transition-all duration-200 border cursor-pointer ${
                                sortOption === key
                                    ? 'bg-text-primary text-bg border-text-primary'
                                    : 'bg-transparent text-text-secondary border-border hover:text-text-primary'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {totalCount === 0 ? (
                <EmptyState
                    message="작성한 게시물이 없습니다"
                    icon="edit_off"
                    description="국민 제안을 작성하거나 의견을 남겨보세요."
                />
            ) : (
                <div className="flex flex-col gap-xl">
                    {/* 국민제안 */}
                    {showProposals && sortedProposals.length > 0 && (
                        <div>
                            {activeCategory === '전체' && (
                                <h3 className="text-sm font-bold text-text-secondary mb-md flex items-center gap-xs">
                                    <span className="material-icons-round text-[16px]">description</span>
                                    국민제안 ({sortedProposals.length})
                                </h3>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                {sortedProposals.map((p) => (
                                    <div key={p.id} className="relative group">
                                        <ProposalCard
                                            proposal={p}
                                            onClick={() => navigate(`/proposals/${p.id}`)}
                                        />
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDialogConfig({
                                                        isOpen: true,
                                                        type: 'prompt',
                                                        title: '게시물 수정',
                                                        message: '제목을 수정합니다.',
                                                        defaultValue: p.title,
                                                        placeholder: '새 제목을 입력하세요',
                                                        onConfirm: (val) => {
                                                            if (val) editProposal({ ...p, title: val });
                                                            closeDialog();
                                                        }
                                                    });
                                                }}
                                                className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 text-text-primary shadow-sm flex items-center justify-center hover:text-primary transition-colors border-none cursor-pointer"
                                            >
                                                <span className="material-icons-round text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDialogConfig({
                                                        isOpen: true,
                                                        type: 'confirm',
                                                        title: '게시물 삭제',
                                                        message: '정말로 이 게시물을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.',
                                                        confirmText: '삭제',
                                                        isDestructive: true,
                                                        onConfirm: () => {
                                                            removeProposal(p.id);
                                                            closeDialog();
                                                        }
                                                    });
                                                }}
                                                className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 text-text-primary shadow-sm flex items-center justify-center hover:text-danger transition-colors border-none cursor-pointer"
                                            >
                                                <span className="material-icons-round text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 국민제안 의견 */}
                    {showProposalOpinions && sortedProposalOpinions.length > 0 && (
                        <div>
                            {activeCategory === '전체' && (
                                <h3 className="text-md font-bold text-text-secondary mb-md flex items-center gap-xs">
                                    <span className="material-icons-round text-[16px]">chat_bubble_outline</span>
                                    국민제안 의견 ({sortedProposalOpinions.length})
                                </h3>
                            )}
                            <div className="flex flex-col gap-md">
                                {sortedProposalOpinions.map(({ opinion, proposal }) => (
                                    <div key={opinion.id} className="relative group">
                                        <Card
                                            className="p-lg cursor-pointer hover:-translate-y-[1px] hover:shadow-md transition-all pr-20"
                                            onClick={() => {
                                                if (proposal) navigate(`/proposals/${proposal.id}`);
                                            }}
                                        >
                                            {proposal && (
                                                <div className="flex items-center gap-xs mb-sm">
                                                    <span className="material-icons-round text-[14px] text-primary">
                                                        description
                                                    </span>
                                                    <span className="text-sm font-bold text-primary line-clamp-1">
                                                        {proposal.title}
                                                    </span>
                                                </div>
                                            )}
                                            <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap break-keep m-0 line-clamp-3">
                                                {opinion.content}
                                            </p>
                                            <div className="flex items-center justify-between mt-sm">
                                                <span className="text-xs text-text-secondary flex items-center gap-xs">
                                                    <span className="material-icons-round text-[14px]">schedule</span>
                                                    {new Date(opinion.createdAt).toLocaleDateString('ko-KR', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-sm text-sm text-text-secondary">
                                                    <span className="material-icons-round text-[14px] text-primary">thumb_up</span>
                                                    {opinion.likes || 0}
                                                </span>
                                            </div>
                                        </Card>
                                        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDialogConfig({
                                                        isOpen: true,
                                                        type: 'prompt',
                                                        title: '의견 수정',
                                                        message: '의견 내용을 수정합니다.',
                                                        defaultValue: opinion.content,
                                                        placeholder: '의견을 입력하세요',
                                                        onConfirm: (val) => {
                                                            if (val) editOpinion({ ...opinion, content: val });
                                                            closeDialog();
                                                        }
                                                    });
                                                }}
                                                className="w-10 h-10 rounded-full bg-surface-variant text-text-primary shadow-sm flex items-center justify-center hover:text-primary transition-colors border border-border"
                                            >
                                                <span className="material-icons-round text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDialogConfig({
                                                        isOpen: true,
                                                        type: 'confirm',
                                                        title: '의견 삭제',
                                                        message: '정말로 이 의견을 삭제하시겠습니까?',
                                                        confirmText: '삭제',
                                                        isDestructive: true,
                                                        onConfirm: () => {
                                                            removeOpinion(opinion.id, opinion.proposalId);
                                                            closeDialog();
                                                        }
                                                    });
                                                }}
                                                className="w-10 h-10 rounded-full bg-surface-variant text-text-primary shadow-sm flex items-center justify-center hover:text-danger transition-colors border border-border"
                                            >
                                                <span className="material-icons-round text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 국민토론 의견 */}
                    {showDiscussionOpinions && sortedDiscussionOpinions.length > 0 && (
                        <div>
                            {activeCategory === '전체' && (
                                <h3 className="text-md font-bold text-text-secondary mb-md flex items-center gap-xs">
                                    <span className="material-icons-round text-[16px]">forum</span>
                                    국민토론 의견 ({sortedDiscussionOpinions.length})
                                </h3>
                            )}
                            <div className="flex flex-col gap-md">
                                {sortedDiscussionOpinions.map((discussion) => (
                                    <div key={discussion.id} className="relative group">
                                        <Card
                                            className="p-lg cursor-pointer hover:-translate-y-[1px] hover:shadow-md transition-all pr-20"
                                            onClick={() => navigate(`/detail/${discussion.issueId}`)}
                                        >
                                            <div className="flex items-center gap-xs mb-sm">
<span className="material-icons-round text-[14px] text-primary">
                                                        description
                                                    </span>
                                                <span className="text-sm font-bold text-primary line-clamp-1">
                                                    {discussion.articleTitle ?? `기사 #${discussion.issueId}`}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap break-keep m-0 line-clamp-3">
                                                {discussion.body}
                                            </p>
                                            <div className="flex items-center justify-between mt-sm">
                                                <span className="text-xs text-text-secondary flex items-center gap-xs">
                                                    <span className="material-icons-round text-[14px]">schedule</span>
                                                    {new Date(discussion.createdAt).toLocaleDateString('ko-KR', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-sm text-sm text-text-secondary">
                                                    <span className="material-icons-round text-[14px] text-primary">thumb_up</span>
                                                    {discussion.likes ?? 0}
                                                </span>
                                            </div>
                                        </Card>
                                        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDialogConfig({
                                                        isOpen: true,
                                                        type: 'prompt',
                                                        title: discussion.type === 'reply' ? '답글 수정' : '댓글 수정',
                                                        message: '내용을 수정합니다.',
                                                        defaultValue: discussion.body,
                                                        placeholder: '내용을 입력하세요',
                                                        onConfirm: (val) => {
                                                            if (val) editDiscussion(discussion.issueId, discussion.targetId, discussion.type, { body: val }, discussion.parentCommentId);
                                                            closeDialog();
                                                        },
                                                    });
                                                }}
                                                className="w-10 h-10 rounded-full bg-surface-variant text-text-primary shadow-sm flex items-center justify-center hover:text-primary transition-colors border border-border"
                                            >
                                                <span className="material-icons-round text-lg">edit</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDialogConfig({
                                                        isOpen: true,
                                                        type: 'confirm',
                                                        title: discussion.type === 'reply' ? '답글 삭제' : '댓글 삭제',
                                                        message: '정말로 삭제하시겠습니까?',
                                                        confirmText: '삭제',
                                                        isDestructive: true,
                                                        onConfirm: () => {
                                                            deleteDiscussion(discussion.issueId, discussion.targetId, discussion.type, discussion.parentCommentId);
                                                            closeDialog();
                                                        },
                                                    });
                                                }}
                                                className="w-10 h-10 rounded-full bg-surface-variant text-text-primary shadow-sm flex items-center justify-center hover:text-danger transition-colors border border-border"
                                            >
                                                <span className="material-icons-round text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI 토론 기록 */}
                    {showHistories && sortedHistories.length > 0 && (
                        <div>
                            {activeCategory === '전체' && (
                                <h3 className="text-md font-bold text-text-secondary mb-md flex items-center gap-xs">
                                    <span className="material-icons-round text-[16px]">smart_toy</span>
                                    AI 토론 기록 ({sortedHistories.length})
                                </h3>
                            )}
                            <div className="flex flex-col gap-md">
                                {sortedHistories.map((history) => (
                                    <div key={history.id} className="relative group">
                                        <Card
                                            className="p-lg cursor-pointer hover:-translate-y-[1px] hover:shadow-md transition-all"
                                            onClick={() => {
                                                if (history.type === 'ai_discussion') {
                                                    if (history.customIssueData) {
                                                        navigate(`/ai-discussion/custom/${history.customIssueData.id}`, {
                                                            state: { customIssue: history.customIssueData }
                                                        });
                                                    } else if (history.articleId) {
                                                        navigate(`/ai-discussion/${history.articleId}`);
                                                    }
                                                } else if (history.type === 'arena' && history.articleId) {
                                                    navigate(`/detail/${history.articleId}/arena`);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-xs mb-sm">
                                                <span className={`material-icons-round text-[14px] ${history.type === 'arena' ? 'text-danger' : 'text-primary'}`}>
                                                    {history.type === 'arena' ? 'sports_kabaddi' : 'auto_awesome'}
                                                </span>
                                                <span className={`text-xs font-bold ${history.type === 'arena' ? 'text-danger' : 'text-primary'} line-clamp-1`}>
                                                    {history.type === 'arena' ? '토론장 참여' : 'AI 토론 연습'}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-text-primary mb-xs">
                                                주제: {history.title}
                                            </p>
                                            {history.messages && history.messages.length > 0 && (
                                                <p className="text-sm text-text-secondary line-clamp-2">
                                                    최근 대화: {history.messages[history.messages.length - 1].content}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-sm">
                                                <span className="text-xs text-text-secondary flex items-center gap-xs">
                                                    <span className="material-icons-round text-[14px]">schedule</span>
                                                    {new Date(history.lastMessageAt).toLocaleDateString('ko-KR', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <GlobalDialog
                {...dialogConfig}
                onCancel={closeDialog}
            />
        </div>
    );
};
