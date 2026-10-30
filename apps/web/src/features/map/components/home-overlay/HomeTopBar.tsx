import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { useHomeBottomSheetStore } from '@/features/map/stores/homeBottomSheetStore';
import { NotificationDefaultIcon, NotificationUnreadIcon, SearchIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { ProfileAvatar } from '@/shared/ui/profile-avatar';

type HomeTopBarProps = {
  hasUnreadNotification: boolean;
};

/**
 * 지도 홈 상단에 장소 검색과 알림·마이페이지 바로가기를 표시합니다.
 *
 * 마이페이지 버튼의 화면상 아래 좌표를 최초 렌더·요소 크기 변경·창 크기 변경 때 측정해
 * `useHomeBottomSheetStore`에 전달하고, 최대 바텀시트가 상단 UI를 덮지 않도록 합니다.
 */
export default function HomeTopBar({ hasUnreadNotification }: HomeTopBarProps) {
  const myPageButtonRef = useRef<HTMLAnchorElement>(null);
  const setTopActionBottom = useHomeBottomSheetStore((state) => state.setTopActionBottom);
  const NotificationIcon = hasUnreadNotification ? NotificationUnreadIcon : NotificationDefaultIcon;

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
    <div className="flex items-center gap-2.75 px-4 py-2">
      <Link
        to={ROUTE_PATHS.homeSearch}
        aria-label="장소 검색"
        title="장소 검색"
        className="flex h-11.5 min-w-0 flex-1 items-center justify-between gap-3 rounded-full bg-neutral-00 px-5 text-neutral-400 shadow-home-overlay transition-[background-color,transform] hover:bg-neutral-50 active:scale-[0.99]"
      >
        <span className="truncate text-body-02-medium text-neutral-500 max-[390px]:text-label-01-medium">
          오늘은 어떤 곳에 방문하셨나요?
        </span>
        <SearchIcon
          aria-hidden="true"
          className="size-6.5 shrink-0 text-neutral-600 [&_path]:fill-neutral-600"
        />
      </Link>

      <div className="flex shrink-0 items-center gap-2.75">
        <Link
          to={ROUTE_PATHS.notifications}
          aria-label={hasUnreadNotification ? '읽지 않은 알림 있음' : '알림'}
          title="알림"
          className="flex size-10 items-center justify-center rounded-full bg-neutral-00 text-neutral-600 shadow-home-overlay transition-[background-color,transform] hover:bg-neutral-50 active:scale-95"
        >
          <NotificationIcon aria-hidden="true" className="size-6.5 [&_path]:fill-neutral-600" />
        </Link>

        <Link
          ref={myPageButtonRef}
          to={ROUTE_PATHS.myPage}
          aria-label="마이페이지"
          title="마이페이지"
          className="flex size-10 items-center justify-center overflow-hidden rounded-full shadow-home-overlay transition-transform active:scale-95"
        >
          <ProfileAvatar className="size-full [&_img]:size-7" />
        </Link>
      </div>
    </div>
  );
}
