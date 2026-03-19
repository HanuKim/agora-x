/**
 * Mypage.tsx
 *
 * 마이페이지 — 좌측 프로필 사이드바 + 우측 탭 콘텐츠.
 * tabs: 내 정보 관리 | 내가 작성한 게시물/의견 | 스크랩한 게시물 | 공감한 의견
 *
 * Layout: max-w-[1200px], height 100vh with scroll
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../features/auth';
import { useUserPrefs } from '../features/user';
import { useProposals } from '../features/proposal/useProposals';
import { useGamification } from '../features/user/hooks/useGamification';
import { useNewsWithAISummary } from '../features/news/useNewsWithAISummary';
import { getScrapedArticles, type ArticleScrap } from '../services/db/gamificationDB';
import { getAllOpinions, type Proposal } from '../services/db/proposalDB';
import { getProposals } from '../services/db/proposalDB';
import { getLikedDiscussions } from '../services/db/detailDB';

// MyPage components
import { ProfileSidebar, type MyPageTab } from '../components/mypage/ProfileSidebar';
import { MyInfoTab } from '../components/mypage/MyInfoTab';
import { MyPostsTab, type MyOpinionItem } from '../components/mypage/MyPostsTab';
import { getChatHistories, type ChatHistoryEntry } from '../services/db/historyDB';
import { ScrapTab } from '../components/mypage/ScrapTab';

import { LikedOpinionsTab, type LikedOpinionItem } from '../components/mypage/LikedOpinionsTab';
import { GlobalDialog } from '../components/common/GlobalDialog';

// For article title lookup (scrap display)
import rawNewsData from '../data/selectedNews.json';

const allRawArticles = (rawNewsData as { selectedNews: Record<string, unknown>[] }).selectedNews;
const articleTitleMap = new Map<number, { title: string; topic: string }>();
allRawArticles.forEach((item, idx) => {
    const article = item.article as Record<string, unknown>;
    articleTitleMap.set(idx + 1, {
        title: (article?.title as string) ?? `기사 #${idx + 1}`,
        topic: (item.topic as string) ?? '',
    });
});

export const Mypage: React.FC = () => {
    const { user, logout } = useAuth();
    const { knowledgePrefs, setKnowledgeLevel } = useUserPrefs();
    const { fetchUserInteractions, fetchLikedOpinions } = useProposals();
    const { userLevel, fetchUserLevel, getProgressToNextLevel, initLevel } = useGamification();
    const { items: newsItems } = useNewsWithAISummary();

    const [activeTab, setActiveTab] = useState<MyPageTab>('info');
    const [scrapedProposals, setScrapedProposals] = useState<Proposal[]>([]);
    const [scrapedArticles, setScrapedArticles] = useState<ArticleScrap[]>([]);
    const [likedOpinions, setLikedOpinions] = useState<LikedOpinionItem[]>([]);
    const [myProposals, setMyProposals] = useState<Proposal[]>([]);
    const [myOpinions, setMyOpinions] = useState<MyOpinionItem[]>([]);
    const [myHistories, setMyHistories] = useState<ChatHistoryEntry[]>([]);

    // Profile image from localStorage
    const [profileImage, setProfileImage] = useState<string | undefined>(() => {
        if (!user) return undefined;
        return localStorage.getItem(`agora-x-profile-img-${user.id}`) ?? user.picture;
    });

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingImage, setPendingImage] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!user) return;

        // 공감한 의견은 다른 로직과 분리해 먼저 로드해 항상 탭에 반영
        const loadLikedOpinions = async () => {
            try {
                const [likedFromProposals, likedDiscussions] = await Promise.all([
                    fetchLikedOpinions(user.id),
                    Promise.resolve(getLikedDiscussions(user.id)),
                ]);
                setLikedOpinions([
                    ...likedFromProposals,
                    ...likedDiscussions.map((d) => ({ opinion: null, proposal: null, discussion: d })),
                ]);
            } catch (err) {
                console.error('[Mypage] Liked opinions load failed:', err);
                try {
                    setLikedOpinions(await fetchLikedOpinions(user.id));
                } catch {
                    setLikedOpinions([]);
                }
            }
        };
        void loadLikedOpinions();

        // Init level if first visit
        await initLevel(user.id);
        await fetchUserLevel(user.id);

        // Scraps
        const interactions = await fetchUserInteractions(user.id);
        setScrapedProposals(interactions.scraped);

        const artScraps = await getScrapedArticles(user.id);
        setScrapedArticles(artScraps);

        // My posts & opinions (국민 제안 / 국민제안 의견 / 국민토론 의견 — 각각 별도 배열로 동일 패턴)
        const allProposals = await getProposals();
        const mine = allProposals.filter((p) => p.authorId === user.id);
        setMyProposals(mine);

        const allOps = await getAllOpinions();
        const proposalMap = new Map(allProposals.map((p) => [p.id, p]));
        const myOps = allOps
            .filter((op) => op.authorId === user.id)
            .map((op) => ({
                opinion: op,
                proposal: proposalMap.get(op.proposalId) ?? null,
            }));
        setMyOpinions(myOps);

        // Fetch AI Discussions & Arena histories
        setMyHistories(getChatHistories().filter(h => h.messages && h.messages.length > 0));
    }, [user, initLevel, fetchUserLevel, fetchUserInteractions, fetchLikedOpinions]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleProfileImageChange = (base64: string) => {
        if (!user) return;
        setPendingImage(base64);
        setIsConfirmOpen(true);
    };

    const confirmProfileImageChange = () => {
        if (!user || !pendingImage) return;
        localStorage.setItem(`agora-x-profile-img-${user.id}`, pendingImage);
        setProfileImage(pendingImage);
        setIsConfirmOpen(false);
        setPendingImage(null);
    };

    const xpProgress = userLevel
        ? getProgressToNextLevel(userLevel.xp, userLevel.level)
        : 0;

    return (
        <div className="px-xl py-xl w-full max-w-[1200px] mx-auto h-[calc(100vh-64px)] flex flex-col">
            <h1 className="text-[2.25rem] font-extrabold text-text-primary mb-xl shrink-0">마이페이지</h1>

            <div className="flex flex-col lg:flex-row gap-xl flex-1 min-h-0">
                {/* Left: Profile Sidebar (fixed) */}
                <div className="shrink-0 lg:overflow-y-auto lg:h-full">
                    <ProfileSidebar
                        userName={user?.name ?? '게스트'}
                        userEmail={user?.email ?? '로그인이 필요합니다'}
                        userPicture={profileImage}
                        provider={user?.provider}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        userLevel={userLevel}
                        xpProgress={xpProgress}
                        onLogout={logout}
                        onProfileImageChange={handleProfileImageChange}
                    />
                </div>

                {/* Right: Tab Content (scrollable) */}
                <div className="flex-1 min-w-0 overflow-y-auto lg:h-full">
                    {activeTab === 'info' && (
                        <MyInfoTab
                            knowledgePrefs={knowledgePrefs}
                            onKnowledgeLevelChange={setKnowledgeLevel}
                            userLevel={userLevel}
                        />
                    )}
                    {activeTab === 'myposts' && (
                        <MyPostsTab
                            myProposals={myProposals}
                            myOpinions={myOpinions}
                            myHistories={myHistories}
                            userId={user?.id}
                        />
                    )}
                    {activeTab === 'scraps' && (
                        <ScrapTab
                            scrapedProposals={scrapedProposals}
                            scrapedArticles={scrapedArticles}
                            articleTitleMap={articleTitleMap}
                            newsItems={newsItems.map((i) => ({ ...i, url: i.articleUrl }))}
                        />
                    )}
                    {activeTab === 'liked' && (
                        <LikedOpinionsTab items={likedOpinions} />
                    )}
                </div>
            </div>

            <GlobalDialog
                isOpen={isConfirmOpen}
                title="프로필 이미지 변경"
                message="프로필 이미지를 변경하시겠습니까?"
                onConfirm={confirmProfileImageChange}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </div>
    );
};
