/**
 * NotificationModal.tsx
 *
 * Dropdown-style notification panel displayed from header bell icon.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../features/notification';
import type { AppNotification } from '../../services/db/notificationDB';

const NOTIFICATION_ICONS: Record<string, string> = {
    like: 'thumb_up',
    scrap: 'bookmark',
    comment: 'chat_bubble',
    level_up: 'emoji_events',
    report: 'flag',
};

const NOTIFICATION_ICON_COLORS: Record<string, string> = {
    like: 'text-primary',
    scrap: 'text-amber-500',
    comment: 'text-blue-500',
    level_up: 'text-green-500',
    report: 'text-danger',
};

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
}

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleItemClick = async (notif: AppNotification) => {
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }
        if (notif.targetUrl) {
            navigate(notif.targetUrl);
        }
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="fixed inset-0 z-50" onClick={handleBackdropClick}>
            <div className="absolute right-[40px] top-[66px] w-[380px] max-h-[480px] flex flex-col bg-bg border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-lg py-md border-b border-border">
                    <h3 className="text-base font-bold text-text-primary m-0">
                        알림
                        {unreadCount > 0 && (
                            <span className="ml-sm text-xs font-bold text-white bg-primary rounded-full px-[6px] py-[2px]">
                                {unreadCount}
                            </span>
                        )}
                    </h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllAsRead()}
                            className="text-xs font-medium text-primary bg-transparent border-none cursor-pointer hover:underline p-0"
                        >
                            모두 읽음
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-xxl text-text-secondary">
                            <span className="material-icons-round text-4xl mb-sm opacity-30">notifications_none</span>
                            <p className="text-sm">아직 알림이 없습니다</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <button
                                key={notif.id}
                                onClick={() => handleItemClick(notif)}
                                className={`w-full text-left flex items-start gap-md px-lg py-md border-b border-border/50 bg-transparent border-x-0 border-t-0 cursor-pointer transition-colors ${notif.isRead
                                    ? 'opacity-60 hover:bg-surface/50'
                                    : 'bg-primary/5 hover:bg-primary/10'
                                    }`}
                            >
                                <span
                                    className={`material-icons-round text-xl mt-[2px] ${NOTIFICATION_ICON_COLORS[notif.type] ?? 'text-text-secondary'
                                        }`}
                                >
                                    {NOTIFICATION_ICONS[notif.type] ?? 'notifications'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary leading-snug m-0 break-keep">
                                        {notif.message}
                                    </p>
                                    <span className="text-xs text-text-secondary mt-xs block">
                                        {timeAgo(notif.createdAt)}
                                    </span>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeNotification(notif.id);
                                    }}
                                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-border text-text-secondary hover:text-danger transition-colors bg-transparent border-none"
                                    title="알림 삭제"
                                >
                                    <span className="material-icons-round text-base">close</span>
                                </button>

                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
