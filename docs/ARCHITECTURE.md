# 프론트엔드 기술 스택 및 프로젝트 구조

## 1. Tech Stack

### Core

| 구분             | 기술                       |
| ---------------- | -------------------------- |
| Web              | React, Vite                 |
| Mobile           | Expo, React Native          |
| Language         | TypeScript                 |
| Monorepo         | pnpm workspace, Turborepo |
| UI Documentation | Storybook                  |

### State & Data

| 구분         | 기술            | 상태      |
| ------------ | --------------- | --------- |
| Server State | TanStack Query  | 적용 완료 |
| HTTP Client  | Axios           | 적용 완료 |
| Client State | Zustand         | 사용 확정 |

### Styling

| 구분              | 기술                       |
| ----------------- | -------------------------- |
| CSS               | Tailwind CSS               |
| RN 스타일         | Uniwind (Tailwind 바인딩)  |
| Component Variant | CVA                        |

### Code Quality

- ESLint
- Prettier
- Husky
- CodeRabbit

### Native & External

| 기능             | 기술 및 소유권                 |
| ---------------- | ------------------------------ |
| 모바일 앱        | Expo + React Native            |
| WebView 연동     | 적용 완료                      |
| 웹·네이티브 브릿지 | 적용 완료 (요청·응답 규약은 `packages/shared`) |
| 알림·푸시        | 추후 네이티브 구현             |
| 영수증 촬영·검토 | RN 네이티브 플로우 적용 (OCR·기록 저장 API 연동 예정) |

> 실기기 테스트는 개발 빌드로 진행한다. Expo Go는 지원 SDK가 낮아 이 프로젝트를 실행할 수 없다.

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

### Monorepo

```text
.
├── apps/
│   ├── web/                    # React + Vite
│   └── mobile/                 # Expo + React Native
├── packages/
│   ├── shared/                 # 웹과 모바일이 함께 쓰는 코드
│   │   ├── assets/             # 웹과 모바일이 함께 쓰는 에셋
│   │   ├── design/             # 디자인 토큰 CSS
│   │   └── src/                # 브릿지 메시지 규약 등 런타임 코드
│   ├── eslint-config/          # 공통 ESLint base 설정
│   └── typescript-config/      # 공통 TypeScript base 설정
├── docs/
├── pnpm-workspace.yaml
└── turbo.json
```

- 애플리케이션은 `apps/*`, 재사용 패키지와 공통 개발 설정은 `packages/*`에서 관리한다.
- workspace 패키지는 `workspace:*`로 참조한다.
- `packages/*-config`에는 플랫폼에 독립적인 공통 base만 두고 웹·모바일 전용 설정은 각 앱에서 관리한다.
- `packages/shared/src`에는 웹과 모바일이 모두 사용하는 런타임 코드만 둔다. 양쪽에서 동작해야 하므로 DOM API와 React Native API를 사용하지 않으며, 타입·상수·순수 함수 위주로 관리한다.
- `packages/shared/assets`에는 웹과 모바일이 같은 원본을 사용하는 에셋만 둔다. 플랫폼별 변환은 각 앱의 빌드 설정에서 처리한다.
- `packages/shared/design`에는 두 앱이 함께 읽는 디자인 토큰 CSS만 둔다. 한쪽에서만 쓰는 스타일은 해당 앱의 진입 CSS에서 관리한다.
- 웹이나 모바일 한쪽에서만 쓰는 코드는 `packages/shared`가 아니라 해당 앱 안에서 관리한다.

### Web

아래 구조와 규칙은 `apps/web`에만 적용한다.

```text
apps/web/src/
├── app/                # 앱 진입점, 전역 설정
│   ├── layouts/        # 라우트 최상위 레이아웃 셸 (4번 참고)
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

### Pages 구조

`pages`는 라우트 단위 화면을 관리하며 비즈니스 로직을 직접 구현하지 않는다.
각 페이지는 `features`와 `shared`의 컴포넌트를 조합한다.

실제 URL은 `apps/web/src/shared/constants/routePaths.ts`를 기준으로 한다.
(`pages`와 `features`에서도 화면 이동에 사용해야 하므로 `app`이 아닌 `shared`에서 관리한다.)

```text
pages/
├── login/
│   └── LoginPage.tsx
├── agreement/
│   └── AgreementPage.tsx
├── onboarding/
│   └── OnboardingPage.tsx
├── home/
│   ├── HomePage.tsx
│   ├── search/
│   │   └── MapSearchPage.tsx
│   └── shop/
│       └── ShopDetailPage.tsx
├── record/
│   ├── RecordMethodPage.tsx
│   ├── manual/
│   │   └── ManualRecordPage.tsx
│   ├── shop/
│   │   └── search/
│   │       └── ShopSearchPage.tsx
│   ├── receipt/
│   │   └── ReceiptCameraPage.tsx
├── report/
│   ├── ReportPage.tsx
│   ├── MonthlyReportPage.tsx
│   ├── history/
│   │   └── SpendingHistoryPage.tsx
│   ├── frequent-shops/
│   │   └── FrequentShopListPage.tsx
│   └── monthly-records/
│       └── MonthlyRecordListPage.tsx
├── notifications/
│   └── NotificationPage.tsx
├── my-page/
│   └── MyPage.tsx
└── not-found/
    └── NotFoundPage.tsx
