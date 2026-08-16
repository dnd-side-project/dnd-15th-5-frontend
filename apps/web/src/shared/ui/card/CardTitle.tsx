import type { ReactNode } from 'react';

type CardTitleProps = {
  children: ReactNode;
};

/** 카드의 이름·제목을 표시합니다. 한 줄을 넘으면 말줄임합니다. */
export function CardTitle({ children }: CardTitleProps) {
  return <p className="truncate text-body-01-bold text-neutral-900">{children}</p>;
}
