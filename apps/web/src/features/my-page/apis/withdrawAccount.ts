import { axiosInstance } from '@/shared/apis';

import type { ApiResponseVoid } from './dto';

type AccountWithdrawalResult =
  { type: 'completed' } | { type: 'reauthentication-required'; location: string };

const HTTP_STATUS_ACCEPTED = 202;

/** 응답 상태와 Location 헤더를 보존해 소셜 제공자별 탈퇴 흐름을 구분합니다. */
export const requestAccountWithdrawal = async (): Promise<AccountWithdrawalResult> => {
  const response = await axiosInstance.delete<ApiResponseVoid>('/accounts/me');

  if (response.status !== HTTP_STATUS_ACCEPTED) {
    return { type: 'completed' };
  }

  const location = response.headers.location;

  if (!location) {
    throw new Error('회원 탈퇴 재인증 주소가 응답에 없습니다.');
  }

  return { type: 'reauthentication-required', location };
};

/** Google 회원 탈퇴에 필요한 재인증 페이지로 현재 창을 이동합니다. */
export const redirectToAccountWithdrawal = (location: string) => {
  window.location.assign(location);
};
