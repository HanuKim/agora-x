/**
 * 앱에서 사용하는 공통 컨텐츠 분류 분야.
 * 국민 제안, 뉴스 큐레이션, 일대일 토론 등 앱 전반에서 사용됩니다.
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
