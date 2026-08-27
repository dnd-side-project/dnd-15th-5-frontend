const COUNTRY_PREFIX_PATTERN = /^대한민국\s+/;

/** Google Places 도로명주소 앞에 붙는 국가명("대한민국")을 제거해 수기 입력 주소와 형식을 맞춘다. */
export const stripCountryPrefix = (address: string): string =>
  address.replace(COUNTRY_PREFIX_PATTERN, '');
