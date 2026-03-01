import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { LoginModal } from '../../features/auth';

export const MainLayout: React.FC = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';

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
