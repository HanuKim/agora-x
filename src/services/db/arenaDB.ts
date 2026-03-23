/**
 * arenaDB.ts
 *
 * localStorage-based storage for the AI-mediated discussion arena.
 * Manages opinions (50 per article), sessions, and stance-change tracking.
 */

import type { ArenaOpinion, ArenaSession } from '../../features/common/types';
import { generateNickname } from '../../utils/nicknameGenerator';

const OPINIONS_KEY = 'agora-arena-opinions';
const SESSIONS_KEY = 'agora-arena-sessions';
const STANCE_CHANGES_KEY = 'agora-arena-stance-changes';

/* ── Storage helpers ──────────────────────────────────────── */

function getJSON<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function setJSON(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch { /* quota errors — ignore */ }
}

/* ── Dummy opinion generation ─────────────────────────────── */

const PRO_TEMPLATES = [
    '이 정책은 장기적으로 사회적 비용을 절감하고 국민 삶의 질을 높일 수 있습니다. 선진국의 성공 사례가 이를 뒷받침합니다.',
    '국민의 안전과 권익을 위해 반드시 필요한 변화입니다. 더 이상 미룰 수 없는 시대적 과제라고 생각합니다.',
    '전문가들의 연구와 데이터를 종합하면 도입의 실익이 분명합니다. 빠르게 추진할수록 효과가 클 것입니다.',
    '현재 시스템의 한계가 명확히 드러났습니다. 새로운 접근이 필요하며, 이 방향이 가장 합리적입니다.',
    '사회적 약자를 보호하고 공정한 기회를 보장하기 위해 이러한 제도적 장치가 필수적입니다.',
    '글로벌 트렌드에 맞춰 우리도 변화해야 합니다. 뒤처진다면 국가 경쟁력에 큰 타격이 될 수 있습니다.',
    '단기적으로는 비용이 발생하지만, 중장기적 관점에서 보면 투자 대비 효과가 매우 클 것으로 예상됩니다.',
    '이미 법적·제도적 기반이 마련되어 있으므로, 실행에 옮기는 것이 중요합니다. 논의만으로는 변화가 없습니다.',
    '국민 여론 조사를 보면 다수가 이 방향을 지지하고 있습니다. 민주적 합의에 부합하는 결정입니다.',
    '다양한 이해관계자의 의견을 종합한 결과, 현 시점에서 가장 실현 가능하고 효과적인 방안입니다.',
    '환경적 지속가능성을 고려하면 이 변화는 선택이 아닌 필수입니다. 미래 세대를 위한 책임있는 결정이 필요합니다.',
    '기존 제도의 비효율성과 부작용을 고려하면, 개선된 시스템으로의 전환이 시급합니다.',
    '지역 균형 발전과 사회 통합의 관점에서 이 정책은 매우 시의적절합니다.',
    '기술 발전에 따른 사회 변화를 반영하기 위해 법과 제도의 현대화가 필요한 시점입니다.',
    '교육과 복지의 질을 높이기 위한 근본적인 해결책으로서 이 접근 방식이 가장 효과적입니다.',
    '시장의 자정 능력만으로는 해결할 수 없는 구조적 문제입니다. 정부의 적극적 개입이 필요합니다.',
    '국제 사회의 기준과 가치에 부합하는 방향으로 나아가야 합니다. 고립은 더 큰 비용을 초래합니다.',
    '실증적 연구 결과가 이 정책의 효과를 지지합니다. 감정이 아닌 데이터에 기반한 판단이 중요합니다.',
    '소득 불평등과 양극화 해소를 위해 이러한 재분배 정책은 불가피합니다.',
    '국민 건강과 안전을 최우선으로 두어야 합니다. 경제적 논리만으로 판단해서는 안 됩니다.',
    '점진적 개혁으로는 근본적 변화를 이끌어낼 수 없습니다. 과감한 전환이 필요한 시기입니다.',
    '이 정책이 만들어내는 사회적 가치는 금전적으로 환산할 수 없을 만큼 큽니다.',
    '현장 전문가들의 압도적 지지가 이 방향의 타당성을 증명합니다.',
    '위기 상황에서의 선제적 대응이 사후 대처보다 훨씬 효율적이라는 것은 역사가 증명합니다.',
    '지속 가능한 성장을 위한 패러다임 전환의 핵심 축입니다. 변화를 두려워해서는 안 됩니다.',
];

