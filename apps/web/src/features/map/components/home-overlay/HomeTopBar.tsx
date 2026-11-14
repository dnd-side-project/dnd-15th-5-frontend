import { Link } from 'react-router-dom';

import { NotificationDefaultIcon, NotificationUnreadIcon, SearchIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { ProfileAvatar } from '@/shared/ui/profile-avatar';

type HomeTopBarProps = {
  hasUnreadNotification: boolean;
};

/** 지도 홈 상단에 장소 검색과 알림·마이페이지 바로가기를 표시합니다. */
export default function HomeTopBar({ hasUnreadNotification }: HomeTopBarProps) {
  const NotificationIcon = hasUnreadNotification ? NotificationUnreadIcon : NotificationDefaultIcon;

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
