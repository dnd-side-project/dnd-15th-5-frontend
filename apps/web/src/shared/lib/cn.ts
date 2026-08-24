import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// NOTE: 타이포그래피 토큰이 text-neutral-* 같은 색상 클래스와 충돌하지 않도록 font-size 토큰으로 인식시킨다.
const isTypographyToken = (value: string) =>
  /^(?:(heading|title|body|label|caption)-\d{2}-(regular|medium|semibold|bold)|body-medium-card|card-(?:(?:back|save)-)?title)$/.test(
    value
  );

const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['05', '08', '15', '16', '30', '32', '46'],
      text: [isTypographyToken],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
