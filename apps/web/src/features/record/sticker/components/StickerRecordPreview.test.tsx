import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import { TEST_CONSUMPTION_DETAIL } from '@/features/record/testFixtures';
import { createEditConsumptionInitialValue } from '@/features/record/utils/createEditConsumptionInitialValue';
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

it.each([{ name: '새 이름' }, { address: '새 주소' }, { latitude: 38 }, { longitude: 128 }])(
  '같은 장소 ID여도 제출할 가게 정보가 바뀌면 저장할 수 있다: %p',
  (changes) => {
    const initial = createEditConsumptionInitialValue(TEST_CONSUMPTION_DETAIL)!;
    const onSubmit = jest.fn();
    render(
      <StickerRecordPreview
        sticker={initial.sticker}
        isDefaultSticker={false}
        {...callbacks}
        isEditing
        initialDraft={initial.draft}
        selectedShop={{ ...initial.draft.shop, ...changes }}
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: '수정완료' }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ shop: expect.objectContaining(changes) })
    );
  }
);

it('제출하지 않는 매장 썸네일만 바뀐 경우 저장을 활성화하지 않는다', () => {
  const initial = createEditConsumptionInitialValue(TEST_CONSUMPTION_DETAIL)!;
  render(
    <StickerRecordPreview
      sticker={initial.sticker}
      isDefaultSticker={false}
      {...callbacks}
      isEditing
      initialDraft={initial.draft}
      selectedShop={{ ...initial.draft.shop, photoUrl: 'other.png' }}
      onSubmit={jest.fn()}
    />
  );
  expect(screen.getByRole('button', { name: '수정완료' })).toBeDisabled();
});

it('기본 스티커를 유지한 채 소비 카테고리를 변경하고 제출할 수 있다', () => {
  const onSubmit = jest.fn();
  const initial = createEditConsumptionInitialValue(TEST_CONSUMPTION_DETAIL)!;
  render(
    <StickerRecordPreview
      sticker="coffee.png"
      isDefaultSticker
      defaultStickerCategory="카페"
      selectedShop={initial.draft.shop}
      onSubmit={onSubmit}
      {...callbacks}
    />
  );
  fireEvent.change(screen.getByRole('textbox', { name: '금액' }), { target: { value: '5500' } });
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '입력 유지' },
  });
  fireEvent.click(screen.getByRole('button', { name: '음식점' }));
  expect(screen.getByAltText('기록에 적용한 스티커')).toHaveAttribute('src', 'coffee.png');
  expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('5,500');
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('입력 유지');
  fireEvent.click(screen.getByRole('button', { name: '기록하기' }));
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ category: '음식점', amount: '5500', memo: '입력 유지' })
  );
});

it('스티커를 재선택하면 새 스티커의 카테고리를 적용하고 다른 입력은 유지한다', () => {
  const props = { ...callbacks, isDefaultSticker: true, defaultStickerCategory: '카페' as const };
  const { rerender } = render(<StickerRecordPreview {...props} sticker="coffee.png" />);
  fireEvent.click(screen.getByRole('button', { name: '기타' }));
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '그대로 유지' },
  });
  rerender(<StickerRecordPreview {...props} sticker="cake.png" />);
  expect(screen.getByRole('button', { name: '카페' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('그대로 유지');
  fireEvent.click(screen.getByRole('button', { name: '운동' }));
  expect(screen.getByRole('button', { name: '운동' })).toHaveAttribute('aria-pressed', 'true');
});

it('저장된 기록의 소비 카테고리는 스티커의 기본 카테고리와 달라도 복원한다', () => {
  const initial = createEditConsumptionInitialValue(TEST_CONSUMPTION_DETAIL)!;
  render(
    <StickerRecordPreview
      sticker="coffee.png"
      isDefaultSticker
      defaultStickerCategory="카페"
      initialDraft={{ ...initial.draft, category: '음식점' }}
      {...callbacks}
    />
  );
  expect(screen.getByRole('button', { name: '음식점' })).toHaveAttribute('aria-pressed', 'true');
});

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

it('사진 스티커는 사진 변경 버튼으로 이미지 선택을 연다', () => {
  render(<StickerRecordPreview sticker="photo.png" isDefaultSticker={false} {...callbacks} />);
  fireEvent.click(screen.getByRole('button', { name: '사진 변경' }));
  expect(callbacks.onChangeImage).toHaveBeenCalledTimes(1);
});

it('영수증 인식 후 완료 안내를 표시하고 재인식 취소 시 입력 내용을 유지한다', async () => {
  jest.mocked(isNativeApp).mockReturnValue(true);
  const receipt = {
    receiptImageId: 23,
    purchaseDate: '2026-08-09',
    purchaseTime: '09:30',
    amount: 5500,
    shop: null,
  };
  callbacks.onScanReceipt
    .mockResolvedValueOnce(receipt)
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ ...receipt, receiptImageId: 24, amount: 8200 });
  renderPreview();
  fireEvent.change(screen.getByRole('textbox', { name: '메모' }), {
    target: { value: '남길 메모' },
  });
  fireEvent.click(screen.getByRole('button', { name: /영수증 인식하기/ }));
  expect(await screen.findByRole('status')).toHaveTextContent('영수증을 인식해 정보를 가져왔어요');
  expect(screen.queryByRole('button', { name: /영수증 인식하기/ })).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('5,500');
  fireEvent.click(screen.getByRole('button', { name: '다시 인식' }));
  await waitFor(() => expect(callbacks.onScanReceipt).toHaveBeenCalledTimes(2));
  expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('5,500');
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('남길 메모');
  fireEvent.click(screen.getByRole('button', { name: '다시 인식' }));
  await waitFor(() => expect(screen.getByRole('textbox', { name: '금액' })).toHaveValue('8,200'));
  expect(screen.getByRole('textbox', { name: '메모' })).toHaveValue('남길 메모');
});
