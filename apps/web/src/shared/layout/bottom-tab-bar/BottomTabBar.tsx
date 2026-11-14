import { NavLink } from 'react-router-dom';
import { LiquidGlass } from 'simple-liquid-glass';

import { NavigationHomeIcon, NavigationAddIcon, NavigationReportIcon } from '@/shared/assets/icons';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';
import { cn } from '@/shared/lib/cn';

import type { ComponentProps, ComponentType, SVGProps } from 'react';

import './bottomTabBar.css';

// NOTE: 캡처용 Scene 없이 Chromium은 SVG 굴절, Safari·iOS WebView·Firefox는 CSS 블러를 사용합니다.
const SURFACE_GLASS_PROPS = {
  material: 'clear',
  renderer: 'auto',
  mobileFallback: 'svg',
  quality: 'standard',
  lensProfile: 'player',
  dispersion: 50,
  frost: 0,
  saturation: 100,
  // NOTE: transparent와 알파 0은 검증 경고를 발생시키므로 빈 값으로 frost: 0의 투명 기본색을 사용한다.
  glassColor: '',
  borderColor: 'transparent',
  background: 'transparent',
  reveal: 'immediate',
  blur: 10,
  iosMinBlur: 10,
  lensOptions: { strength: 0.2, specular: 0.8, sheenAngle: -45 },
} satisfies ComponentProps<typeof LiquidGlass>;

// NOTE: 옵션 참조가 바뀌면 라이브러리가 굴절 맵을 다시 계산하므로 렌더 밖에 고정합니다.
const CAPSULE_LENS_OPTIONS = { ...SURFACE_GLASS_PROPS.lensOptions, depth: 0.4 };
const RECORD_LENS_OPTIONS = { ...SURFACE_GLASS_PROPS.lensOptions, depth: 0.2259 };

/**
 * 하단 탭바가 차지하는 높이입니다. 탭바가 숨겨졌을 때(또는 탭바 위 다른 요소가 탭바와 겹치지
 * 않아야 할 때) 이 값을 그대로 오프셋으로 사용해, 탭바의 실제 패딩·아이콘 크기가 바뀌어도 두 곳이
 * 따로 어긋나지 않게 한다. 캡슐 높이에 앱·웹별 하단 여백과 Safe Area를 더합니다.
 */
export const BOTTOM_TAB_BAR_HEIGHT_CSS =
  'calc(4.5625rem + var(--bottom-tab-bar-gap, 32px) + env(safe-area-inset-bottom))';

type TabNavLinkProps = {
  analyticsId: string;
  to: string;
  end?: boolean;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
};

/** 활성 탭의 선택 배경과 아이콘·라벨 색을 전환하는 탭 링크입니다. */
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
            'flex shrink-0 flex-col items-center justify-center gap-1 rounded-full transition-colors duration-200 motion-reduce:transition-none',
            isActive ? 'bg-neutral-400/40 text-neutral-700' : 'text-neutral-500'
          )}
          style={{ width: '4.375rem', height: '3.8125rem' }}
        >
          <Icon className="shrink-0" aria-hidden="true" />
          <span className="text-body-02-medium">{label}</span>
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
 * import { BottomTabBar } from '@/shared/layout/bottom-tab-bar';
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
      className="mobile-frame pointer-events-none fixed right-0 bottom-0 left-0 z-bottom-navigation flex items-center justify-center gap-4 px-5 pb-[calc(var(--bottom-tab-bar-gap,32px)+env(safe-area-inset-bottom))]"
      style={{ minHeight: BOTTOM_TAB_BAR_HEIGHT_CSS }}
    >
      <LiquidGlass
        {...SURFACE_GLASS_PROPS}
        radius={300}
        lensOptions={CAPSULE_LENS_OPTIONS}
        className="bottom-tab-glass pointer-events-auto shrink-0 shadow-bottom-navigation"
        style={{ width: '9.875rem', height: '4.5625rem' }}
      >
        {/* NOTE: SVG와 CSS 블러에서 동일한 Fill을 유지합니다. */}
        <div className="flex h-full items-center justify-center gap-0.5 rounded-full bg-neutral-00/65 px-2 py-1.5">
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
        {...SURFACE_GLASS_PROPS}
        radius={31}
        lensOptions={RECORD_LENS_OPTIONS}
        className="bottom-tab-glass pointer-events-auto shrink-0 rounded-full shadow-bottom-navigation"
        style={{ width: '3.8125rem', height: '3.8125rem' }}
      >
        <NavLink
          to={ROUTE_PATHS.record}
          aria-label="기록하기"
          data-analytics-id="bottom-navigation-record"
          className="record-glass-fill pointer-events-auto flex size-full items-center justify-center rounded-full text-neutral-00 outline-offset-4 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-primary-500 active:scale-95 motion-reduce:transition-none"
        >
          <NavigationAddIcon className="shrink-0" aria-hidden="true" />
        </NavLink>
      </LiquidGlass>
    </nav>
  );
}
