import { useEffect, useRef, useState } from 'react';

import { SearchIcon } from '@/shared/assets/icons';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

import type { FormEvent } from 'react';

const DEFAULT_SEARCH_DEBOUNCE_MS = 400;

type AppliedKeyword = {
  keyword: string;
};

type PlaceSearchInputProps = {
  /**
   * 최근 검색어 선택처럼 외부에서 검색어를 채우고 즉시 검색을 실행할 때 전달합니다.
   * 같은 검색어를 다시 선택해도 반응하도록, 선택할 때마다 새 객체를 전달해야 합니다.
   */
  appliedKeyword?: AppliedKeyword;
  debounceMs?: number;
  onSearch: (keyword: string) => void;
  placeholder?: string;
};

/** 입력 중 자동 검색과 즉시 제출을 함께 제공하는 공통 장소 검색창입니다. */
export function PlaceSearchInput({
  appliedKeyword,
  debounceMs = DEFAULT_SEARCH_DEBOUNCE_MS,
  onSearch,
  placeholder = '장소를 검색해주세요',
}: PlaceSearchInputProps) {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword, debounceMs);
  const onSearchRef = useRef(onSearch);
  const lastSearchedKeywordRef = useRef(debouncedKeyword);
  const lastAppliedKeywordRef = useRef(appliedKeyword);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (lastSearchedKeywordRef.current === debouncedKeyword) {
      return;
    }

    lastSearchedKeywordRef.current = debouncedKeyword;
    onSearchRef.current(debouncedKeyword);
  }, [debouncedKeyword]);

  useEffect(() => {
    if (appliedKeyword === undefined || appliedKeyword === lastAppliedKeywordRef.current) {
      return;
    }

    lastAppliedKeywordRef.current = appliedKeyword;
    lastSearchedKeywordRef.current = appliedKeyword.keyword;
    setKeyword(appliedKeyword.keyword);
    onSearchRef.current(appliedKeyword.keyword);
  }, [appliedKeyword]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    lastSearchedKeywordRef.current = keyword;
    onSearchRef.current(keyword);
  };

  return (
    <form
      role="search"
      onSubmit={handleSearchSubmit}
      className="flex min-h-14 items-center gap-2 rounded-08 bg-neutral-50 px-4 focus-within:ring-2 focus-within:ring-primary-300"
    >
      <input
        aria-label="장소 검색어"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-body-01-regular text-neutral-700 outline-none placeholder:text-neutral-500"
      />
      <button
        type="submit"
        aria-label="검색"
        className="flex size-6 shrink-0 items-center justify-center"
      >
        <SearchIcon className="size-6 text-neutral-500" aria-hidden="true" />
      </button>
    </form>
  );
}
