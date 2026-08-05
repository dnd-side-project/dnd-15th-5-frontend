# 프론트엔드 기술 스택 및 프로젝트 구조

## 1. Tech Stack

### Core

| 구분             | 기술        |
| ---------------- | ----------- |
| Framework        | React, Vite |
| Language         | TypeScript  |
| Package Manager  | pnpm        |
| UI Documentation | Storybook   |

### State & Data

| 구분         | 기술            | 상태      |
| ------------ | --------------- | --------- |
| Server State | TanStack Query  | 적용 완료 |
| HTTP Client  | Axios           | 적용 완료 |
| Client State | Zustand         | 적용 완료 |

### Styling

| 구분              | 기술         |
| ----------------- | ------------ |
| CSS               | Tailwind CSS |
| Component Variant | CVA          |

### Code Quality

- ESLint
- Prettier
- Husky
- CodeRabbit

### Native & External

| 기능 | 기술      |
| ---- | --------- |
| 지도 | 구글 지도 |

> React Native WebView와 Capacitor 중 PoC 비교 후 결정 (약 1주)
> 카메라, 푸시 알림 구현 방식은 래핑 방식 확정 후 결정
> 웹 앱 코드(React + Vite + TS)는 어느 쪽으로 가도 그대로 사용

---

## 2. Architecture Rule

### 공통화 기준

- 하나의 Feature 안에서 여러 곳이 사용하면 해당 Feature 내부에서 공통화
- 둘 이상의 Feature 또는 도메인에서 사용하면 `shared`로 이동
- 둘 이상의 Feature에서 사용하는 Type, Constant만 `shared`에서 관리

### 파일 분리 기준

- 파일 수가 적으면 하나의 파일에서 관리
- 파일 수가 많아지면 역할별 폴더로 확장
- 과도한 폴더 분리 지양
- 관련 코드는 최대한 가까운 위치에서 관리

> `index.ts` 규칙은 [CONVENTIONS.md](./CONVENTIONS.md) 8번 참고

---

## 3. Directory Structure

```text
src/
├── app/                # 앱 진입점, 전역 설정
│   ├── providers/
│   ├── routes/
│   ├── styles/
│   └── App.tsx
├── pages/              # 라우트 단위 화면, feature 조합만 담당
├── features/           # 도메인 단위 기능
└── shared/             # 도메인에 종속되지 않는 공통 코드
    ├── ui/
    ├── layout/
    ├── hooks/
    ├── stores/         # 2곳 이상에서 사용하는 전역 상태
    ├── utils/
    ├── apis/           # axiosInstance, 인터셉터, 공통 에러 핸들링
    ├── constants/
    ├── types/
    ├── assets/
    └── lib
```

`pages`는 라우트 또는 화면 목적을 기준으로 구성하고, `features`는 비즈니스 기능과 도메인을 기준으로 구성한다.
두 계층의 이름은 필요할 때만 동일하게 사용한다.

### Feature 내부 구조 (기본형)

```text
features/receipt/
├── api/
│   ├── services/
│   │   ├── getReceipts.ts
│   │   ├── postReceipt.ts
│   │   └── index.ts
│   ├── queries/
│   │   ├── useReceiptListQuery.ts
│   │   ├── useReceiptDetailQuery.ts
│   │   └── index.ts
│   ├── mutations/
│   │   ├── useCreateReceiptMutation.ts
│   │   ├── useDeleteReceiptMutation.ts
│   │   └── index.ts
│   ├── queryKeys.ts
│   ├── dto.ts          # DTO 타입만
│   └── index.ts
├── components/
├── hooks/
├── stores/         # 해당 도메인 전용 전역 상태
├── schemas.ts
├── types.ts        # DTO가 아닌 feature 공통 타입
├── constants.ts
├── utils/
└── index.ts
```

- API 호출, 쿼리, 뮤테이션, 쿼리 키, DTO 타입은 전부 `api/` 아래에 모아서 관리
- `services`, `queries`, `mutations`는 함수·훅 하나당 파일 하나
- 파일명은 함수·훅 이름과 동일하게 (`useReceiptListQuery.ts` → `useReceiptListQuery`, `getReceipts.ts` → `getReceipts`)
- 폴더 안 `index.ts`에서 모아서 export
- 쿼리 키는 `api/queryKeys.ts`에서 한 곳으로 관리
- `types.ts`는 DTO가 아닌 feature 공통 타입(여러 컴포넌트/훅이 공유하는 도메인 타입 등)을 관리. DTO와 화면에서 쓰는 모양이 갈라지면 그때 `api/dto.ts`와 `types.ts`를 구분해서 쓴다
- 폴더명·파일명 앞에 feature 이름을 다시 붙이지 않는다 (`features/receipt/api/dto.ts`, `features/receipt/api/services/getReceipts.ts`처럼 경로와 함수명이 이미 역할을 드러내므로 `receipt.dto.ts` 같은 접두어는 중복)

