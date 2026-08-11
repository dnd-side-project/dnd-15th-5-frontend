/**
 * 디자인 시안의 색상 토큰.
 *
 * NOTE: 웹은 Tailwind가 CSS에서 토큰을 읽으므로 `apps/web/src/app/styles/colors.css`에 같은 값이 있다.
 * 색상을 바꿀 때는 두 파일을 함께 수정해야 한다.
 */
export const COLORS = {
  neutral900: '#000000',
  neutral700: '#1f1f1f',
  neutral600: '#4b4b4b',
  neutral500: '#8e8e8e',
  neutral400: '#cacaca',
  neutral300: '#e1e1e1',
  neutral200: '#eeeeee',
  neutral100: '#f5f5f5',
  neutral50: '#fafafa',
  neutral00: '#ffffff',

  primary700: '#1a34c7',
  primary600: '#2a4bef',
  primary500: '#4a6bff',
  primary400: '#7a93ff',
  primary300: '#a6b6ff',
  primary200: '#cbd5ff',
  primary100: '#e5eaff',
  primary50: '#f9ffff',

  gold: '#fbd508',
  silver: '#bec2d5',
  bronze: '#95592e',
  notification: '#ff5252',
} as const;
