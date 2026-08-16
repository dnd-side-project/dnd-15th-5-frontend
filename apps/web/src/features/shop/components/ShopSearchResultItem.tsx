import { PlaceCard } from '@/shared/ui/card';

import type { ShopSearchResult } from '../types';

type ShopSearchResultItemProps = {
  shop: ShopSearchResult;
  onSelect: (shop: ShopSearchResult) => void;
};

export default function ShopSearchResultItem({ shop, onSelect }: ShopSearchResultItemProps) {
  return (
    <li>
      <button type="button" onClick={() => onSelect(shop)} className="w-full py-3 text-left">
        <PlaceCard thumbnailSrc={shop.photoUrl} title={shop.name} location={shop.address} />
      </button>
    </li>
  );
}
