import {
  getProfileImageOption,
  PROFILE_IMAGE_OPTIONS,
} from '@/features/my-page/constants/profileImageOptions';
import type { ProfileImageCode } from '@/features/my-page/constants/profileImageOptions';
import { ProfileAvatar } from '@/shared/ui/profile-avatar';

type ProfileImageSelectorProps = {
  selectedCode: ProfileImageCode;
  onSelect: (code: ProfileImageCode) => void;
};

/** 프로필 기본 이미지 미리보기와 색상 선택 목록입니다. */
export default function ProfileImageSelector({
  selectedCode,
  onSelect,
}: ProfileImageSelectorProps) {
  const selectedOption = getProfileImageOption(selectedCode);

  return (
    <section className="shrink-0 border-b border-neutral-100 pb-7" aria-label="프로필 아이콘 선택">
      <div className="flex justify-center pt-1">
        <ProfileAvatar className="size-25" backgroundColor={selectedOption.color} />
      </div>
      <div className="mt-7 grid grid-cols-6 gap-2">
        {PROFILE_IMAGE_OPTIONS.map((option) => (
          <button
            key={option.code}
            type="button"
            aria-label={`${option.label} 프로필 선택`}
            aria-pressed={selectedCode === option.code}
            onClick={() => onSelect(option.code)}
            className={`flex aspect-square w-full min-w-0 max-w-13 items-center justify-center justify-self-center rounded-full focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${selectedCode === option.code ? 'outline-2 outline-primary-500 outline-offset-1' : 'outline-none'}`}
          >
            <ProfileAvatar className="size-full" backgroundColor={option.color} />
          </button>
        ))}
      </div>
    </section>
  );
}
