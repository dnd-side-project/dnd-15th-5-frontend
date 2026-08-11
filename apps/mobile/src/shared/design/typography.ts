import type { TextStyle } from 'react-native';

/**
 * 디자인 시안의 타이포그래피 토큰.
 *
 * NOTE: 시안의 행간이 `Auto`인 항목은 React Native에 대응하는 값이 없어 140%로 맞춘다.
 * 웹은 같은 항목을 `normal`(글꼴 기본 행간)로 두므로 두 플랫폼의 행간이 미세하게 다를 수 있다.
 *
 * NOTE: 웹은 `apps/web/src/app/styles/typography.css`에 같은 값이 있으므로 함께 수정해야 한다.
 *
 * TODO: Pretendard를 앱에 번들해 `fontFamily`를 지정한다. 지금은 기기 기본 글꼴을 사용한다.
 */
export const TYPOGRAPHY = {
  heading01Bold: { fontSize: 26, lineHeight: 36.4, fontWeight: '700' },
  heading02SemiBold: { fontSize: 24, lineHeight: 33.6, fontWeight: '600' },
  heading03SemiBold: { fontSize: 22, lineHeight: 30.8, fontWeight: '600' },

  title01Bold: { fontSize: 20, lineHeight: 28, fontWeight: '700' },
  title01SemiBold: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  title02Bold: { fontSize: 18, lineHeight: 25.2, fontWeight: '700' },
  title02SemiBold: { fontSize: 18, lineHeight: 25.2, fontWeight: '600' },

  body01Regular: { fontSize: 16, lineHeight: 22.4, fontWeight: '400' },
  body01Medium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  body01SemiBold: { fontSize: 16, lineHeight: 22.4, fontWeight: '600' },
  body01Bold: { fontSize: 16, lineHeight: 24, fontWeight: '700' },

  body02Regular: { fontSize: 14, lineHeight: 19.6, fontWeight: '400' },
  body02Medium: { fontSize: 14, lineHeight: 19.6, fontWeight: '500' },
  body02SemiBold: { fontSize: 14, lineHeight: 19.6, fontWeight: '600' },

  label01SemiBold: { fontSize: 12, lineHeight: 16.8, fontWeight: '600' },
  label01Medium: { fontSize: 12, lineHeight: 16.8, fontWeight: '500' },

  caption01Regular: { fontSize: 12, lineHeight: 18, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;
