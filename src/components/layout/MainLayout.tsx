import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { LoginModal } from '../../features/auth';
import { GlobalFloatingButton } from '../common/GlobalFloatingButton';

export const MainLayout: React.FC = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';
    const isAIPractice = location.pathname.startsWith('/ai-discussion/');
    const isArena = /^\/detail\/\d+\/arena$/.test(location.pathname);
    const isFullScreen = isLogin || isAIPractice || isArena;

    // 페이지 이동 시 스크롤을 항상 최상단으로 초기화
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    const wrapperClass = isFullScreen
        ? "h-screen flex flex-col bg-bg font-sans overflow-hidden"
        : "min-h-screen flex flex-col bg-bg font-sans";

    return (
        <div className={wrapperClass}>
            {!isLogin && <Header />}

            <main className={[
                'flex-1 flex flex-col min-h-0',
                isFullScreen ? '' : 'pb-[60px]'
            ].join(' ')}>
                <Outlet />
            </main>

            {!isLogin && !isFullScreen && <Footer />}
            <LoginModal />
            {!isLogin && <GlobalFloatingButton />}
        </div>
    );
};
