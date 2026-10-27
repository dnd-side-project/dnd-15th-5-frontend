import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import type { ButtonProps } from '@/shared/ui/button/Button';

type DialogActionButtonProps = Omit<ButtonProps, 'className' | 'size' | 'variant'> & {
  tone: 'neutral' | 'primary';
  className?: string;
};

const TONE_CLASS_NAMES = {
  neutral: 'bg-neutral-300 text-neutral-600 hover:bg-neutral-400 active:bg-neutral-400',
  primary: 'bg-primary-500 text-neutral-00 hover:bg-primary-600 active:bg-primary-700',
} as const;

/**
 * 공통 다이얼로그에서 취소 또는 주요 확인 동작을 표시하는 버튼입니다.
 * 너비와 높이, 타이포그래피는 다이얼로그 액션 영역에 맞춰 고정되며 `className`으로 보정할 수 있습니다.
 *
 * @example
 * ```tsx
 * <DialogActionButton tone="neutral" onClick={onCancel}>취소</DialogActionButton>
 * <DialogActionButton tone="primary" onClick={onConfirm}>확인</DialogActionButton>
 * ```
 *
 * @param props - 버튼 동작과 강조 수준을 설정하는 속성입니다.
 * @param props.tone - `neutral`은 보조 동작, `primary`는 강조할 주요 동작에 사용합니다.
 * @param props.children - 버튼에 표시할 텍스트 또는 콘텐츠입니다.
 * @param props.onClick - 버튼을 눌렀을 때 실행할 동작입니다.
 * @param props.disabled - 버튼을 비활성화할지 여부입니다.
 * @param props.isLoading - 처리 중 상태를 표시하고 버튼 입력을 막을지 여부입니다.
 * @param props.className - 기본 액션 버튼 스타일에 추가할 클래스입니다.
 */
export function DialogActionButton({ tone, className, ...props }: DialogActionButtonProps) {
  return (
    <Button
      {...props}
      variant="secondary"
      size="medium"
      className={cn(
        'h-12 w-0 min-w-0 flex-1 rounded-full border-0 text-body-01-medium',
        TONE_CLASS_NAMES[tone],
        className
      )}
    />
  );
}
