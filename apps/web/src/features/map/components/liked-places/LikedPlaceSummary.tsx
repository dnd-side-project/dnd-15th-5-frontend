import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { LikedPlaceMapNavigation } from '@/features/map/types';
import { LocationPinIcon, LikeIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { cn } from '@/shared/lib/cn';
import { StoreImageFallback } from '@/shared/ui/card';
import { Chip } from '@/shared/ui/chip';

import type { ReactNode } from 'react';

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
  isUnlikePending: boolean;
  onUnlike: () => void;
  headingAs: 'h1' | 'h2';
  mapNavigation?: LikedPlaceMapNavigation;
};

type LikedPlaceSummaryContentProps = Pick<
  LikedPlaceSummaryProps,
  'placeId' | 'name' | 'category' | 'address' | 'photoUrls' | 'headingAs'
> & {
  headerAction?: ReactNode;
  headerClassName?: string;
};

function LikedPlaceLikeButton({
  name,
  isUnlikePending,
  onUnlike,
  className,
}: Pick<LikedPlaceSummaryProps, 'name' | 'isUnlikePending' | 'onUnlike'> & {
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={`${name} 좋아요 해제`}
      onClick={onUnlike}
      disabled={isUnlikePending}
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-full text-red outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
        className
      )}
    >
      <LikeIcon aria-hidden="true" className="size-4.75" />
    </button>
  );
}

function LikedPlaceSummaryContent({
  placeId,
  name,
  category,
  address,
  photoUrls,
  headingAs: Heading,
  headerAction,
  headerClassName,
}: LikedPlaceSummaryContentProps) {
  return (
    <>
      <div className={cn('flex min-w-0 items-center gap-2.5', headerClassName)}>
        <Heading
          id={`liked-place-${placeId}`}
          className="min-w-0 truncate text-body-01-semibold text-neutral-700"
          data-mp-mask=""
        >
          {name}
        </Heading>
        <Chip>{category}</Chip>
        {headerAction}
      </div>

      <p
        className="mt-2.5 flex min-w-0 items-center gap-2 text-body-02-regular text-neutral-500"
        data-mp-mask=""
      >
        <LocationPinIcon aria-hidden="true" className="h-auto w-2.25 shrink-0 text-neutral-400" />
        <span className="line-clamp-2">{address || '주소 정보가 없어요'}</span>
      </p>

      <div
        aria-label={`${name} 사진`}
        className="mt-3 grid gap-1 overflow-hidden rounded-16 bg-neutral-100"
        style={{
          gridTemplateColumns: `repeat(${Math.max(photoUrls.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {photoUrls.length > 0 ? (
          photoUrls.map((photoUrl, index) => (
            <LikedPlaceGalleryImage key={photoUrl} name={name} photoUrl={photoUrl} index={index} />
          ))
        ) : (
          <StoreImageFallback className="col-span-full h-32 w-full" iconClassName="size-12" />
        )}
      </div>
    </>
  );
}

/** 좋아요 매장 시트와 목록에서 공유하는 매장 정보·사진 UI입니다. 지도 이동 정보가 있으면 요약 영역을 지도 링크로 만듭니다. */
export default function LikedPlaceSummary({
  placeId,
  name,
  category,
  address,
  photoUrls,
  isUnlikePending,
  onUnlike,
  headingAs: Heading,
  mapNavigation,
}: LikedPlaceSummaryProps) {
  return (
    <section aria-labelledby={`liked-place-${placeId}`}>
      {mapNavigation ? (
        <div className="relative">
          <Link
            to={ROUTE_PATHS.home}
            state={{ openLikedPlace: mapNavigation }}
            aria-label={`${name} 지도에서 보기`}
            className="block rounded-12 text-left text-inherit outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1"
          >
            <LikedPlaceSummaryContent
              placeId={placeId}
              name={name}
              category={category}
              address={address}
              photoUrls={photoUrls}
              headingAs={Heading}
              headerClassName="pr-12"
            />
          </Link>
          <LikedPlaceLikeButton
            name={name}
            isUnlikePending={isUnlikePending}
            onUnlike={onUnlike}
            className="absolute top-0 right-4 z-10"
          />
        </div>
      ) : (
        <LikedPlaceSummaryContent
          placeId={placeId}
          name={name}
          category={category}
          address={address}
          photoUrls={photoUrls}
          headingAs={Heading}
          headerClassName="pr-4"
          headerAction={
            <LikedPlaceLikeButton
              name={name}
              isUnlikePending={isUnlikePending}
              onUnlike={onUnlike}
              className="ml-auto"
            />
          }
        />
      )}
    </section>
  );
}
