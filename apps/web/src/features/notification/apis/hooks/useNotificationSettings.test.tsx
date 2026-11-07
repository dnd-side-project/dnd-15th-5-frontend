import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

import { updateNotificationSettings } from '@/features/notification/apis/clients';
import { getGetNotificationSettingsQueryKey } from '@/features/notification/apis/queryKeys';
import { ToastProvider } from '@/shared/ui/toast';

import { useNotificationSettings } from './useNotificationSettings';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/notification/apis/clients', () => ({
  ...jest.requireActual('@/features/notification/apis/clients'),
  updateNotificationSettings: jest.fn(),
}));

const mockUpdateNotificationSettings = jest.mocked(updateNotificationSettings);

describe('useNotificationSettings', () => {
  it('화면을 나갔다 다시 들어와도 진행 중인 저장 상태를 유지한다', async () => {
    let resolveUpdate:
      ((response: { data: { consumptionReminderEnabled: boolean } }) => void) | null = null;
    const pendingUpdate = new Promise<{ data: { consumptionReminderEnabled: boolean } }>(
      (resolve) => {
        resolveUpdate = resolve;
      }
    );
    mockUpdateNotificationSettings.mockReturnValue(pendingUpdate as never);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
        mutations: { retry: false, gcTime: Infinity },
      },
    });
    queryClient.setQueryData(getGetNotificationSettingsQueryKey(), {
      data: { consumptionReminderEnabled: false, monthlyReportEnabled: true },
    });

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );

    const firstPage = renderHook(() => useNotificationSettings(), { wrapper });

    act(() => firstPage.result.current.toggleSetting('consumptionReminderEnabled', false));
    await waitFor(() => expect(firstPage.result.current.isSaving).toBe(true));
    firstPage.unmount();

    const reenteredPage = renderHook(() => useNotificationSettings(), { wrapper });
    expect(reenteredPage.result.current.isSaving).toBe(true);

    await act(async () => {
      resolveUpdate?.({ data: { consumptionReminderEnabled: true } });
      await pendingUpdate;
    });

    await waitFor(() => expect(reenteredPage.result.current.isSaving).toBe(false));
    reenteredPage.unmount();
    queryClient.clear();
  });
});
