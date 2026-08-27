import { getKakaoTalkShareTarget } from './kakaoTalkShare';

describe('getKakaoTalkShareTarget', () => {
  it('iOS 카카오링크 스킴은 그대로 반환한다', () => {
    const url = 'kakaolink://send?appkey=javascript-key';

    expect(getKakaoTalkShareTarget(url)).toEqual({ launchUrl: url });
  });

  it('Android 카카오 Intent를 실행 URL과 fallback URL로 변환한다', () => {
    const fallbackUrl = 'https://play.google.com/store/apps/details?id=com.kakao.talk';
    const url = `intent://send?appkey=javascript-key#Intent;scheme=kakaolink;package=com.kakao.talk;S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`;

    expect(getKakaoTalkShareTarget(url)).toEqual({
      fallbackUrl,
      launchUrl: 'kakaolink://send?appkey=javascript-key',
    });
  });

  it('카카오톡이 아닌 Intent와 임의의 커스텀 스킴은 허용하지 않는다', () => {
    expect(
      getKakaoTalkShareTarget('intent://send#Intent;scheme=other;package=com.example.other;end')
    ).toBeNull();
    expect(getKakaoTalkShareTarget('other-app://send')).toBeNull();
  });
});
