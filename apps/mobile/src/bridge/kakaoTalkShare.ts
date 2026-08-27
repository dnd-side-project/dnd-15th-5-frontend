const KAKAO_LINK_SCHEME = 'kakaolink';
const KAKAO_TALK_ANDROID_PACKAGE = 'com.kakao.talk';
const ANDROID_INTENT_PREFIX = 'intent://';
const ANDROID_INTENT_MARKER = '#Intent;';

export type KakaoTalkShareTarget = {
  fallbackUrl?: string;
  launchUrl: string;
};

const getIntentParameter = (intentParameters: string, key: string) => {
  const prefix = `${key}=`;
  const parameter = intentParameters.split(';').find((value) => value.startsWith(prefix));

  return parameter?.slice(prefix.length);
};

const decodeIntentUrl = (encodedUrl: string | undefined) => {
  if (!encodedUrl) return undefined;

  try {
    return decodeURIComponent(encodedUrl);
  } catch {
    return undefined;
  }
};

/** WebView에서 요청한 카카오톡 공유 URL을 네이티브에서 실행할 안전한 URL로 변환합니다. */
export const getKakaoTalkShareTarget = (url: string): KakaoTalkShareTarget | null => {
  if (url.startsWith(`${KAKAO_LINK_SCHEME}://`)) {
    return { launchUrl: url };
  }

  if (!url.startsWith(ANDROID_INTENT_PREFIX)) return null;

  const markerIndex = url.indexOf(ANDROID_INTENT_MARKER);
  if (markerIndex < 0) return null;

  const intentParameters = url.slice(markerIndex + ANDROID_INTENT_MARKER.length);
  const scheme = getIntentParameter(intentParameters, 'scheme');
  const packageName = getIntentParameter(intentParameters, 'package');

  if (scheme !== KAKAO_LINK_SCHEME || packageName !== KAKAO_TALK_ANDROID_PACKAGE) return null;

  const intentPath = url.slice(ANDROID_INTENT_PREFIX.length, markerIndex);
  const encodedFallbackUrl = getIntentParameter(intentParameters, 'S.browser_fallback_url');

  return {
    fallbackUrl: decodeIntentUrl(encodedFallbackUrl),
    launchUrl: `${KAKAO_LINK_SCHEME}://${intentPath}`,
  };
};
