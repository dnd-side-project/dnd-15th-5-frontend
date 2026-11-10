import { NavLink } from 'react-router-dom';
import { LiquidGlass } from 'simple-liquid-glass';

import { NavigationHomeIcon, AddIcon, NavigationReportIcon } from '@/shared/assets/icons';
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
  analyticsId: string;
  to: string;
  end?: boolean;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
};

/** 활성 탭 아이콘 뒤에 알약 모양 배경을, 라벨 색과 굵기를 애니메이션으로 전환하는 탭 링크입니다. */
function TabNavLink({ analyticsId, to, end, label, Icon, onClick }: TabNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      data-analytics-id={analyticsId}
      className="flex min-w-0 justify-center rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary-500"
    >
      {({ isActive }) => (
        <span
          className={cn(
            'flex h-15.25 w-18.25 flex-col items-center justify-center gap-1 rounded-full transition-colors duration-200 motion-reduce:transition-none',
            isActive ? 'bg-neutral-700/10 text-neutral-700' : 'text-neutral-500'
          )}
        >
          <Icon aria-hidden="true" />
          <span className={cn('text-label-01-medium', isActive && 'font-bold')}>{label}</span>
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
 * 홈·리포트는 유리 캡슐에, 기록하기는 오른쪽의 독립된 원형 버튼으로 표시합니다.
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
      data-liquid-glass-ignore
      className="mobile-frame pointer-events-none fixed right-0 bottom-0 left-0 z-bottom-navigation flex items-center justify-center gap-4 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      style={{ minHeight: BOTTOM_TAB_BAR_HEIGHT_CSS }}
    >
      <LiquidGlass
        material="clear"
        radius={300}
        blur={2}
        iosMinBlur={2}
        mobileFallback="svg"
        quality="standard"
        lensProfile="player"
        lensOptions={{ strength: 0.2, depth: 0.4, specular: 0.8, sheenAngle: -45 }}
        dispersion={50}
        frost={0.1}
        background="transparent"
        reveal="immediate"
        className="pointer-events-auto shrink-0"
        style={{ width: '9.875rem', height: '4.5625rem' }}
      >
        {/* NOTE: WebGL이 glassColor를 자체 하이라이트로 대체하므로 Fill은 별도 배경으로 유지한다. */}
        <div className="flex h-full items-center justify-center rounded-full bg-neutral-00/65 p-1.5">
          <TabNavLink
            analyticsId="bottom-navigation-home"
            to={ROUTE_PATHS.home}
            end
            label="홈"
            Icon={NavigationHomeIcon}
            onClick={onHomeClick}
          />
          <TabNavLink
            analyticsId="bottom-navigation-report"
            to={ROUTE_PATHS.report}
            label="리포트"
            Icon={NavigationReportIcon}
          />
        </div>
      </LiquidGlass>

      <LiquidGlass
        material="clear"
        radius={31}
        blur={2}
        iosMinBlur={2}
        mobileFallback="svg"
        quality="standard"
        lensProfile="player"
        lensOptions={{ strength: 0.2, depth: 0.2259, specular: 0.8, sheenAngle: -45 }}
        dispersion={50}
        frost={0.1}
        glassColor="rgba(255,255,255,0.01)"
        borderColor="transparent"
        reveal="immediate"
        className="pointer-events-auto shrink-0 rounded-full"
        style={{ width: '3.8125rem', height: '3.8125rem' }}
      >
        <NavLink
          to={ROUTE_PATHS.record}
          aria-label="기록하기"
          data-analytics-id="bottom-navigation-record"
          className="pointer-events-auto flex size-full items-center justify-center rounded-full bg-record-glass text-neutral-00 outline-offset-4 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-primary-500 active:scale-95 motion-reduce:transition-none"
        >
          <AddIcon className="size-8" aria-hidden="true" />
        </NavLink>
      </LiquidGlass>
    </nav>
  );
}
