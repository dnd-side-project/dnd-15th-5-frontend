/** HH:mm[:ss[.소수]] 형식의 시각을 오전·오후로 표시하고, 누락되거나 유효하지 않으면 생략합니다. */
export const formatTimePeriod = (time?: string) => {
  const match = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.exec(time ?? '');
  if (!match) return undefined;

  return Number(match[1]) < 12 ? '오전' : '오후';
};
