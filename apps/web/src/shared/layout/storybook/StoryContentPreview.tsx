import { useState } from 'react';

import {
  BlueLocationPinIcon,
  RankFirstIcon,
  RankSecondIcon,
  RankThirdIcon,
} from '@/shared/assets/icons';
import { coffee } from '@/shared/assets/images/ios-stickers';
import { CardTitle, PlaceTagCard } from '@/shared/ui/card';

import { STORY_PLACES } from './storyPreviewData';

import type { ReactNode } from 'react';

const RANK_ICONS = [RankFirstIcon, RankSecondIcon, RankThirdIcon] as const;

type StoryPlaceListProps = { headerContent?: ReactNode; onSelectPlace?: (placeId: string) => void };
type StorySpendingHistoryProps = { headerContent?: ReactNode };

/** 공통 카드와 실제 스티커 에셋으로 자주 소비한 곳 목록을 구성합니다. */
export function StoryPlaceList({ headerContent, onSelectPlace }: StoryPlaceListProps) {
  return (
    <div className="pb-28">
      {headerContent && (
        <div className="sticky top-0 z-sticky-header bg-neutral-00">{headerContent}</div>
      )}
      <p className="pt-2 pb-5 text-center text-body-02-medium text-neutral-500">
        이번 달 가장 자주 찾은 곳이에요
      </p>
      <ol className="flex flex-col gap-6">
        {STORY_PLACES.map((place, index) => {
          const RankIcon = RANK_ICONS[index];
          const content = (
            <>
              <span className="flex w-7 shrink-0 items-center justify-center">
                {RankIcon ? (
                  <RankIcon className="w-7 drop-shadow-rank" aria-hidden="true" />
                ) : (
                  <span className="text-body-02-semibold text-neutral-500">{index + 1}</span>
                )}
              </span>
              <PlaceTagCard
                thumbnailSrc={place.image}
                title={place.name}
                tags={[{ label: '성수동', icon: BlueLocationPinIcon }, { label: place.category }]}
              />
              <strong className="shrink-0 text-title-01-semibold text-neutral-700">
                {place.visits}
                <span className="ml-1 text-label-01-medium">회</span>
              </strong>
            </>
          );
          return (
            <li key={place.id}>
              {onSelectPlace ? (
                <button
                  type="button"
                  onClick={() => onSelectPlace(place.id)}
                  className="flex w-full items-center gap-2 rounded-12 text-left outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary-500"
                >
                  {content}
                </button>
              ) : (
                <div className="flex items-center gap-2">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** 날짜·가게·금액이 있는 소비 목록으로 긴 화면의 스크롤과 복원을 확인합니다. */
export function StorySpendingHistory({ headerContent }: StorySpendingHistoryProps) {
  return (
    <div className="pb-28">
      {headerContent && (
        <div className="sticky top-0 z-sticky-header bg-neutral-00">{headerContent}</div>
      )}
      {[
        { date: '11월 10일', places: STORY_PLACES },
        { date: '11월 9일', places: STORY_PLACES.slice(0, 3) },
        { date: '11월 7일', places: STORY_PLACES.slice(1) },
      ].map(({ date, places }) => (
        <section key={date} className="pt-5">
          <h3 className="mb-4 text-body-01-semibold text-neutral-700">{date}</h3>
          <ul className="space-y-5">
            {places.map((place) => (
              <li key={place.id} className="flex items-center gap-3">
                <img src={place.image} alt="" className="size-13 shrink-0 object-contain" />
                <div className="min-w-0 flex-1">
                  <CardTitle weight="semibold">{place.name}</CardTitle>
                  <p className="mt-1 text-caption-01-regular text-neutral-500">
                    오전 · {place.category}
                  </p>
                </div>
                <strong className="shrink-0 text-body-01-semibold text-neutral-700">
                  {place.amount.toLocaleString('ko-KR')} 원
                </strong>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** 리포트 활성 탭은 월간 요약과 소비 기록 위에서 비교합니다. */
export function StoryReportBackground() {
  return (
    <main className="min-h-dvh bg-neutral-50 px-5 pt-10 pb-8">
      <p className="text-label-01-medium text-neutral-500">2026년 11월</p>
      <h1 className="mt-2 text-heading-01-bold text-neutral-700">나의 동네 생활</h1>
      <section className="mt-7 rounded-30 bg-primary-50 p-6">
        <p className="text-body-02-medium text-neutral-600">이번 달 동네에서 쓴 금액</p>
        <p className="mt-2 text-heading-01-bold text-primary-600">
          184,500<span className="ml-1 text-body-01-medium">원</span>
        </p>
        <div className="mt-6 flex items-center gap-3">
          <img src={coffee} alt="" className="size-16 object-contain" />
          <p className="text-body-02-medium text-neutral-600">
            가장 자주 찾은 카테고리는
            <br />
            <strong className="text-neutral-700">카페</strong>였어요
          </p>
        </div>
      </section>
      <h2 className="mt-8 mb-2 text-title-01-bold text-neutral-700">최근 소비 기록</h2>
      <StorySpendingHistory />
    </main>
  );
}

/** 선택된 탭이 없는 기록 화면은 기존 스티커 에셋으로 배경 대비를 확인합니다. */
export function StoryRecordBackground() {
  const [selectedId, setSelectedId] = useState<string>('coffee');
  return (
    <main className="min-h-dvh bg-neutral-00 px-5 pt-10 pb-32">
      <p className="text-label-01-medium text-primary-500">오늘의 기록</p>
      <h1 className="mt-2 text-heading-01-bold text-neutral-700">어떤 소비를 하셨나요?</h1>
      <p className="mt-3 text-body-02-medium text-neutral-500">마음에 드는 스티커를 골라보세요</p>
      <div className="mt-8 grid grid-cols-2 gap-4">
        {STORY_PLACES.map((place) => (
          <button
            key={place.id}
            type="button"
            aria-pressed={selectedId === place.id}
            aria-label={`${place.name} 스티커`}
            onClick={() => setSelectedId(place.id)}
            className="flex aspect-square flex-col items-center justify-center gap-3 rounded-30 border border-neutral-200 bg-neutral-50 text-neutral-600 outline-offset-4 aria-pressed:border-primary-500 aria-pressed:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            <img src={place.image} alt="" className="size-20 object-contain" />
            <span className="text-label-01-medium">{place.category}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
