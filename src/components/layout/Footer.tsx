import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bottom-0 left-0 right-0 z-50 flex justify-around bg-bg dark:bg-[#2B2E34] border-t border-border pb-[calc(1rem+env(safe-area-inset-bottom))] pt-md">
            <div className="flex flex-col items-center gap-[2px] flex-1 no-underline transition-colors duration-200">
                <p>&copy; 2026 Agora X. All rights reserved.</p>
                <p>Terms of Service | Privacy Policy</p>
            </div>
        </footer>
    );
};
