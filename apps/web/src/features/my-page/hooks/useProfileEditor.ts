import { useState } from 'react';

import type { ProfileUpdateRequest } from '@/features/my-page/apis/dto';
import { useUpdateMyProfileMutation } from '@/features/my-page/apis/hooks/useUpdateMyProfileMutation';
import { useGetMyAccount } from '@/features/my-page/apis/queries';
import type { ProfileImageCode } from '@/features/my-page/constants/profileImageOptions';
import { getProfileImageOption } from '@/features/my-page/constants/profileImageOptions';
import { useProfileEditNavigationGuard } from '@/features/my-page/hooks/useProfileEditNavigationGuard';
import { NICKNAME_MAX_LENGTH, nicknameSchema } from '@/features/my-page/nicknameSchema';

/** 프로필 수정 화면의 조회·편집·저장·이탈 확인 상태를 관리합니다. */
export const useProfileEditor = () => {
  const accountQuery = useGetMyAccount();
  const account = accountQuery.data?.data;
  const updateProfile = useUpdateMyProfileMutation();
  const [editedNickname, setEditedNickname] = useState<string>();
  const [nicknameLengthExceeded, setNicknameLengthExceeded] = useState(false);
  const [editedCode, setEditedCode] = useState<ProfileImageCode>();

  const initialNickname = account?.nickname ?? '';
  const initialCode = getProfileImageOption(account?.profileImageCode).code;
  const nickname = editedNickname ?? initialNickname;
  const profileImageCode = editedCode ?? initialCode;
  const nicknameResult = nicknameSchema.safeParse(nickname);
  const normalizedNickname = nicknameResult.success ? nicknameResult.data : nickname.trim();
  const normalizedInitialNickname = nicknameSchema.safeParse(initialNickname);
  const initialNicknameValue = normalizedInitialNickname.success
    ? normalizedInitialNickname.data
    : initialNickname.trim();
  const hasChanges =
    Boolean(account) &&
    (normalizedNickname !== initialNicknameValue || profileImageCode !== initialCode);
  const isNicknameValid = nicknameResult.success;
  const showNicknameError =
    Boolean(account) && nickname !== '' && (!isNicknameValid || nicknameLengthExceeded);
  const nicknameErrorMessage = showNicknameError
    ? nicknameLengthExceeded || (!nicknameResult.success && nicknameResult.error === 'length')
      ? '이름은 최대 16자까지 입력할 수 있어요.'
      : '한글과 공백만 입력할 수 있어요.'
    : undefined;
  const canSave =
    hasChanges && isNicknameValid && !nicknameLengthExceeded && !updateProfile.isPending;
  const navigationGuard = useProfileEditNavigationGuard(hasChanges);

  const handleSave = () => {
    if (!account || !canSave) return;

    updateProfile.mutate(
      { data: { nickname: normalizedNickname, profileImageCode } satisfies ProfileUpdateRequest },
      {
        onSuccess: () => navigationGuard.navigateToMyPage(),
      }
    );
  };

  const handleNicknameChange = (value: string) => {
    const characters = [...value];
    setNicknameLengthExceeded(characters.length > NICKNAME_MAX_LENGTH);
    setEditedNickname(characters.slice(0, NICKNAME_MAX_LENGTH).join(''));
  };

  return {
    account,
    accountQuery,
    canSave,
    handleSave,
    isSaving: updateProfile.isPending,
    isSaveError: updateProfile.isError,
    nickname,
    nicknameErrorMessage,
    profileImageCode,
    setNickname: handleNicknameChange,
    setProfileImageCode: setEditedCode,
    showNicknameError,
    ...navigationGuard,
  };
};
