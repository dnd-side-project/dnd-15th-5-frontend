import { useState } from 'react';

const RECENT_NEIGHBORHOODS_STORAGE_KEY = 'chapchap:recent-recommendation-neighborhoods';
const MAX_RECENT_NEIGHBORHOODS = 5;

const readRecentNeighborhoods = () => {
  try {
    const storedValue = window.localStorage.getItem(RECENT_NEIGHBORHOODS_STORAGE_KEY);
    const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
};

/** 최근 선택한 동네를 중복 없이 최신순으로 저장합니다. */
export const useRecentNeighborhoods = () => {
  const [recentNeighborhoods, setRecentNeighborhoods] = useState(readRecentNeighborhoods);

  const updateRecentNeighborhoods = (nextRecentNeighborhoods: string[]) => {
    setRecentNeighborhoods(nextRecentNeighborhoods);
    try {
      window.localStorage.setItem(
        RECENT_NEIGHBORHOODS_STORAGE_KEY,
        JSON.stringify(nextRecentNeighborhoods)
      );
    } catch {
      // 저장에 실패해도 현재 화면의 최근 동네 목록은 유지합니다.
    }
  };

  const addRecentNeighborhood = (address: string) => {
    const remaining = recentNeighborhoods.filter((recent) => recent !== address);
    updateRecentNeighborhoods([address, ...remaining].slice(0, MAX_RECENT_NEIGHBORHOODS));
  };

  const removeRecentNeighborhood = (address: string) => {
    updateRecentNeighborhoods(recentNeighborhoods.filter((recent) => recent !== address));
  };

  return { recentNeighborhoods, addRecentNeighborhood, removeRecentNeighborhood };
};
