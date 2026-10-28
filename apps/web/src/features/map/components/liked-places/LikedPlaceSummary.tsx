import { useState } from 'react';

import { LocationPinIcon, LikeIcon } from '@/shared/assets/icons';
import { StoreImageFallback } from '@/shared/ui/card';
import { Chip } from '@/shared/ui/chip';

import LikedPlacePhotoSkeleton from './LikedPlacePhotoSkeleton';

type LikedPlaceGalleryImageProps = {
  name: string;
  photoUrl: string;
  index: number;
};

function LikedPlaceGalleryImage({ name, photoUrl, index }: LikedPlaceGalleryImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <StoreImageFallback
        ariaLabel={`${name} 사진을 불러올 수 없음`}
        className="h-32 w-full"
        iconClassName="size-12"
      />
    );
  }

  return (
    <img
      src={photoUrl}
      alt={`${name} 사진 ${index + 1}`}
      data-mp-block=""
      loading="lazy"
      className="h-32 w-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

type LikedPlaceSummaryProps = {
  placeId: string;
  name: string;
  category: string;
  address?: string;
  photoUrls: string[];
  isLoading: boolean;
  isUnlikePending: boolean;
  onUnlike: () => void;
  headingAs: 'h1' | 'h2';
};

/** 좋아요 매장 시트와 목록에서 함께 사용하는 매장 요약 및 사진 UI입니다. */
export default function LikedPlaceSummary({
  placeId,
  name,
  category,
  address,
  photoUrls,
  isLoading,
  isUnlikePending,
  onUnlike,
  headingAs: Heading,
}: LikedPlaceSummaryProps) {
  return (
    <section aria-labelledby={`liked-place-${placeId}`}>
      <div className="flex min-w-0 items-center gap-2.5 pr-4">
        <Heading
          id={`liked-place-${placeId}`}
          className="min-w-0 truncate text-body-01-semibold text-neutral-700"
          data-mp-mask=""
        >
          {name}
        </Heading>
        <Chip>{category}</Chip>
        <button
          type="button"
          aria-label={`${name} 좋아요 해제`}
          onClick={onUnlike}
          disabled={isUnlikePending}
          className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full text-red outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
        >
          <LikeIcon aria-hidden="true" className="size-4.75" />
        </button>
      </div>

      <p
        className="mt-2.5 flex min-w-0 items-center gap-2 text-body-02-regular text-neutral-500"
        data-mp-mask=""
      >
        <LocationPinIcon aria-hidden="true" className="h-auto w-2.25 shrink-0 text-neutral-400" />
        <span className="line-clamp-2">{address || '주소 정보가 없어요'}</span>
      </p>

      <div
        role={isLoading ? 'status' : undefined}
        aria-label={isLoading ? '가게 사진 불러오는 중' : `${name} 사진`}
        className="mt-3 grid gap-1 overflow-hidden rounded-16 bg-neutral-100"
        style={{
          gridTemplateColumns: `repeat(${isLoading ? 3 : Math.max(photoUrls.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {isLoading ? (
          <LikedPlacePhotoSkeleton />
        ) : photoUrls.length > 0 ? (
          photoUrls.map((photoUrl, index) => (
            <LikedPlaceGalleryImage key={photoUrl} name={name} photoUrl={photoUrl} index={index} />
          ))
        ) : (
          <StoreImageFallback className="col-span-full h-32 w-full" iconClassName="size-12" />
        )}
      </div>
    </section>
  );
}
