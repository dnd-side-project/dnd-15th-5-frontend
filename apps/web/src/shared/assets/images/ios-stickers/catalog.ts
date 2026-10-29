import appleJuice from '@/shared/assets/images/ios-stickers/apple-juice.png';
import apple from '@/shared/assets/images/ios-stickers/apple.png';
import books from '@/shared/assets/images/ios-stickers/books.png';
import bowling from '@/shared/assets/images/ios-stickers/bowling.png';
import bubbleTea from '@/shared/assets/images/ios-stickers/bubble-tea.png';
import burger from '@/shared/assets/images/ios-stickers/burger.png';
import cake from '@/shared/assets/images/ios-stickers/cake.png';
import camera from '@/shared/assets/images/ios-stickers/camera.png';
import cannedFood from '@/shared/assets/images/ios-stickers/canned-food.png';
import capsule from '@/shared/assets/images/ios-stickers/capsule.png';
import car from '@/shared/assets/images/ios-stickers/car.png';
import cat from '@/shared/assets/images/ios-stickers/cat.png';
import clapperboard from '@/shared/assets/images/ios-stickers/clapperboard.png';
import coffee from '@/shared/assets/images/ios-stickers/coffee.png';
import convenienceStore from '@/shared/assets/images/ios-stickers/convenience-store.png';
import cookie from '@/shared/assets/images/ios-stickers/cookie.png';
import creditCard from '@/shared/assets/images/ios-stickers/credit-card.png';
import croissant from '@/shared/assets/images/ios-stickers/croissant.png';
import cupcake from '@/shared/assets/images/ios-stickers/cupcake.png';
import cycling from '@/shared/assets/images/ios-stickers/cycling.png';
import dog from '@/shared/assets/images/ios-stickers/dog.png';
import dress from '@/shared/assets/images/ios-stickers/dress.png';
import ferrisWheel from '@/shared/assets/images/ios-stickers/ferris-wheel.png';
import gamepad from '@/shared/assets/images/ios-stickers/gamepad.png';
import gift from '@/shared/assets/images/ios-stickers/gift.png';
import greenTea from '@/shared/assets/images/ios-stickers/green-tea.png';
import haircut from '@/shared/assets/images/ios-stickers/haircut.png';
import handbag from '@/shared/assets/images/ios-stickers/handbag.png';
import headphones from '@/shared/assets/images/ios-stickers/headphones.png';
import hospital from '@/shared/assets/images/ios-stickers/hospital.png';
import iceCream from '@/shared/assets/images/ios-stickers/ice-cream.png';
import jeans from '@/shared/assets/images/ios-stickers/jeans.png';
import laundry from '@/shared/assets/images/ios-stickers/laundry.png';
import lipstick from '@/shared/assets/images/ios-stickers/lipstick.png';
import lotion from '@/shared/assets/images/ios-stickers/lotion.png';
import massage from '@/shared/assets/images/ios-stickers/massage.png';
import meditation from '@/shared/assets/images/ios-stickers/meditation.png';
import microphone from '@/shared/assets/images/ios-stickers/microphone.png';
import milk from '@/shared/assets/images/ios-stickers/milk.png';
import mirror from '@/shared/assets/images/ios-stickers/mirror.png';
import muscle from '@/shared/assets/images/ios-stickers/muscle.png';
import nailPolish from '@/shared/assets/images/ios-stickers/nail-polish.png';
import paella from '@/shared/assets/images/ios-stickers/paella.png';
import palette from '@/shared/assets/images/ios-stickers/palette.png';
import pizza from '@/shared/assets/images/ios-stickers/pizza.png';
import plate from '@/shared/assets/images/ios-stickers/plate.png';
import pushpin from '@/shared/assets/images/ios-stickers/pushpin.png';
import ramen from '@/shared/assets/images/ios-stickers/ramen.png';
import rice from '@/shared/assets/images/ios-stickers/rice.png';
import ring from '@/shared/assets/images/ios-stickers/ring.png';
import running from '@/shared/assets/images/ios-stickers/running.png';
import sauna from '@/shared/assets/images/ios-stickers/sauna.png';
import shoppingBags from '@/shared/assets/images/ios-stickers/shopping-bags.png';
import shoppingCart from '@/shared/assets/images/ios-stickers/shopping-cart.png';
import sneaker from '@/shared/assets/images/ios-stickers/sneaker.png';
import soccerBall from '@/shared/assets/images/ios-stickers/soccer-ball.png';
import spaghetti from '@/shared/assets/images/ios-stickers/spaghetti.png';
import sparkles from '@/shared/assets/images/ios-stickers/sparkles.png';
import sunglasses from '@/shared/assets/images/ios-stickers/sunglasses.png';
import sushi from '@/shared/assets/images/ios-stickers/sushi.png';
import swimming from '@/shared/assets/images/ios-stickers/swimming.png';
import tennisBall from '@/shared/assets/images/ios-stickers/tennis-ball.png';
import toiletPaper from '@/shared/assets/images/ios-stickers/toilet-paper.png';
import weightlifting from '@/shared/assets/images/ios-stickers/weightlifting.png';

export const DEFAULT_STICKER_CATEGORIES = [
  '카페',
  '음식점',
  '편의점/마트',
  '취미/놀거리',
  '쇼핑',
  '운동',
  '미용/뷰티',
  '기타',
] as const;

export type DefaultStickerCategory = (typeof DEFAULT_STICKER_CATEGORIES)[number];

export type DefaultSticker = {
  id: string;
  name: string;
  category: DefaultStickerCategory;
  image: string;
};

