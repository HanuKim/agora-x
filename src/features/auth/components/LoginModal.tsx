import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

declare global {
    interface Window {
        Kakao: any;
    }
}

export const LoginModal: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();

    React.useEffect(() => {
        const kakaoJsKey = import.meta.env.VITE_KAKAO_JS_KEY as string;
        if (window.Kakao && !window.Kakao.isInitialized() && kakaoJsKey) {
            window.Kakao.init(kakaoJsKey);
        }
    }, []);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await res.json();
                login({ id: userInfo.sub, name: userInfo.name, email: userInfo.email, picture: userInfo.picture, provider: 'google' });
            } catch {
                alert('Google Login failed. Please try again.');
            }
        },
        onError: () => console.error('Google Login Failed'),
    });

    const handleKakaoLogin = () => {
        if (!window.Kakao) { alert('Kakao SDK fails to load.'); return; }
        window.Kakao.Auth.login({
            success: (_authObj: any) => {
                window.Kakao.API.request({
                    url: '/v2/user/me',
                    success: (res: any) => {
                        const kakaoAccount = res.kakao_account;
                        login({ id: res.id.toString(), name: kakaoAccount.profile?.nickname || '카카오 사용자', email: kakaoAccount.email || `${res.id}@kakao.com`, picture: kakaoAccount.profile?.profile_image_url, provider: 'kakao' });
                    },
                    fail: () => alert('카카오 프로필을 가져오는데 실패했습니다.'),
                });
            },
            fail: () => alert('카카오 로그인이 취소되었거나 실패했습니다.'),
        });
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
                        <img src="/logo.png" alt="Agora-X Logo" className="h-12 mb-md object-contain mx-auto" />
                        <h2 className="text-[1.75rem] font-bold text-text-primary mb-xs">Sign In</h2>
                        <p className="text-sm text-text-secondary">Log in to participate in the discussion.</p>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex flex-col gap-md">
                        <Button
                            fullWidth
                            className="bg-social-google! text-text-primary! border border-border!"
                            onClick={() => handleGoogleLogin()}
                        >
                            Continue with Google
                        </Button>
                        <Button
                            fullWidth
                            className="bg-social-kakao! text-text-primary! border-0!"
                            onClick={handleKakaoLogin}
                        >
                            Continue with Kakao
                        </Button>
                        <Button
                            fullWidth
                            className="bg-social-naver! text-text-inverse! border-0!"
                            onClick={() => alert('Naver login will be implemented soon!')}
                        >
                            Continue with Naver
                        </Button>
                    </div>

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
