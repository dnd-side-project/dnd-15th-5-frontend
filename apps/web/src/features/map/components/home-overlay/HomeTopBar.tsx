import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { NotificationDefaultIcon, SearchIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { DefaultProfile } from '@/shared/ui/default-profile';

import HomePreferenceBanner from './HomePreferenceBanner';

import type { ComponentType, SVGProps } from 'react';

const QUICK_LINKS: ReadonlyArray<{
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  { to: ROUTE_PATHS.homeSearch, label: '장소 검색', Icon: SearchIcon },
  { to: ROUTE_PATHS.notifications, label: '알림', Icon: NotificationDefaultIcon },
];

type HomeTopBarProps = {
  recordedShopCount: number | undefined;
};

/**
 * 지도 홈 상단에 취향 요약 배너와 검색·알림·마이페이지 바로가기를 표시합니다.
 *
 * 마이페이지 버튼의 화면상 아래 좌표를 최초 렌더·요소 크기 변경·창 크기 변경 때 측정해
 * `useHomeBottomSheetStore`에 전달하고, 최대 바텀시트가 상단 UI를 덮지 않도록 합니다.
 */
export default function HomeTopBar({ recordedShopCount }: HomeTopBarProps) {
  const myPageButtonRef = useRef<HTMLAnchorElement>(null);
  const setTopActionBottom = useHomeBottomSheetStore((state) => state.setTopActionBottom);

  useLayoutEffect(() => {
    const myPageButton = myPageButtonRef.current;
    if (!myPageButton) {
      return;
    }

    const reportButtonBottom = () => {
      setTopActionBottom(myPageButton.getBoundingClientRect().bottom);
    };

    reportButtonBottom();
    window.addEventListener('resize', reportButtonBottom);

    if (typeof ResizeObserver === 'undefined') {
      return () => window.removeEventListener('resize', reportButtonBottom);
    }

    const resizeObserver = new ResizeObserver(reportButtonBottom);
    resizeObserver.observe(myPageButton);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', reportButtonBottom);
    };
  }, [setTopActionBottom]);

  return (
    <div className="flex items-center gap-2 px-4 pt-4">
      <HomePreferenceBanner recordedShopCount={recordedShopCount} />

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        {QUICK_LINKS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            title={label}
            className="flex size-8 items-center justify-center rounded-full bg-neutral-00 text-neutral-600 shadow-current-location-button transition-[background-color,transform] hover:bg-neutral-50 active:scale-95"
          >
            <Icon aria-hidden="true" className="size-6" />
          </Link>
        ))}

        <Link
          ref={myPageButtonRef}
          to={ROUTE_PATHS.myPage}
          aria-label="마이페이지"
          title="마이페이지"
          className="flex size-8 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-00 shadow-current-location-button transition-transform active:scale-95"
        >
          <DefaultProfile className="size-full" />
        </Link>
      </div>
    </div>
  );
}
