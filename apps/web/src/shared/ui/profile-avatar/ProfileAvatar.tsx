import { StickerEyesImage } from '@/shared/assets/images/stickers';
import { getProfileImageOption } from '@/shared/constants/profileImageOptions';
import { cn } from '@/shared/lib/cn';

type ProfileAvatarProps = {
  className?: string;
  backgroundColor?: string;
  profileImageCode?: string;
};

/**
 * 프로필 코드에 해당하는 아바타를 표시하며, 코드가 없으면 지정한 배경색 또는 기본 색상을 사용합니다.
 *
 * @example
 * ```tsx
 * <ProfileAvatar className="size-25" />
 * ```
 */
export default function ProfileAvatar({
  className,
  backgroundColor,
  profileImageCode,
}: ProfileAvatarProps) {
  const avatarColor = profileImageCode
    ? getProfileImageOption(profileImageCode).color
    : (backgroundColor ?? getProfileImageOption().color);

  return (
    <span
      className={cn(
        'inline-flex aspect-square items-center justify-center rounded-full bg-primary-500',
        className
      )}
      style={{ backgroundColor: avatarColor }}
    >
      <img className="h-[76%] w-[86%] object-contain" src={StickerEyesImage} alt="" />
    </span>
  );
}
