import { useLayoutEffect, useState } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { LiquidGlassScene } from 'simple-liquid-glass/backdrop';

import {
  selectIsHomeSheetFullyExpanded,
  useHomeBottomSheetStore,
} from '@/features/map/stores/homeBottomSheetStore';
import { CurrentLocationIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { BottomTabBar, BOTTOM_TAB_BAR_HEIGHT_CSS } from '@/shared/layout/bottom-tab-bar';
import {
  StoryPlaceList,
  StoryRecordBackground,
  StoryReportBackground,
  StorySpendingHistory,
} from '@/shared/layout/storybook/StoryContentPreview';
import { StoryMapBackdrop, StoryMapToolbar } from '@/shared/layout/storybook/StoryMapPreview';
import { STORY_PLACES } from '@/shared/layout/storybook/storyPreviewData';
import type { BottomSheetSnapPoint } from '@/shared/ui/bottom-sheet';
import { PlaceTagCard } from '@/shared/ui/card';

import HomeTopBar from './home-overlay/HomeTopBar';
import HomeBottomSheet from './HomeBottomSheet';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

type HomeBottomSheetPreviewProps = ComponentProps<typeof HomeBottomSheet> & {
  initialSnapPoint: Extract<BottomSheetSnapPoint, 'collapsed' | 'medium' | 'full'>;
};

type StorySelectedPlaceProps = { placeId: string };

/** 지도 API 없이 홈 시트와 네비게이션의 겹침·접힘·스크롤을 확인합니다. */
function HomeBottomSheetPreview(props: HomeBottomSheetPreviewProps) {
  return (
    <MemoryRouter initialEntries={[ROUTE_PATHS.home]}>
      <HomeBottomSheetCanvas {...props} />
    </MemoryRouter>
  );
}

/** 같은 예시 안에서 네비게이션으로 이동했다가 돌아와도 홈 시트 상태를 유지합니다. */
function HomeBottomSheetCanvas({ initialSnapPoint, ...props }: HomeBottomSheetPreviewProps) {
  const { pathname } = useLocation();
  const isReport = pathname.startsWith(ROUTE_PATHS.report);
  const isRecord = pathname.startsWith(ROUTE_PATHS.record);
  const visibleHeightPx = useHomeBottomSheetStore((state) => state.visibleHeightPx);
  const activeSheet = useHomeBottomSheetStore((state) => state.activeSheet);
  const isHomeSheetFullyExpanded = useHomeBottomSheetStore(selectIsHomeSheetFullyExpanded);
  const [category, setCategory] = useState<string | null>(null);

  useLayoutEffect(() => {
    const previousState = useHomeBottomSheetStore.getState();
    useHomeBottomSheetStore.setState({
      activeSheet: { type: 'home' },
      tab: 'frequentShops',
      scrollPositions: { frequentShops: 0, history: 0 },
    });
    useHomeBottomSheetStore.getState().setSnapPoint(initialSnapPoint);
    return () => useHomeBottomSheetStore.setState(previousState);
  }, [initialSnapPoint]);

  return (
    <LiquidGlassScene className="mobile-frame relative min-h-dvh bg-neutral-100">
      {isReport ? (
        <StoryReportBackground />
      ) : isRecord ? (
        <StoryRecordBackground />
      ) : (
        <>
          <StoryMapBackdrop
            category={category}
            selectedPlaceId={activeSheet.type === 'selectedPlace' ? activeSheet.stickerId : null}
            onSelectPlace={(placeId) =>
              useHomeBottomSheetStore.getState().showSelectedPlace(placeId)
            }
          />
          <StoryMapToolbar
            category={category}
            onCategoryChange={setCategory}
            headerContent={<HomeTopBar hasUnreadNotification />}
            isCategoryFilterVisible={!isHomeSheetFullyExpanded}
          />
          {!isHomeSheetFullyExpanded && (
            <div
              className="mobile-frame pointer-events-none fixed right-0 left-0 z-map-control flex justify-end pr-4"
              style={{
                bottom: `max(calc(${visibleHeightPx}px + 0.75rem), ${BOTTOM_TAB_BAR_HEIGHT_CSS})`,
              }}
            >
              <span
                className="flex size-8 items-center justify-center rounded-full bg-neutral-00 text-primary-500 shadow-current-location-button"
                aria-hidden="true"
              >
                <CurrentLocationIcon className="size-4" />
              </span>
            </div>
          )}
          <HomeBottomSheet {...props} />
        </>
      )}
      {(isReport || isRecord || activeSheet.type === 'home') && (
        <BottomTabBar
          onHomeClick={() => {
            if (pathname === ROUTE_PATHS.home) useHomeBottomSheetStore.getState().advance();
          }}
        />
      )}
    </LiquidGlassScene>
  );
}

/** 지도 핀과 가게 행을 선택하면 서버 호출 없이 장소 요약과 시트 전환을 확인합니다. */
function StorySelectedPlace({ placeId }: StorySelectedPlaceProps) {
  const place = STORY_PLACES.find(({ id }) => id === placeId) ?? STORY_PLACES[0];
  return (
    <div className="space-y-5 pt-2">
      <PlaceTagCard
        thumbnailSrc={place.image}
        title={place.name}
        tags={[{ label: '성수동' }, { label: place.category }]}
      />
      <p className="text-body-02-medium text-neutral-500">
        이번 달 {place.visits}번 방문한 곳이에요.
      </p>
      <button
        type="button"
        onClick={() => useHomeBottomSheetStore.getState().showHome()}
        className="w-full rounded-full bg-neutral-100 py-3 text-body-02-semibold text-neutral-700 outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary-500"
      >
        목록으로 돌아가기
      </button>
    </div>
  );
}

const meta = {
  title: 'Features/Map/HomeBottomSheet',
  component: HomeBottomSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, iframeHeight: 800 },
      description: {
        component:
          '지도와 실제 공통 카드 위에서 접힘·중간·최대 높이를 비교합니다. 핀이나 목록을 선택하면 장소 요약이 열리고, 소비 기록 탭에서는 긴 목록의 스크롤 복원을 확인할 수 있습니다.',
      },
    },
  },
  argTypes: {
    initialSnapPoint: {
      name: '시트 높이',
      options: ['collapsed', 'medium', 'full'],
      control: { type: 'select', labels: { collapsed: '접힘', medium: '중간', full: '최대' } },
    },
    renderFrequentShops: { table: { disable: true } },
    renderSpendingHistory: { table: { disable: true } },
    renderSelectedPlace: { table: { disable: true } },
  },
  args: {
    initialSnapPoint: 'medium',
    renderFrequentShops: (headerContent) => (
      <StoryPlaceList
        headerContent={headerContent}
        onSelectPlace={(placeId) => useHomeBottomSheetStore.getState().showSelectedPlace(placeId)}
      />
    ),
    renderSpendingHistory: (headerContent) => (
      <StorySpendingHistory headerContent={headerContent} />
    ),
    renderSelectedPlace: (placeId) => <StorySelectedPlace placeId={placeId} />,
  },
  render: (args) => <HomeBottomSheetPreview {...args} />,
} satisfies Meta<HomeBottomSheetPreviewProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = { args: { initialSnapPoint: 'collapsed' } };
export const Medium: Story = {};
export const Full: Story = { args: { initialSnapPoint: 'full' } };
