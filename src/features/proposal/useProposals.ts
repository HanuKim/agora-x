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
    getAllOpinions,
    toggleProposalLike as dbToggleProposalLike,
    toggleProposalScrap as dbToggleProposalScrap,
    toggleOpinionLike as dbToggleOpinionLike,
    updateProposal as dbUpdateProposal,
    deleteProposal as dbDeleteProposal,
    updateOpinion as dbUpdateOpinion,
    deleteOpinion as dbDeleteOpinion
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

    const fetchLikedOpinions = useCallback(async (userId: string) => {
        try {
            const [allOpinions, allProposals] = await Promise.all([
                getAllOpinions(),
                getProposals(),
            ]);
            const proposalMap = new Map(allProposals.map(p => [p.id, p]));
            const liked = allOpinions
                .filter(op => op.likedBy?.includes(userId))
                .map(op => ({
                    opinion: op,
                    proposal: proposalMap.get(op.proposalId) ?? null,
                }));
            return liked;
        } catch (err) {
            console.error(err);
            return [];
        }
    }, []);

    const editProposal = async (proposal: Proposal) => {
        try {
            await dbUpdateProposal(proposal);
            await fetchAllProposals();
        } catch (err) {
            console.error(err);
            throw new Error('국민 제안을 수정하는데 실패했습니다.');
        }
    };

    const removeProposal = async (id: string) => {
        try {
            await dbDeleteProposal(id);
            await fetchAllProposals();
        } catch (err) {
            console.error(err);
            throw new Error('국민 제안을 삭제하는데 실패했습니다.');
        }
    };

    const editOpinion = async (opinion: Opinion) => {
        try {
            await dbUpdateOpinion(opinion);
            // This hook handles global opinions, so no need for proposalId-specific refresh here
            // but we might want to refresh whatever is using this.
        } catch (err) {
            console.error(err);
            throw new Error('의견을 수정하는데 실패했습니다.');
        }
    };

    const removeOpinion = async (opinionId: string, proposalId: string) => {
        try {
            await dbDeleteOpinion(opinionId, proposalId);
        } catch (err) {
            console.error(err);
            throw new Error('의견을 삭제하는데 실패했습니다.');
        }
    };

    return {
        proposals,
        loading,
        error,
        fetchAllProposals,
        addProposal,
        editProposal,
        removeProposal,
        editOpinion,
        removeOpinion,
        fetchUserInteractions,
        fetchLikedOpinions,
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

    const editOpinion = async (opinion: Opinion) => {
        try {
            await dbUpdateOpinion(opinion);
            await fetchDetail();
        } catch (err) {
            console.error(err);
            throw new Error('의견을 수정하는데 실패했습니다.');
        }
    };

    const removeOpinion = async (opinionId: string) => {
        if (!proposalId) return;
        try {
            await dbDeleteOpinion(opinionId, proposalId);
            await fetchDetail();
        } catch (err) {
            console.error(err);
            throw new Error('의견을 삭제하는데 실패했습니다.');
        }
    };

    const editProposal = async (p: Proposal) => {
        if (!proposalId) return;
        try {
            await dbUpdateProposal(p);
            await fetchDetail();
        } catch (err) {
            console.error(err);
            throw new Error('국민 제안을 수정하는데 실패했습니다.');
        }
    };

    const removeProposal = async () => {
        if (!proposalId) return;
        try {
            await dbDeleteProposal(proposalId);
        } catch (err) {
            console.error(err);
            throw new Error('국민 제안을 삭제하는데 실패했습니다.');
        }
    };

    return {
        proposal,
        opinions,
        loading,
        error,
        fetchDetail,
        addOpinion,
        editOpinion,
        removeOpinion,
        editProposal,
        removeProposal,
        toggleProposalLike,
        toggleProposalScrap,
        toggleOpinionLike
    };
}
