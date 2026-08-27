import { CREATED_CONSUMPTION_QUERY_KEYS } from '@chapchap/shared/record';

import type { CreatedConsumptionPlace } from '@chapchap/shared/record';

/** 네이티브 영수증 기록 완료 뒤 홈 URL에 전달된 장소 정보를 복원합니다. */
export const parseCreatedConsumptionPlace = (
  searchParams: URLSearchParams
): CreatedConsumptionPlace | undefined => {
  const placeName = searchParams.get(CREATED_CONSUMPTION_QUERY_KEYS.placeName);
  const latitudeValue = searchParams.get(CREATED_CONSUMPTION_QUERY_KEYS.latitude);
  const longitudeValue = searchParams.get(CREATED_CONSUMPTION_QUERY_KEYS.longitude);

  if (!placeName || latitudeValue === null || longitudeValue === null) {
    return undefined;
  }

  const normalizedLatitude = latitudeValue.trim();
  const normalizedLongitude = longitudeValue.trim();

  if (!normalizedLatitude || !normalizedLongitude) {
    return undefined;
  }

  const latitude = Number(normalizedLatitude);
  const longitude = Number(normalizedLongitude);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return undefined;
  }

  return { placeName, latitude, longitude };
};
