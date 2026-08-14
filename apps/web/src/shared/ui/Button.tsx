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
 * Base UI가 제공하는 키보드 및 비활성화 동작을 사용하며, 기본적으로 전체 너비와 `xlarge` 크기(54px)로 렌더링됩니다.
 * `className`으로 너비를 포함한 기본 스타일을 재정의할 수 있습니다.
 * `icon`과 `icon-primary` variant에는 버튼의 목적을 설명하는 `aria-label`이 반드시 필요합니다.
 *
 * @example
 * ```tsx
 * <Button onClick={handleSubmit}>저장하기</Button>
 *
 * <Button variant="icon-primary" aria-label="기록 추가">
 *   <PlusIcon aria-hidden="true" />
 * </Button>
 *
 * <Button variant="secondary">
 *   <DownloadIcon aria-hidden="true" />
 *   이미지 저장
 * </Button>
 * ```
 *
 * @param props - 버튼에 전달할 속성입니다.
 * @param props.children - 버튼에 표시할 내용입니다.
 * `secondary`에서는 아이콘과 텍스트를 함께 전달할 수 있습니다.
 * @param props.variant - 버튼 형태입니다.
 * 기본값은 `primary`입니다.
 * @param props.size - 버튼 높이입니다.
 * `xlarge` 54px, `large` 50px, `medium` 46px, `small` 40px을 지원합니다.
 * 기본값은 `xlarge`입니다.
 * @param props.className - 기본 스타일을 재정의하거나 확장할 Tailwind CSS 클래스입니다.
 * `icon` variant의 hover 색상은 사용하는 컴포넌트에서 지정합니다.
 * @param props.disabled - 버튼을 비활성화하고 사용자 인터랙션을 차단합니다.
 * @param props.onClick - 버튼을 실행했을 때 호출됩니다.
 * @param props.aria-label - 아이콘 전용 variant에서 버튼의 목적을 설명하는 필수 이름입니다.
 */
export function Button(props: ButtonProps) {
  const { className, size = 'xlarge', type = 'button', variant = 'primary', ...restProps } = props;

  return (
    <BaseButton
      type={type}
      className={cn(buttonVariants({ size, variant }), className)}
      {...restProps}
    />
  );
}
