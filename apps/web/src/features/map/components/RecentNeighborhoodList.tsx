import { CloseIcon, LocationPinOutlineIcon } from '@/shared/assets/icons';

type RecentNeighborhoodListProps = {
  neighborhoods: string[];
  onSelect: (address: string) => void;
  onRemove: (address: string) => void;
};

export default function RecentNeighborhoodList({
  neighborhoods,
  onSelect,
  onRemove,
}: RecentNeighborhoodListProps) {
  return (
    <>
      <h1 className="mt-8 text-body-01-semibold text-neutral-700">최근 설정한 동네</h1>
      {neighborhoods.length > 0 ? (
        <ul className="mt-3 pr-4">
          {neighborhoods.map((address) => (
            <li
              key={address}
              className="flex min-h-16.5 items-center gap-2.5 border-b border-neutral-100 last:border-0"
            >
              <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
                <LocationPinOutlineIcon />
              </span>
              <button
                type="button"
                className="min-w-0 flex-1 truncate py-4 text-left text-body-01-semibold text-neutral-700"
                onClick={() => onSelect(address)}
              >
                {address}
              </button>
              <button
                type="button"
                aria-label={`${address} 최근 검색에서 삭제`}
                className="flex size-6 shrink-0 items-center justify-center text-neutral-400"
                onClick={() => onRemove(address)}
              >
                <CloseIcon aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-body-02-regular text-neutral-400">검색한 동네가 여기에 표시돼요</p>
      )}
    </>
  );
}