```

페이지를 추가하거나 이동할 때는 이 구조와 `apps/web/src/app/routes`의 라우트 설정을 함께 수정한다.

### Features 구조

`features`는 화면이 아닌 비즈니스 도메인을 기준으로 구성한다.
수기 입력과 영수증 입력은 모두 기록 생성 흐름에 속하므로 `receipt`를 별도 Feature로 분리하지 않고 `record`에서 관리한다.
영수증 관련 코드의 규모가 커지면 `features/record/receipt`와 같이 하위 영역으로 구분한다.

```text
features/
├── auth/
├── map/
├── my-page/
├── notification/
├── onboarding/
├── profile/
├── record/
├── report/
└── shop/
```

### Feature 내부 구조 (기본형)

```text
features/record/
├── apis/
│   ├── clients.ts      # 순수 API 요청 함수
│   ├── queryKeys.ts    # TanStack Query key
│   ├── queries.ts      # Query, Suspense Query
│   ├── mutations.ts    # Mutation
│   ├── dto.ts          # 요청·응답 타입
│   └── hooks/          # 화면별 Query·Mutation 옵션이 필요할 때만 생성
│       └── useRecordListQuery.ts
├── components/
├── hooks/          # API와 무관한 feature 훅
├── stores/         # 해당 도메인 전용 전역 상태
├── schemas.ts
├── types.ts        # DTO가 아닌 feature 공통 타입
├── constants.ts
├── utils/
└── index.ts
```

- `apis/`의 `clients.ts`, `queryKeys.ts`, `queries.ts`, `mutations.ts`, `dto.ts`는 OpenAPI에서 자동 생성하며 직접 수정하지 않는다
- 페이지와 feature 코드는 역할에 맞는 파일에서 필요한 항목만 직접 import한다
- 화면별 `enabled`, `select`, `staleTime` 등의 옵션이나 응답 가공이 필요하면 생성 훅을 감싼 파일을 `apis/hooks/`에 Query·Mutation 훅 하나당 하나씩 작성한다
- API와 무관한 feature 공통 훅만 feature 루트의 `hooks/`에서 관리한다
- `types.ts`는 Swagger DTO가 아닌 feature 공통 타입을 관리한다

### Feature 내부 구조 (화면이 여러 개인 경우)

```text
features/report/
├── apis/
│   ├── clients.ts
│   ├── queryKeys.ts
│   ├── queries.ts
│   ├── mutations.ts
│   ├── dto.ts
│   └── hooks/
│       ├── useMonthlyReportQuery.ts
│       └── useConsumptionListQuery.ts
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
- `apis/` 생성 파일 사용 규칙은 기본형과 동일하다
- `apis/hooks/` 파일은 자동 생성 대상이 아니므로 화면 요구사항에 맞게 직접 작성하고 테스트한다

### Mobile

아래 구조와 규칙은 `apps/mobile`에만 적용한다.

```text
apps/mobile/src/
├── global.css          # Tailwind·Uniwind 진입점, 공유 디자인 토큰 import
├── app/                # Expo Router 라우트·레이아웃 전용
│   ├── _layout.tsx
│   └── index.tsx
├── screens/            # 화면 단위 컴포넌트, feature 조합만 담당
│   └── home/
│       └── HomeScreen.tsx
├── bridge/             # 웹(WebView)과 주고받는 메시지 처리
├── features/           # 도메인 단위 기능
├── native/             # 카메라·위치 등 네이티브 기능 래퍼
└── shared/             # 모바일 앱 안에서만 쓰는 공통 코드
    └── assets/         # 모바일 전용 아이콘·이미지
```

