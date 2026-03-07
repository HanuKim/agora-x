import React, { useCallback, useState } from 'react';
import { PollCardAfter } from './PollCardAfter';
import { PollCardBefore, type PollVote } from './PollCardBefore';

const STORAGE_KEY = (articleId: number) => `agora-poll-${articleId}`;

interface StoredPoll {
    hasVoted: boolean;
    selectedVote: PollVote | null;
    proCount: number;
    neutralCount: number;
    conCount: number;
}

// 임의로 투표 수 변경 시 StoredPoll 변경
const DEFAULT_POLL: StoredPoll = {
    hasVoted: false,
    selectedVote: null,
    proCount: 10,
    neutralCount: 3,
    conCount: 5,
};

function loadPoll(articleId: number): StoredPoll {
    try {
        const raw = localStorage.getItem(STORAGE_KEY(articleId));
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<StoredPoll>;
            const loaded: StoredPoll = {
                hasVoted: parsed.hasVoted ?? false,
                selectedVote: parsed.selectedVote ?? null,
                proCount: parsed.proCount ?? 55,
                neutralCount: parsed.neutralCount ?? 20,
                conCount: parsed.conCount ?? 25,
            };
            // 이전 기본값(55,20,25) 마이그레이션 → 0,0,0으로 리셋
            const wasLegacyDefault =
                !loaded.hasVoted &&
                loaded.proCount === 55 &&
                loaded.neutralCount === 20 &&
                loaded.conCount === 25;
            if (wasLegacyDefault) {
                localStorage.setItem(STORAGE_KEY(articleId), JSON.stringify(DEFAULT_POLL));
                return DEFAULT_POLL;
            }
            return loaded;
        }
    } catch {
        // ignore
    }
    return DEFAULT_POLL;
}

export interface PollSectionProps {
    /** 기사 ID (투표 저장 키로 사용) */
    articleId: number;
}

export const PollSection: React.FC<PollSectionProps> = ({ articleId }) => {
    const [poll, setPoll] = useState<StoredPoll>(() => loadPoll(articleId));
    const [selectedVote, setSelectedVote] = useState<PollVote | null>(null);

    const savePoll = useCallback(
        (next: StoredPoll) => {
            setPoll(next);
            localStorage.setItem(STORAGE_KEY(articleId), JSON.stringify(next));
        },
        [articleId],
    );

    const handleVoteSubmit = useCallback(() => {
        if (selectedVote === null) return;
        savePoll({
            hasVoted: true,
            selectedVote,
            proCount: poll.proCount + (selectedVote === 'pro' ? 1 : 0),
            neutralCount: poll.neutralCount + (selectedVote === 'neutral' ? 1 : 0),
            conCount: poll.conCount + (selectedVote === 'con' ? 1 : 0),
        });
        setSelectedVote(null);
    }, [selectedVote, poll.proCount, poll.neutralCount, poll.conCount, savePoll]);

    const handleEditPoll = useCallback(() => {
        savePoll({
            hasVoted: false,
            selectedVote: null,
            proCount: Math.max(0, poll.proCount - (poll.selectedVote === 'pro' ? 1 : 0)),
            neutralCount: Math.max(0, poll.neutralCount - (poll.selectedVote === 'neutral' ? 1 : 0)),
            conCount: Math.max(0, poll.conCount - (poll.selectedVote === 'con' ? 1 : 0)),
        });
    }, [poll, savePoll]);

    if (poll.hasVoted) {
        return (
            <PollCardAfter
                proCount={poll.proCount}
                neutralCount={poll.neutralCount}
                conCount={poll.conCount}
                deadlineText="투표 마감까지 3일 남음"
                onEdit={handleEditPoll}
            />
        );
    }

    return (
        <PollCardBefore
            selectedVote={selectedVote}
            onSelect={setSelectedVote}
            onSubmit={handleVoteSubmit}
            deadlineText="투표 마감까지 3일 남음"
        />
    );
};
