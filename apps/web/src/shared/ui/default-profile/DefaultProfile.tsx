import { StickerEyesImage } from '@/shared/assets/images/stickers';
import { cn } from '@/shared/lib/cn';

type DefaultProfileProps = {
  className?: string;
};

/**
 * 프로필 이미지가 없는 사용자를 표시하는 공통 기본 프로필입니다.
 *
 * @example
 * ```tsx
 * <DefaultProfile className="size-25" />
 * ```
 */
export default function DefaultProfile({ className }: DefaultProfileProps) {
  return (
    <span
      className={cn(
        'inline-flex aspect-square items-center justify-center rounded-full bg-primary-500',
        className
      )}
    >
      <img className="h-[76%] w-[86%] object-contain" src={StickerEyesImage} alt="" />
    </span>
  );
}
