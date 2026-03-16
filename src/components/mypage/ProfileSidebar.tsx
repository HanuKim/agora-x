/**
 * ProfileSidebar.tsx
 *
 * Left sidebar for MyPage showing user profile, level/XP,
 * manner score, and tab navigation.
 */

import React, { useRef } from 'react';
import { Card } from '../ui/Card';
import { theme } from '../../design/theme';
import type { UserLevel } from '../../services/db/gamificationDB';
import { LEVEL_THRESHOLDS } from '../../services/db/gamificationDB';
import { Button } from '../ui/Button';

export type MyPageTab = 'info' | 'myposts' | 'scraps' | 'liked';

interface ProfileSidebarProps {
    userName: string;
    userEmail: string;
    userPicture?: string;
    provider?: string;
    activeTab: MyPageTab;
    onTabChange: (tab: MyPageTab) => void;
    userLevel: UserLevel | null;
    xpProgress: number;
    onLogout: () => void;
    onProfileImageChange: (base64: string) => void;
}

const TAB_ITEMS: { key: MyPageTab; icon: string; label: string }[] = [
    { key: 'info', icon: 'person', label: '내 정보 관리' },
    { key: 'myposts', icon: 'edit_note', label: '내가 작성한 게시물/의견' },
    { key: 'scraps', icon: 'bookmark', label: '스크랩한 게시물' },
    { key: 'liked', icon: 'thumb_up', label: '공감한 의견' },
];

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
    userName,
    userEmail,
    userPicture,
    provider,
    activeTab,
    onTabChange,
    userLevel,
    xpProgress,
    onLogout,
    onProfileImageChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            onProfileImageChange(base64);
        };
        reader.readAsDataURL(file);
    };

    const levelInfo = userLevel
        ? LEVEL_THRESHOLDS.find((t) => t.level === userLevel.level)
        : null;

    return (
        <div className="w-full lg:w-[280px] shrink-0">
            <Card className="px-xl pt-xl pb-md">
                {/* Profile Image */}
                <div className="flex flex-col items-center mb-lg">
                    <div
                        className="relative cursor-pointer group mb-md"
                        onClick={handleImageClick}
                    >
                        {userPicture ? (
                            <img
                                src={userPicture}
                                alt={userName}
                                className="w-[88px] h-[88px] rounded-full object-cover border-2 border-border"
                            />
                        ) : (
                            <div className="w-[88px] h-[88px] rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold select-none border-2 border-border">
                                {userName?.[0] ?? '?'}
                            </div>
                        )}
                        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-icons-round text-white text-xl">
                                camera_alt
                            </span>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <p className="text-lg font-bold text-text-primary mb-xs text-center">
                        {userName}
                    </p>
                    <p className="text-sm text-text-secondary mb-xs text-center truncate max-w-full">
                        {userEmail}
                    </p>
                    {provider && (
                        <span className={`${theme.badge.base} ${theme.badge.muted}`}>
                            {provider}
                        </span>
                    )}
                </div>

                {/* Level & XP */}
                {userLevel && (
                    <div className="border-t border-border pt-md mb-lg">
                        <div className="flex items-center justify-between mb-sm">
                            <span className="text-xs font-bold text-text-secondary">레벨</span>
                            <span className="text-sm font-bold text-primary">
                                Lv.{userLevel.level}{' '}
                                <span className="text-text-secondary font-medium">
                                    {levelInfo?.label}
                                </span>
                            </span>
                        </div>
                        <div className="w-full h-[6px] bg-surface rounded-full overflow-hidden mb-xs">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${xpProgress}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-text-secondary text-right">
                            {userLevel.xp} XP
                        </p>

                        {/* Manner Score */}
                        <div className="flex items-center justify-between mt-md">
                            <span className="text-xs font-bold text-text-secondary">매너 점수</span>
                            <span
                                className={`text-sm font-bold ${userLevel.mannerScore >= 80
                                    ? 'text-green-500'
                                    : userLevel.mannerScore >= 50
                                        ? 'text-amber-500'
                                        : 'text-danger'
                                    }`}
                            >
                                {userLevel.mannerScore}점
                            </span>
                        </div>
                        <div className="w-full h-[6px] bg-surface rounded-full overflow-hidden mt-xs">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${userLevel.mannerScore >= 80
                                    ? 'bg-green-500'
                                    : userLevel.mannerScore >= 50
                                        ? 'bg-amber-500'
                                        : 'bg-danger'
                                    }`}
                                style={{ width: `${userLevel.mannerScore}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <nav className="flex flex-col gap-xs">
                    {TAB_ITEMS.map(({ key, icon, label }) => (
                        <button
                            key={key}
                            onClick={() => onTabChange(key)}
                            className={`flex items-center gap-sm px-md py-sm rounded-lg text-sm font-medium transition-all duration-200 border-none cursor-pointer ${activeTab === key
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary'
                                }`}
                        >
                            <span className="material-icons-round text-lg">{icon}</span>
                            {label}
                        </button>
                    ))}
                </nav>
                {/* Logout */}
                <div className="flex justify-end mt-md">
                    <Button variant="outline" size="sm" onClick={onLogout}>
                        로그아웃
                    </Button>
                </div>
            </Card>
        </div>
    );
};
