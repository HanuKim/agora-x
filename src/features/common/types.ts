/**
 * 앱에서 사용하는 공통 컨텐츠 분류 분야.
 * 국민 제안, 뉴스 큐레이션, 토론 연습 등 앱 전반에서 사용됩니다.
 */
export type ContentCategory =
    | '정치'
    | '경제'
    | '사회'
    | '국제'
    | '문화'
    | '기술'
    | '기타';

/** 분야 목록 (UI 렌더링용) */
export const CONTENT_CATEGORIES: ContentCategory[] = [
    '정치',
    '경제',
    '사회',
    '국제',
    '문화',
    '기술',
    '기타',
];

/* ── Arena (AI 중재 토론장) 타입 ────────────────────────── */

/** 토론장 의견 한 건 */
export interface ArenaOpinion {
    id: string;
    articleId: number;
    authorId: string;
    authorName: string;
    stance: 'pro' | 'con';
    body: string;
    createdAt: number;
    /** 이 의견으로 인해 입장이 변한 사용자 수 */
    influenceCount: number;
    /** 이 의견에 반박한 의견 ID 목록 */
    rebuttedBy: string[];
    likes: number;
}

/** AI 중재 토론 세션 */
export interface ArenaSession {
    articleId: number;
    userId: string;
    initialStance: 'pro' | 'con';
    finalStance?: 'pro' | 'con';
    messages: { role: 'user' | 'assistant'; content: string }[];
    /** 입장 변화 시 가장 영향을 준 의견 ID */
    influentialOpinionId?: string;
    /** 세션 완료 여부 */
    completed: boolean;
    createdAt: number;
}

/** Best 의견 (입장변화 유도 순위) */
export interface BestOpinion {
    opinion: ArenaOpinion;
    stanceChangeCount: number;
}
