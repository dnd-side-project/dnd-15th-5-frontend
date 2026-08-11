import { FONT_FAMILY } from './fonts';

import type { TextStyle } from 'react-native';

/**
 * 디자인 시안의 타이포그래피 토큰.
 *
 * 굵기는 `fontWeight` 대신 굵기별 글꼴로 지정한다. 이유는 `fonts.ts` 참고.
 *
 * NOTE: 시안의 행간이 `Auto`인 항목은 React Native에 대응하는 값이 없어 140%로 맞춘다.
 * 웹은 같은 항목을 `normal`(글꼴 기본 행간)로 두므로 두 플랫폼의 행간이 미세하게 다를 수 있다.
 *
 * NOTE: 웹은 `apps/web/src/app/styles/typography.css`에 같은 값이 있으므로 함께 수정해야 한다.
 */
export const TYPOGRAPHY = {
  heading01Bold: { fontFamily: FONT_FAMILY.bold, fontSize: 26, lineHeight: 36.4 },
  heading02SemiBold: { fontFamily: FONT_FAMILY.semiBold, fontSize: 24, lineHeight: 33.6 },
  heading03SemiBold: { fontFamily: FONT_FAMILY.semiBold, fontSize: 22, lineHeight: 30.8 },

  title01Bold: { fontFamily: FONT_FAMILY.bold, fontSize: 20, lineHeight: 28 },
  title01SemiBold: { fontFamily: FONT_FAMILY.semiBold, fontSize: 20, lineHeight: 28 },
  title02Bold: { fontFamily: FONT_FAMILY.bold, fontSize: 18, lineHeight: 25.2 },
  title02SemiBold: { fontFamily: FONT_FAMILY.semiBold, fontSize: 18, lineHeight: 25.2 },

  body01Regular: { fontFamily: FONT_FAMILY.regular, fontSize: 16, lineHeight: 22.4 },
  body01Medium: { fontFamily: FONT_FAMILY.medium, fontSize: 16, lineHeight: 24 },
  body01SemiBold: { fontFamily: FONT_FAMILY.semiBold, fontSize: 16, lineHeight: 22.4 },
  body01Bold: { fontFamily: FONT_FAMILY.bold, fontSize: 16, lineHeight: 24 },

  body02Regular: { fontFamily: FONT_FAMILY.regular, fontSize: 14, lineHeight: 19.6 },
  body02Medium: { fontFamily: FONT_FAMILY.medium, fontSize: 14, lineHeight: 19.6 },
  body02SemiBold: { fontFamily: FONT_FAMILY.semiBold, fontSize: 14, lineHeight: 19.6 },

  label01SemiBold: { fontFamily: FONT_FAMILY.semiBold, fontSize: 12, lineHeight: 16.8 },
  label01Medium: { fontFamily: FONT_FAMILY.medium, fontSize: 12, lineHeight: 16.8 },

  caption01Regular: { fontFamily: FONT_FAMILY.regular, fontSize: 12, lineHeight: 18 },
} as const satisfies Record<string, TextStyle>;
