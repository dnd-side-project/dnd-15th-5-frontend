import { act, renderHook } from '@testing-library/react';

import { findStickers, upload } from '@/features/record/apis/clients';

import { useSubmitStickerRecord } from './useSubmitStickerRecord';

const mockCreate = jest.fn();
jest.mock('@/features/record/apis/clients', () => ({ upload: jest.fn(), findStickers: jest.fn() }));
jest.mock('@/features/record/apis/hooks/useCreateConsumptionMutation', () => ({
  useCreateConsumptionMutation: () => ({ createConsumptionAsync: mockCreate }),
}));
const image = new Blob(['sticker'], { type: 'image/png' });
const draft = {
  shop: {
    id: 'google-01',
    name: '카페',
    address: '서울',
    latitude: 37.5,
    longitude: 127,
    photoUrl: null,
  },
  visitDateTime: { date: new Date(2020, 6, 25), period: 'afternoon' as const },
  amount: '',
  memo: '',
  category: '카페' as const,
};
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(upload).mockResolvedValue({ data: { imageId: 42 } });
  jest
    .mocked(findStickers)
    .mockResolvedValue({ data: [{ category: '카페', name: '커피', stickerItemId: 173 }] });
  mockCreate.mockResolvedValue({ data: { consumptionId: 1 } });
});

it('기본 이모지는 카테고리·이름으로 서버 ID를 찾아 업로드 없이 등록한다', async () => {
  jest.mocked(findStickers).mockResolvedValueOnce({
    data: [
      { category: '음식점', name: '커피', stickerItemId: 24 },
      { category: '카페', name: '커피', stickerItemId: 934 },
    ],
  });
  const { result } = renderHook(useSubmitStickerRecord);
  await act(async () =>
    result.current.submit(
      { source: 'default', category: '카페', name: '커피' },
      { ...draft, receiptImageId: 15 }
    )
  );
  expect(findStickers).toHaveBeenCalledWith(undefined, expect.any(AbortSignal));
  expect(upload).not.toHaveBeenCalled();
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({ stickerItemId: 934, receiptImageId: 15, category: '카페' })
  );
  expect(mockCreate.mock.calls[0][0]).not.toHaveProperty('imageId');
});

it.each([
  { data: [] },
  { data: [{ category: '카페', name: '커피', stickerItemId: 0 }] },
  {
    data: [
      { category: '카페', name: '커피', stickerItemId: 1 },
      { category: '카페', name: '커피', stickerItemId: 2 },
    ],
  },
])('서버 목록에 없거나 ID를 특정할 수 없는 이모지는 저장하지 않는다', async ({ data }) => {
  jest.mocked(findStickers).mockResolvedValueOnce({ data });
  const { result } = renderHook(useSubmitStickerRecord);
  await act(async () =>
    result.current.submit({ source: 'default', category: '카페', name: '커피' }, draft)
  );
  expect(upload).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
  expect(result.current.submitError).toContain('서버 목록');
});

it('목록 조회 실패 시 이모지를 이미지 업로드로 대체하지 않고 재시도한다', async () => {
  jest.mocked(findStickers).mockRejectedValueOnce(new Error('목록 조회 실패'));
  const { result } = renderHook(useSubmitStickerRecord);
  const media = { source: 'default' as const, category: '카페' as const, name: '커피' };
  await act(async () => result.current.submit(media, draft));
  expect(result.current.submitError).toBe('목록 조회 실패');
  expect(mockCreate).not.toHaveBeenCalled();
  await act(async () => result.current.submit(media, draft));
  expect(upload).not.toHaveBeenCalled();
  expect(mockCreate).toHaveBeenCalledTimes(1);
});

it('기본 이모지와 다른 카테고리는 서버 요청 전에 차단한다', async () => {
  const { result } = renderHook(useSubmitStickerRecord);
  await act(async () =>
    result.current.submit({ source: 'default', category: '운동', name: '근육' }, draft)
  );
  expect(findStickers).not.toHaveBeenCalled();
  expect(upload).not.toHaveBeenCalled();
  expect(mockCreate).not.toHaveBeenCalled();
});

