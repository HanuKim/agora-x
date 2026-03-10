import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../features/auth';
import React, { Suspense } from 'react';

// Lazy loaded routes for bundle optimization
const Home = React.lazy(() => import('../pages/Home').then(m => ({ default: m.Home })));
const Detail = React.lazy(() => import('../pages/Detail').then(m => ({ default: m.Detail })));
const Community = React.lazy(() => import('../pages/Community').then(m => ({ default: m.Community })));
const Profile = React.lazy(() => import('../pages/Profile').then(m => ({ default: m.Profile })));
const Login = React.lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const DiscussionAI = React.lazy(() => import('../pages/DiscussionAI').then(m => ({ default: m.DiscussionAI })));
const DiscussionAIDetail = React.lazy(() => import('../pages/DiscussionAIDetail').then(m => ({ default: m.DiscussionAIDetail })));
const ProposalList = React.lazy(() => import('../pages/ProposalList').then(m => ({ default: m.ProposalList })));
const ProposalCreate = React.lazy(() => import('../pages/ProposalCreate').then(m => ({ default: m.ProposalCreate })));
const ProposalDetail = React.lazy(() => import('../pages/ProposalDetail').then(m => ({ default: m.ProposalDetail })));
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
            { path: '/community', element: <Community /> },
            { path: '/ai-discussion', element: <DiscussionAI /> },
            { path: '/ai-discussion/:id', element: <DiscussionAIDetail /> },
            { path: '/proposals', element: <ProposalList /> },
            { path: '/proposals/new', element: <ProposalCreate /> },
            { path: '/proposals/:id', element: <ProposalDetail /> },
            { path: '/guide', element: <Guide /> },
            {
                path: '/profile',
                element: (
                    <ProtectedRoute>
                        <Profile />
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
