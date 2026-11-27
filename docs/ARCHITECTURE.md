# 프론트엔드 아키텍처

코드의 위치와 계층별 책임을 정의한다. 실행 방법과 기능 상세는 [문서 안내](./README.md)를 참고한다.

## 기술 스택

| 구분              | 기술                               |
| ----------------- | ---------------------------------- |
| 웹                | React, Vite, TypeScript            |
| 모바일            | Expo, React Native, TypeScript     |
| 모노레포          | pnpm workspace, Turborepo          |
| 상태·통신         | TanStack Query, Zustand, Axios     |
| 스타일링          | Tailwind CSS, Uniwind, CVA         |
| UI 문서·품질 검사 | Storybook, ESLint, Prettier, Husky |

모바일은 웹을 WebView로 표시하고 카메라·알림 등 네이티브 기능을 브릿지로 연결한다.

## 모노레포

| 위치                     | 책임                                               |
| ------------------------ | -------------------------------------------------- |
| `apps/web`               | 웹 화면과 웹 전용 코드                             |
| `apps/mobile`            | 네이티브 화면과 WebView·기기 기능 연결             |
| `packages/shared/src`    | 두 앱에서 사용하는 타입·상수·순수 함수·브릿지 규약 |
| `packages/shared/assets` | 두 앱이 공유하는 원본 에셋                         |
| `packages/shared/design` | 공유 디자인 토큰 CSS                               |
| `packages/*-config`      | 플랫폼에 독립적인 공통 개발 설정                   |

- workspace 패키지는 `workspace:*`로 참조한다.
- 공유 런타임 코드에는 DOM·React Native API를 사용하지 않는다.
- 한 앱에서만 쓰는 코드·에셋·스타일과 플랫폼별 설정은 해당 앱에 둔다.

## 웹 계층

```text
apps/web/src/
├── app/       # 진입점, Provider, 라우터와 최상위 레이아웃
├── pages/     # 라우트별 feature 조합
├── features/  # 도메인 기능
└── shared/    # 도메인에 종속되지 않는 공통 코드
```

의존 방향은 ESLint Boundary 검사로 강제한다.

```text
app → pages → features → shared
```

- feature 간 직접 import는 금지한다. 공통 코드를 올리거나 `pages`에서 조합한다.
- `shared`는 feature를 참조하지 않고, `pages`에는 비즈니스 로직을 두지 않는다.
- `pages`는 화면 목적, `features`는 비즈니스 도메인으로 나눈다. 두 이름을 억지로 맞추지 않는다.
- 스티커 기록과 영수증 인식은 모두 `features/record`에서 관리한다.

### 라우팅과 레이아웃

- URL은 `shared/constants/routePaths.ts`, 라우트 등록은 `app/routes`에서 관리한다.
- 페이지와 메인 탭 레이아웃은 React Router의 `lazy`로 불러온다. 코드 로딩·실패는 `RouteLoading`·`RouteErrorPage`가 담당한다.
- 전역 Provider·레이아웃은 필요한 API·저장소를 직접 import해 지연 로딩할 화면이 초기 번들에 포함되지 않게 한다.
- 이미지 캡처처럼 사용 시점이 제한된 큰 의존성은 실행 시 동적으로 불러온다.

### 컴포넌트 배치

| 컴포넌트 범위                    | 위치                            |
| -------------------------------- | ------------------------------- |
| 공통 UI                          | `shared/ui`                     |
| 재사용 레이아웃 조각             | `shared/layout`                 |
| 라우터가 직접 참조하는 최상위 셸 | `app/layouts`                   |
| 기능 전용 컴포넌트               | `features/{feature}/components` |
| 화면 조합                        | `pages/{page}`                  |

