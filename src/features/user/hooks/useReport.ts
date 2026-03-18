/**
 * useReport.ts
 *
 * Hook for submitting user reports.
 */

import { useState, useCallback } from 'react';
import { createReport, type Report } from '../../../services/db/gamificationDB';

export const REPORT_REASONS = [
    '비속어/욕설',
    '허위 정보',
    '광고/스팸',
    '혐오 발언',
    '개인정보 노출',
    '기타',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export function useReport() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitReport = useCallback(
        async (params: {
            reporterId: string;
            targetType: 'proposal' | 'opinion' | 'article';
            targetId: string;
            reason: string;
            detail: string;
        }) => {
            setIsSubmitting(true);
            try {
                const report: Report = {
                    id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    reporterId: params.reporterId,
                    targetType: params.targetType,
                    targetId: params.targetId,
                    reason: params.reason,
                    detail: params.detail,
                    createdAt: Date.now(),
                };
                await createReport(report);
            } finally {
                setIsSubmitting(false);
            }
        },
        []
    );

    return { submitReport, isSubmitting };
}
