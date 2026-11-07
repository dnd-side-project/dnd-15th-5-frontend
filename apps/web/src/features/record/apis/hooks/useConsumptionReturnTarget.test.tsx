import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { getConsumption } from '@/features/record/apis/clients';

import { useConsumptionReturnTarget } from './useConsumptionReturnTarget';

import type { PropsWithChildren } from 'react';

jest.mock('@/features/record/apis/clients', () => ({ getConsumption: jest.fn() }));

beforeEach(() => jest.clearAllMocks());

const setup = (consumptionId: number | undefined = 196) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return {
    client,
    ...renderHook(
      () =>
        useConsumptionReturnTarget({
          consumptionId,
          fallbackDate: '2026-11-01',
          placeId: 101,
        }),
      { wrapper }
    ),
  };
};

it('같은 가게에서 날짜를 수정하면 이전 날짜 대신 최신 날짜로 방문을 찾는다', async () => {
  jest
    .mocked(getConsumption)
    .mockResolvedValue({ data: { placeId: 101, purchaseDate: '2026-10-20' } });
  const { result, unmount, client } = setup();
  expect(result.current.isRestoreTargetPending).toBe(true);
  await waitFor(() => expect(result.current.isRestoreTargetPending).toBe(false));
  expect(result.current.scrollToConsumptionId).toBe(196);
  expect(result.current.scrollToDate).toBe('2026-10-20');
  unmount();
  client.clear();
});

it.each(['moved', 'deleted'] as const)(
  '기록이 %s이면 원래 가게에서 ID를 찾지 않고 이전 날짜로 복귀한다',
  async (state) => {
    if (state === 'moved') {
      jest
        .mocked(getConsumption)
        .mockResolvedValue({ data: { placeId: 102, purchaseDate: '2026-10-20' } });
    } else {
      jest.mocked(getConsumption).mockRejectedValue(new Error('not found'));
    }
    const { result, unmount, client } = setup();
    await waitFor(() => expect(result.current.isRestoreTargetPending).toBe(false));
    expect(result.current.scrollToConsumptionId).toBeUndefined();
    expect(result.current.scrollToDate).toBe('2026-11-01');
    expect(getConsumption).toHaveBeenCalledTimes(1);
    unmount();
    client.clear();
  }
);

it('복귀 대상 ID가 없는 일반 가게 상세 진입에서는 기록을 조회하지 않는다', () => {
  const { result, unmount, client } = setup(0);
  expect(result.current.isRestoreTargetPending).toBe(false);
  expect(getConsumption).not.toHaveBeenCalled();
  unmount();
  client.clear();
});
