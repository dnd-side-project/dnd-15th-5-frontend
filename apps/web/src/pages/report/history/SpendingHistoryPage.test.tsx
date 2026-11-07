import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { getConsumption } from '@/features/record/apis/clients';
import { useConsumptionsInfiniteQuery } from '@/features/report/apis/hooks/useConsumptionsInfiniteQuery';

import SpendingHistoryPage from './SpendingHistoryPage';

jest.mock('@/features/record/apis/clients', () => ({ getConsumption: jest.fn() }));
jest.mock('@/features/record/apis/hooks/useDeleteConsumptionRecord', () => ({
  useDeleteConsumptionRecord: () => ({
    deleteRecord: jest.fn(),
    isDeleting: false,
    deleteError: '',
    clearDeleteError: jest.fn(),
  }),
}));
jest.mock('@/features/report/apis/hooks/useConsumptionsInfiniteQuery');
jest.mock('@/features/report/apis/hooks/useFirstAvailableYearMonthQuery', () => ({
  useFirstAvailableYearMonthQuery: () => ({ data: undefined }),
}));
jest.mock('@/shared/assets/images/ios-stickers/img-coffee.png', () => 'coffee-sticker.png');

it('같은 가게의 기록도 기록별 이모지·사진 스티커를 표시한다', async () => {
  const storeThumbnail = 'https://example.com/store.jpg';
  jest.mocked(useConsumptionsInfiniteQuery).mockReturnValue({
    data: {
      pages: [
        {
          data: {
            consumptions: [1, 2].map((id) => ({
              id,
              placeId: 42,
              placeName: '챱챱 카페',
              purchaseDate: '2026-11-03',
              purchaseTime: '14:30:00',
              thumbnailUrl: storeThumbnail,
            })),
          },
        },
      ],
    },
    hasNextPage: false,
    isPending: false,
    isError: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    fetchNextPage: jest.fn(),
  } as unknown as ReturnType<typeof useConsumptionsInfiniteQuery>);
  jest.mocked(getConsumption).mockImplementation(async (id) => ({
    data:
      id === 1
        ? { stickerItemId: 22, stickerName: '커피' }
        : { imageId: 11, imageUrl: 'https://example.com/photo-sticker.png' },
  }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const { container, unmount } = render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <SpendingHistoryPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

  await waitFor(() => expect(screen.getAllByAltText('기록에 사용한 스티커')).toHaveLength(2));
  const images = screen.getAllByAltText('기록에 사용한 스티커');
  expect(images[0]).toHaveAttribute('src', 'coffee-sticker.png');
  expect(images[1]).toHaveAttribute('src', 'https://example.com/photo-sticker.png');
  expect(container.querySelector(`img[src="${storeThumbnail}"]`)).toBeNull();
  unmount();
  client.clear();
});
