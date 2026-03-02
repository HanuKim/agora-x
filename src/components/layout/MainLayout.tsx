import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { LoginModal } from '../../features/auth';

export const MainLayout: React.FC = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

    // 페이지 이동 시 스크롤을 항상 최상단으로 초기화
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);


    return (
        <div className="min-h-screen flex flex-col bg-bg font-sans">
            {!isLogin && <Header />}

            <main className={['flex-1', isLogin ? '' : 'pb-[60px]'].join(' ')}>
                <Outlet />
            </main>

            {!isLogin && <Footer />}
            <LoginModal />
        </div>
    );
};
