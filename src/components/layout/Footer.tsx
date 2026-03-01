import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bottom-0 left-0 right-0 z-50 flex justify-around bg-bg border-t border-border pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-sm">
            <div className="flex flex-col items-center gap-[2px] flex-1 no-underline transition-colors duration-200">
                <p>&copy; 2026 Agora X. All rights reserved.</p>
                <p>Terms of Service | Privacy Policy</p>
            </div>
        </footer>
    );
};
