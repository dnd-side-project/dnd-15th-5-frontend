import { LocationPinIcon } from '@/shared/assets/icons';

type CardLocationProps = {
  children: string;
};

/** 카드의 주소를 표시합니다. 한 줄을 넘으면 말줄임합니다. */
export function CardLocation({ children }: CardLocationProps) {
  return (
    <span className="flex items-center gap-0.5 text-body-02-regular text-neutral-500">
      <LocationPinIcon className="size-3 shrink-0 text-neutral-400" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </span>
  );
}
