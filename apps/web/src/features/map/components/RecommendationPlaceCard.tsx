import type { ShopRecommendation } from '@/features/map/types';
import { getDistrict } from '@/features/map/utils/recommendation';
import { BlueLocationPinIcon, LikeIcon } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/cn';
import { CardThumbnail, CardTitle } from '@/shared/ui/card';
import { Chip } from '@/shared/ui/chip';

type RecommendationPlaceCardProps = {
  recommendation: ShopRecommendation;
  onSelect: () => void;
  onToggleLike: () => void;
  isLikePending: boolean;
};

export default function RecommendationPlaceCard({
  recommendation: { place, thumbnailSrc, isLiked },
  onSelect,
  onToggleLike,
  isLikePending,
}: RecommendationPlaceCardProps) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-08 border border-neutral-100 bg-neutral-00">
      <button
        type="button"
        onClick={onSelect}
        aria-label={`${place.name} 상세 보기`}
        className="flex w-full min-w-0 flex-col gap-2 pb-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
      >
        <span className="block aspect-[1.56] w-full overflow-hidden *:h-full *:w-full *:rounded-none">
          <CardThumbnail src={thumbnailSrc} radius="medium" />
        </span>
        <CardTitle weight="semibold" className="w-full px-3">
          {place.name}
        </CardTitle>
        <span className="flex w-full flex-wrap gap-1 px-3">
          {place.address && <Chip icon={BlueLocationPinIcon}>{getDistrict(place.address)}</Chip>}
          <Chip>{place.category}</Chip>
        </span>
      </button>
      <button
        type="button"
        aria-label={`${place.name} 관심 가게`}
        aria-pressed={isLiked}
        disabled={isLikePending}
        onClick={onToggleLike}
        className={cn(
          'absolute top-1 right-1 flex size-9 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-50',
          isLiked ? 'text-red' : 'text-neutral-00'
        )}
      >
        <LikeIcon
          aria-hidden="true"
          className={cn(
            'size-5 overflow-visible',
            !isLiked &&
              '[&_path]:fill-none [&_path]:stroke-current [&_path]:stroke-1 [&_path]:[stroke-linecap:round] [&_path]:[stroke-linejoin:round]'
          )}
        />
      </button>
    </div>
  );
}
