# AGENTS.md

AI 도구가 이 저장소에서 작업할 때 따르는 공통 지침입니다.

## 기본 원칙

- 구현 전 관련 파일과 지침을 먼저 확인하고, 작업은 작고 검증 가능한 단위로 나눕니다.

## Project Overview

pnpm workspace와 Turborepo로 관리하는 ChapChap 모노레포. 웹은 React + Vite + TypeScript,
모바일은 Expo + React Native 기반이다. 모바일 앱은 웹 화면을 WebView로 띄우는 구조이며,
웹과 네이티브가 주고받는 브릿지까지 적용되어 있다. 알림·영수증 촬영 같은 네이티브 기능은
이 브릿지 위에 얹어 추후 구현한다.

## Commands

```bash
pnpm dev           # 웹과 모바일 개발 서버
pnpm dev:web       # Vite 웹 개발 서버
pnpm dev:mobile    # Expo 모바일 개발 서버
pnpm build         # 웹 Vite build와 모바일 Expo export
pnpm build:ios     # iOS Release 빌드
pnpm build:android # Android Release 빌드
pnpm lint          # SVG 최적화 검사와 전체 workspace ESLint
pnpm optimize:icons # 웹·모바일·공통 SVG 아이콘 최적화
pnpm check:icons   # SVG 아이콘 최적화 상태 검사
pnpm typecheck     # 전체 workspace TypeScript 검사
pnpm test          # 전체 workspace Jest
pnpm preview       # 웹 빌드 결과 미리보기
```

- 패키지 매니저는 **pnpm만** 사용한다. `package-lock.json`/`yarn.lock`을 생성하지 말 것.

## Tech Stack

적용 완료: React, Vite, TypeScript, TanStack Query, Axios, Tailwind CSS, CVA.

사용 확정: Zustand. 실제 도입 시점과 상태 범위는 기능 구현에 맞춰 결정한다.

> 네이티브 기능 범위는 알림과 영수증으로 제한하며, 범위를 확대하기 전에 먼저 확인한다.

## Architecture & Code Style

- 웹 디렉토리 구조, 의존 방향(`app → pages → features → shared`), 상태관리 규칙: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 모바일 디렉토리 구조(`app`/`screens`/`features`/`bridge`/`native`/`shared`): [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 네이밍, Import(`@/` alias), Props/Type, TSDoc, 주석 규칙: [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
- 인증/토큰 처리는 `apps/web/src/shared/apis`에서만. feature별 `apis`는 공통 인스턴스만 가져다 쓴다.

## Git 작업

- 브랜치: `타입/기능명-이슈번호` (예: `feat/login-ui-10`), `develop`에서 생성해서 `develop`으로 PR.
- 커밋: `깃모지 Type: 작업 내용` (예: `✨ Feat: 로그인 기능 추가`), 한글, 마침표 없음.
- Squash merge, 승인 후 merge, merge 후 브랜치 삭제.
- 커밋 메시지와 PR 본문은 [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)를 따른다.
- 사용자가 명시적으로 요청하지 않으면 `git commit`, `git push`, PR 생성을 실행하지 않는다.

## Testing

- Jest + React Testing Library. 앱별 설정은 `apps/*/jest.config.cjs`, 웹 셋업은 `apps/web/jest.setup.ts`에서 관리한다.
- 웹과 모바일의 일반 컴포넌트·훅·유틸 테스트는 대상 파일과 같은 폴더에 `ComponentName.test.tsx`처럼 둔다.
- `apps/mobile/src/app`은 Expo Router의 라우트·레이아웃 전용이므로 테스트 파일을 두지 않는다.
- 모바일 라우트·레이아웃 테스트는 `apps/mobile/__tests__`에 둔다.
- 테스트 대상은 feature 로직과 사용자 플로우 위주로 한다.
- 공통 컴포넌트는 인터랙션이 있는 것만 테스트하고, 레이아웃이나 표시 전용 UI는 생략한다.
- `render()`가 던지는 에러는 Jest가 알아서 실패 처리하므로 `expect(() => render(...)).not.toThrow()` 같은 래핑은 하지 않는다.

## CI/CD와 Gotchas

- GitHub Actions는 루트 Turbo 명령으로 lint, typecheck, test, format, build를 검사한다. `pnpm build`의 모바일 검증 범위는 iOS·Android Expo export이며 네이티브 빌드는 CI에서 실행하지 않는다. Expo web은 앱의 타깃이 아니라 export 대상에서 제외한다(웹 화면은 `apps/web`).
- Vercel과 Chromatic은 `apps/web`을 웹 앱 기준 디렉토리로 사용한다.
- `apps/web/tsconfig.app.json`은 Vite 번들러 전용 옵션(`moduleResolution: bundler`)을 쓰기 때문에 Jest가 그대로 못 읽는다. `apps/web/jest.config.cjs` 안에 별도 inline tsconfig를 둔다.
- Turbo build 입력에는 각 workspace의 `.env`, `.env.*`를 포함한다. 환경 파일 패턴을 바꿀 때 `turbo.json`도 함께 갱신한다.
