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
 * 애플리케이션 내부 페이지로 이동하는 공통 링크 버튼입니다.
 *
 * React Router의 링크 의미와 브라우저 탐색 동작을 유지하면서 `Button`과 동일한 variant 및 size 스타일을 제공합니다.
 * 기본적으로 전체 너비와 `large` 크기(54px)로 렌더링됩니다.
 * `className`으로 너비와 높이를 포함한 기본 스타일을 재정의할 수 있습니다.
 * `icon`과 `icon-primary` variant에는 이동 목적을 설명하는 `aria-label`이 반드시 필요합니다.
 * 외부 URL에는 이 컴포넌트 대신 스타일을 적용한 `<a>` 요소를 사용합니다.
 *
 * @example
 * ```tsx
 * <LinkButton to="/record">기록하러 가기</LinkButton>
 *
 * <LinkButton to="/record" variant="icon" aria-label="기록 페이지로 이동">
 *   <RecordIcon aria-hidden="true" />
 * </LinkButton>
 *
 * <LinkButton to="/report" variant="secondary" size="medium">
 *   <ReportIcon aria-hidden="true" />
 *   리포트 보기
 * </LinkButton>
 * ```
 *
 * @param props - 링크 버튼에 전달할 속성입니다.
 * @param props.to - 이동할 애플리케이션 내부 경로입니다.
 * @param props.children - 링크 버튼에 표시할 내용입니다.
 * `secondary`에서는 아이콘과 텍스트를 함께 전달할 수 있습니다.
 * @param props.variant - 링크 버튼 형태입니다.
 * 기본값은 `primary`입니다.
 * @param props.size - 링크 버튼 크기입니다.
 * `large` 54px, `medium` 46px, `small` 40px, `icon` 30px을 지원합니다.
 * `icon` variant의 기본값은 `icon`이며, 나머지 variant의 기본값은 `large`입니다.
 * `icon-primary` 내부 SVG는 24px로 렌더링됩니다.
 * @param props.className - 기본 스타일을 재정의하거나 확장할 Tailwind CSS 클래스입니다.
 * 50px 높이는 `className`으로 지정합니다.
 * `icon` variant의 hover 색상은 사용하는 컴포넌트에서 지정합니다.
 * @param props.replace - 현재 방문 기록을 새 경로로 대체할지 여부입니다.
 * @param props.aria-label - 아이콘 전용 variant에서 이동 목적을 설명하는 필수 이름입니다.
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
