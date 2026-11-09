import { croissant, gift, meditation, rice } from '@/shared/assets/images/ios-stickers';

const SAMPLE_RECORDS: Record<number, { image: string; count: number }> = {
  1: { image: croissant, count: 1 },
  4: { image: rice, count: 1 },
  5: { image: gift, count: 2 },
  7: { image: meditation, count: 1 },
  8: { image: croissant, count: 1 },
  11: { image: rice, count: 1 },
  12: { image: gift, count: 2 },
  14: { image: meditation, count: 1 },
  15: { image: croissant, count: 1 },
  18: { image: rice, count: 1 },
  19: { image: gift, count: 1 },
};

const SAMPLE_SHOPS = {
  [rice]: { shopName: '윤이네김치찌개', category: '음식점', visitLabel: '3회째 방문' },
  [gift]: { shopName: '한정선 서울역점', category: '카페', visitLabel: '첫방문' },
  [croissant]: { shopName: '동네 베이커리', category: '카페', visitLabel: '첫방문' },
  [meditation]: { shopName: '요가 스튜디오', category: '운동', visitLabel: '첫방문' },
};

export function getSampleRecord(date: Date, sampleMonth: Date) {
  if (
    date.getFullYear() !== sampleMonth.getFullYear() ||
    date.getMonth() !== sampleMonth.getMonth()
  ) {
    return undefined;
  }
  return SAMPLE_RECORDS[date.getDate()];
}

export function getSampleDailyRecords(date: Date, sampleMonth: Date) {
  const record = getSampleRecord(date, sampleMonth);
  if (!record) return [];

  const images = record.count > 1 ? [record.image, rice] : [record.image];
  return images.map((image) => ({ image, ...SAMPLE_SHOPS[image] }));
}
