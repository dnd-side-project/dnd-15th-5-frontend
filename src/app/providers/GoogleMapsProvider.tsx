import { APIProvider } from '@vis.gl/react-google-maps';

import { GOOGLE_MAPS_API_KEY } from '@/shared/lib/env';

import type { PropsWithChildren } from 'react';

type GoogleMapsProviderProps = PropsWithChildren;

/**
 * 앱 전역에서 Google Maps JavaScript API를 사용할 수 있도록 스크립트를 로드하는 Provider입니다.
 *
 * 지도 화면뿐 아니라 장소 검색처럼 지도를 그리지 않는 화면에서도 Places 라이브러리를 써야 하므로
 * 개별 컴포넌트가 아닌 앱 최상단에서 한 번만 로드합니다.
 * `places`를 미리 로드해 두면 라이브러리 로드 실패도 API 로딩 상태로 함께 감지할 수 있습니다.
 */
function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      {children}
    </APIProvider>
  );
}

export default GoogleMapsProvider;
