import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth';

export const Header: React.FC = () => {
    const { user, isAuthenticated, openLoginModal } = useAuth();

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-md py-sm bg-bg border-b border-border">
            {/* Logo + Nav */}
            <div className="flex items-center gap-xl">
                <NavLink to="/" className="no-underline">
                    <img src="/logo.png" alt="Agora-X Logo" className="h-8" />
                </NavLink>

                <nav className="flex gap-lg">
                    {[
                        { to: '/', label: '홈' },
                        { to: '/community', label: '커뮤니티' },
                        { to: '/ai-discussion', label: 'AI와의 토론' },
                        { to: '/guide', label: '이용 가이드' },
                    ].map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                isActive
                                    ? 'text-sm font-bold text-primary no-underline'
                                    : 'text-sm font-medium text-text-secondary no-underline hover:text-primary transition-colors duration-200'
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Auth */}
            <div className="flex items-center">
                {isAuthenticated && user ? (
                    <NavLink to="/profile" className="flex items-center gap-sm no-underline">
                        <span className="text-sm font-medium text-text-primary">{user.name}</span>
                        {user.picture ? (
                            <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-primary">
                                <span className="material-icons-round text-xl">person</span>
                            </div>
                        )}
                    </NavLink>
                ) : (
                    <button
                        onClick={openLoginModal}
                        className="bg-primary text-text-inverse border-0 px-md py-xs rounded-md cursor-pointer font-sans text-sm font-medium hover:bg-primary-hover transition-colors duration-200"
                    >
                        로그인
                    </button>
                )}
            </div>
        </header>
    );
};