const CON_TEMPLATES = [
    '충분한 사회적 합의 없이 성급하게 추진하면 더 큰 갈등을 초래할 수 있습니다. 신중한 접근이 필요합니다.',
    '예산 집행의 효율성에 대한 객관적 검증이 부족합니다. 한정된 재원을 낭비할 위험이 있습니다.',
    '현실적 대안과 후속 조치 없이 도입하면 부작용만 커질 수 있습니다. 단계적 접근이 바람직합니다.',
    '해외 사례를 그대로 적용하기엔 한국 사회의 특수성을 고려해야 합니다. 맥락 없는 벤치마킹은 위험합니다.',
    '기존 시스템이 가진 장점마저 잃을 수 있습니다. 전면 교체보다 개선이 더 효과적일 수 있습니다.',
    '이해관계자 간의 이견이 너무 큽니다. 충분한 소통과 조율 과정 없이 밀어붙이면 안 됩니다.',
    '자유시장 경제 원칙에 반하는 과도한 규제는 오히려 경제 활력을 떨어뜨릴 수 있습니다.',
    '정책의 의도는 좋으나, 실제 집행 과정에서의 부작용과 비효율이 우려됩니다.',
    '이미 유사한 정책이 시행되었다가 실패한 전례가 있습니다. 같은 실수를 반복해서는 안 됩니다.',
    '단기적 성과에 집착하여 장기적 부작용을 간과하고 있습니다. 보다 넓은 시야가 필요합니다.',
    '개인의 자유와 선택권을 침해할 소지가 있습니다. 국가의 개입은 최소화되어야 합니다.',
    '재정 건전성을 해칠 수 있는 정책입니다. 미래 세대에게 부담을 전가해서는 안 됩니다.',
    '시장의 자율적 조정 기능을 무시한 인위적 개입은 더 큰 왜곡을 낳을 수 있습니다.',
    '법적 근거가 불분명하고 헌법적 검토가 충분히 이루어지지 않았습니다.',
    '가장 취약한 계층에게 오히려 불리하게 작용할 수 있다는 연구 결과도 있습니다.',
    '실효성이 검증되지 않은 정책을 전국적으로 시행하는 것은 지나치게 위험합니다.',
    '행정 비용과 관료적 비효율이 정책의 효과를 상쇄할 가능성이 높습니다.',
    '현재 논의되고 있는 것보다 더 시급한 사안들이 있습니다. 우선순위를 재정립해야 합니다.',
    '특정 이익집단에 유리한 방향으로 설계되었다는 의혹을 해소할 필요가 있습니다.',
    '국민 속에서의 양극화를 심화시킬 수 있는 위험 요소를 간과하고 있습니다.',
    '기술적 한계와 인프라 부족으로 당장의 시행은 현실적으로 어렵습니다.',
    '도입 초기 혼란과 사회적 비용이 예상보다 클 수 있습니다. 충분한 준비가 선행되어야 합니다.',
    '감정적 여론에 편승한 졸속 입법의 위험이 있습니다. 냉철한 분석이 우선되어야 합니다.',
    '정책 실패 시 책임 소재가 불분명합니다. 거버넌스 구조부터 확립해야 합니다.',
    '이미 자발적으로 개선되고 있는 영역에 대한 과잉 개입은 오히려 역효과를 낼 수 있습니다.',
];

function generateDummyOpinions(articleId: number, count = 50): ArenaOpinion[] {
    const opinions: ArenaOpinion[] = [];
    const half = Math.ceil(count / 2);

    for (let i = 0; i < count; i++) {
        const stance: 'pro' | 'con' = i < half ? 'pro' : 'con';
        const templates = stance === 'pro' ? PRO_TEMPLATES : CON_TEMPLATES;
        const body = templates[i % templates.length];
        const authorId = `dummy_${articleId}_${i}`;
        const authorName = generateNickname(authorId, String(articleId));
        const daysAgo = Math.floor(Math.random() * 14) + 1;

        opinions.push({
            id: `arena-${articleId}-${i}`,
            articleId,
            authorId,
            authorName,
            stance,
            body,
            createdAt: Date.now() - daysAgo * 86_400_000 - Math.floor(Math.random() * 86_400_000),
            influenceCount: Math.floor(Math.random() * 20),
            rebuttedBy: [],
            likes: Math.floor(Math.random() * 30) + 1,
        });
    }

    // Sort by createdAt desc
    return opinions.sort((a, b) => b.createdAt - a.createdAt);
}

/* ── Opinions CRUD ────────────────────────────────────────── */

