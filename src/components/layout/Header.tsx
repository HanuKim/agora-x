import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import { useTheme } from '../../hooks/useTheme';

export const Header: React.FC = () => {
    const { user, isAuthenticated, openLoginModal } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-md py-md bg-bg border-b border-border">
            {/* Logo — dark 모드에서 logo-dark.png로 전환 */}
            <NavLink to="/" className="no-underline">
                <img
                    src={isDark ? '/logo-dark.png' : '/logo.png'}
                    alt="Agora-X Logo"
                    className="h-8"
                />
            </NavLink>

            {/* Nav */}
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

            {/* Right: Dark mode toggle + Auth */}
            <div className="flex items-center gap-sm">
                {/* Auth */}
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

                {/* Dark mode toggle button */}
                <button
                    onClick={toggleTheme}
                    aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                    title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                    className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-surface hover:bg-border transition-all duration-200 text-text-secondary hover:text-text-primary"
                >
                    {isDark ? (
                        /* 🌞 Sun icon (switch to light) */
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    ) : (
                        /* 🌙 Moon icon (switch to dark) */
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>
            </div>
        </header>
    );
};
