import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useProposals } from '../features/proposal/useProposals';
import { CONTENT_CATEGORIES, type ContentCategory } from '../features/user';
import { generateNickname } from '../utils/nicknameGenerator';
import { Button } from '../components/ui/Button';

export const ProposalCreate: React.FC = () => {
    const { user, isAuthenticated, openLoginModal } = useAuth();
    const { addProposal, loading } = useProposals();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<ContentCategory | ''>('');
    const [problem, setProblem] = useState('');
    const [reason, setReason] = useState('');
    const [currentSituation, setCurrentSituation] = useState('');
    const [solution, setSolution] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Minimum length requirement for structured fields
    const MIN_LENGTH = 20;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated || !user) {
            openLoginModal();
            return;
        }

        if (!title.trim() || !category || !problem.trim() || !reason.trim() || !currentSituation.trim() || !solution.trim()) {
            setErrorMsg('모든 필드(카테고리 포함)를 입력해주세요.');
            return;
        }

        if (title.length < 5) {
            setErrorMsg('제목은 5자 이상 작성해주세요.');
            return;
        }

        if (problem.length < MIN_LENGTH || reason.length < MIN_LENGTH || currentSituation.length < MIN_LENGTH || solution.length < MIN_LENGTH) {
            setErrorMsg(`모든 내용 항목은 최소 ${MIN_LENGTH}자 이상 작성해주세요.`);
            return;
        }

        // Generate a context ID for this proposal (random string for now)
        const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const nickname = generateNickname(user.id, proposalId);

        try {
            await addProposal({
                id: proposalId,
                title: title.trim(),
                description: `${problem}\n\n${reason}\n\n${currentSituation}\n\n${solution}`, // Fallback for backwards compatibility if needed
                problem: problem.trim(),
                reason: reason.trim(),
                currentSituation: currentSituation.trim(),
                solution: solution.trim(),
                category: category as ContentCategory,
                authorId: user.id,
                authorNickname: nickname,
                createdAt: Date.now(),
                upvotes: 0
            });
            // Go to the detail page of the new proposal
            navigate(`/proposals/${proposalId}`);
        } catch (err) {
            setErrorMsg('저장에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }
    };

    return (
        <div className="px-xl py-xl w-full max-w-[1200px] mx-auto">
            <h1 className="text-[2.5rem] font-bold mb-lg text-text-primary">
                국민 제안 작성
            </h1>

            {!isAuthenticated && (
                <div className="bg-warning/10 border border-warning/20 p-md rounded-lg mb-lg flex justify-between items-center text-sm text-warning font-medium">
                    <span>제안을 작성하려면 로그인이 필요합니다. (아고라-X에서는 랜덤 닉네임으로 자유로운 의견 개진이 보장됩니다)</span>
                    <Button size="sm" onClick={openLoginModal}>로그인</Button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-lg bg-surface p-xl rounded-[1.25rem] border border-border">
                {errorMsg && (
                    <div className="p-sm bg-danger/10 text-danger text-sm font-medium rounded-md border border-danger/20">
                        {errorMsg}
                    </div>
                )}

                <div className="flex flex-col gap-xs">
                    <label className="text-md mb-1 font-bold text-text-primary">
                        카테고리 <span className="text-danger">*</span>
                    </label>
                    <div className="flex flex-wrap gap-sm">
                        {CONTENT_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors border ${category === cat
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-bg text-text-secondary border-border hover:border-primary hover:text-primary'
                                    }`}
                                disabled={loading || !isAuthenticated}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-xs mt-md">
                    <label className="text-md mb-1 font-bold text-text-primary">
                        제안 제목 <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제안 주제는 다양한 의견이 오갈 수 있도록 포괄적으로 정의해주세요. (예: 청년 주거 문제 해결을 위한 제안)"
                        className="p-md rounded-md bg-bg border border-border text-text-primary focus:outline-none focus:border-primary placeholder:text-text-secondary"
                        disabled={loading || !isAuthenticated}
                    />
                </div>

                <div className="flex flex-col gap-xs relative mt-md">
                    <label className="text-md mb-1 font-bold text-text-primary flex justify-between">
                        <span>제안 주제 (문제 정의) <span className="text-danger">*</span></span>
                    </label>
                    <textarea
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        placeholder="어떤 문제를 해결해야 하나요?"
                        className="p-md rounded-md bg-bg border border-border text-text-primary focus:outline-none focus:border-primary placeholder:text-text-secondary min-h-[120px] resize-none"
                        disabled={loading || !isAuthenticated}
                    />
                    <div className="flex justify-end">
                        <span className={`text-[10px] font-medium ${problem.length < MIN_LENGTH ? 'text-danger' : 'text-primary'}`}>
                            {problem.length} / {MIN_LENGTH}자 이상
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-xs relative">
                    <label className="text-md mb-1 font-bold text-text-primary flex justify-between">
                        <span>제안 이유 <span className="text-danger">*</span></span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="왜 이 문제가 중요하며, 해결되어야 하나요?"
                        className="p-md rounded-md bg-bg border border-border text-text-primary focus:outline-none focus:border-primary placeholder:text-text-secondary min-h-[120px] resize-none"
                        disabled={loading || !isAuthenticated}
                    />
                    <div className="flex justify-end">
                        <span className={`text-[10px] font-medium ${reason.length < MIN_LENGTH ? 'text-danger' : 'text-primary'}`}>
                            {reason.length} / {MIN_LENGTH}자 이상
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-xs relative">
                    <label className="text-md mb-1 font-bold text-text-primary flex justify-between">
                        <span>현재 상황 <span className="text-danger">*</span></span>
                    </label>
                    <textarea
                        value={currentSituation}
                        onChange={(e) => setCurrentSituation(e.target.value)}
                        placeholder="현재 어떤 문제가 발생하고 있나요? 구체적인 현황을 제시할수록 양질의 토의가 형성될 수 있습니다."
                        className="p-md rounded-md bg-bg border border-border text-text-primary focus:outline-none focus:border-primary placeholder:text-text-secondary min-h-[120px] resize-none"
                        disabled={loading || !isAuthenticated}
                    />
                    <div className="flex justify-end">
                        <span className={`text-[10px] font-medium ${currentSituation.length < MIN_LENGTH ? 'text-danger' : 'text-primary'}`}>
                            {currentSituation.length} / {MIN_LENGTH}자 이상
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-xs relative">
                    <label className="text-md mb-1 font-bold text-text-primary flex justify-between">
                        <span>해결책 제시 <span className="text-danger">*</span></span>
                    </label>
                    <textarea
                        value={solution}
                        onChange={(e) => setSolution(e.target.value)}
                        placeholder="어떤 해결책을 제안하시나요? 구체적이고 실질적인 해결책을 제안해주세요."
                        className="p-md rounded-md bg-bg border border-border text-text-primary focus:outline-none focus:border-primary placeholder:text-text-secondary min-h-[120px] resize-none"
                        disabled={loading || !isAuthenticated}
                    />
                    <div className="flex justify-end">
                        <span className={`text-[10px] font-medium ${solution.length < MIN_LENGTH ? 'text-danger' : 'text-primary'}`}>
                            {solution.length} / {MIN_LENGTH}자 이상
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-sm mt-md">
                    <Button type="button" variant="outline" onClick={() => navigate('/proposals')} disabled={loading}>
                        취소
                    </Button>
                    <Button type="submit" disabled={loading || !isAuthenticated}>
                        {loading ? '등록 중...' : '국민 제안 등록'}
                    </Button>
                </div>
            </form>
        </div>
    );
};
