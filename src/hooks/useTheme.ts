/**
 * useTheme — 다크/라이트 모드 관리 훅
 *
 * - localStorage에 테마 설정을 지속 저장
 * - <html> 엘리먼트에 'dark' 클래스를 토글
 * - OS 기본 설정(prefers-color-scheme)을 초기값으로 사용
 *
 * 사용:
 *   const { isDark, toggleTheme } = useTheme();
 */
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'agora-x-theme';

function getInitialTheme(): boolean {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(isDark: boolean) {
    document.documentElement.classList.toggle('dark', isDark);
}

export function useTheme() {
    const [isDark, setIsDark] = useState<boolean>(() => {
        const initial = getInitialTheme();
        applyTheme(initial);
        return initial;
    });

    useEffect(() => {
        applyTheme(isDark);
        localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = () => setIsDark((prev) => !prev);

    return { isDark, toggleTheme };
}
