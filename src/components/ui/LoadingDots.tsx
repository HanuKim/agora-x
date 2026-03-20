import React from 'react';

/**
 * Wave-style loading dots (... with sequential bounce).
 * Use for AI content loading states instead of placeholder text.
 *
 * @param size - 'sm' | 'md' | 'lg' (default: 'md')
 * @param label - Optional text to show alongside dots
 */
export const LoadingDots: React.FC<{
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    className?: string;
}> = ({ size = 'md', label, className = '' }) => {
    const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2';
    const gap = size === 'sm' ? 'gap-1' : size === 'lg' ? 'gap-2' : 'gap-1.5';
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

    return (
        <div className={`flex items-center ${gap} ${className}`}>
            {label && (
                <span className={`${textSize} text-text-secondary font-medium mr-1`}>{label}</span>
            )}
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className={`${dotSize} rounded-full bg-primary/60 inline-block`}
                    style={{
                        animation: 'loadingWave 1.4s ease-in-out infinite',
                        animationDelay: `${i * 0.16}s`,
                    }}
                />
            ))}
            <style>{`
                @keyframes loadingWave {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                    40% { transform: translateY(-6px); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
