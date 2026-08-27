import { stripCountryPrefix } from './stripCountryPrefix';

describe('stripCountryPrefix', () => {
  it('Google Places 주소 앞의 대한민국을 제거한다', () => {
    expect(stripCountryPrefix('대한민국 서울특별시 강남구 봉은사로 125 1층')).toBe(
      '서울특별시 강남구 봉은사로 125 1층'
    );
  });

  it('대한민국으로 시작하지 않으면 그대로 반환한다', () => {
    expect(stripCountryPrefix('서울특별시 강남구 봉은사로 125 1층')).toBe(
      '서울특별시 강남구 봉은사로 125 1층'
    );
  });

  it('빈 문자열은 그대로 반환한다', () => {
    expect(stripCountryPrefix('')).toBe('');
  });

  it('국가명만 있으면 빈 주소로 변환한다', () => {
    expect(stripCountryPrefix('대한민국')).toBe('');
  });
});
