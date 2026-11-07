import { getRecordCategoryFromLocationState } from './recordNavigation';

it.each(['카페', '쇼핑'])('기록 화면으로 전달된 %s 카테고리를 유지한다', (category) => {
  expect(getRecordCategoryFromLocationState({ category })).toBe(category);
});

it.each([null, undefined, {}, { category: '알 수 없음' }])(
  '지원하지 않는 라우트 상태에는 카테고리를 지정하지 않는다 (%#)',
  (state) => {
    expect(getRecordCategoryFromLocationState(state)).toBeUndefined();
  }
);
