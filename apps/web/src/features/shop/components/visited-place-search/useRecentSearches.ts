import { useCallback, useState } from 'react';

const RECENT_SEARCH_STORAGE_KEY = 'chapchap:visited-place-recent-searches';
const RECENT_SEARCH_MAX_COUNT = 10;

const readRecentSearches = (): string[] => {
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

const writeRecentSearches = (searches: string[]) => {
  try {
    window.localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // 프라이빗 모드 등 localStorage를 쓸 수 없는 환경에서는 저장을 건너뛴다
  }
};

/** 소비한 곳 검색 화면의 최근 검색어를 localStorage에 저장하고 관리합니다. */
export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState<string[]>(readRecentSearches);

  const addRecentSearch = useCallback((keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      return;
    }

    setRecentSearches((prev) => {
      const next = [trimmedKeyword, ...prev.filter((item) => item !== trimmedKeyword)].slice(
        0,
        RECENT_SEARCH_MAX_COUNT
      );
      writeRecentSearches(next);
      return next;
    });
  }, []);

  const removeRecentSearch = useCallback((keyword: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== keyword);
      writeRecentSearches(next);
      return next;
    });
  }, []);

  return { addRecentSearch, recentSearches, removeRecentSearch };
};
