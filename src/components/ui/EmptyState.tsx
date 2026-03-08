import React from 'react';

interface EmptyStateProps {
    message: string;
    icon?: string;
    description?: string;
}

/**
 * EmptyState Component
 * Displays a unified layout when there's no data (search results, comments, etc.)
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    message,
    icon = 'error_outline',
    description
}) => {
    return (
        <div className="w-full text-center py-[100px] bg-surface rounded-xl border border-border flex flex-col items-center justify-center gap-sm">
            <span className="material-icons-round text-text-muted text-[30px]! mb-xs">
                {icon}
            </span>
            <h3 className="text-lg font-bold text-text-primary m-0">
                {message}
            </h3>
            {description && (
                <p className="text-sm text-text-secondary mt-xs max-w-[400px]">
                    {description}
                </p>
            )}
        </div>
    );
};
