import { useState, useEffect, useRef } from 'react';
import { useProposals } from '../proposal/useProposals';
import { useNewsWithAISummary } from '../news/useNewsWithAISummary';

export const useHome = () => {
    // 1:1 토론하기 Carousel State
    const issueScrollRef = useRef<HTMLDivElement>(null);
    const isPaused = useRef(false);
    const CARD_WIDTH = 236; // 220px card + 16px gap
    const [centerIssueIndex, setCenterIssueIndex] = useState(0);

    // 국민 제안 Carousel State
    const proposalScrollRef = useRef<HTMLDivElement>(null);
    const { proposals, fetchAllProposals } = useProposals();
    const [activeProposalIndex, setActiveProposalIndex] = useState(0);

    const activeProposals = proposals.slice(0, 5);
    const currentProposal = activeProposals[activeProposalIndex];

    const { items: newsItems } = useNewsWithAISummary(6);

    // Fetch proposals
    useEffect(() => {
        fetchAllProposals();
    }, [fetchAllProposals]);

    // Issue Carousel Logic
    const handleIssueScroll = () => {
        if (!issueScrollRef.current) return;
        const container = issueScrollRef.current;
        const scrollCenter = container.scrollLeft + container.clientWidth / 2;
        let minDiff = Infinity;
        let closestIndex = 0;

        const children = Array.from(container.children);
        for (let i = 0; i < children.length; i++) {
            const child = children[i] as HTMLElement;
            const childCenter = child.offsetLeft + child.clientWidth / 2;
            const diff = Math.abs(childCenter - scrollCenter);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        setCenterIssueIndex(closestIndex);
    };

    useEffect(() => {
        handleIssueScroll(); // Initialize
        const timer = setInterval(() => {
            if (isPaused.current || !issueScrollRef.current) return;
            const el = issueScrollRef.current;
            const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
            if (atEnd) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' });
            }
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const scrollIssues = (dir: 'left' | 'right') => {
        if (issueScrollRef.current) {
            issueScrollRef.current.scrollBy({ left: dir === 'right' ? CARD_WIDTH : -CARD_WIDTH, behavior: 'smooth' });
        }
    };

    // Proposals Carousel Logic
    useEffect(() => {
        if (activeProposals.length <= 1) return;
        const autoRotate = setInterval(() => {
            setActiveProposalIndex((prev) => {
                const next = (prev + 1) % activeProposals.length;
                if (proposalScrollRef.current) {
                    const child = proposalScrollRef.current.children[next] as HTMLElement;
                    if (child) {
                        const scrollToLeft = child.offsetLeft - (proposalScrollRef.current.clientWidth / 2) + (child.clientWidth / 2);
                        proposalScrollRef.current.scrollTo({ left: scrollToLeft, behavior: 'smooth' });
                    }
                }
                return next;
            });
        }, 5000);
        return () => clearInterval(autoRotate);
    }, [activeProposals.length]);

    const scrollProposals = (dir: 'left' | 'right') => {
        setActiveProposalIndex((prev) => {
            const next = dir === 'left'
                ? (prev - 1 + activeProposals.length) % activeProposals.length
                : (prev + 1) % activeProposals.length;

            if (proposalScrollRef.current) {
                const child = proposalScrollRef.current.children[next] as HTMLElement;
                if (child) {
                    const scrollToLeft = child.offsetLeft - (proposalScrollRef.current.clientWidth / 2) + (child.clientWidth / 2);
                    proposalScrollRef.current.scrollTo({ left: scrollToLeft, behavior: 'smooth' });
                }
            }
            return next;
        });
    };

    const handleProposalClick = (idx: number) => {
        setActiveProposalIndex(idx);
        if (proposalScrollRef.current) {
            const child = proposalScrollRef.current.children[idx] as HTMLElement;
            if (child) {
                const scrollToLeft = child.offsetLeft - (proposalScrollRef.current.clientWidth / 2) + (child.clientWidth / 2);
                proposalScrollRef.current.scrollTo({ left: scrollToLeft, behavior: 'smooth' });
            }
        }
    };

    return {
        issueScrollRef,
        isPaused,
        centerIssueIndex,
        handleIssueScroll,
        scrollIssues,

        proposalScrollRef,
        activeProposals,
        currentProposal,
        activeProposalIndex,
        scrollProposals,
        handleProposalClick,

        newsItems,
    };
};
