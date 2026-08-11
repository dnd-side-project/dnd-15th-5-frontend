/**
 * 앱에 번들한 Pretendard 글꼴 이름.
 *
 * Android는 사용자 글꼴에 `fontWeight`를 적용해도 굵기가 바뀌지 않으므로,
 * 굵기마다 해당 글꼴을 직접 지정한다. 그래서 타이포그래피 토큰은 `fontWeight`를 사용하지 않는다.
 *
 * 글꼴 파일은 `pretendard` 패키지에서 가져와 `app.json`의 expo-font 설정으로 빌드 시 포함한다.
 * 이름은 파일명을 따르므로 파일이나 경로를 바꾸면 이 값도 함께 수정해야 한다.
 */
export const FONT_FAMILY = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
} as const;
