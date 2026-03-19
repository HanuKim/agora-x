/**
 * Detail / 시민 토론장 관련 타입 (useDetail에서 사용)
 * 단일 소스: features/detail/useCivilStance.ts
 */

/** Stance in civil discussion (찬성 / 반대 / 중립) */
export type CivilStance = 'pro' | 'con' | 'neutral';

export interface CivilComment {
  id: string;
  authorName: string;
  authorId?: string;
  stance: CivilStance;
  body: string;
  timeAgo: string;
  createdAt?: string;
  score: number;
  avatarGradient?: string;
  replies?: CivilReply[];
  moreRepliesCount?: number;
}

export interface CivilReply {
  id: string;
  authorName: string;
  authorId?: string;
  stance: CivilStance;
  body: string;
  timeAgo: string;
  createdAt?: string;
  curveHeight?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stance preference (DiscussionInput ↔ ReplyInput sync)
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useSyncExternalStore } from 'react';

type StanceListener = (payload: { key: string; stance: CivilStance }) => void;
const stanceListeners = new Set<StanceListener>();

function stanceStorageKey(issueId: string, userId: string) {
  return `agora-civil-stance:${userId}:${issueId}`;
}

function readStoredStance(key: string): CivilStance | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === 'pro' || raw === 'con' || raw === 'neutral') return raw;
    return null;
  } catch {
    return null;
  }
}

function writeStoredStance(key: string, stance: CivilStance) {
  try {
    localStorage.setItem(key, stance);
  } catch {
    // ignore
  }
}

export function setCivilStancePreference(params: { issueId: string; userId: string; stance: CivilStance }) {
  const key = stanceStorageKey(params.issueId, params.userId);
  writeStoredStance(key, params.stance);
  stanceListeners.forEach((fn) => fn({ key, stance: params.stance }));
}

/**
 * 기사(issueId) + 사용자(userId) 단위로 "현재 선택한 stance"를 실시간 동기화합니다.
 * - localStorage에 영구 저장
 * - 같은 탭 내 컴포넌트 간 즉시 브로드캐스트
 * - 다른 탭 간에는 storage 이벤트로 동기화
 */
export function useCivilStancePreference(params: {
  issueId?: string;
  userId?: string;
  defaultStance: CivilStance;
}) {
  const key = useMemo(() => {
    if (!params.issueId || !params.userId) return null;
    return stanceStorageKey(params.issueId, params.userId);
  }, [params.issueId, params.userId]);

  const stance = useSyncExternalStore(
    (onStoreChange) => {
      if (!key) return () => {};

      const listener: StanceListener = (payload) => {
        if (payload.key !== key) return;
        onStoreChange();
      };
      stanceListeners.add(listener);

      const onStorage = (e: StorageEvent) => {
        if (e.key !== key) return;
        onStoreChange();
      };
      window.addEventListener('storage', onStorage);

      return () => {
        stanceListeners.delete(listener);
        window.removeEventListener('storage', onStorage);
      };
    },
    () => {
      if (!key) return params.defaultStance;
      return readStoredStance(key) ?? params.defaultStance;
    },
    () => params.defaultStance
  );

  const update = (next: CivilStance) => {
    if (!params.issueId || !params.userId) {
      return;
    }
    setCivilStancePreference({ issueId: params.issueId, userId: params.userId, stance: next });
  };

  return { stance, setStance: update };
}
