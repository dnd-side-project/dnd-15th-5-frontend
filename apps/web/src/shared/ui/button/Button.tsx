import { Button as BaseButton } from '@base-ui/react/button';

import { cn } from '@/shared/lib/cn';

import { buttonVariants } from './buttonVariants';

import type { ButtonContentProps, ButtonStyleProps } from './types';
import type { ComponentProps } from 'react';

type BaseButtonProps = Omit<
  ComponentProps<typeof BaseButton>,
  | 'aria-label'
  | 'children'
  | 'className'
  | 'disabled'
  | 'focusableWhenDisabled'
  | 'nativeButton'
  | 'onClick'
  | 'render'
>;

type ButtonActionProps = {
  disabled?: ComponentProps<typeof BaseButton>['disabled'];
  onClick?: ComponentProps<typeof BaseButton>['onClick'];
};

export type ButtonProps = BaseButtonProps &
  ButtonContentProps &
  ButtonStyleProps &
  ButtonActionProps;

/**
 * 사용자 동작을 실행하는 공통 버튼입니다.
 *
 * Base UI의 키보드 조작과 비활성화 동작을 지원합니다.
 * `primary`와 `secondary`는 `large` 또는 `medium`일 때 전체 너비로 렌더링됩니다.
 * 50px 높이 등 기본 스타일에 없는 값은 `className`으로 지정합니다.
 * `icon`과 `icon-primary` variant에는 버튼의 목적을 설명하는 `aria-label`이 반드시 필요합니다.
 * `icon` variant의 hover 색상은 사용하는 컴포넌트에서 지정합니다.
 *
 * @example
 * ```tsx
 * import { AddIcon, ShareIcon } from '@/shared/assets/icons';
 * import { Button } from '@/shared/ui/button';
 *
 * <Button onClick={handleSubmit}>저장하기</Button>
 *
 * <Button variant="icon-primary" aria-label="기록 추가">
 *   <AddIcon aria-hidden="true" />
 * </Button>
 *
 * <Button variant="secondary" size="medium">
 *   <ShareIcon aria-hidden="true" />
 *   취향 카드 공유하기
 * </Button>
 * ```
 *
 * @param props - 버튼 속성입니다.
 * @param props.children - 버튼에 표시할 내용입니다. 아이콘과 텍스트를 함께 전달할 수 있습니다.
 * @param props.variant - 버튼 스타일입니다.
 * 기본값은 `primary`입니다.
 * @param props.size - 버튼 크기입니다.
 * `primary`, `secondary`, `icon-primary`에서는 `large` 54px, `medium` 46px, `small` 40px을 지원합니다.
 * `icon`에서는 30px의 `icon`만 지원합니다.
 * `icon` variant의 기본값은 `icon`이며, 나머지 variant의 기본값은 `large`입니다.
 * @param props.className - 스타일을 확장하거나 재정의할 Tailwind CSS 클래스입니다.
 * @param props.type - 네이티브 버튼 타입입니다. 기본값은 `button`이며, 폼을 제출할 때는 `submit`을 지정합니다.
 * @param props.disabled - 버튼을 비활성화합니다.
 * @param props.onClick - 버튼을 실행했을 때 호출됩니다.
 * @param props.aria-label - 아이콘 전용 variant의 목적을 설명하는 접근성 이름입니다.
 */
export function Button(props: ButtonProps) {
  const { className, size, type = 'button', variant = 'primary', ...restProps } = props;
  const resolvedSize = size ?? (variant === 'icon' ? 'icon' : 'large');

  return (
    <BaseButton
      type={type}
      className={cn(buttonVariants({ size: resolvedSize, variant }), className)}
      {...restProps}
    />
  );
}
