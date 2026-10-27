import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { composeSticker } from '@/features/record/sticker/stickerImage';
import { ROUTE_PATHS } from '@/shared/constants/routePaths';

import ShopStickerPreviewPage from './ShopStickerPreviewPage';

jest.mock('@/features/record/sticker/stickerImage', () => ({ composeSticker: jest.fn() }));
jest.mock('@/shared/assets/images/ios-stickers/coffee.png', () => 'coffee.png');

const originalFetch = globalThis.fetch;
const coffeeImage = new Blob(['coffee'], { type: 'image/png' });

beforeEach(() => {
  jest.clearAllMocks();
  globalThis.fetch = jest.fn().mockResolvedValue({ ok: true, blob: async () => coffeeImage });
  URL.createObjectURL = jest.fn(() => 'blob:coffee-sticker');
  URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const renderPreview = () =>
  render(
    <MemoryRouter initialEntries={['/shop/sticker-preview']}>
      <Routes>
        <Route path={ROUTE_PATHS.shopStickerPreview} element={<ShopStickerPreviewPage />} />
        <Route path={ROUTE_PATHS.record} element={<p>기록 화면</p>} />
      </Routes>
    </MemoryRouter>
  );

it('샘플 가게 상세에 기본 커피 PNG 원본을 붙이고 이탈 시 임시 URL을 정리한다', async () => {
  const { unmount } = renderPreview();
  expect(screen.getByRole('status', { name: '커피 스티커 준비 중' })).toBeInTheDocument();
  await screen.findByRole('heading', { name: '챱챱 카페 · 미리보기' });
  const hero = screen.getByRole('group', { name: '획득한 스티커' });
  const stickers = within(hero).getAllByRole('button', { name: /번째 스티커 다시 붙이기/ });
  expect(stickers).toHaveLength(6);
  stickers.forEach((sticker) =>
    expect(sticker.querySelector('img')).toHaveAttribute('src', 'blob:coffee-sticker')
  );
  expect(composeSticker).not.toHaveBeenCalled();
  expect(URL.createObjectURL).toHaveBeenCalledWith(coffeeImage);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith('coffee.png', { signal: expect.any(AbortSignal) });
  expect(screen.getAllByText('4,500원')).toHaveLength(6);
  fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));
  expect(screen.getByText('기록 화면')).toBeInTheDocument();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:coffee-sticker');
  unmount();
});

it('이모지 로딩에 실패하면 다시 시도해 상세 미리보기를 연다', async () => {
  jest.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);
  renderPreview();
  await screen.findByRole('heading', { name: '스티커를 불러오지 못했어요' });
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  await screen.findByRole('heading', { name: '챱챱 카페 · 미리보기' });
});
