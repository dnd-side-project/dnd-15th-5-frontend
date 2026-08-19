import { PlaceCard } from './PlaceCard';

import type { ShopSearchResult } from '../types';

type ShopSearchResultItemProps = {
  shop: ShopSearchResult;
  onSelect: (shop: ShopSearchResult) => void;
};

export default function ShopSearchResultItem({ shop, onSelect }: ShopSearchResultItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(shop)}
        className="w-full rounded-08 text-left outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1"
      >
        <PlaceCard thumbnailSrc={shop.photoUrl} title={shop.name} location={shop.address} />
      </button>
    </li>
  );
}
