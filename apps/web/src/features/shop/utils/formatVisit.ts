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

export const formatFirstVisitedDate = (date?: string) => {
  if (!date) return '-';

  const dateParts = getDateParts(date);
  if (!dateParts) return date;

  return `${dateParts.year}. ${dateParts.month}. ${dateParts.day}.`;
};

export const formatVisitDate = (date?: string) => {
  if (!date) return '-';

  const dateParts = getDateParts(date);
  if (!dateParts) return date;

  return `${dateParts.month}월 ${dateParts.day}일`;
};

export const formatVisitAmount = (amount?: number) =>
  amount === undefined ? '-' : `${new Intl.NumberFormat('ko-KR').format(amount)}원`;
