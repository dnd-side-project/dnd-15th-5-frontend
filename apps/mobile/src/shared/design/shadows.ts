import type { ViewStyle } from 'react-native';

/**
 * 디자인 시안의 그림자 토큰.
 *
 * iOS는 `shadow*` 속성을, Android는 `elevation`을 사용하므로 두 값을 함께 정의한다.
 * `elevation`은 흐림 정도에 대응하는 근사값이라 두 플랫폼의 결과가 완전히 같지는 않다.
 *
 * NOTE: 웹은 `apps/web/src/app/styles/shadows.css`에 같은 값이 있으므로 함께 수정해야 한다.
 */
export const SHADOWS = {
  sticker: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  rank: {
    shadowColor: '#636363',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  like: {
    shadowColor: '#6c7dca',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
} as const satisfies Record<string, ViewStyle>;
