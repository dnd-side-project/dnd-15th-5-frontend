import type { ShopSearchResult } from '../types';

type ShopSearchResultItemProps = {
  shop: ShopSearchResult;
  onSelect: (shop: ShopSearchResult) => void;
};

export default function ShopSearchResultItem({ shop, onSelect }: ShopSearchResultItemProps) {
  return (
    // TODO: 디자인 확정되면 스타일 수정
    <li>
      <button
        type="button"
        onClick={() => onSelect(shop)}
        className="flex w-full items-center gap-4 py-3 text-left"
      >
        {shop.photoUrl ? (
          <img
            src={shop.photoUrl}
            alt=""
            loading="lazy"
            className="size-16 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="size-16 shrink-0 rounded-lg bg-gray-200" />
        )}
        <div className="min-w-0">
          <p className="truncate font-bold">{shop.name}</p>
          <p className="flex items-center gap-1 truncate text-sm text-gray-500">
            {/* TODO: 아이콘 시스템 세팅되면 shared/assets의 ic-location-pin.svg로 교체 */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="shrink-0"
              aria-hidden="true"
            >
              <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            {shop.address}
          </p>
        </div>
      </button>
    </li>
  );
}