/** 서버 스티커 목록의 category·name은 이 목록과 일치해야 하며 ID는 서버에서 조회합니다. */
/** 서버 스티커 목록의 category·name은 이 목록과 일치해야 하며 ID는 서버에서 조회합니다. */
export const DEFAULT_STICKERS: readonly DefaultSticker[] = [
  { id: 'coffee', name: '커피', category: '카페', image: coffee },
  { id: 'cake', name: '케이크', category: '카페', image: cake },
  { id: 'croissant', name: '크루아상', category: '카페', image: croissant },
  { id: 'ice-cream', name: '아이스크림', category: '카페', image: iceCream },
  { id: 'cupcake', name: '컵케이크', category: '카페', image: cupcake },
  { id: 'cookie', name: '쿠키', category: '카페', image: cookie },
  { id: 'bubble-tea', name: '버블티', category: '카페', image: bubbleTea },
  { id: 'green-tea', name: '녹차', category: '카페', image: greenTea },

  { id: 'burger', name: '햄버거', category: '음식점', image: burger },
  { id: 'paella', name: '빠에야', category: '음식점', image: paella },
  { id: 'pizza', name: '피자', category: '음식점', image: pizza },
  { id: 'plate', name: '접시', category: '음식점', image: plate },
  { id: 'ramen', name: '라면', category: '음식점', image: ramen },
  { id: 'rice', name: '밥', category: '음식점', image: rice },
  { id: 'spaghetti', name: '스파게티', category: '음식점', image: spaghetti },
  { id: 'sushi', name: '초밥', category: '음식점', image: sushi },

  { id: 'apple-juice', name: '사과 주스', category: '편의점/마트', image: appleJuice },
  { id: 'apple', name: '사과', category: '편의점/마트', image: apple },
  { id: 'canned-food', name: '통조림', category: '편의점/마트', image: cannedFood },
  { id: 'convenience-store', name: '편의점', category: '편의점/마트', image: convenienceStore },
  { id: 'laundry', name: '세탁', category: '편의점/마트', image: laundry },
  { id: 'milk', name: '우유', category: '편의점/마트', image: milk },
  { id: 'shopping-cart', name: '장바구니', category: '편의점/마트', image: shoppingCart },
  { id: 'toilet-paper', name: '휴지', category: '편의점/마트', image: toiletPaper },

  { id: 'bowling', name: '볼링', category: '취미/놀거리', image: bowling },
  { id: 'camera', name: '카메라', category: '취미/놀거리', image: camera },
  { id: 'clapperboard', name: '영화', category: '취미/놀거리', image: clapperboard },
  { id: 'ferris-wheel', name: '관람차', category: '취미/놀거리', image: ferrisWheel },
  { id: 'gamepad', name: '게임기', category: '취미/놀거리', image: gamepad },
  { id: 'headphones', name: '헤드폰', category: '취미/놀거리', image: headphones },
  { id: 'microphone', name: '마이크', category: '취미/놀거리', image: microphone },
  { id: 'palette', name: '팔레트', category: '취미/놀거리', image: palette },

  { id: 'dress', name: '드레스', category: '쇼핑', image: dress },
  { id: 'gift', name: '선물', category: '쇼핑', image: gift },
  { id: 'handbag', name: '핸드백', category: '쇼핑', image: handbag },
  { id: 'jeans', name: '청바지', category: '쇼핑', image: jeans },
  { id: 'ring', name: '반지', category: '쇼핑', image: ring },
  { id: 'shopping-bags', name: '쇼핑백', category: '쇼핑', image: shoppingBags },
  { id: 'sneaker', name: '운동화', category: '쇼핑', image: sneaker },
  { id: 'sunglasses', name: '선글라스', category: '쇼핑', image: sunglasses },

  { id: 'cycling', name: '자전거', category: '운동', image: cycling },
  { id: 'meditation', name: '명상', category: '운동', image: meditation },
  { id: 'muscle', name: '근육', category: '운동', image: muscle },
  { id: 'running', name: '달리기', category: '운동', image: running },
  { id: 'soccer-ball', name: '축구공', category: '운동', image: soccerBall },
  { id: 'swimming', name: '수영', category: '운동', image: swimming },
  { id: 'tennis-ball', name: '테니스공', category: '운동', image: tennisBall },
  { id: 'weightlifting', name: '역도', category: '운동', image: weightlifting },

  { id: 'haircut', name: '헤어컷', category: '미용/뷰티', image: haircut },
  { id: 'lipstick', name: '립스틱', category: '미용/뷰티', image: lipstick },
  { id: 'lotion', name: '로션', category: '미용/뷰티', image: lotion },
  { id: 'massage', name: '마사지', category: '미용/뷰티', image: massage },
  { id: 'mirror', name: '거울', category: '미용/뷰티', image: mirror },
  { id: 'nail-polish', name: '매니큐어', category: '미용/뷰티', image: nailPolish },
  { id: 'sauna', name: '사우나', category: '미용/뷰티', image: sauna },
  { id: 'sparkles', name: '반짝임', category: '미용/뷰티', image: sparkles },

  { id: 'books', name: '책', category: '기타', image: books },
  { id: 'capsule', name: '알약', category: '기타', image: capsule },
  { id: 'car', name: '자동차', category: '기타', image: car },
  { id: 'cat', name: '고양이', category: '기타', image: cat },
  { id: 'credit-card', name: '신용카드', category: '기타', image: creditCard },
  { id: 'dog', name: '강아지', category: '기타', image: dog },
  { id: 'hospital', name: '병원', category: '기타', image: hospital },
  { id: 'pushpin', name: '압정', category: '기타', image: pushpin },
];
