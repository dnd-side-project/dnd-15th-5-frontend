import { axiosInstance } from '@/shared/apis';

import { requestAccountWithdrawal } from './withdrawAccount';

jest.mock('@/shared/apis', () => ({
  axiosInstance: { delete: jest.fn() },
}));

const mockDelete = jest.mocked(axiosInstance.delete);

describe('requestAccountWithdrawal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('즉시 탈퇴 응답이면 완료 결과를 반환한다', async () => {
    mockDelete.mockResolvedValue({ status: 200, headers: {} } as never);

    await expect(requestAccountWithdrawal()).resolves.toEqual({ type: 'completed' });
    expect(mockDelete).toHaveBeenCalledWith('/accounts/me');
  });

  it('재인증이 필요하면 Location 헤더를 반환한다', async () => {
    mockDelete.mockResolvedValue({
      status: 202,
      headers: { location: 'https://accounts.google.com/reauthenticate' },
    } as never);

    await expect(requestAccountWithdrawal()).resolves.toEqual({
      type: 'reauthentication-required',
      location: 'https://accounts.google.com/reauthenticate',
    });
  });

  it('202 응답에 Location 헤더가 없으면 실패한다', async () => {
    mockDelete.mockResolvedValue({ status: 202, headers: {} } as never);

    await expect(requestAccountWithdrawal()).rejects.toThrow(
      '회원 탈퇴 재인증 주소가 응답에 없습니다.'
    );
  });
});
