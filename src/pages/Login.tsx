import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../features/auth';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await res.json();
                login({ id: userInfo.sub, name: userInfo.name, email: userInfo.email, picture: userInfo.picture, provider: 'google' });
                navigate('/');
            } catch {
                alert('Google Login failed. Please try again.');
            }
        },
        onError: () => console.error('Google Login Failed'),
    });

    return (
        <div className="flex items-center justify-center min-h-screen p-md bg-bg">
            <Card variant="glass" className="w-full max-w-[400px] text-center">
                {/* Logo */}
                <div className="mb-xl">
                    <img src="/logo.png" alt="Agora-X Logo" className="h-[60px] mb-md object-contain mx-auto" />
                    <h1 className="text-[2.25rem] font-bold text-text-primary mb-sm">Agora-X</h1>
                </div>

                <p className="text-text-secondary mb-xl font-sans">
                    Sign in to access curated news and discussions.
                </p>

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
                        onClick={() => alert('Kakao login will be implemented soon!')}
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
            </Card>
        </div>
    );
};
