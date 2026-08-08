# DND Mobile

Expo와 React Native로 구성한 DND 모바일 애플리케이션입니다.

## 실행

저장소 루트에서 의존성을 설치하고 개발 서버를 실행합니다.

```bash
pnpm install
pnpm dev:mobile
```

플랫폼별로 직접 실행할 수도 있습니다.

```bash
pnpm ios
pnpm android
pnpm --filter @dnd/mobile web
```

Expo Router 라우트는 `src/app`에 추가합니다.

## pnpm nodeLinker 정책

Expo의 pnpm workspace 지원을 그대로 사용하기 위해 pnpm 기본값인 `isolated`를 유지합니다.
`.npmrc`에 `node-linker=hoisted`를 추가하지 않으며, 네이티브 모듈이 isolated 구조를
해석하지 못하는 문제가 실제로 확인될 때만 호환성 우회책으로 적용합니다.
