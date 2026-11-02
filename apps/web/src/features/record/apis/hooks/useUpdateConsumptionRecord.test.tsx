import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

import { findStickers, upload } from '@/features/record/apis/clients';
import { TEST_CONSUMPTION_DETAIL } from '@/features/record/testFixtures';
import { createEditConsumptionInitialValue } from '@/features/record/utils/createEditConsumptionInitialValue';

import { useUpdateConsumptionRecord } from './useUpdateConsumptionRecord';

import type { ReactNode } from 'react';

const mockUpdate = jest.fn();
const mockToast = jest.fn();
jest.mock('@/features/record/apis/clients', () => ({ findStickers: jest.fn(), upload: jest.fn() }));
jest.mock('@/features/record/apis/mutations', () => ({
  useUpdateConsumption: () => ({ mutateAsync: mockUpdate }),
}));
jest.mock('@/shared/ui/toast', () => ({ useToast: () => ({ showToast: mockToast }) }));

const initial = createEditConsumptionInitialValue(TEST_CONSUMPTION_DETAIL)!;
const onSuccess = jest.fn();
const setup = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(() => useUpdateConsumptionRecord(196, onSuccess), { wrapper }) };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdate.mockResolvedValue({});
});

it('기존 사진을 재업로드하지 않고 ID·방문 시각을 유지하며 비운 금액·메모를 삭제한다', async () => {
  const { result, client } = setup();
  const related = [
    '/v1/consumptions',
    '/v1/consumptions/visited-places',
    '/v1/consumptions/places/10',
    '/v1/places/visited/search',
    '/v1/reports/current',
  ];
  related.forEach((key) => client.setQueryData([key], {}));
  client.setQueryData(['/v1/reports/monthly'], {});
  await act(async () => {
    await result.current.submit(initial.media, { ...initial.draft, amount: '', memo: '' });
  });
  expect(upload).not.toHaveBeenCalled();
  expect(findStickers).not.toHaveBeenCalled();
  expect(mockUpdate).toHaveBeenCalledWith({
    consumptionId: 196,
    data: expect.objectContaining({ imageId: 42, purchaseTime: '11:20:15' }),
  });
  expect(mockUpdate.mock.calls[0][0].data).not.toHaveProperty('amount');
  expect(mockUpdate.mock.calls[0][0].data).not.toHaveProperty('memo');
  related.forEach((key) => expect(client.getQueryState([key])?.isInvalidated).toBe(true));
  expect(client.getQueryState(['/v1/reports/monthly'])?.isInvalidated).toBe(false);
  expect(onSuccess).toHaveBeenCalledTimes(1);
  expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
});

it('기본 스티커로 변경하면 새 스티커 ID만 보내고 사진 ID는 보내지 않는다', async () => {
  jest
    .mocked(findStickers)
    .mockResolvedValue({ data: [{ stickerItemId: 8, name: '커피', category: '카페' }] });
  const { result } = setup();
  await act(async () => {
    await result.current.submit(
      { source: 'default', name: '커피', category: '카페' },
      initial.draft
    );
  });
  expect(mockUpdate.mock.calls[0][0].data).toMatchObject({ stickerItemId: 8 });
  expect(mockUpdate.mock.calls[0][0].data).not.toHaveProperty('imageId');
});

it('교체 사진을 업로드한 뒤 수정하고 중복 제출을 막는다', async () => {
  let resolveUpload!: (value: { data: { imageId: number } }) => void;
  jest.mocked(upload).mockReturnValue(
    new Promise((resolve) => {
      resolveUpload = resolve;
    })
  );
  const { result } = setup();
  const media = { source: 'photo' as const, image: new Blob(['photo'], { type: 'image/png' }) };
  await act(async () => {
    const first = result.current.submit(media, initial.draft);
    const second = result.current.submit(media, initial.draft);
    resolveUpload({ data: { imageId: 99 } });
    await Promise.all([first, second]);
  });
  expect(upload).toHaveBeenCalledTimes(1);
  expect(mockUpdate).toHaveBeenCalledTimes(1);
  expect(mockUpdate.mock.calls[0][0].data.imageId).toBe(99);
});

it('수정 실패 시 입력을 유지한 채 재시도할 수 있다', async () => {
  mockUpdate.mockRejectedValueOnce(new Error('수정 실패'));
  const { result } = setup();
  await act(async () => {
    await result.current.submit(initial.media, initial.draft);
  });
  expect(result.current.submitError).toBe('수정 실패');
  expect(onSuccess).not.toHaveBeenCalled();
  await act(async () => {
    await result.current.submit(initial.media, initial.draft);
  });
  expect(onSuccess).toHaveBeenCalledTimes(1);
});
