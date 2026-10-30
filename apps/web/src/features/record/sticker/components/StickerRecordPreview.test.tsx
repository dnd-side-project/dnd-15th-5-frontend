import { fireEvent, render, screen, within } from '@testing-library/react';

import { isNativeApp } from '@/shared/lib/bridge';

import StickerRecordPreview from './StickerRecordPreview';

import type { VisitDateTimeValue } from '@chapchap/shared/record';

jest.mock('@/shared/lib/bridge', () => ({ isNativeApp: jest.fn() }));
jest.mock('@/features/record/components/visit-date-time-sheet/VisitDateTimeSheet', () => ({
  __esModule: true,
  default: ({
    onConfirm,
    onClose,
  }: {
    onConfirm: (value: VisitDateTimeValue) => void;
    onClose: () => void;
  }) => (
    <div role="dialog" aria-label="방문 일시 선택">
      <button onClick={() => onConfirm({ date: new Date(2026, 7, 9), period: 'morning' })}>
        날짜 확정
      </button>
      <button onClick={onClose}>날짜 취소</button>
    </div>
  ),
}));

const callbacks = {
  onBack: jest.fn(),
  onClose: jest.fn(),
  onChangeImage: jest.fn(),
  onSearchShop: jest.fn(),
  onScanReceipt: jest.fn(),
};
const renderPreview = () =>
  render(<StickerRecordPreview sticker="sticker.png" isDefaultSticker {...callbacks} />);

it('카테고리 8개를 정해진 순서로 표시한다', () => {
  renderPreview();
  const categories = screen.getByRole('group', { name: '카테고리' });
  expect(
    within(categories)
      .getAllByRole('button')
      .map((button) => button.textContent)
  ).toEqual(['카페', '음식점', '운동', '미용/뷰티', '편의점/마트', '쇼핑', '취미/놀거리', '기타']);
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(isNativeApp).mockReturnValue(false);
});

it('뒤로 가기, 닫기, 이미지 변경과 가게 검색을 연결한다', () => {
  renderPreview();
  expect(screen.getByRole('heading', { level: 1, name: '기록하기' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '뒤로 가기' }));
  fireEvent.click(screen.getByRole('button', { name: '기록 닫고 홈으로 이동' }));
  fireEvent.click(screen.getByRole('button', { name: '이미지 변경' }));
  fireEvent.click(screen.getByRole('button', { name: '가게 정보 검색' }));
  expect(callbacks.onBack).toHaveBeenCalledTimes(1);
  expect(callbacks.onClose).toHaveBeenCalledTimes(1);
  expect(callbacks.onChangeImage).toHaveBeenCalledTimes(1);
  expect(callbacks.onSearchShop).toHaveBeenCalledTimes(1);
});

it('방문 일시를 확정하면 선택한 날짜와 시간대로 표시한다', () => {
  renderPreview();
  fireEvent.click(screen.getByRole('button', { name: /방문 일시 변경/ }));
  expect(screen.getByRole('dialog', { name: '방문 일시 선택' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '날짜 확정' }));
  expect(screen.getByRole('button', { name: /8월 9일 \(일\) · 오전/ })).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('금액을 숫자로 정리하고 천 단위로 표시하며 상한 초과를 안내한다', () => {
  renderPreview();
  const amount = screen.getByRole('textbox', { name: '금액' });
  fireEvent.change(amount, { target: { value: '12a345' } });
  expect(amount).toHaveValue('12,345');
  fireEvent.change(amount, { target: { value: '100000001' } });
  expect(amount).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('alert')).toHaveTextContent('100,000,000원 이하');
  fireEvent.change(amount, { target: { value: '' } });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('가게 선택 결과를 받아도 작성 중인 카테고리와 메모를 유지한다', () => {
  const { rerender } = renderPreview();
  fireEvent.click(screen.getByRole('button', { name: '운동' }));
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '친구와 방문' },
  });
  rerender(
    <StickerRecordPreview
      sticker="sticker.png"
      isDefaultSticker
      {...callbacks}
      selectedShop={{
        id: 'shop-01',
        name: '챱챱 카페',
        address: '서울',
        photoUrl: null,
        latitude: 37.5,
        longitude: 127,
      }}
    />
  );
  expect(screen.getByText('챱챱 카페')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '운동' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('친구와 방문');
});

it('웹에서는 영수증 인식 메뉴와 관련 오류를 표시하지 않는다', () => {
  render(
    <StickerRecordPreview
      sticker="sticker.png"
      isDefaultSticker
      {...callbacks}
      receiptError="촬영 오류"
    />
  );
  expect(screen.queryByRole('button', { name: /영수증 인식하기/ })).not.toBeInTheDocument();
  expect(screen.queryByText('소비정보를 자동으로 기록')).not.toBeInTheDocument();
  expect(screen.queryByText('촬영 오류')).not.toBeInTheDocument();
  expect(callbacks.onScanReceipt).not.toHaveBeenCalled();
});

it('가게에서 전달된 쇼핑 카테고리를 선택 상태로 표시하고 그대로 제출한다', () => {
  const onSubmit = jest.fn();
  render(
    <StickerRecordPreview
      {...callbacks}
      sticker="sticker.png"
      isDefaultSticker={false}
      initialCategory="쇼핑"
      selectedShop={{
        id: 'shop-01',
        name: '가게',
        address: '서울',
        photoUrl: null,
        latitude: 37.5,
        longitude: 127,
      }}
      onSubmit={onSubmit}
    />
  );
  expect(screen.getByRole('button', { name: '쇼핑' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: '기록하기' }));
  expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ category: '쇼핑' }));
});

it('앱에서는 영수증 촬영 진입을 요청한다', () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  renderPreview();
  fireEvent.click(screen.getByRole('button', { name: /영수증 인식하기/ }));
  expect(callbacks.onScanReceipt).toHaveBeenCalledTimes(1);
});
