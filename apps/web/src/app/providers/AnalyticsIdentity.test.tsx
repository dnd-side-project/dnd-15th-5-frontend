import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';

import { useGetMyAccount } from '@/features/my-page';
import { getGetMyAccountQueryKey } from '@/features/my-page/apis/queryKeys';
import { identifyAnalyticsUser, resetAnalyticsUser } from '@/shared/lib/analytics/mixpanel';
import { useAuthStore } from '@/shared/stores/authStore';

import AnalyticsIdentity from './AnalyticsIdentity';

jest.mock('@/features/my-page', () => ({ useGetMyAccount: jest.fn() }));
jest.mock('@/shared/lib/analytics/mixpanel', () => ({
  identifyAnalyticsUser: jest.fn(),
  resetAnalyticsUser: jest.fn(),
}));

const mockUseGetMyAccount = jest.mocked(useGetMyAccount);
const mockIdentifyAnalyticsUser = jest.mocked(identifyAnalyticsUser);
const mockResetAnalyticsUser = jest.mocked(resetAnalyticsUser);

describe('<AnalyticsIdentity />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      accessToken: 'access-token',
      isAuthenticated: true,
      isInitialized: true,
    });
    mockUseGetMyAccount.mockReturnValue({
      data: { data: { userId: 123 } },
      isFetching: false,
    } as ReturnType<typeof useGetMyAccount>);
  });

  it('내 정보의 userId로 로그인 사용자를 식별한다', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsIdentity />
      </QueryClientProvider>
    );

    await waitFor(() => expect(mockIdentifyAnalyticsUser).toHaveBeenCalledWith(123));
  });

  it('로그아웃하면 Mixpanel 식별자와 이전 계정 조회 캐시를 초기화한다', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(getGetMyAccountQueryKey(), { data: { userId: 123 } });

    render(
      <QueryClientProvider client={queryClient}>
        <AnalyticsIdentity />
      </QueryClientProvider>
    );
    await waitFor(() => expect(mockIdentifyAnalyticsUser).toHaveBeenCalledWith(123));

    act(() => {
      useAuthStore.setState({ accessToken: null, isAuthenticated: false });
    });

    await waitFor(() => expect(mockResetAnalyticsUser).toHaveBeenCalledTimes(1));
    expect(queryClient.getQueryData(getGetMyAccountQueryKey())).toBeUndefined();
  });
});