- `app`은 라우트 정의만 두고 화면 구현은 `screens`에서 관리한다. 웹의 `app/routes`와 `pages` 관계와 같다.
- 화면 컴포넌트는 `화면명 + Screen`으로 작성한다 (`HomeScreen`).
- 웹과 모바일이 함께 쓰는 코드는 `apps/mobile/src/shared`가 아니라 `packages/shared`에 둔다.
- WebView 화면은 `shared/layout/WebViewScreen`을 사용해 Safe Area·로딩·오류 복구 동작을 통일한다. 지도 홈(`/home`)만 지도를 시스템 영역까지 표시하도록 edge-to-edge 옵션을 사용한다.
- 수기 입력과 영수증 입력의 공통 규칙은 `packages/shared/record`, 네이티브 영수증 UI와 상태는 `features/record`에서 관리한다.
- 필요한 폴더만 만든다. 사용처가 생기기 전에는 만들지 않는다.

---

## 4. Component 위치 기준

| 범위                                                                       | 위치                             |
| -------------------------------------------------------------------------- | -------------------------------- |
| 전역 공통 UI (Button, Modal 등)                                           | `shared/ui`                     |
| 여러 페이지에 조합해서 쓰는 레이아웃 조각 (Header, TabBar, PaddedLayout 등) | `shared/layout`                 |
| 라우트 최상위 레이아웃 셸 (앱 전체에 하나만 존재, `router`가 직접 참조)      | `app/layouts`                   |
| 특정 기능 전용                                                             | `features/{feature}/components` |
| 화면 조합                                                                  | `pages/{page}`                  |

`shared/layout`은 여러 곳에 재사용해서 조합하는 조각을 둔다. 반대로 라우트 최상위에서 한 번만 마운트되는 셸(`AppMainLayout`, `MobileLayout` 등)은 `app/layouts`에 둔다 — feature를 조합해야 하면 `shared`가 feature를 import할 수 없기 때문이기도 하고(5번 참고), feature 의존이 없더라도 다른 최상위 셸과 위치를 맞추는 게 일관적이다.

---

## 5. Dependency Direction

### Web

아래 의존 방향은 ESLint Boundary 검사로 강제하며 `apps/web/src`에만 적용한다.

```text
app → pages → features → shared
```

- feature 간 직접 import 금지 (공통으로 올리거나 pages에서 조합)
- `shared`는 어떤 feature도 import하지 않는다
- `pages`에는 비즈니스 로직을 두지 않는다

### Mobile

`apps/mobile/src`에 적용한다. ESLint로 강제하지 않으므로 코드 리뷰에서 확인한다.

```text
app → screens → features → bridge · native → shared
```

- `app`은 라우트 정의만 두고 화면 구현은 `screens`에서 조합한다
- `bridge`·`native`는 네이티브 기능 계층이므로 `screens`·`features`가 가져다 쓰고, 반대로 화면을 참조하지 않는다
- feature 간 직접 import 금지 (공통으로 올리거나 `screens`에서 조합)
- 웹과 공유하는 타입·상수는 `packages/shared`에서 가져온다

---

## 6. State Management

- 서버 상태: TanStack Query
- 전역 상태: Zustand
- 로컬 상태: useState, useReducer
- Context: Theme 및 Provider 용도

### Store 위치

| 범위                       | 위치                        |
| -------------------------- | --------------------------- |
| 하나의 Feature에서만 사용  | `features/{feature}/stores` |
| 둘 이상의 Feature에서 사용 | `shared/stores`             |

---

## 7. API Structure

### 공통 API (`apps/web/src/shared/apis`)

- Axios 인스턴스 생성 및 설정 (baseURL, timeout 등)
- 인증 토큰을 포함한 인터셉터(Request/Response Interceptor) 설정
- 공통 에러 핸들링 로직
- 여러 Feature에서 공통으로 사용하는 API 함수
- OpenAPI 생성 코드가 사용하는 공통 Axios mutator

### 기능별 API (`apps/web/src/features/{feature}/apis`)

- 해당 Feature 전용 OpenAPI 생성 파일 (`clients.ts`, `queryKeys.ts`, `queries.ts`, `mutations.ts`, `dto.ts`)
- `shared/apis`에서 만든 공통 Axios 인스턴스를 가져와서 사용
- 이 Feature에서만 쓰는 엔드포인트 함수만 위치
- DTO, 요청 함수, Query, Mutation을 역할별 파일로 분리해 생성
- 화면별 옵션과 데이터 가공을 담당하는 수기 훅은 `apis/hooks/`에 위치

### 규칙

- 인증/토큰 처리는 `apps/web/src/shared/apis`에서만 관리하고, 생성된 API 파일에서 직접 헤더를 설정하지 않는다
- 페이지와 컴포넌트는 필요한 항목을 feature의 역할별 API 파일에서 직접 import한다
- 생성 훅을 그대로 사용할 수 있으면 `apis/queries.ts` 또는 `apis/mutations.ts`에서 직접 import한다
- 화면별 옵션이나 응답 가공이 필요하면 생성 파일을 수정하지 않고 `apis/hooks/`에서 감싼 뒤 해당 수기 훅을 사용한다
- API 생성 방법과 사용 규칙은 [API_GENERATION.md](./API_GENERATION.md)를 따른다

