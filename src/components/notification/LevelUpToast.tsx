/**
 * LevelUpToast.tsx
 *
 * Celebratory toast notification for level-up events.
 * Auto-fades after a delay.
 */

import React, { useEffect, useState } from 'react';
import { LEVEL_THRESHOLDS } from '../../services/db/gamificationDB';
import { triggerConfetti } from '../../utils/confetti';

interface LevelUpToastProps {
    level: number;
    onClose: () => void;
}

export const LevelUpToast: React.FC<LevelUpToastProps> = ({ level, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const levelInfo = LEVEL_THRESHOLDS.find((t) => t.level === level);

    useEffect(() => {
        // Enter animation
        requestAnimationFrame(() => setIsVisible(true));

        // Fire confetti 🎉
        setTimeout(() => triggerConfetti(), 200);

        // Auto dismiss
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 4000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed top-[80px] left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-4'
                }`}
        >
            <div className="flex items-center gap-md bg-gradient-to-r from-primary to-amber-500 text-white px-xl py-lg rounded-2xl shadow-2xl min-w-[320px]">
                <span className="material-icons-round text-4xl">celebration</span>
                <div>
                    <p className="text-base font-bold m-0">
                        레벨 {level} 달성!
                    </p>
                    <p className="text-sm opacity-90 m-0 mt-xs">
                        축하합니다! {levelInfo?.label ?? ''} 등급으로 승급하셨습니다.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="ml-auto bg-white/20 border-none text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
                >
                    <span className="material-icons-round text-sm">close</span>
                </button>
            </div>
        </div>
    );
};
