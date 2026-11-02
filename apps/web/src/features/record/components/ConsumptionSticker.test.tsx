import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { getConsumption } from '@/features/record/apis/clients';

import ConsumptionSticker from './ConsumptionSticker';

import type { ReactNode } from 'react';

jest.mock('@/features/record/apis/clients', () => ({ getConsumption: jest.fn() }));
jest.mock('@/shared/assets/images/ios-stickers/img-coffee.png', () => 'coffee-sticker.png');

const setup = (children: ReactNode) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{children}</QueryClientProvider>);
};
beforeEach(() => jest.clearAllMocks());

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
  expect(screen.getByRole('img', { name: '기록 스티커 없음' })).toBeInTheDocument();
  expect(screen.queryByAltText('기록에 사용한 스티커')).not.toBeInTheDocument();
});
