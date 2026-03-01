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
const Guide = React.lazy(() => import('../pages/Guide').then(m => ({ default: m.Guide })));

const LoadingFallback = () => (
    <div className="flex justify-center p-[50px]">Loading...</div>
);

// App Router Configuration
export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Suspense fallback={<LoadingFallback />}>
                <MainLayout />
            </Suspense>
        ),
        children: [
            { path: '/', element: <Home /> },
            { path: '/detail', element: <Detail /> },
            { path: '/community', element: <Community /> },
            { path: '/ai-discussion', element: <DiscussionAI /> },
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
            <Suspense fallback={<LoadingFallback />}>
                <Login />
            </Suspense>
        ),
    },
]);
