import { TEST_CONSUMPTION_DETAIL } from '@/features/record/testFixtures';

import { createEditConsumptionInitialValue } from './createEditConsumptionInitialValue';

it('사진 ID와 기존 장소, 정확한 방문 시각 및 입력값을 복원한다', () => {
  const value = createEditConsumptionInitialValue(TEST_CONSUMPTION_DETAIL);
  expect(value?.media).toEqual({ source: 'saved', imageId: 42, category: '카페' });
  expect(value?.draft).toMatchObject({
    amount: '5500',
    memo: '기존 메모',
    purchaseTime: '11:20:15',
    shop: { id: 'google-cafe', latitude: 37.5, longitude: 127 },
  });
  expect(value?.draft.visitDateTime.date.getSeconds()).toBe(15);
});

it('기본 스티커는 사진 업로드 없이 유지할 서버 ID로 복원한다', () => {
  const value = createEditConsumptionInitialValue({
    ...TEST_CONSUMPTION_DETAIL,
    imageId: null,
    imageUrl: null,
    stickerItemId: 5,
    stickerName: '커피',
    amount: 0,
  });
  expect(value?.media).toEqual({ source: 'saved', stickerItemId: 5, category: '카페' });
  expect(value?.draft.amount).toBe('0');
  expect(value?.sticker).toBeTruthy();
  expect(value?.defaultSticker).toMatchObject({ id: 'coffee', name: '커피', category: '카페' });
});

it('카탈로그에 없는 저장된 기본 스티커는 수정 폼을 만들지 않는다', () => {
  const value = createEditConsumptionInitialValue({
    ...TEST_CONSUMPTION_DETAIL,
    imageId: null,
    imageUrl: null,
    stickerItemId: 5,
    stickerName: '도넛',
  });
  expect(value).toBeNull();
});

it('소비 카테고리와 달라도 저장된 스티커 카테고리로 선택 항목을 찾는다', () => {
  const value = createEditConsumptionInitialValue({
    ...TEST_CONSUMPTION_DETAIL,
    category: '음식점',
    stickerCategory: '카페',
    imageId: null,
    imageUrl: null,
    stickerItemId: 5,
    stickerName: '케이크',
  });
  expect(value?.defaultSticker).toMatchObject({ id: 'cake', category: '카페' });
  expect(value?.draft.category).toBe('음식점');
});

it.each([
  { purchaseTime: undefined },
  { latitude: undefined },
  { googlePlaceId: '' },
  { imageId: null },
  { stickerItemId: 5 },
  { category: '알 수 없음' },
  { purchaseDate: '2020-02-30' },
])('안전하게 복원할 수 없는 기록은 수정 폼을 만들지 않는다: %p', (changes) => {
  expect(createEditConsumptionInitialValue({ ...TEST_CONSUMPTION_DETAIL, ...changes })).toBeNull();
});

it('금액·메모가 없으면 빈 입력값으로 복원하고 분 단위 시각도 보존한다', () => {
  const value = createEditConsumptionInitialValue({
    ...TEST_CONSUMPTION_DETAIL,
    amount: null,
    memo: null,
    purchaseTime: '11:20',
  });
  expect(value?.draft).toMatchObject({ amount: '', memo: '', purchaseTime: '11:20:00' });
});
