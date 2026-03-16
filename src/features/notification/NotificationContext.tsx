/**
 * NotificationContext.tsx
 *
 * Global notification state management.
 * Wraps the app to provide notification count and actions.
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
    getNotifications,
    getUnreadCount,
    createNotification as dbCreateNotification,
    markAsRead as dbMarkAsRead,
    markAllAsRead as dbMarkAllAsRead,
    deleteNotification as dbDeleteNotification,
    type AppNotification,
    type NotificationType,
} from '../../services/db/notificationDB';
import { useAuth } from '../auth';

export interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    isModalOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
    addNotification: (type: NotificationType, message: string, targetUrl?: string) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    removeNotification: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refresh = useCallback(async () => {
        if (!user) return;
        const [notifs, count] = await Promise.all([
            getNotifications(user.id),
            getUnreadCount(user.id),
        ]);
        setNotifications(notifs);
        setUnreadCount(count);
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addNotification = useCallback(
        async (type: NotificationType, message: string, targetUrl?: string) => {
            if (!user) return;
            await dbCreateNotification({
                id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                userId: user.id,
                type,
                message,
                targetUrl,
                isRead: false,
                createdAt: Date.now(),
            });
            await refresh();
        },
        [user, refresh]
    );

    const markAsRead = useCallback(
        async (id: string) => {
            await dbMarkAsRead(id);
            await refresh();
        },
        [refresh]
    );

    const markAllAsRead = useCallback(async () => {
        if (!user) return;
        await dbMarkAllAsRead(user.id);
        await refresh();
    }, [user, refresh]);

    const removeNotification = useCallback(
        async (id: string) => {
            await dbDeleteNotification(id);
            await refresh();
        },
        [refresh]
    );

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                isModalOpen,
                openModal: () => setIsModalOpen(true),
                closeModal: () => setIsModalOpen(false),
                addNotification,
                markAsRead,
                markAllAsRead,
                removeNotification,
                refresh,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};
