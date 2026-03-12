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