type OpinionStore = Record<string, ArenaOpinion[]>;

function getOpinionStore(): OpinionStore {
    return getJSON<OpinionStore>(OPINIONS_KEY, {});
}

function setOpinionStore(data: OpinionStore): void {
    setJSON(OPINIONS_KEY, data);
}

/** Get all opinions for an article. Seeds dummy data on first access. */
export function getOpinionsForArticle(articleId: number): ArenaOpinion[] {
    const store = getOpinionStore();
    const key = String(articleId);
    if (!store[key] || store[key].length === 0) {
        store[key] = generateDummyOpinions(articleId);
        setOpinionStore(store);
    }
    return store[key];
}

/** Add a new opinion */
export function addOpinion(opinion: ArenaOpinion): void {
    const store = getOpinionStore();
    const key = String(opinion.articleId);
    const list = store[key] ?? [];
    store[key] = [opinion, ...list];
    setOpinionStore(store);
}

/** Get best opinions (most influential) for a stance */
export function getBestOpinions(articleId: number, stance: 'pro' | 'con', limit = 3): ArenaOpinion[] {
    const opinions = getOpinionsForArticle(articleId);
    return opinions
        .filter(o => o.stance === stance)
        .sort((a, b) => b.influenceCount - a.influenceCount)
        .slice(0, limit);
}

/** Get opinions sorted/filtered */
export function getFilteredOpinions(
    articleId: number,
    options: { stance?: 'pro' | 'con'; sort?: 'latest' | 'oldest' | 'likes' }
): ArenaOpinion[] {
    let opinions = getOpinionsForArticle(articleId);
    if (options.stance) {
        opinions = opinions.filter(o => o.stance === options.stance);
    }
    switch (options.sort) {
        case 'oldest':
            return [...opinions].sort((a, b) => a.createdAt - b.createdAt);
        case 'likes':
            return [...opinions].sort((a, b) => b.likes - a.likes);
        case 'latest':
        default:
            return [...opinions].sort((a, b) => b.createdAt - a.createdAt);
    }
}

/* ── Stance change tracking ───────────────────────────────── */

type StanceChangeStore = Record<string, { total: number; byOpinion: Record<string, number> }>;

function getStanceChangeStore(): StanceChangeStore {
    return getJSON<StanceChangeStore>(STANCE_CHANGES_KEY, {});
}

function setStanceChangeStore(data: StanceChangeStore): void {
    setJSON(STANCE_CHANGES_KEY, data);
}

/** Record a stance change caused by a specific opinion */
export function recordStanceChange(articleId: number, opinionId: string): void {
    const store = getStanceChangeStore();
    const key = String(articleId);
    if (!store[key]) store[key] = { total: 0, byOpinion: {} };
    store[key].total += 1;
    store[key].byOpinion[opinionId] = (store[key].byOpinion[opinionId] ?? 0) + 1;
    setStanceChangeStore(store);

    // Also update the opinion's influenceCount
    const opStore = getOpinionStore();
    const opinions = opStore[key] ?? [];
    const idx = opinions.findIndex(o => o.id === opinionId);
    if (idx !== -1) {
        opinions[idx] = { ...opinions[idx], influenceCount: opinions[idx].influenceCount + 1 };
        opStore[key] = opinions;
        setOpinionStore(opStore);
    }
}

/** Get total stance changes for an article */
export function getStanceChangeCount(articleId: number): number {
    const store = getStanceChangeStore();
    return store[String(articleId)]?.total ?? 0;
}

/* ── Sessions ─────────────────────────────────────────────── */

type SessionStore = Record<string, ArenaSession>;

function getSessionStore(): SessionStore {
    return getJSON<SessionStore>(SESSIONS_KEY, {});
}

function setSessionStore(data: SessionStore): void {
    setJSON(SESSIONS_KEY, data);
}

function sessionKey(articleId: number, userId: string): string {
    return `${articleId}_${userId}`;
}

/** Get an existing arena session */
export function getArenaSession(articleId: number, userId: string): ArenaSession | null {
    return getSessionStore()[sessionKey(articleId, userId)] ?? null;
}

/** Create or update an arena session */
export function saveArenaSession(session: ArenaSession): void {
    const store = getSessionStore();
    store[sessionKey(session.articleId, session.userId)] = session;
    setSessionStore(store);
}

/** Clear an arena session */
export function clearArenaSession(articleId: number, userId: string): void {
    const store = getSessionStore();
    delete store[sessionKey(articleId, userId)];
    setSessionStore(store);
}
