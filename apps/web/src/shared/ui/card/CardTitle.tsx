import type { ReactNode } from 'react';

type CardTitleWeight = 'medium' | 'semibold';

type CardTitleProps = {
  children: ReactNode;
  weight: CardTitleWeight;
};

const WEIGHT_CLASS: Record<CardTitleWeight, string> = {
  medium: 'text-body-01-medium',
  semibold: 'text-body-01-semibold',
};

/**
 * 카드의 이름·제목을 표시합니다. 한 줄을 넘으면 말줄임합니다.
 *
 * 카드 종류마다 디자인상 굵기가 달라(예: `PlaceCard`는 medium, `PlaceTagCard`는 semibold)
 * `weight`로 지정합니다.
 */
export function CardTitle({ children, weight }: CardTitleProps) {
  return <p className={`truncate ${WEIGHT_CLASS[weight]} text-neutral-900`}>{children}</p>;
}
