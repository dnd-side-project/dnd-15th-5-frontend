import type { ComponentType, ReactNode, SVGProps } from 'react';

type ChipProps = {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  children: ReactNode;
};

/**
 * 카테고리·지역 등 짧은 정보를 표시하는 공통 칩입니다.
 *
 * 아이콘은 있는 경우에만 전달합니다(예: 지역 태그는 위치 아이콘과 함께, 카테고리 태그는 텍스트만).
 *
 * @example
 * ```tsx
 * import { BlueLocationPinIcon } from '@/shared/assets/icons';
 * import { Chip } from '@/shared/ui/chip';
 *
 * <Chip icon={BlueLocationPinIcon}>용산구</Chip>
 * <Chip>카페</Chip>
 * ```
 *
 * @param props - 칩 속성입니다.
 * @param props.icon - 라벨 앞에 표시할 아이콘입니다. 선택 사항입니다.
 * @param props.children - 칩에 표시할 라벨입니다.
 */
export function Chip({ icon: Icon, children }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-05 bg-primary-50 px-2 py-1 text-label-01-medium text-primary-400">
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </span>
  );
}
