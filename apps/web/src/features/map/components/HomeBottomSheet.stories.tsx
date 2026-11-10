import { useLayoutEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LiquidGlassScene } from 'simple-liquid-glass/backdrop';

import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { CurrentLocationIcon } from '@/shared/assets/icons';
import BottomTabBar, { BOTTOM_TAB_BAR_HEIGHT_CSS } from '@/shared/layout/BottomTabBar';

import HomeBottomSheet from './HomeBottomSheet';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps, ReactNode } from 'react';

type HomeBottomSheetPreviewProps = ComponentProps<typeof HomeBottomSheet> & {
  initialStepIndex: number;
};

type PreviewListProps = { headerContent: ReactNode; label: string };

/** 지도 API 없이 홈 시트와 네비게이션의 겹침·접힘·스크롤을 확인합니다. */
function HomeBottomSheetPreview({ initialStepIndex, ...props }: HomeBottomSheetPreviewProps) {
  const visibleHeightPx = useHomeBottomSheetStore((state) => state.visibleHeightPx);

  useLayoutEffect(() => {
    const previousState = useHomeBottomSheetStore.getState();
    useHomeBottomSheetStore.setState({
      activeSheet: { type: 'home' },
      stepIndex: initialStepIndex,
      tab: 'frequentShops',
      scrollPositions: { frequentShops: 0, history: 0 },
    });
    return () => useHomeBottomSheetStore.setState(previousState);
  }, [initialStepIndex]);

  return (
    <MemoryRouter initialEntries={['/home']}>
      <LiquidGlassScene className="mobile-frame min-h-dvh bg-primary-50">
        <section className="flex h-dvh flex-col items-center justify-center gap-8 text-neutral-500">
          <p>시트를 내리고 위로 당겨보세요</p>
          <div className="size-48 rounded-full border-8 border-primary-100 bg-neutral-00" />
        </section>
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
        <HomeBottomSheet {...props} />
        <BottomTabBar onHomeClick={() => useHomeBottomSheetStore.getState().advance()} />
      </LiquidGlassScene>
    </MemoryRouter>
  );
}

/** 목록은 충분히 길게 두어 접힘 전후 스크롤 복원도 확인합니다. */
function PreviewList({ headerContent, label }: PreviewListProps) {
  return (
    <div>
      <div className="sticky top-0 z-sticky-header bg-neutral-00">{headerContent}</div>
      {Array.from({ length: 12 }, (_, index) => (
        <article key={index} className="flex h-24 items-center gap-4 border-b border-neutral-200">
          <span className="flex size-12 items-center justify-center rounded-12 bg-primary-100 text-primary-600">
            {index + 1}
          </span>
          <p className="text-body-02-semibold text-neutral-700">
            {label} {index + 1}
          </p>
        </article>
      ))}
    </div>
  );
}

const meta = {
  title: 'Features/Map/HomeBottomSheet',
  component: HomeBottomSheet,
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 800 } } },
  args: {
    initialStepIndex: 0,
    renderFrequentShops: (headerContent) => (
      <PreviewList headerContent={headerContent} label="동네 가게" />
    ),
    renderSpendingHistory: (headerContent) => (
      <PreviewList headerContent={headerContent} label="소비 기록" />
    ),
    renderSelectedPlace: () => <p>선택한 가게 정보</p>,
  },
  render: (args) => <HomeBottomSheetPreview {...args} />,
} satisfies Meta<HomeBottomSheetPreviewProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = { args: { initialStepIndex: 3 } };
export const Medium: Story = {};
export const Full: Story = { args: { initialStepIndex: 1 } };