### Feature 내부 구조 (화면이 여러 개인 경우)

```text
features/report/
├── api/
│   ├── services/
│   │   ├── getReportStreak.ts
│   │   ├── getReportMonthly.ts
│   │   └── index.ts
│   ├── queries/
│   │   ├── useReportStreakQuery.ts
│   │   ├── useReportMonthlyQuery.ts
│   │   └── index.ts
│   ├── queryKeys.ts
│   ├── dto.ts
│   └── index.ts
├── components/
│   ├── common/     # feature 안에서 2곳 이상 쓰는 것
│   ├── streak/
│   └── monthly/
├── hooks/
│   ├── common/
│   ├── streak/
│   └── monthly/
├── stores/
├── schemas.ts
├── types.ts
├── constants.ts
├── utils/
└── index.ts
```

- 화면 단위로 나눌지는 컴포넌트 개수 보고 판단하고, 필요한 폴더만 만든다 (`mutations/`처럼 안 쓰면 비워두지 말고 아예 생략)
- 파일이 적으면 파일 하나로 관리, 많아지면 화면·역할 단위 폴더로 확장
- `api/` 내부 구조(`services`, `queries`, `mutations`, `queryKeys.ts`, `dto.ts`)는 기본형과 동일한 규칙을 따른다

---

## 4. Component 위치 기준

| 범위                            | 위치                            |
| ------------------------------- | ------------------------------- |
| 전역 공통 UI (Button, Modal 등) | `shared/ui`                     |
| 레이아웃 (Header, TabBar 등)    | `shared/layout`                 |
| 특정 기능 전용                  | `features/{feature}/components` |
| 화면 조합                       | `pages/{page}`                  |

---

## 5. Dependency Direction

```text
app → pages → features → shared
```

- feature 간 직접 import 금지 (공통으로 올리거나 pages에서 조합)
- `shared`는 어떤 feature도 import하지 않는다
- `pages`에는 비즈니스 로직을 두지 않는다

---

## 6. State Management

- 서버 상태: TanStack Query
- 전역 상태: Zustand (적용 범위 확정 후 사용)
- 로컬 상태: useState, useReducer
- Context: Theme 및 Provider 용도

### Store 위치

| 범위                       | 위치                        |
| -------------------------- | --------------------------- |
| 하나의 Feature에서만 사용  | `features/{feature}/stores` |
| 둘 이상의 Feature에서 사용 | `shared/stores`             |

---

## 7. Form & Validation

> 적용 범위는 와이어프레임 확인 후 결정 — 그 전까지는 아래 규칙을 확정된 것으로 간주하지 않는다

- 폼 적용이 확정되면 React Hook Form + Zod 사용
- 단순 입력은 Local State 사용

---

## 8. API Structure

### 공통 API (`src/shared/apis`)

- Axios 인스턴스 생성 및 설정 (baseURL, timeout 등)
- 인증 토큰을 포함한 인터셉터(Request/Response Interceptor) 설정
- 공통 에러 핸들링 로직
- 여러 Feature에서 공통으로 사용하는 API 함수

### 기능별 API (`src/features/{feature}/api/services`)

- 해당 Feature 전용 API 요청 함수
- `shared/apis`에서 만든 공통 Axios 인스턴스를 가져와서 사용
- 이 Feature에서만 쓰는 엔드포인트 함수만 위치

### 규칙

- 인증/토큰 처리는 `src/shared/apis`에서만 관리하고, 기능별 `api/services`에서 직접 헤더를 설정하지 않는다
- 기능별 `api/services`는 공통 인스턴스를 import해서 엔드포인트 함수만 작성한다

---

## 9. Styling

- Tailwind CSS 사용
- Variant는 CVA 사용
- variant가 2~3개를 넘으면 cva로, 조건부 클래스가 단순하면 cn() + 삼항/객체로 처리한다.
- 상세 규칙은 `docs/CONVENTIONS.md`를 따른다

---

## 10. Package Manager

### pnpm 선택 이유

속도·디스크 효율이 좋고 npm 생태계와 호환성이 높으면서도 명령어가 npm과 유사해 러닝 커브가 낮다.

### 사용 규칙

- pnpm으로 통일
- `pnpm-lock.yaml` Commit
- `package-lock.json` 생성 금지
- `yarn.lock` 생성 금지
- Package Manager 혼용 금지

---

## 11. Pending

- Zustand 적용 범위
- React Hook Form 적용 범위
- Zod 적용 범위
- 앱 래핑 방식 (RN WebView vs Capacitor)
- 앱 배포 방식
- 환경 변수 관리
- CI/CD

---

코드 네이밍 규칙은 [CONVENTIONS.md](./CONVENTIONS.md)를, Git/브랜치/커밋/PR 규칙은 [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)를 참고하세요.
