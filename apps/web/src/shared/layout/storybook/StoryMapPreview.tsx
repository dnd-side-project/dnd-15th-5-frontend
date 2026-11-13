import { useState } from 'react';

import { NotificationUnreadIcon, SearchIcon } from '@/shared/assets/icons';
import { CategoryChip } from '@/shared/ui/category-chip';
import { ProfileAvatar } from '@/shared/ui/profile-avatar';

import { STORY_PLACES } from './storyPreviewData';

import type { ReactNode } from 'react';

const STORY_CATEGORIES = ['카페', '음식점', '취미/놀거리'] as const;
const MAP_STREETS = [
  'M-40 120 510 280',
  'M-40 310 510 460',
  'M-40 490 510 640',
  'M90 -40 -30 760',
  'M260 -40 100 940',
  'M440 -40 280 940',
  'M-40 215 510 375',
  'M-40 405 510 555',
  'M170 -40 30 900',
  'M350 -40 190 940',
];

type StoryMapBackdropProps = {
  category?: string | null;
  selectedPlaceId?: string | null;
  onSelectPlace?: (placeId: string) => void;
};

/** 지도 타일 요청 없이 도로·수변·스티커가 있는 배경을 재현하는 Storybook 전용 캔버스입니다. */
export function StoryMapBackdrop({
  category,
  selectedPlaceId,
  onSelectPlace,
}: StoryMapBackdropProps) {
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const selectedId = selectedPlaceId === undefined ? localSelectedId : selectedPlaceId;
  const places = category
    ? STORY_PLACES.filter((place) => place.category === category)
    : STORY_PLACES;

  return (
    <div className="absolute inset-0 overflow-hidden bg-neutral-100">
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 480 900"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label="서울숲 주변을 표현한 예시 지도"
      >
        <rect width="480" height="900" fill="var(--color-neutral-100)" />
        <path
          d="M-50 570C130 660 250 625 520 790L520 950-50 950Z"
          fill="var(--color-primary-100)"
        />
        <path
          d="M-50 680C170 730 240 720 530 870"
          fill="none"
          stroke="var(--color-primary-200)"
          strokeWidth="100"
        />
        <rect
          x="285"
          y="140"
          width="145"
          height="200"
          rx="48"
          fill="var(--color-primary-50)"
          transform="rotate(14 360 240)"
        />
        <g fill="none" strokeLinecap="round">
          {MAP_STREETS.map((d) => (
            <path key={`edge-${d}`} d={d} stroke="var(--color-neutral-300)" strokeWidth="13" />
          ))}
          {MAP_STREETS.map((d) => (
            <path key={d} d={d} stroke="var(--color-neutral-00)" strokeWidth="9" />
          ))}
          <path d="M-40 550 520 710" stroke="var(--color-neutral-00)" strokeWidth="28" />
          <path
            d="M-40 550 520 710"
            stroke="var(--color-primary-200)"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
        </g>
        <g fill="var(--color-neutral-500)" fontSize="12" fontFamily="inherit" textAnchor="middle">
          <text x="120" y="180">
            성수동
          </text>
          <text x="360" y="230">
            서울숲
          </text>
          <text x="180" y="390" transform="rotate(16 180 390)">
            서울숲길
          </text>
          <text x="375" y="505" transform="rotate(-80 375 505)">
            성수이로
          </text>
          <text x="110" y="815" fill="var(--color-primary-500)" fontSize="16" letterSpacing="12">
            한강
          </text>
        </g>
      </svg>
      {places.map((place) => (
        <button
          key={place.id}
          type="button"
          aria-label={`${place.name} 지도에서 보기`}
          aria-pressed={selectedId === place.id}
          onClick={() => {
            setLocalSelectedId(place.id);
            onSelectPlace?.(place.id);
          }}
          style={{ left: place.left, top: place.top }}
          className="absolute flex -translate-x-1/2 flex-col items-center rounded-full outline-offset-4 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary-500 motion-reduce:transition-none"
        >
          <span className="relative flex size-14 items-center justify-center rounded-full border-2 border-neutral-00 bg-neutral-00/85 shadow-home-overlay in-aria-pressed:ring-2 in-aria-pressed:ring-primary-500">
            <img src={place.image} alt="" className="size-12 object-contain" />
            <span className="absolute -right-2 -bottom-1 rounded-full border-2 border-neutral-00 bg-primary-500 px-1.5 text-caption-01-medium text-neutral-00">
              +{place.visits - 1}
            </span>
          </span>
          <span className="mt-1.5 whitespace-nowrap rounded-full bg-neutral-00/90 px-2 py-0.5 text-caption-01-medium text-neutral-600">
            {place.name}
          </span>
        </button>
      ))}
      <span
        className="absolute top-[61%] left-[48%] size-5 rounded-full border-4 border-neutral-00 bg-primary-500 shadow-[0_0_0_10px_color-mix(in_srgb,var(--color-primary-500)_12%,transparent)]"
        aria-label="현재 위치"
        role="img"
      />
    </div>
  );
}

type StoryMapToolbarProps = {
  category: string | null;
  onCategoryChange: (category: string | null) => void;
  headerContent?: ReactNode;
};

/** 실제 앱 헤더를 주입할 수 있고 카테고리로 예시 핀을 걸러보는 지도 오버레이입니다. */
export function StoryMapToolbar({
  category,
  onCategoryChange,
  headerContent,
}: StoryMapToolbarProps) {
  return (
    <div className="mobile-frame pointer-events-none absolute top-0 right-0 left-0 z-map-control pt-[env(safe-area-inset-top)]">
      <div className="pointer-events-auto">
        {headerContent ?? (
          <div className="flex items-center gap-2.5 px-4 py-3">
            <div className="flex h-11.5 min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-neutral-00 px-4 text-neutral-500 shadow-home-overlay">
              <span className="truncate text-label-01-medium">오늘은 어떤 곳에 방문하셨나요?</span>
              <SearchIcon className="size-5 shrink-0" aria-hidden="true" />
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-00 shadow-home-overlay">
              <NotificationUnreadIcon className="size-6" aria-hidden="true" />
            </span>
            <ProfileAvatar className="size-10 shrink-0 shadow-home-overlay" />
          </div>
        )}
      </div>
      <div
        className="pointer-events-auto flex gap-2 overflow-x-auto px-4 pt-1 pb-3"
        aria-label="지도 카테고리"
        role="group"
      >
        {STORY_CATEGORIES.map((item) => (
          <CategoryChip
            key={item}
            variant="compact"
            selected={category === item}
            onSelectedChange={(selected) => onCategoryChange(selected ? item : null)}
          >
            {item}
          </CategoryChip>
        ))}
      </div>
    </div>
  );
}
