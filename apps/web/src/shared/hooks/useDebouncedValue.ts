import { useEffect, useState } from 'react';

/**
 * 값이 바뀐 뒤 일정 시간 동안 추가 변경이 없을 때만 최신 값을 반영합니다.
 *
 * 검색어처럼 빠르게 바뀌는 값을 그대로 쓰면 매 변경마다 API를 호출하게 되는 상황에,
 * 입력이 멈춘 뒤에만 반영되는 값을 만들어 호출 빈도를 줄일 때 사용합니다.
 *
 * @example
 * ```tsx
 * const [keyword, setKeyword] = useState('');
 * const debouncedKeyword = useDebouncedValue(keyword, 400);
 *
 * useEffect(() => {
 *   if (debouncedKeyword) search(debouncedKeyword);
 * }, [debouncedKeyword]);
 * ```
 *
 * @param value - 지연시켜 반영할 값입니다.
 * @param delayMs - 값이 바뀐 뒤 반영까지 기다릴 시간(ms)입니다.
 * @returns `delayMs` 동안 추가 변경이 없었던 가장 최근 값입니다.
 */
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
};
