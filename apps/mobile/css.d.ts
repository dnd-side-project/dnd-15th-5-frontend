// CSS는 Metro가 처리하므로 모듈 선언만 둔다.
// 같은 선언이 expo-env.d.ts에도 있지만 그 파일은 Expo가 만들고 gitignore 대상이라 CI에는 없다.
declare module '*.css' {}
