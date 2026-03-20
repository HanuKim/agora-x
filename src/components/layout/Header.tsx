import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import { useTheme } from '../../hooks/useTheme';
import { useNotifications } from '../../features/notification';
import { NotificationModal } from '../notification/NotificationModal';

export const Header: React.FC = () => {
    const { user, isAuthenticated, openLoginModal } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { unreadCount, isModalOpen, openModal, closeModal } = useNotifications();

    return (
        <>
            <header className="sticky top-0 z-40 flex items-center justify-between px-xl py-lg bg-bg dark:bg-[#2B2E34] border-b border-border">
                {/* Logo — dark 모드에서 logo-dark.png로 전환 */}
                <NavLink to="/" className="no-underline">
                    <img src="/logo-dark.png" alt="Agora-X Logo" className="hidden dark:block h-8" />
                    <img src="/logo.png" alt="Agora-X Logo" className="block dark:hidden h-8" />
                </NavLink>

                {/* Nav */}
                <nav className="flex gap-xl">
                    {[
                        { to: '/', label: '홈' },
                        { to: '/community', label: '국민 토론' },
                        { to: '/proposals', label: '국민 제안' },
                        { to: '/ai-discussion', label: '토론 연습' },
                        { to: '/guide', label: '이용 가이드' },
                    ].map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                isActive
                                    ? 'text-md font-bold text-primary no-underline'
                                    : 'text-md font-bold text-text-white no-underline hover:text-primary transition-colors duration-200'
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Right: Auth + Notification + Dark mode toggle */}
                <div className="flex items-center gap-md">
                    {/* Auth */}
                    {isAuthenticated && user ? (
                        <NavLink to="/mypage" className="flex items-center gap-md no-underline">
                            <span className="text-md font-medium text-text-primary">{user.name}</span>
                            {user.picture ? (
                                <div className="w-10 h-10 rounded-full border border-border overflow-hidden">
                                    <img src={localStorage.getItem(`agora-x-profile-img-${user.id}`) ?? user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-primary">
                                    <span className="material-icons-round text-xl">person</span>
                                </div>
                            )}
                        </NavLink>
                    ) : (
                        <button
                            onClick={openLoginModal}
                            className="bg-primary text-white border-0 px-md py-xs rounded-md cursor-pointer font-sans text-md font-medium hover:bg-primary-hover transition-colors duration-200"
                        >
                            로그인
                        </button>
                    )}

                    {/* Notification Bell */}
                    {isAuthenticated && (
                        <button
                            onClick={openModal}
                            aria-label="알림"
                            className="relative flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface hover:bg-border transition-all duration-200 text-text-secondary hover:text-text-primary"
                        >
                            <span className="material-icons-round text-xl">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute -top-[3px] -right-[3px] min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full px-[4px]">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Dark mode toggle button */}
                    <button
                        onClick={toggleTheme}
                        aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                        title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                        className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface hover:bg-border transition-all duration-200 text-text-secondary hover:text-text-primary"
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

            {/* Notification Modal */}
            <NotificationModal isOpen={isModalOpen} onClose={closeModal} />
        </>
    );
};
