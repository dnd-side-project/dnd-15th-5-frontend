import { StickerEyesImage } from '@/shared/assets/images/stickers';
import { getProfileImageOption } from '@/shared/constants/profileImageOptions';
import { cn } from '@/shared/lib/cn';

type ProfileAvatarProps = {
  className?: string;
  backgroundColor?: string;
  profileImageCode?: string;
  profileImageUrl?: string | null;
};

/**
 * 프로필 코드를 우선 표시하고, 코드가 없으면 기존 이미지 또는 기본 아바타를 표시합니다.
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
  profileImageUrl,
}: ProfileAvatarProps) {
  if (!profileImageCode && profileImageUrl) {
    return (
      <img
        className={cn('aspect-square rounded-full object-cover', className)}
        src={profileImageUrl}
        alt="프로필"
        data-mp-block=""
      />
    );
  }

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
