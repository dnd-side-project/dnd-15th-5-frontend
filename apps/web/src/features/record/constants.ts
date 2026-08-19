import type { VisitPeriod } from './types';

export const RECORD_CATEGORIES = [
  '카페',
  '운동',
  '편의점/마트',
  '취미/놀거리',
  '음식점',
  '미용/뷰티',
  '기타',
] as const;

export const VISIT_PERIODS: ReadonlyArray<{
  value: VisitPeriod;
  label: string;
  range: string;
}> = [
  { value: 'morning', label: '오전', range: '05–11시' },
  { value: 'afternoon', label: '오후', range: '11–17시' },
  { value: 'evening', label: '저녁', range: '17–21시' },
  { value: 'night', label: '밤', range: '21–05시' },
];
