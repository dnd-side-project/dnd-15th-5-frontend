import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';

import type { ProfileUpdateRequest } from '@/features/my-page/apis/dto';
import { useUpdateMyProfile } from '@/features/my-page/apis/mutations';
import { useGetMyAccount } from '@/features/my-page/apis/queries';
import { getGetMyAccountQueryKey } from '@/features/my-page/apis/queryKeys';
import type { ProfileImageCode } from '@/features/my-page/constants/profileImageOptions';
import { PROFILE_IMAGE_OPTIONS } from '@/features/my-page/constants/profileImageOptions';
import { NICKNAME_MAX_LENGTH, nicknameSchema } from '@/features/my-page/nicknameSchema';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

/** 프로필 수정 화면의 조회·편집·저장·이탈 확인 상태를 관리합니다. */
export const useProfileEditor = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accountQuery = useGetMyAccount();
  const account = accountQuery.data?.data;
  const updateProfile = useUpdateMyProfile();
  const allowNavigationRef = useRef(false);
  const [editedNickname, setEditedNickname] = useState<string>();
  const [nicknameLengthExceeded, setNicknameLengthExceeded] = useState(false);
  const [editedCode, setEditedCode] = useState<ProfileImageCode>();

  const initialNickname = account?.nickname ?? '';
  const initialCode =
    PROFILE_IMAGE_OPTIONS.find((option) => option.code === account?.profileImageCode)?.code ??
    PROFILE_IMAGE_OPTIONS[0].code;
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
  const blocker = useBlocker(() => hasChanges && !allowNavigationRef.current);

  const handleBack = () => navigate(-1);

  const handleDiscardChanges = () => {
    if (blocker.state === 'blocked') blocker.proceed();
  };

  const handleContinueEditing = () => {
    if (blocker.state === 'blocked') blocker.reset();
  };

  const handleSave = () => {
    if (!account || !canSave) return;

    updateProfile.mutate(
      { data: { nickname: normalizedNickname, profileImageCode } satisfies ProfileUpdateRequest },
      {
        onSuccess: async (response) => {
          if (response.data) {
            queryClient.setQueryData(getGetMyAccountQueryKey(), {
              ...accountQuery.data,
              data: response.data,
            });
          } else {
            await queryClient.invalidateQueries({ queryKey: getGetMyAccountQueryKey() });
          }

          allowNavigationRef.current = true;
          navigate(ROUTE_PATHS.myPage, { replace: true });
        },
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
    handleBack,
    handleContinueEditing,
    handleDiscardChanges,
    handleSave,
    isCancelDialogOpen: blocker.state === 'blocked',
    isSaving: updateProfile.isPending,
    isSaveError: updateProfile.isError,
    nickname,
    nicknameErrorMessage,
    profileImageCode,
    setNickname: handleNicknameChange,
    setProfileImageCode: setEditedCode,
    showNicknameError,
  };
};
