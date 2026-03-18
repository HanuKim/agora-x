/**
 * ReportModal.tsx
 *
 * Modal for reporting proposals or opinions.
 * Displays reason selection + detail textarea.
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { REPORT_REASONS, type ReportReason } from '../../features/user/hooks/useReport';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, detail: string) => Promise<void>;
    targetLabel?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    targetLabel = '콘텐츠',
}) => {
    const [selectedReason, setSelectedReason] = useState<ReportReason | ''>('');
    const [detail, setDetail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedReason) return;
        setIsSubmitting(true);
        try {
            await onSubmit(selectedReason, detail);
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setSelectedReason('');
                setDetail('');
                onClose();
            }, 1500);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <Card className="w-full max-w-[480px] mx-md p-xl animate-in fade-in zoom-in-95 duration-200">
                {submitted ? (
                    <div className="text-center py-xl">
                        <span className="material-icons-round text-3xl! mb-md block text-green-500">check_circle</span>
                        <p className="text-lg font-bold text-text-primary">신고가 접수되었습니다</p>
                        <p className="text-sm text-text-secondary mt-xs">검토 후 조치하겠습니다.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-lg">
                            <h2 className="text-xl font-bold text-text-primary m-0 flex items-center gap-sm">
                                <span className="material-icons-round text-danger">flag</span>
                                {targetLabel} 신고
                            </h2>
                            <button
                                onClick={onClose}
                                className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary transition-colors p-0"
                            >
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <p className="text-sm text-text-secondary mb-md">
                            신고 사유를 선택해 주세요.
                        </p>

                        <div className="flex flex-col gap-sm mb-lg">
                            {REPORT_REASONS.map((reason) => (
                                <label
                                    key={reason}
                                    className={`flex items-center gap-sm p-md rounded-lg border cursor-pointer transition-all ${selectedReason === reason
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="report-reason"
                                        value={reason}
                                        checked={selectedReason === reason}
                                        onChange={() => setSelectedReason(reason)}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm font-medium text-text-primary">
                                        {reason}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <textarea
                            value={detail}
                            onChange={(e) => setDetail(e.target.value)}
                            placeholder="상세 내용을 입력해 주세요 (선택)"
                            className="w-full bg-surface border border-border rounded-lg p-md text-text-primary focus:outline-none focus:border-primary min-h-[80px] resize-none text-sm mb-lg"
                        />

                        <div className="flex justify-end gap-sm">
                            <Button variant="outline" size="sm" onClick={onClose}>
                                취소
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={!selectedReason || isSubmitting}
                            >
                                {isSubmitting ? '접수 중...' : '신고하기'}
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};
