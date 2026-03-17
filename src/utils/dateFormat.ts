/**
 * 날짜/시간 포맷 유틸 — 상대 시간·절대 날짜 표시용
 */

/**
 * 날짜 문자열을 받아 '방금 전', 'n분 전' 등 상대적인 시간 형식으로 반환합니다.
 * @param dateInput - ISO 형식의 날짜 문자열 또는 Date 객체
 */
export function formatTimeAgo(dateInput: string | Date): string {
  try {
    const date =
      typeof dateInput === 'string' ? new Date(dateInput.replace(' ', 'T')) : dateInput;

    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid Date');
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return '방금 전';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
  } catch {
    return typeof dateInput === 'string' ? dateInput.slice(0, 10) : '방금 전';
  }
}

/**
 * 댓글 더미 데이터의 날짜 문자열을 시민 토론장 댓글 표시용 한글 형식으로 변환합니다.
 * @param createdAt - ISO 8601 문자열 또는 'YYYY-MM-DD HH:mm:ss' 형식의 날짜 문자열 (생략 시 null 반환)
 * @returns 'oooo년 oo월 oo일' 형식 문자열. 파싱 실패 또는 값 없음 시 null
 */
export function formatCivilDate(createdAt?: string): string | null {
  if (!createdAt) return null;
  const d = new Date(createdAt.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}년 ${m}월 ${day}일`;
}
