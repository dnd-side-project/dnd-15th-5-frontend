/** 주소에서 시·도 다음에 오는 구 이름을 추출합니다. */
export const getDistrict = (address: string) => address.split(' ')[1] ?? address;

/** 해당 가게의 장소 상세 화면을 여는 Google Maps 검색 URL을 만듭니다. */
export const getGoogleMapsPlaceUrl = (name: string, address: string) => {
  const searchParams = new URLSearchParams({
    api: '1',
    query: `${name} ${address}`,
  });

  return `https://www.google.com/maps/search/?${searchParams.toString()}`;
};
