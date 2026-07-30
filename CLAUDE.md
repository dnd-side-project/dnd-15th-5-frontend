# CLAUDE.md

Claude Code가 이 저장소에서 작업할 때 참고하는 컨텍스트입니다.

## Project Overview

React + Vite + TypeScript 기반 프론트엔드. 네이티브 앱(iOS/Android) 빌드는 Capacitor / React Native 둘 중 미정.

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

React + Vite, TypeScript.
서버 상태 TanStack Query, 전역 상태 Zustand, 폼 React Hook Form + Zod, HTTP Axios, 스타일 Tailwind + CVA.

> Zustand / RHF / Zod의 실제 적용 범위, **네이티브 래퍼(Capacitor vs React Native)**는 아직 미확정. 확정된 것처럼 가정하지 말 것.

## Architecture & Code Style

- 디렉토리 구조, 의존 방향(`app → pages → features → shared`), 상태관리 규칙: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 네이밍, Import(`@/` alias), Props/Type, TSDoc, 주석 규칙: [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
- 인증/토큰 처리는 `src/shared/apis`에서만. feature별 `apis`는 공통 인스턴스만 가져다 쓴다.

## Git

- 브랜치: `타입/기능명-이슈번호` (예: `feat/login-ui-10`), `develop`에서 생성해서 `develop`으로 PR.
- 커밋: `깃모지 Type: 작업 내용` (예: `✨ Feat: 로그인 기능 추가`), 한글, 마침표 없음.
- Squash merge, 승인 후 merge, merge 후 브랜치 삭제.
- 전체 규칙: [docs/GITFLOW.md](docs/GITFLOW.md)

## Testing

- Jest + React Testing Library. 설정은 `jest.config.cjs`, 셋업은 `src/setupTests.ts`.
- 테스트 파일은 대상 파일과 같은 폴더에 `ComponentName.test.tsx`로 둔다.
- `render()`가 던지는 에러는 Jest가 알아서 실패 처리하므로 `expect(() => render(...)).not.toThrow()` 같은 래핑은 하지 않는다.

## Gotchas

- `tsconfig.app.json`은 Vite 번들러 전용 옵션(`moduleResolution: bundler`)을 쓰기 때문에 Jest가 그대로 못 읽는다. `jest.config.cjs` 안에 별도 inline tsconfig를 두고 있다.
- `docs/GITFLOW.md`, `AGENTS.md`는 아직 작성 전이다 (다른 팀원 담당).
- 앱 배포 방식, CI/CD, 환경변수 관리 전략은 미확정. 관련 작업 전에 먼저 확인할 것.
