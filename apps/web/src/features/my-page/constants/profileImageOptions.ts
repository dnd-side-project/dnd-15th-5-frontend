import { ProfileUpdateRequestProfileImageCode } from '@/features/my-page/apis/dto';

export const PROFILE_IMAGE_OPTIONS = [
  { code: ProfileUpdateRequestProfileImageCode.BLUE, color: '#4a6bff', label: '파랑' },
  { code: ProfileUpdateRequestProfileImageCode.SKY_BLUE, color: '#98d7f0', label: '하늘색' },
  { code: ProfileUpdateRequestProfileImageCode.PINK, color: '#ff68a3', label: '분홍' },
  { code: ProfileUpdateRequestProfileImageCode.YELLOW, color: '#ffb743', label: '노랑' },
  { code: ProfileUpdateRequestProfileImageCode.TEAL, color: '#4ca49d', label: '청록' },
  { code: ProfileUpdateRequestProfileImageCode.RED, color: '#ff6243', label: '빨강' },
] as const;

export type ProfileImageCode = (typeof PROFILE_IMAGE_OPTIONS)[number]['code'];
