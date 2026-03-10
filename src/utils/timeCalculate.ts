/**
 * 날짜 문자열을 받아 '방금 전', 'n분 전' 등 상대적인 시간 형식으로 반환합니다.
 * @param dateInput - ISO 형식의 날짜 문자열 또는 Date 객체
 */
export function formatTimeAgo(dateInput: string | Date): string {
    try {
      const date = typeof dateInput === 'string' 
        ? new Date(dateInput.replace(' ', 'T')) 
        : dateInput;
  
      if (isNaN(date.getTime())) {
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