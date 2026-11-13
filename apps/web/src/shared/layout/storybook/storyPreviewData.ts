import { books, coffee, croissant, pizza } from '@/shared/assets/images/ios-stickers';

/** 실제 API 없이도 사진·금액·방문 횟수를 비교할 수 있는 고정 예시 데이터입니다. */
export const STORY_PLACES = [
  {
    id: 'coffee',
    name: '오후의 커피',
    category: '카페',
    image: coffee,
    visits: 12,
    amount: 5500,
    left: '34%',
    top: '28%',
  },
  {
    id: 'bakery',
    name: '서울숲 베이커리',
    category: '카페',
    image: croissant,
    visits: 7,
    amount: 8200,
    left: '69%',
    top: '39%',
  },
  {
    id: 'pizza',
    name: '성수 피자클럽',
    category: '음식점',
    image: pizza,
    visits: 5,
    amount: 18000,
    left: '24%',
    top: '49%',
  },
  {
    id: 'books',
    name: '작은 동네책방',
    category: '취미/놀거리',
    image: books,
    visits: 3,
    amount: 16000,
    left: '72%',
    top: '60%',
  },
] as const;
