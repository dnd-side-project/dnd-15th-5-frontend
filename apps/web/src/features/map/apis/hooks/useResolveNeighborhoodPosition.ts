import { useMutation } from '@tanstack/react-query';

import { geocodeMapLocation } from '@/features/map/apis/services/googleMapsGeocoding';

/** 동네 검색 응답에 좌표가 없으므로 사용자가 선택한 주소만 좌표로 변환합니다. */
export const useResolveNeighborhoodPosition = () =>
  useMutation({
    mutationFn: async (address: string) => {
      const { results } = await geocodeMapLocation({
        address,
        componentRestrictions: { country: 'KR' },
        region: 'KR',
      });
      const location = results[0]?.geometry.location;
      if (!location) throw new Error('동네 좌표를 찾지 못했습니다.');
      return { lat: location.lat(), lng: location.lng() };
    },
  });
