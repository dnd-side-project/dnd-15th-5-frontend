import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useSocialLoginCallback } from '@/features/auth/apis/hooks/useSocialLoginCallback';
import { AUTH_FLOW_ERROR_CODE, AuthFlowError } from '@/features/auth/errors';
import type { AuthFlowErrorCode } from '@/features/auth/errors';

import SocialLoginCallback from './SocialLoginCallback';

jest.mock('@/features/auth/apis/hooks/useSocialLoginCallback', () => ({
  useSocialLoginCallback: jest.fn(),
}));

const renderError = (code: AuthFlowErrorCode) => {
  jest.mocked(useSocialLoginCallback).mockReturnValue({
    error: new AuthFlowError(code),
    isLoading: false,
  });

  render(
    <MemoryRouter>
      <SocialLoginCallback />
    </MemoryRouter>
  );
};

describe('SocialLoginCallback', () => {
  it('탈퇴 계정의 데이터 삭제 및 재가입 가능 시점을 안내한다', () => {
    renderError(AUTH_FLOW_ERROR_CODE.ACCOUNT_WITHDRAWN);

    expect(
      screen.getByRole('heading', { name: '탈퇴한 계정은 로그인할 수 없어요' })
    ).toBeInTheDocument();
    expect(screen.getByText(/계정 데이터는 탈퇴 다음 날 0시에 삭제돼요/)).toHaveTextContent(
      '계정 데이터는 탈퇴 다음 날 0시에 삭제돼요. 삭제가 완료된 후 다시 가입할 수 있어요.'
    );
  });

  it.each([
    [AUTH_FLOW_ERROR_CODE.OAUTH_FAILED, '소셜 로그인에 실패했어요'],
    [AUTH_FLOW_ERROR_CODE.WITHDRAWAL_FAILED, '회원 탈퇴에 실패했어요'],
  ] as const)('%s 오류에 맞는 제목을 표시한다', (code, title) => {
    renderError(code);

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
  });
});
