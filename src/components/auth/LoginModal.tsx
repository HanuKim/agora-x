import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../features/auth/hooks/useAuth';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY as string;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID as string;

// Popup window dimensions — matches Google's OAuth popup size
const POPUP_W = 500;
const POPUP_H = 700;
function openPopup(url: string, name: string): Window | null {
    const left = window.screenX + (window.outerWidth - POPUP_W) / 2;
    const top = window.screenY + (window.outerHeight - POPUP_H) / 2;
    return window.open(url, name, `width=${POPUP_W},height=${POPUP_H},left=${left},top=${top},scrollbars=yes`);
}

export const LoginModal: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();

    // Close the modal once login succeeds (message listener in App.tsx calls login())
    // We watch isLoginModalOpen — if it was open and user is now logged in, close it.
    // (Auth state change triggers re-render; LoginModal returns null when closed.)

    // ── Google ────────────────────────────────────────────────────────────────
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await res.json();
                login({
                    id: userInfo.sub,
                    name: userInfo.name,
                    email: userInfo.email,
                    picture: userInfo.picture,
                    provider: 'google',
                });
            } catch {
                alert('Google 로그인에 실패했습니다. 다시 시도해 주세요.');
            }
        },
        onError: () => alert('Google 로그인이 취소되었거나 실패했습니다.'),
    });

    // ── Kakao ─────────────────────────────────────────────────────────────────
    // Kakao only supports response_type=code (implicit grant was removed in SDK 2.x).
    // The popup returns ?code= via OAuthCallbackBridge → App.tsx exchanges it for
    // a real access token via Vite proxy → fetches real Kakao user profile.
    const handleKakaoLogin = () => {
        if (!KAKAO_JS_KEY) {
            alert('VITE_KAKAO_JS_KEY가 .env.local에 설정되지 않았습니다.');
            return;
        }

        // Prefix state with 'kakao_' so OAuthCallbackBridge can identify the provider
        const state = `kakao_${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem('kakao_oauth_state', state);

        const params = new URLSearchParams({
            client_id: KAKAO_JS_KEY,
            redirect_uri: window.location.origin,
            response_type: 'code',
            state,
        });

        const popup = openPopup(
            `https://kauth.kakao.com/oauth/authorize?${params.toString()}`,
            'kakao_login',
        );
        if (!popup) {
            alert('팝업이 차단되었습니다. 브라우저 팝업 허용 설정 후 다시 시도해 주세요.');
        }
    };

    // ── Naver ─────────────────────────────────────────────────────────────────
    // Naver only supports authorization code flow (response_type=code).
    // The popup redirects back to origin with ?code=. OAuthCallbackBridge in
    // App.tsx detects this, postMessages the code to the main window, and closes.
    const handleNaverLogin = () => {
        if (!NAVER_CLIENT_ID) {
            alert('VITE_NAVER_CLIENT_ID가 .env.local에 설정되지 않았습니다.');
            return;
        }

        // Prefix state with 'naver_' so OAuthCallbackBridge can identify the provider
        const state = `naver_${Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem('naver_oauth_state', state);

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: NAVER_CLIENT_ID,
            state,
            redirect_uri: window.location.origin,
        });

        const popup = openPopup(
            `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`,
            'naver_login',
        );
        if (!popup) {
            alert('팝업이 차단되었습니다. 브라우저 팝업 허용 설정 후 다시 시도해 주세요.');
        }
    };

    if (!isLoginModalOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-overlay backdrop-blur-sm flex items-center justify-center z-[1000] p-md"
            onClick={closeLoginModal}
        >
            <div className="w-full max-w-[400px]" onClick={(e) => e.stopPropagation()}>
                <Card variant="glass" className="w-full text-center bg-bg!">
                    {/* Header */}
                    <div className="mb-xl">
                        <h2 className="text-[1.75rem] font-bold text-text-primary mb-xs">Sign In</h2>
                        <p className="text-sm text-text-secondary">Log in to participate in the discussion.</p>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex flex-col gap-md">
                        <Button
                            fullWidth
                            className="bg-social-google! text-text-primary! dark:text-text-inverse! border-1! border-border!"
                            onClick={() => handleGoogleLogin()}
                        >
                            Continue with Google
                        </Button>
                        <Button
                            fullWidth
                            className="bg-social-kakao! text-text-primary! dark:text-text-inverse! border-0!"
                            onClick={handleKakaoLogin}
                        >
                            Continue with Kakao
                        </Button>
                        <Button
                            fullWidth
                            className="bg-social-naver! text-text-primary! dark:text-text-inverse! border-0!"
                            onClick={handleNaverLogin}
                        >
                            Continue with Naver
                        </Button>
                    </div>
                    {/* 다크모드/라이트모드 로고 전환 */}
                    <img src="/logo-dark.png" alt="Agora-X Logo" className="hidden dark:block h-12 mt-lg object-contain mx-auto" />
                    <img src="/logo.png" alt="Agora-X Logo" className="block dark:hidden h-12 mt-lg object-contain mx-auto" />
                    <button
                        onClick={closeLoginModal}
                        className="mt-lg bg-none border-0 text-text-secondary cursor-pointer text-sm underline font-sans"
                    >
                        Close
                    </button>
                </Card>
            </div>
        </div>
    );
};
