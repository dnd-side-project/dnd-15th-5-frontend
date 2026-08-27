const { withAndroidManifest } = require('expo/config-plugins');

const KAKAO_TALK_PACKAGE = 'com.kakao.talk';

/** Android 11 이상에서 WebView의 카카오톡 공유 Intent가 카카오톡을 찾도록 허용합니다. */
module.exports = function withKakaoTalkPackageVisibility(config) {
  return withAndroidManifest(config, (configuredProject) => {
    const manifest = configuredProject.modResults.manifest;
    const queries = manifest.queries ?? [];
    const hasKakaoTalkPackage = queries.some((query) =>
      query.package?.some((packageEntry) => packageEntry.$?.['android:name'] === KAKAO_TALK_PACKAGE)
    );

    if (!hasKakaoTalkPackage) {
      queries.push({ package: [{ $: { 'android:name': KAKAO_TALK_PACKAGE } }] });
    }

    manifest.queries = queries;

    return configuredProject;
  });
};
