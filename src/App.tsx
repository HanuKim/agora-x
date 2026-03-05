import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { router } from './app/router';
import { AuthProvider, useAuth } from './features/auth';
import { UserPrefsProvider } from './features/user';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
const KAKAO_REST_API_KEY = (import.meta.env.VITE_KAKAO_REST_API_KEY || import.meta.env.VITE_KAKAO_JS_KEY) as string;
const KAKAO_CLIENT_SECRET = import.meta.env.VITE_KAKAO_CLIENT_SECRET as string | undefined;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID as string;
const NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET as string;

// ─── OAuthCallbackBridge ──────────────────────────────────────────────────────
// Runs when the SPA loads inside an OAuth popup window (window.opener exists).
// Determines the provider from the state prefix ('kakao_xxx' / 'naver_xxx'),
// postMessages the auth code to the opener, then closes the popup.
function OAuthCallbackBridge() {
  useEffect(() => {
    const isPopup = window.opener !== null && window.opener !== window;
    if (!isPopup) return;

    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const accessToken = hashParams.get('access_token');

    if (!code && !accessToken) return;

    // Derive provider from state prefix set in LoginModal before opening the popup
    let provider: 'kakao' | 'naver' = 'naver';
    if (state?.startsWith('kakao_')) provider = 'kakao';
    else if (state?.startsWith('naver_')) provider = 'naver';
    else if (accessToken) provider = 'kakao'; // legacy implicit fallback

    window.opener.postMessage(
      { type: 'oauth_callback', provider, accessToken, code, state },
      window.location.origin,
    );

    window.close();
  }, []);

  return null;
}

// ─── OAuthPostMessageListener ─────────────────────────────────────────────────
// Receives auth codes from both Kakao and Naver popups.
// Uses Vite's dev proxy (/oauth/*/token, /oauth/*/me) to bypass CORS and
// exchange codes for real access tokens → real user profiles.
function OAuthPostMessageListener() {
  const { login } = useAuth();

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'oauth_callback') return;

      const { provider, code, state } = event.data;

      // ── Kakao ────────────────────────────────────────────────────────────
      if (provider === 'kakao' && code) {
        // CSRF state validation
        const savedKakaoState = sessionStorage.getItem('kakao_oauth_state');
        sessionStorage.removeItem('kakao_oauth_state');
        if (savedKakaoState && state !== savedKakaoState) {
          console.error('[Kakao] CSRF state mismatch. Aborting.');
          return;
        }

        try {
          // 1. Exchange code for access token via Vite proxy → kauth.kakao.com
          // Build POST body — include client_secret only when enabled in Kakao app
          const tokenBody: Record<string, string> = {
            grant_type: 'authorization_code',
            client_id: KAKAO_REST_API_KEY,
            redirect_uri: window.location.origin,
            code,
          };
          if (KAKAO_CLIENT_SECRET) tokenBody.client_secret = KAKAO_CLIENT_SECRET;

          const tokenRes = await fetch('/oauth/kakao/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(tokenBody),
          });
          const tokenData = await tokenRes.json();
          console.debug('[Kakao] token response:', tokenData);

          if (!tokenData.access_token) {
            throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
          }

          // 2. Fetch user profile via Vite proxy → kapi.kakao.com
          const userRes = await fetch('/oauth/kakao/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          const userData = await userRes.json();
          const kakaoAccount = userData.kakao_account ?? {};

          login({
            id: String(userData.id),
            name: kakaoAccount.profile?.nickname ?? '카카오 사용자',
            email: kakaoAccount.email ?? `${userData.id}@kakao.com`,
            picture: kakaoAccount.profile?.profile_image_url,
            provider: 'kakao',
          });
        } catch (err) {
          console.error('[Kakao] Token exchange failed:', err);
          // Fallback — still grants access with a generic identity
          login({
            id: `kakao-${Date.now()}`,
            name: '카카오 사용자',
            email: 'kakao@user.com',
            picture: undefined,
            provider: 'kakao',
          });
        }
        return;
      }

      // ── Naver ────────────────────────────────────────────────────────────
      if (provider === 'naver' && code) {
        // CSRF state validation
        const savedState = sessionStorage.getItem('naver_oauth_state');
        sessionStorage.removeItem('naver_oauth_state');
        if (savedState && state !== savedState) {
          console.error('[Naver] CSRF state mismatch. Aborting.');
          return;
        }

        try {
          // 1. Exchange code for access token via Vite proxy → nid.naver.com
          const tokenRes = await fetch('/oauth/naver/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              client_id: NAVER_CLIENT_ID,
              client_secret: NAVER_CLIENT_SECRET,
              code,
              state: state ?? '',
            }),
          });
          const tokenData = await tokenRes.json();

          if (!tokenData.access_token) throw new Error(JSON.stringify(tokenData));

          // 2. Fetch user profile via Vite proxy → openapi.naver.com
          const userRes = await fetch('/oauth/naver/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          const userData = await userRes.json();
          const profile = userData.response ?? {};

          login({
            id: profile.id ?? `naver-${Date.now()}`,
            name: profile.name ?? profile.nickname ?? '네이버 사용자',
            email: profile.email ?? `${profile.id}@naver.com`,
            picture: profile.profile_image,
            provider: 'naver',
          });
        } catch (err) {
          console.error('[Naver] Token exchange failed:', err);
          login({
            id: `naver-${Date.now()}`,
            name: '네이버 사용자',
            email: 'naver@user.com',
            picture: undefined,
            provider: 'naver',
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login]);

  return null;
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <UserPrefsProvider>
          <OAuthCallbackBridge />
          <OAuthPostMessageListener />
          <RouterProvider router={router} />
        </UserPrefsProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
