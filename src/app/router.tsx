import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../features/auth';
import React, { Suspense } from 'react';

// Lazy loaded routes for bundle optimization
const Home = React.lazy(() => import('../pages/Home').then(m => ({ default: m.Home })));
const Detail = React.lazy(() => import('../pages/Detail').then(m => ({ default: m.Detail })));
const Community = React.lazy(() => import('../pages/Community').then(m => ({ default: m.Community })));
const Mypage = React.lazy(() => import('../pages/Mypage').then(m => ({ default: m.Mypage })));
const Login = React.lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const DiscussionAI = React.lazy(() => import('../pages/DiscussionAI').then(m => ({ default: m.DiscussionAI })));
const DiscussionAIDetail = React.lazy(() => import('../pages/DiscussionAIDetail').then(m => ({ default: m.DiscussionAIDetail })));
const ProposalList = React.lazy(() => import('../pages/ProposalList').then(m => ({ default: m.ProposalList })));
const ProposalCreate = React.lazy(() => import('../pages/ProposalCreate').then(m => ({ default: m.ProposalCreate })));
const ProposalDetail = React.lazy(() => import('../pages/ProposalDetail').then(m => ({ default: m.ProposalDetail })));
const DiscussionArena = React.lazy(() => import('../pages/DiscussionArena').then(m => ({ default: m.DiscussionArena })));
const Guide = React.lazy(() => import('../pages/Guide').then(m => ({ default: m.Guide })));

const loadingFallback = <div className="flex justify-center p-[50px]">Loading...</div>;

// App Router Configuration
export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Suspense fallback={loadingFallback}>
                <MainLayout />
            </Suspense>
        ),
        children: [
            { path: '/', element: <Home /> },
            { path: '/detail/:id', element: <Detail /> },
            { path: '/detail/:id/arena', element: <DiscussionArena /> },
            { path: '/community', element: <Community /> },
            { path: '/ai-discussion', element: <DiscussionAI /> },
            { path: '/ai-discussion/custom', element: <DiscussionAIDetail /> },
            { path: '/ai-discussion/custom/:customId', element: <DiscussionAIDetail /> },
            { path: '/ai-discussion/:id', element: <DiscussionAIDetail /> },
            { path: '/proposals', element: <ProposalList /> },
            { path: '/proposals/new', element: <ProposalCreate /> },
            { path: '/proposals/:id/edit', element: <ProposalCreate /> },
            { path: '/proposals/:id', element: <ProposalDetail /> },
            { path: '/guide', element: <Guide /> },
            {
                path: '/mypage',
                element: (
                    <ProtectedRoute>
                        <Mypage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
    {
        path: '/login',
        element: (
            <Suspense fallback={loadingFallback}>
                <Login />
            </Suspense>
        ),
    },
]);
