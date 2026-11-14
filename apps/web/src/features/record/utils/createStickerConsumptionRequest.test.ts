import { createStickerConsumptionRequest } from './createStickerConsumptionRequest';

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
it('빈 금액·메모·영수증 ID는 전송하지 않고 이미지 ID만 선택한다', () => {
  const request = createStickerConsumptionRequest(draft, { imageId: 42 });
  expect(request).toMatchObject({
    imageId: 42,
    purchaseDate: '2020-07-25',
    purchaseTime: '11:00:00',
  });
  for (const field of ['amount', 'memo', 'receiptImageId', 'stickerItemId'])
    expect(request).not.toHaveProperty(field);
});
it('OCR 시각과 영수증 ID는 이미지 선택과 독립적으로 보존한다', () => {
  expect(
    createStickerConsumptionRequest(
      { ...draft, receiptImageId: 15, purchaseTime: '11:20:00', amount: '0', memo: ' 메모 ' },
      { imageId: 42 }
    )
  ).toMatchObject({
    receiptImageId: 15,
    imageId: 42,
    purchaseTime: '11:20:00',
    amount: 0,
    memo: '메모',
  });
});
it.each([
  { memo: '가'.repeat(1001) },
  { amount: '-1' },
  { amount: '1.5' },
  { amount: '100000001' },
  { shop: { ...draft.shop, latitude: Number.NaN } },
  { shop: { ...draft.shop, address: '' } },
  { purchaseTime: '25:00:00' },
  { receiptImageId: -1 },
])('잘못된 입력은 등록 요청으로 만들지 않는다', (invalid) => {
  expect(() =>
    createStickerConsumptionRequest({ ...draft, ...invalid }, { imageId: 42 })
  ).toThrow();
});

it('기본 이모지는 imageId 없이 stickerItemId와 영수증 ID를 전달한다', () => {
  const request = createStickerConsumptionRequest(
    { ...draft, receiptImageId: 15 },
    { stickerItemId: 173 }
  );
  expect(request).toMatchObject({ stickerItemId: 173, receiptImageId: 15 });
  expect(request).not.toHaveProperty('imageId');
});

it.each([{ imageId: 42 }, { stickerItemId: 173 }])(
  '사진과 이모지 모두 쇼핑 카테고리로 등록할 수 있다 (%#)',
  (media) => {
    expect(createStickerConsumptionRequest({ ...draft, category: '쇼핑' }, media)).toMatchObject({
      ...media,
      category: '쇼핑',
    });
  }
);
