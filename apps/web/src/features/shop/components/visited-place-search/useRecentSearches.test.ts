import { act, renderHook } from '@testing-library/react';

import { useRecentSearches } from './useRecentSearches';

describe('useRecentSearches', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('검색어를 추가하면 최신 검색어가 맨 앞에 온다', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('투썸');
    });
    act(() => {
      result.current.addRecentSearch('카페');
    });

    expect(result.current.recentSearches).toEqual(['카페', '투썸']);
  });

  it('이미 있는 검색어를 다시 추가하면 중복 없이 맨 앞으로 옮긴다', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('투썸');
      result.current.addRecentSearch('카페');
      result.current.addRecentSearch('투썸');
    });

    expect(result.current.recentSearches).toEqual(['투썸', '카페']);
  });

  it('빈 문자열이나 공백만 있는 검색어는 추가하지 않는다', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('   ');
    });

    expect(result.current.recentSearches).toEqual([]);
  });

  it('최대 개수를 넘으면 가장 오래된 검색어부터 제거한다', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      for (let i = 0; i < 11; i += 1) {
        result.current.addRecentSearch(`검색어${i}`);
      }
    });

    expect(result.current.recentSearches).toHaveLength(10);
    expect(result.current.recentSearches).not.toContain('검색어0');
    expect(result.current.recentSearches[0]).toBe('검색어10');
  });

  it('검색어를 삭제할 수 있다', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addRecentSearch('투썸');
      result.current.addRecentSearch('카페');
    });
    act(() => {
      result.current.removeRecentSearch('투썸');
    });

    expect(result.current.recentSearches).toEqual(['카페']);
  });

  it('localStorage에 저장된 검색어를 초기값으로 불러온다', () => {
    const { result: firstResult } = renderHook(() => useRecentSearches());
    act(() => {
      firstResult.current.addRecentSearch('투썸');
    });

    const { result: secondResult } = renderHook(() => useRecentSearches());

    expect(secondResult.current.recentSearches).toEqual(['투썸']);
  });
});
