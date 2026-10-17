import { PROFILE_IMAGE_OPTIONS } from '@/features/my-page/constants/profileImageOptions';
import type { ProfileImageCode } from '@/features/my-page/constants/profileImageOptions';
import { StickerEyesImage } from '@/shared/assets/images/stickers';

type ProfileImageSelectorProps = {
  selectedCode: ProfileImageCode;
  onSelect: (code: ProfileImageCode) => void;
};

/** 프로필 기본 이미지 미리보기와 색상 선택 목록입니다. */
export default function ProfileImageSelector({
  selectedCode,
  onSelect,
}: ProfileImageSelectorProps) {
  const selectedOption = PROFILE_IMAGE_OPTIONS.find((option) => option.code === selectedCode);

  return (
    <section className="shrink-0 border-b border-neutral-100 pb-7" aria-label="프로필 아이콘 선택">
      <div className="flex justify-center pt-1">
        <span
          className="inline-flex size-25 items-center justify-center rounded-full"
          style={{ backgroundColor: selectedOption?.color ?? PROFILE_IMAGE_OPTIONS[0].color }}
        >
          <img className="h-[76%] w-[86%] object-contain" src={StickerEyesImage} alt="" />
        </span>
      </div>
      <div className="mt-7 grid grid-cols-6 gap-2 px-4">
        {PROFILE_IMAGE_OPTIONS.map((option) => (
          <button
            key={option.code}
            type="button"
            aria-label={`${option.label} 프로필 선택`}
            aria-pressed={selectedCode === option.code}
            onClick={() => onSelect(option.code)}
            className={`flex aspect-square w-full min-w-0 max-w-13 items-center justify-center justify-self-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${selectedCode === option.code ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
            style={{ backgroundColor: option.color }}
          >
            <img className="size-[76%] object-contain" src={StickerEyesImage} alt="" />
          </button>
        ))}
      </div>
    </section>
  );
}