---

## 8. Styling

- Tailwind CSS 사용. 모바일은 Uniwind로 같은 `className`을 RN 스타일로 변환한다
- Variant는 CVA 사용
- variant가 2~3개를 넘으면 cva로, 조건부 클래스가 단순하면 cn() + 삼항/객체로 처리한다.
- 상세 규칙은 `docs/CONVENTIONS.md`를 따른다

### 디자인 토큰

색상·타이포그래피·그림자·모서리 반경은 시안의 토큰만 사용하고 값을 직접 적지 않는다.

토큰은 `packages/shared/design`의 Tailwind `@theme` CSS 한 곳에서만 정의하고 웹과 모바일이 같은 파일을 읽는다.
모바일은 [Uniwind](https://uniwind.dev)가 Metro에서 이 CSS를 읽어 `className`을 RN 스타일로 바꿔주므로, 웹과 같은 유틸리티 이름을 그대로 쓴다.

| 대상         | 정의 위치                                |
| ------------ | ---------------------------------------- |
| 색상         | `packages/shared/design/colors.css`      |
| 타이포그래피 | `packages/shared/design/typography.css`  |
| 그림자       | `packages/shared/design/shadows.css`     |
| 모서리 반경  | `packages/shared/design/radius.css`      |

| 앱     | 진입 CSS                          |
| ------ | --------------------------------- |
| 웹     | `apps/web/src/app/styles/index.css` |
| 모바일 | `apps/mobile/src/global.css`        |

- 타이포그래피 토큰은 크기·행간·굵기를 함께 적용하므로 웹은 `text-body-01-bold`처럼 하나만 사용한다.
- **모바일은 글꼴 유틸리티를 함께 붙인다.** `text-body-01-bold`는 CSS `font-weight`만 지정하는데, Android는 번들한 글꼴에 `fontWeight`가 적용되지 않아 굵기별 글꼴을 직접 지정해야 한다. 토큰 이름의 굵기와 같은 것을 짝지어 쓴다.

  ```tsx
  <Text className="font-pretendard-bold text-body-01-bold">
  ```

  | 토큰 굵기  | 모바일에서 함께 쓸 유틸리티 |
  | ---------- | --------------------------- |
  | `regular`  | `font-pretendard-regular`   |
  | `medium`   | `font-pretendard-medium`    |
  | `semibold` | `font-pretendard-semibold`  |
  | `bold`     | `font-pretendard-bold`      |

- 행간은 `140%`가 아니라 `1.4`처럼 단위 없는 배수로 적는다. 웹은 결과가 같고, 모바일은 Uniwind가 배수에 글자 크기를 곱해 숫자로 변환한다.
- 시안에서 행간이 `Auto`인 항목은 `normal`로 두고 두 플랫폼 모두 글꼴 기본 행간을 사용한다.
- 글꼴만 플랫폼별로 정의가 다르다. 웹은 CDN에서 가변 글꼴 하나(`apps/web/src/app/styles/fonts.css`)를 받아 `font-weight`로 굵기를 조절하므로 글꼴 유틸리티가 필요 없다. 모바일은 `app.json`의 expo-font 설정으로 굵기별 글꼴을 앱 빌드에 포함하고 `apps/mobile/src/global.css`에서 유틸리티로 정의한다.
- 색상은 `--color-*: initial`로 Tailwind 기본 팔레트를 꺼둬서 시안에 있는 색만 쓸 수 있다. `bg-red-500`이나 `bg-neutral-800`처럼 시안에 없는 색은 클래스가 아예 생성되지 않는다.
- 시안에 없는 값이 필요하면 임의로 토큰을 만들지 말고 디자이너에게 확인한다.

---

## 9. Package Manager

### pnpm 선택 이유

속도·디스크 효율이 좋고 npm 생태계와 호환성이 높으면서도 명령어가 npm과 유사해 러닝 커브가 낮다.

### 사용 규칙

- pnpm으로 통일
- `pnpm-lock.yaml` Commit
- `package-lock.json` 생성 금지
- `yarn.lock` 생성 금지
- Package Manager 혼용 금지

---

## 10. Pending

- 앱 배포 방식
- 환경 변수 관리
- CI/CD

---

코드 네이밍 규칙은 [CONVENTIONS.md](./CONVENTIONS.md)를, Git/브랜치/커밋/PR 규칙은 [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)를 참고하세요.
