import { CloseIcon } from '@/shared/assets/icons';

type RecentSearchListProps = {
  keywords: readonly string[];
  onRemove: (keyword: string) => void;
  onSelect: (keyword: string) => void;
};

/** 검색어를 입력하기 전, 최근 검색어를 칩 목록으로 보여줍니다. */
export function RecentSearchList({ keywords, onRemove, onSelect }: RecentSearchListProps) {
  if (keywords.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <p className="text-body-01-semibold text-neutral-700">최근 검색어</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <li
            key={keyword}
            className="flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-00 py-1.5 pl-3 pr-2"
          >
            <button
              type="button"
              onClick={() => onSelect(keyword)}
              className="max-w-40 truncate text-body-02-medium text-neutral-600"
            >
              {keyword}
            </button>
            <button
              type="button"
              aria-label={`${keyword} 최근 검색어 삭제`}
              onClick={() => onRemove(keyword)}
              className="flex size-4 shrink-0 items-center justify-center text-neutral-500"
            >
              <CloseIcon aria-hidden="true" className="size-2.5" />
            </button>
          </li>
        ))}
      </ul>
      <div className="-mx-4 mt-8 h-2 bg-neutral-100" aria-hidden="true" />
    </div>
  );
}
