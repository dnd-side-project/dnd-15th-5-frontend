import { cn } from '@/shared/lib/cn';

type OverlayProps = {
  className?: string;
};

/**
 * 바텀시트 뒤에 깔리는 공용 오버레이입니다.
 *
 * 시각적인 딤 처리만 담당하며 닫기 동작은 `useOutsidePress` 같은 훅에서 연결합니다.
 * 모바일 프레임의 최대 너비에 맞춰 화면 전체를 덮습니다.
 *
 * @example
 * ```tsx
 * <Overlay />
 * ```
 *
 * @param props - 오버레이 속성입니다.
 * @param props.className - 오버레이에 추가할 스타일입니다.
 */
export function Overlay({ className }: OverlayProps) {
  return (
    <div
      aria-hidden="true"
      data-slot="overlay"
      className={cn('mobile-frame fixed inset-0 z-modal-backdrop bg-neutral-900/20', className)}
    />
  );
}
