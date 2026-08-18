import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

import { buttonVariants } from './buttonVariants';

import type { ButtonContentProps, ButtonStyleProps } from './types';
import type { ComponentProps } from 'react';

type BaseLinkProps = Omit<
  ComponentProps<typeof Link>,
  'aria-label' | 'children' | 'className' | 'replace' | 'to'
>;

type LinkNavigationProps = {
  to: ComponentProps<typeof Link>['to'];
  replace?: ComponentProps<typeof Link>['replace'];
};

export type LinkButtonProps = BaseLinkProps &
  ButtonContentProps &
  ButtonStyleProps &
  LinkNavigationProps;

/**
 * 페이지로 이동하는 공통 링크 버튼입니다.
 *
 * 내부 경로는 React Router로 이동하고, 외부 URL은 일반 링크로 이동합니다.
 * `Button`과 동일한 스타일을 제공합니다.
 * `primary`와 `secondary`는 `large` 또는 `medium`일 때 전체 너비로 렌더링됩니다.
 * 50px 높이 등 기본 스타일에 없는 값은 `className`으로 지정합니다.
 * `icon`과 `icon-primary` variant에는 이동 목적을 설명하는 `aria-label`이 반드시 필요합니다.
 * `icon` variant의 hover 색상은 사용하는 컴포넌트에서 지정합니다.
 *
 * @example
 * ```tsx
 * import { NavigationRecordIcon, NavigationReportIcon } from '@/shared/assets/icons';
 * import { LinkButton } from '@/shared/ui/button';
 *
 * <LinkButton to="/record" variant="icon" aria-label="기록 페이지로 이동">
 *   <NavigationRecordIcon aria-hidden="true" />
 * </LinkButton>
 *
 * <LinkButton to="/report" variant="secondary" size="medium">
 *   <NavigationReportIcon aria-hidden="true" />
 *   리포트 보기
 * </LinkButton>
 *
 * <LinkButton to="https://example.com" target="_blank" rel="noopener noreferrer">
 *   외부 페이지 열기
 * </LinkButton>
 * ```
 *
 * @param props - 링크 버튼 속성입니다.
 * @param props.to - 이동할 내부 경로 또는 외부 URL입니다.
 * @param props.children - 링크 버튼에 표시할 내용입니다. 아이콘과 텍스트를 함께 전달할 수 있습니다.
 * @param props.variant - 링크 버튼 스타일입니다.
 * 기본값은 `primary`입니다.
 * @param props.size - 링크 버튼 크기입니다.
 * `primary`, `secondary`, `icon-primary`에서는 `large` 54px, `medium` 46px, `small` 40px을 지원합니다.
 * `icon`에서는 30px의 `icon`만 지원합니다.
 * `icon` variant의 기본값은 `icon`이며, 나머지 variant의 기본값은 `large`입니다.
 * @param props.className - 스타일을 확장하거나 재정의할 Tailwind CSS 클래스입니다.
 * @param props.replace - 현재 방문 기록을 새 경로로 대체할지 여부입니다.
 * @param props.aria-label - 아이콘 전용 variant의 이동 목적을 설명하는 접근성 이름입니다.
 */
export function LinkButton(props: LinkButtonProps) {
  const { className, size, variant = 'primary', ...restProps } = props;
  const resolvedSize = size ?? (variant === 'icon' ? 'icon' : 'large');

  return (
    <Link
      className={cn(buttonVariants({ size: resolvedSize, variant }), className)}
      {...restProps}
    />
  );
}
