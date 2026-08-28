import { NavLink } from 'react-router-dom';

import {
  NavigationHomeIcon,
  NavigationRecordIcon,
  NavigationReportIcon,
} from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { cn } from '@/shared/lib/cn';

import type { ComponentType, SVGProps } from 'react';

/**
 * 하단 탭바가 차지하는 높이입니다. 탭바가 숨겨졌을 때(또는 탭바 위 다른 요소가 탭바와 겹치지
 * 않아야 할 때) 이 값을 그대로 오프셋으로 사용해, 탭바의 실제 패딩·아이콘 크기가 바뀌어도 두 곳이
 * 따로 어긋나지 않게 한다.
 */
export const BOTTOM_TAB_BAR_HEIGHT_CSS = 'calc(6.5rem + env(safe-area-inset-bottom))';

type TabNavLinkProps = {
  to: string;
  end?: boolean;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
};

/** 활성 탭 아이콘 뒤에 알약 모양 배경을, 라벨 색과 굵기를 애니메이션으로 전환하는 탭 링크입니다. */
function TabNavLink({ to, end, label, Icon, onClick }: TabNavLinkProps) {
  return (
    <NavLink to={to} end={end} onClick={onClick} className="flex min-w-0 justify-center">
      {({ isActive }) => (
        <span
          className={cn(
            'flex h-15.5 w-22 flex-col items-center justify-center gap-1 rounded-30 transition-colors duration-200',
            isActive ? 'bg-neutral-100 text-neutral-700' : 'bg-neutral-00 text-neutral-500'
          )}
        >
          <Icon className="transition-colors duration-200" aria-hidden="true" />
          <span
            className={cn(
              'text-label-01-medium transition-colors duration-200',
              isActive && 'font-bold'
            )}
          >
            {label}
          </span>
        </span>
      )}
    </NavLink>
  );
}

type BottomTabBarProps = {
  onHomeClick?: () => void;
};

/**
 * 홈·기록하기·리포트로 이동하는 하단 탭바입니다.
 *
 * 화면 하단에 붙어 상단 모서리만 둥글고, 기록하기는 가운데 위로 떠 있는 원형 버튼으로 표시합니다.
 * "홈" 탭 클릭에 어떤 동작이 필요한지는 이 컴포넌트가 알지 못하므로(`shared`는 `features`를
 * import할 수 없음), `onHomeClick`으로 바깥에서 주입합니다.
 *
 * @example
 * ```tsx
 * import BottomTabBar from '@/shared/layout/BottomTabBar';
 *
 * <BottomTabBar onHomeClick={() => advanceHomeBottomSheet()} />
 * ```
 *
 * @param props - 탭바 속성입니다.
 * @param props.onHomeClick - "홈" 탭을 눌렀을 때 호출됩니다. 선택 사항입니다.
 */
export default function BottomTabBar({ onHomeClick }: BottomTabBarProps) {
  return (
    <nav
      aria-label="주요 메뉴"
      className="sticky bottom-0 z-bottom-navigation grid shrink-0 grid-cols-3 items-start rounded-t-30 border-x border-t border-neutral-200 bg-neutral-00 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <TabNavLink
        to={ROUTE_PATHS.home}
        end
        label="홈"
        Icon={NavigationHomeIcon}
        onClick={onHomeClick}
      />

      {/* NOTE: 원 버튼은 다른 탭과 높이가 달라 flex 정렬에 얹으면 튀어나오는 정도가 흔들려서,
          nav 기준 절대 위치로 고정한다. 라벨만 다른 탭과 같은 높이의 자리를 차지하도록 둔다. */}
      <div className="relative h-15.5 min-w-0">
        <span className="absolute top-9 flex w-full justify-center whitespace-nowrap text-label-01-medium text-neutral-500">
          기록 하기
        </span>
      </div>

      <TabNavLink to={ROUTE_PATHS.report} label="리포트" Icon={NavigationReportIcon} />

      <NavLink
        to={ROUTE_PATHS.record}
        aria-label="기록하기"
        className="absolute left-1/2 -top-5 flex size-15 -translate-x-1/2 items-center justify-center rounded-full bg-primary-400 shadow-record transition-transform duration-150 active:scale-95"
      >
        <NavigationRecordIcon aria-hidden="true" />
      </NavLink>
    </nav>
  );
}
