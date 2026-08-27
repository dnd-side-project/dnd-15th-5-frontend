const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

const getDateParts = (date: string) => {
  const match = DATE_PATTERN.exec(date);
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** 첫 방문일과 오늘 사이의 달력 기준 개월 수를 구한다(같은 날짜에 도달하지 않았으면 하루 부족한 것으로 본다). */
const getMonthsBetween = (target: { year: number; month: number; day: number }, today: Date) => {
  let months = (today.getFullYear() - target.year) * 12 + (today.getMonth() - (target.month - 1));

  if (today.getDate() < target.day) {
    months -= 1;
  }

  return Math.max(months, 1);
};

export const formatFirstVisitedDate = (date?: string, now = new Date()) => {
  if (!date) return '-';

  const dateParts = getDateParts(date);
  if (!dateParts) return date;

  const target = new Date(dateParts.year, dateParts.month - 1, dateParts.day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / DAY_MS);

  if (diffDays <= 0) return '오늘';
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주일 전`;

  const months = getMonthsBetween(dateParts, today);
  if (months < 12) return `${months}달 전`;

  return `${Math.floor(months / 12)}년 전`;
};

export const formatVisitDate = (date?: string, now = new Date()) => {
  if (!date) return '-';

  const dateParts = getDateParts(date);
  if (!dateParts) return date;

  if (dateParts.year !== now.getFullYear()) {
    return `${dateParts.year}년 ${dateParts.month}월 ${dateParts.day}일`;
  }

  return `${dateParts.month}월 ${dateParts.day}일`;
};

export const formatVisitAmount = (amount?: number) =>
  amount === undefined ? '-' : `${new Intl.NumberFormat('ko-KR').format(amount)}원`;
