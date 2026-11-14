import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getConsumption } from '@/features/record/apis/clients';
import { getGetConsumptionQueryKey } from '@/features/record/apis/queryKeys';

import ConsumptionSticker from './ConsumptionSticker';

import type { ReactNode } from 'react';

jest.mock('@/features/record/apis/clients', () => ({ getConsumption: jest.fn() }));
jest.mock('@/shared/assets/images/ios-stickers/img-coffee.png', () => 'coffee-sticker.png');

const setup = (children: ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    client,
    ...render(<QueryClientProvider client={client}>{children}</QueryClientProvider>),
  };
};
beforeEach(() => jest.clearAllMocks());

it('재시도를 소진해도 새 조회가 같은 정적 URL을 반환하면 이미지를 다시 표시한다', async () => {
  const response = { data: { stickerName: '커피', stickerItemId: 22 } };
  jest.mocked(getConsumption).mockResolvedValue(response);
  const { client } = setup(<ConsumptionSticker consumptionId={1} />);
  fireEvent.error(await screen.findByAltText('기록에 사용한 스티커'));
  fireEvent.error(await screen.findByAltText('기록에 사용한 스티커'));
  expect(screen.getByRole('img', { name: '기록 스티커 없음' })).toBeInTheDocument();
  const key = getGetConsumptionQueryKey(1);
  act(() =>
    client.setQueryData(key, response, {
      updatedAt: client.getQueryState(key)!.dataUpdatedAt + 1,
    })
  );
  const recovered = await screen.findByAltText('기록에 사용한 스티커');
  expect(recovered).toHaveAttribute('src', 'coffee-sticker.png');
  fireEvent.load(recovered);
  expect(screen.queryByRole('img', { name: '기록 스티커 없음' })).not.toBeInTheDocument();
  expect(getConsumption).toHaveBeenCalledTimes(2);
});

it('기록 ID별로 사진 스티커와 기본 스티커를 표시하고 매장 썸네일은 사용하지 않는다', async () => {
  jest.mocked(getConsumption).mockImplementation(async (id) => ({
    data:
      id === 1
        ? {
            consumptionId: 1,
            imageId: 11,
            imageUrl: 'https://example.com/record-sticker.png',
            thumbnailUrl: 'https://example.com/store.png',
          }
        : {
            consumptionId: 2,
            stickerItemId: 22,
            stickerName: '커피',
            thumbnailUrl: 'https://example.com/store.png',
          },
  }));
  setup(
    <>
      <ConsumptionSticker consumptionId={1} />
      <ConsumptionSticker consumptionId={2} />
    </>
  );
  await waitFor(() => expect(screen.getAllByAltText('기록에 사용한 스티커')).toHaveLength(2));
  const images = screen.getAllByAltText('기록에 사용한 스티커');
  expect(images[0]).toHaveAttribute('src', 'https://example.com/record-sticker.png');
  expect(images[1]).toHaveAttribute('src', 'coffee-sticker.png');
  expect(getConsumption).toHaveBeenCalledWith(1, undefined, expect.any(AbortSignal));
  expect(getConsumption).toHaveBeenCalledWith(2, undefined, expect.any(AbortSignal));
});

it('이미지를 불러오지 못해도 매장 사진으로 바꾸지 않는다', async () => {
  jest.mocked(getConsumption).mockResolvedValue({
    data: {
      imageId: 11,
      imageUrl: 'https://example.com/expired.png',
      thumbnailUrl: 'https://example.com/store.png',
    },
  });
  setup(<ConsumptionSticker consumptionId={1} />);
  fireEvent.error(await screen.findByAltText('기록에 사용한 스티커'));
  fireEvent.error(await screen.findByAltText('기록에 사용한 스티커'));
  expect(screen.getByRole('img', { name: '기록 스티커 없음' })).toBeInTheDocument();
  expect(screen.queryByAltText('기록에 사용한 스티커')).not.toBeInTheDocument();
  expect(getConsumption).toHaveBeenCalledTimes(2);
});

it.each([true, false])(
  '이미지 실패 시 URL을 갱신하고 같은 URL도 한 번 다시 로드한다: %s',
  async (sameUrl) => {
    const firstUrl = 'https://example.com/first.png';
    const nextUrl = sameUrl ? firstUrl : 'https://example.com/refreshed.png';
    jest
      .mocked(getConsumption)
      .mockResolvedValueOnce({ data: { imageId: 11, imageUrl: firstUrl } })
      .mockResolvedValueOnce({ data: { imageId: 11, imageUrl: nextUrl } });
    setup(<ConsumptionSticker consumptionId={1} />);
    const firstImage = await screen.findByAltText('기록에 사용한 스티커');
    fireEvent.error(firstImage);
    const retried = await screen.findByAltText('기록에 사용한 스티커');
    expect(retried).not.toBe(firstImage);
    expect(retried).toHaveAttribute('src', nextUrl);
    fireEvent.load(retried);
    expect(screen.queryByRole('img', { name: '기록 스티커 없음' })).not.toBeInTheDocument();
    expect(getConsumption).toHaveBeenCalledTimes(2);
  }
);

it('이미지 URL 재조회가 실패하면 무한 재시도 없이 안내를 표시한다', async () => {
  jest
    .mocked(getConsumption)
    .mockResolvedValueOnce({ data: { imageId: 11, imageUrl: 'https://example.com/expired.png' } })
    .mockRejectedValueOnce(new Error('network'));
  setup(<ConsumptionSticker consumptionId={1} />);
  fireEvent.error(await screen.findByAltText('기록에 사용한 스티커'));
  expect(await screen.findByRole('img', { name: '기록 스티커 없음' })).toBeInTheDocument();
  expect(getConsumption).toHaveBeenCalledTimes(2);
});

it('복구에 성공한 뒤 URL이 다시 만료되면 새 실패에 대해 한 번 복구할 수 있다', async () => {
  jest.mocked(getConsumption).mockResolvedValue({
    data: { imageId: 11, imageUrl: 'https://example.com/photo.png' },
  });
  setup(<ConsumptionSticker consumptionId={1} />);
  fireEvent.error(await screen.findByAltText('기록에 사용한 스티커'));
  const recovered = await screen.findByAltText('기록에 사용한 스티커');
  fireEvent.load(recovered);
  fireEvent.error(recovered);
  expect(await screen.findByAltText('기록에 사용한 스티커')).not.toBe(recovered);
  expect(getConsumption).toHaveBeenCalledTimes(3);
});

it('화면에서 먼 방문 기록은 조회하지 않고 가까워졌을 때 조회한다', async () => {
  const originalObserver = globalThis.IntersectionObserver;
  let notify: IntersectionObserverCallback = () => {};
  const disconnect = jest.fn();
  globalThis.IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
    notify = callback;
    return { observe: jest.fn(), disconnect };
  }) as unknown as typeof IntersectionObserver;
  try {
    jest.mocked(getConsumption).mockResolvedValue({ data: { stickerName: '커피' } });
    setup(<ConsumptionSticker consumptionId={1} />);
    expect(getConsumption).not.toHaveBeenCalled();
    act(() =>
      notify([{ isIntersecting: true }] as IntersectionObserverEntry[], {} as IntersectionObserver)
    );
    expect(await screen.findByAltText('기록에 사용한 스티커')).toHaveAttribute(
      'src',
      'coffee-sticker.png'
    );
    expect(getConsumption).toHaveBeenCalledTimes(1);
    expect(disconnect).toHaveBeenCalled();
  } finally {
    globalThis.IntersectionObserver = originalObserver;
  }
});