최상위 셸은 feature를 조합할 수 있다. 재사용 레이아웃은 `shared`의 의존 규칙을 따른다.
Safe Area는 [WebView와 네이티브 실행](./MOBILE_RUNTIME.md#webview와-safe-area)을 참고한다.

- 도메인 상태·규칙을 다루는 컴포넌트는 재사용되더라도 해당 feature 안에 둔다.
- `shared/ui`에는 Button·Dialog처럼 도메인에 종속되지 않는 UI를 둔다. 데이터와 동작은 props로 전달받는다.
- 작은 내부 컴포넌트는 같은 파일에 둘 수 있다. 역할이나 재사용 범위가 분리될 때 파일을 나눈다.

### Feature 내부 구조

아래는 역할별 배치 예시다. 실제 사용하는 파일·폴더만 만든다.

```text
features/{feature}/
├── apis/          # API 요청·DTO·Query·Mutation
│   └── hooks/     # 화면별 API 옵션과 응답 가공
├── components/    # 기능 UI
├── hooks/         # API와 무관한 기능 로직
├── stores/        # 기능 전역 상태
├── schemas.ts     # 입력 검증 스키마
├── types.ts       # DTO를 제외한 feature 공통 타입
├── constants.ts
├── utils/         # 순수 데이터 변환·계산
└── index.ts       # 외부에 공개하는 항목
```

- 컴포넌트 Props와 한 파일에서만 쓰는 타입은 사용하는 파일에 둔다.
- 한 feature 안의 여러 화면에서 쓰는 코드는 내부에서 공유한다. 파일이 많아지면 `components`·`hooks` 등을 화면·역할별 하위 폴더로 나눈다.
- API 생성 파일과 수기 훅의 구분은 [API 책임](#api-책임)을 따른다.
- `index.ts`의 export 범위와 네이밍은 [코드 컨벤션](./CONVENTIONS.md)을 따른다.

## 모바일 계층

```text
apps/mobile/src/
├── app/       # Expo Router 라우트·레이아웃
├── screens/   # 화면 조합
├── features/  # 도메인 기능과 상태
├── bridge/    # WebView 메시지 처리
├── native/    # 카메라·알림·이미지 처리 래퍼
└── shared/    # 모바일 전용 공통 코드
```

```text
app → screens → features → bridge · native → shared
```

- `app`에는 라우트 정의만 두고 화면은 `screens`에서 조합한다.
- `bridge`·`native`는 화면을 참조하지 않는다. feature 간 조합은 `screens`에서 한다.
- 두 앱의 공유 코드는 모바일의 `shared`가 아닌 `packages/shared`에 둔다.
- 모바일 의존 방향은 ESLint로 강제하지 않으므로 코드 리뷰에서 확인한다.

## 공통화와 상태

한 feature에서만 사용하는 코드는 내부에 둔다. 도메인에 종속되지 않고 여러 feature가 사용하는 코드만 `shared`로 옮긴다.

| 코드                    | feature 내부                                  | 여러 feature가 공유                |
| ----------------------- | --------------------------------------------- | ---------------------------------- |
| 도메인과 무관한 공통 훅 | `features/{feature}/hooks`                    | `shared/hooks`                     |
| 순수 유틸리티           | `features/{feature}/utils`                    | `shared/utils`                     |
| 타입·상수               | `features/{feature}/types.ts`, `constants.ts` | `shared/types`, `shared/constants` |

도메인 간 조합은 페이지·화면에서 담당한다.

| 상태                 | 관리 방법                |
| -------------------- | ------------------------ |
| 서버 상태            | TanStack Query           |
| 전역 클라이언트 상태 | Zustand                  |
| 로컬 상태            | `useState`, `useReducer` |
| Context              | Theme·Provider           |

Store는 한 feature에서만 쓰면 `features/{feature}/stores`, 여러 feature에서 쓰면 `shared/stores`에 둔다.

## API 책임

| 위치                            | 책임                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| `shared/apis`                   | 공통 Axios 인스턴스, 인증·토큰, 인터셉터, 공통 오류 처리와 Orval mutator |
| `features/{feature}/apis`       | 해당 도메인의 API와 DTO                                                  |
| `features/{feature}/apis/hooks` | 화면별 조회·변경 옵션과 응답 가공을 담당하는 수기 훅                     |
| `features/{feature}/hooks`      | API와 무관한 기능 로직                                                   |

- `clients.ts`, `queryKeys.ts`, `queries.ts`, `mutations.ts`, `dto.ts`는 생성 파일이므로 직접 수정하지 않는다.
- 페이지·컴포넌트는 필요한 역할별 API 파일에서 import한다. 옵션이 필요할 때만 수기 훅으로 감싼다.
- 인증·토큰은 `shared/apis`에서만 처리한다. 기능별 API는 공통 인스턴스를 사용하고 인증 헤더를 직접 설정하지 않는다.
- DTO는 `apis/dto.ts`에서 가져오고, 그 외 feature 공통 타입은 `types.ts`에 둔다.

생성 명령과 상세 사용법은 [API_GENERATION.md](./API_GENERATION.md)를 따른다.
