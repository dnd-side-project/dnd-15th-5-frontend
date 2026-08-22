import { Link } from 'react-router-dom';

import { ChapchapLogo, NotificationDefaultIcon, SearchIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

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
  recordedShopCount: number;
};

/** 지도 홈 상단에 뜨는 취향 요약 배너와 검색·알림·마이페이지 바로가기입니다. */
export default function HomeTopBar({ recordedShopCount }: HomeTopBarProps) {
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
            <Icon aria-hidden="true" className="size-4" />
          </Link>
        ))}

        <Link
          to={ROUTE_PATHS.myPage}
          aria-label="마이페이지"
          title="마이페이지"
          className="flex size-8 items-center justify-center overflow-hidden rounded-full border-2 border-neutral-00 shadow-current-location-button transition-transform active:scale-95"
        >
          <ChapchapLogo aria-hidden="true" className="size-full" />
        </Link>
      </div>
    </div>
  );
}
