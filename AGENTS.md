# AGENTS.md

AI 도구가 이 저장소에서 작업할 때 따르는 공통 지침입니다.

## 기본 원칙

- 구현 전 관련 파일과 지침을 먼저 확인하고, 작업은 작고 검증 가능한 단위로 나눕니다.

## Project Overview

React + Vite + TypeScript 기반 프론트엔드. 네이티브 앱(iOS/Android) 래핑 방식은 React Native WebView와 Capacitor 중 미정.

## Commands

```bash
pnpm dev       # 개발 서버
pnpm build     # tsc -b && vite build
pnpm lint      # eslint
pnpm test      # jest
pnpm preview   # 빌드 결과 미리보기
```

- 패키지 매니저는 **pnpm만** 사용한다. `package-lock.json`/`yarn.lock`을 생성하지 말 것.

## Tech Stack

적용 완료: React, Vite, TypeScript, TanStack Query, Axios, Tailwind CSS, CVA.

적용 예정 또는 검토 중: Zustand, React Hook Form, Zod.

> Zustand, React Hook Form, Zod의 실제 적용 범위와 **네이티브 래퍼(React Native WebView vs Capacitor)**는 아직 미확정이다. 확정된 것처럼 가정하지 않는다.

## Architecture & Code Style

- 디렉토리 구조, 의존 방향(`app → pages → features → shared`), 상태관리 규칙: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 네이밍, Import(`@/` alias), Props/Type, TSDoc, 주석 규칙: [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
- 인증/토큰 처리는 `apps/web/src/shared/apis`에서만. feature별 `apis`는 공통 인스턴스만 가져다 쓴다.

## Git 작업

- 브랜치: `타입/기능명-이슈번호` (예: `feat/login-ui-10`), `develop`에서 생성해서 `develop`으로 PR.
- 커밋: `깃모지 Type: 작업 내용` (예: `✨ Feat: 로그인 기능 추가`), 한글, 마침표 없음.
- Squash merge, 승인 후 merge, merge 후 브랜치 삭제.
- 커밋 메시지와 PR 본문은 [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)를 따른다.
- 사용자가 명시적으로 요청하지 않으면 `git commit`, `git push`, PR 생성을 실행하지 않는다.

## Testing

- Jest + React Testing Library. 설정은 `jest.config.cjs`, 셋업은 `jest.setup.ts`.
- 테스트 파일은 대상 파일과 같은 폴더에 `ComponentName.test.tsx`로 둔다.
- `render()`가 던지는 에러는 Jest가 알아서 실패 처리하므로 `expect(() => render(...)).not.toThrow()` 같은 래핑은 하지 않는다.

## Gotchas

- `apps/web/tsconfig.app.json`은 Vite 번들러 전용 옵션(`moduleResolution: bundler`)을 쓰기 때문에 Jest가 그대로 못 읽는다. `apps/web/jest.config.cjs` 안에 별도 inline tsconfig를 두고 있다.
- 앱 배포 방식, CI/CD, 환경변수 관리 전략은 미확정. 관련 작업 전에 먼저 확인할 것.
