/**
 * useProposals.ts
 *
 * Custom hook to interact with proposalDB for the People's Proposal feature.
 */

import { useState, useCallback } from 'react';
import type { Proposal, Opinion } from '../../services/db/proposalDB';
import {
    getProposals,
    getProposalById,
    createProposal,
    getOpinionsByProposalId,
    createOpinion,
    toggleProposalLike as dbToggleProposalLike,
    toggleProposalScrap as dbToggleProposalScrap,
    toggleOpinionLike as dbToggleOpinionLike
} from '../../services/db/proposalDB';

export function useProposals() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllProposals = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProposals();
            setProposals(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('국민 제안 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    const addProposal = async (proposal: Proposal) => {
        try {
            await createProposal(proposal);
            // Refresh list
            await fetchAllProposals();
        } catch (err) {
            console.error(err);
            throw new Error('국민 제안을 저장하는데 실패했습니다.');
        }
    };

    const fetchUserInteractions = useCallback(async (userId: string) => {
        setLoading(true);
        try {
            const all = await getProposals();
            const liked = all.filter(p => p.likedBy?.includes(userId));
            const scraped = all.filter(p => p.scrapedBy?.includes(userId));
            return { liked, scraped };
        } catch (err) {
            console.error(err);
            setError('활동 내역을 불러오는데 실패했습니다.');
            return { liked: [], scraped: [] };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        proposals,
        loading,
        error,
        fetchAllProposals,
        addProposal,
        fetchUserInteractions
    };
}

export function useProposalDetail(proposalId: string | undefined) {
    const [proposal, setProposal] = useState<Proposal | null>(null);
    const [opinions, setOpinions] = useState<Opinion[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!proposalId) return;
        setLoading(true);
        try {
            const p = await getProposalById(proposalId);
            setProposal(p);

            const ops = await getOpinionsByProposalId(proposalId);
            setOpinions(ops);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('국민 제안 상세 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [proposalId]);

    const addOpinion = async (opinion: Opinion) => {
        try {
            await createOpinion(opinion);
            // Refresh opinions
            await fetchDetail();
        } catch (err) {
            console.error(err);
            throw new Error('의견을 저장하는데 실패했습니다.');
        }
    };

    const toggleProposalLike = async (userId: string) => {
        if (!proposalId) return;
        try {
            await dbToggleProposalLike(proposalId, userId);
            await fetchDetail();
        } catch (err) {
            console.error('Failed to toggle proposal like', err);
        }
    };

    const toggleProposalScrap = async (userId: string) => {
        if (!proposalId) return;
        try {
            await dbToggleProposalScrap(proposalId, userId);
            await fetchDetail();
        } catch (err) {
            console.error('Failed to toggle proposal scrap', err);
        }
    };

    const toggleOpinionLike = async (opinionId: string, userId: string) => {
        try {
            await dbToggleOpinionLike(opinionId, userId);
            await fetchDetail();
        } catch (err) {
            console.error('Failed to toggle opinion like', err);
        }
    };

    return {
        proposal,
        opinions,
        loading,
        error,
        fetchDetail,
        addOpinion,
        toggleProposalLike,
        toggleProposalScrap,
        toggleOpinionLike
    };
}