it('가공된 PNG를 먼저 업로드하고 imageId와 OCR ID를 최종 등록에 전달한다', async () => {
  const { result } = renderHook(useSubmitStickerRecord);
  await act(async () =>
    result.current.submit(
      { source: 'photo', image },
      {
        ...draft,
        receiptImageId: 15,
        amount: '33000',
        memo: '방문',
        purchaseTime: '11:20:00',
      }
    )
  );
  expect(upload).toHaveBeenCalledWith(
    { image: expect.any(File) },
    undefined,
    expect.any(AbortSignal)
  );
  const file = jest.mocked(upload).mock.calls[0][0]?.image;
  expect(file).toMatchObject({ name: 'sticker.png', type: 'image/png', size: image.size });
  expect(mockCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      imageId: 42,
      receiptImageId: 15,
      amount: 33000,
      memo: '방문',
      purchaseTime: '11:20:00',
    })
  );
  expect(mockCreate.mock.calls[0][0]).not.toHaveProperty('stickerItemId');
  expect(result.current.isSubmitting).toBe(false);
});

it('업로드 실패 시 등록을 호출하지 않고 같은 이미지로 재시도할 수 있다', async () => {
  jest
    .mocked(upload)
    .mockRejectedValueOnce({ response: { data: { message: '저장소 연결 실패' } } });
  const { result } = renderHook(useSubmitStickerRecord);
  await act(async () => result.current.submit({ source: 'photo', image }, draft));
  expect(mockCreate).not.toHaveBeenCalled();
  expect(result.current.submitError).toBe('저장소 연결 실패');
  await act(async () => result.current.submit({ source: 'photo', image }, draft));
  expect(upload).toHaveBeenCalledTimes(2);
  expect(mockCreate).toHaveBeenCalledTimes(1);
});

it('등록 실패 후 재시도하면 이미지를 새로 업로드해 새 ID를 사용한다', async () => {
  mockCreate.mockRejectedValueOnce(new Error('이미지가 만료됐어요'));
  jest.mocked(upload).mockResolvedValueOnce({ data: { imageId: 41 } });
  const { result } = renderHook(useSubmitStickerRecord);
  await act(async () => result.current.submit({ source: 'photo', image }, draft));
  await act(async () => result.current.submit({ source: 'photo', image }, draft));
  expect(mockCreate.mock.calls.map(([request]) => request.imageId)).toEqual([41, 42]);
});

it('연속 클릭은 업로드와 등록을 중복해서 실행하지 않는다', async () => {
  let finish!: (response: { data: { imageId: number } }) => void;
  jest.mocked(upload).mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const { result } = renderHook(useSubmitStickerRecord);
  let task!: Promise<void>;
  act(() => {
    task = result.current.submit({ source: 'photo', image }, draft);
  });
  await act(async () => result.current.submit({ source: 'photo', image }, draft));
  expect(upload).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish({ data: { imageId: 42 } });
    await task;
  });
  expect(mockCreate).toHaveBeenCalledTimes(1);
});

it('화면을 떠나면 업로드 요청을 취소하고 늦은 결과로 기록을 등록하지 않는다', async () => {
  let finish!: (response: { data: { imageId: number } }) => void;
  jest.mocked(upload).mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const { result, unmount } = renderHook(useSubmitStickerRecord);
  let task!: Promise<void>;
  act(() => {
    task = result.current.submit({ source: 'photo', image }, draft);
  });
  const signal = jest.mocked(upload).mock.calls[0][2];
  unmount();
  await act(async () => {
    finish({ data: { imageId: 42 } });
    await task;
  });
  expect(signal?.aborted).toBe(true);
  expect(mockCreate).not.toHaveBeenCalled();
});

it.each([
  new Blob([], { type: 'image/png' }),
  new Blob(['gif'], { type: 'image/gif' }),
  new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/png' }),
])('업로드 제약을 벗어난 이미지는 서버로 보내지 않는다', async (invalidImage) => {
  const { result } = renderHook(useSubmitStickerRecord);
  await act(async () => result.current.submit({ source: 'photo', image: invalidImage }, draft));
  expect(upload).not.toHaveBeenCalled();
  expect(result.current.submitError).not.toBe('');
});
