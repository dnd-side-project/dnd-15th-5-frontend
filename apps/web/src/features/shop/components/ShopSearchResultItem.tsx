import { LocationPinIcon } from '@/shared/assets/icons';

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
          <div className="size-16 shrink-0 rounded-lg bg-neutral-200" />
        )}
        <div className="min-w-0">
          <p className="truncate text-body-01-bold">{shop.name}</p>
          <p className="flex items-center gap-1 truncate text-body-02-regular text-neutral-500">
            <LocationPinIcon className="h-3 w-2.25 shrink-0 text-neutral-400" aria-hidden="true" />
            {shop.address}
          </p>
        </div>
      </button>
    </li>
  );
}
