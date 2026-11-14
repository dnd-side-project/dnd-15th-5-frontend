import { useEffect, useRef, useState } from 'react';

import { SearchIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';

import type { FormEvent } from 'react';

type AppliedKeyword = {
  keyword: string;
};

type PlaceSearchInputProps = {
  /**
   * 최근 검색어 선택처럼 외부에서 검색어를 채울 때 전달합니다. 검색은 제출 시 실행합니다.
   * 같은 검색어를 다시 선택해도 반응하도록, 선택할 때마다 새 객체를 전달해야 합니다.
   */
  appliedKeyword?: AppliedKeyword;
  onSearch: (keyword: string) => void;
  placeholder?: string;
  inputClassName?: string;
  searchIconClassName?: string;
};

/** 완료·Enter 또는 검색 버튼으로 제출할 때만 검색하는 공통 장소 검색창입니다. */
export function PlaceSearchInput({
  appliedKeyword,
  onSearch,
  placeholder = '장소를 검색해주세요',
  inputClassName,
  searchIconClassName,
}: PlaceSearchInputProps) {
  const [keyword, setKeyword] = useState(appliedKeyword?.keyword ?? '');
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);
  const lastAppliedKeywordRef = useRef(appliedKeyword);

  useEffect(() => {
    if (appliedKeyword === undefined || appliedKeyword === lastAppliedKeywordRef.current) {
      return;
    }

    lastAppliedKeywordRef.current = appliedKeyword;
    setKeyword(appliedKeyword.keyword);
  }, [appliedKeyword]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isComposingRef.current) return;
    onSearch(keyword);
    inputRef.current?.blur();
  };

  return (
    <form
      role="search"
      onSubmit={handleSearchSubmit}
      className="flex min-h-14 items-center gap-2 rounded-08 bg-neutral-50 px-4 focus-within:ring-2 focus-within:ring-primary-300"
    >
      <input
        ref={inputRef}
        aria-label="장소 검색어"
        enterKeyHint="search"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
        }}
        onKeyDown={(event) => {
          // NOTE: 일부 WebView는 조합 확정 Enter를 keyCode 229로만 구분합니다.
          if (
            event.key === 'Enter' &&
            (isComposingRef.current || event.nativeEvent.isComposing || event.keyCode === 229)
          ) {
            event.preventDefault();
          }
        }}
        placeholder={placeholder}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-body-01-regular text-neutral-700 outline-none placeholder:text-neutral-500',
          inputClassName
        )}
      />
      <button type="submit" aria-label="검색" className="flex shrink-0 items-center justify-center">
        <SearchIcon
          className={cn('size-6 text-neutral-600', searchIconClassName)}
          aria-hidden="true"
        />
      </button>
    </form>
  );
}
