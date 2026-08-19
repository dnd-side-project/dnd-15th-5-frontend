# API 코드 생성

웹 앱의 백엔드 API 타입과 TanStack Query 훅은 ChapChap OpenAPI 명세를 기준으로 Orval이 생성한다.

- Swagger UI: `https://chapchap.kr/api/swagger-ui/index.html`
- OpenAPI JSON: `https://chapchap.kr/api/v3/api-docs`
- 생성 설정: `apps/web/orval.config.ts`
- 명세 보정: `apps/web/openapiTransformer.ts`
- 생성 결과: `apps/web/src/features/{feature}/api/{clients,queries,mutations,dto}.ts`
- 공통 Axios 연결: `apps/web/src/shared/apis/orvalMutator.ts`

## 생성 방법

저장소 루트에서 다음 명령을 실행한다.

```bash
pnpm api:generate
```

명세 변경을 감시하면서 생성하려면 다음 명령을 실행한다.

```bash
pnpm api:watch
```

커밋된 생성 결과가 현재 명세와 일치하는지 검사하려면 다음 명령을 실행한다.

```bash
pnpm api:check
```

생성 설정의 `operationId → feature` 매핑에 따라 API가 feature별로 분리된다. Orval이 만든
임시 파일은 생성 후 `clients.ts`, `queries.ts`, `mutations.ts`, `dto.ts`로 자동 분리되고 삭제된다.
GET 엔드포인트에는 `useQuery`와 `useSuspenseQuery`, 그 외 생성·수정·삭제 엔드포인트에는
`useMutation` 훅이 생성된다.

## 사용 규칙

- `features/*/api/{clients,queries,mutations,dto}.ts`는 직접 수정하지 않는다.
- 생성 파일은 ESLint 대상에서 제외하고 TypeScript 검사와 Orval 재생성으로 검증한다.
- 서버 명세의 비표준 응답 헤더 속성과 누락된 문자열 schema는 transformer에서 생성 전에 보정한다.
- React의 `useCallback`과 충돌하는 OAuth `callback` operation은 생성 설정에서 `completeSocialOAuth`로 이름을 보정한다.
- 명세가 변경되면 `pnpm api:generate`를 실행하고 생성 결과를 함께 커밋한다.
- 인증, 쿠키, 타임아웃, 공통 에러 처리는 `axiosInstance.ts`에서 관리한다.
- 화면 전용 데이터 변환과 여러 API를 조합하는 로직은 각 feature의 `hooks/`에서 작성한다.
- 페이지와 컴포넌트는 필요한 항목을 역할에 맞는 생성 파일에서 직접 import한다.
- 조건부 요청에는 일반 Query 훅을 사용하고, 즉시 실행되어야 하는 조회에는 Suspense Query 훅을 사용한다.

각 feature API는 역할별 경로에서 사용한다.

```ts
import { exchangeSocialLoginCode } from '@/features/auth/api/clients';
import type { LoginCodeExchangeRequest } from '@/features/auth/api/dto';
import { useExchangeSocialLoginCode } from '@/features/auth/api/mutations';
```

현재 매핑은 다음과 같다.

| feature   | operationId                                                                                   |
| --------- | --------------------------------------------------------------------------------------------- |
| auth      | refreshApp, refreshWeb, exchangeSocialLoginCode, agree, logoutApp, logoutWeb, start, callback |
| map       | getVisitedPlaceMarkers, getNearbyPlaces                                                       |
| my-page   | getMyAccount, updateMyAccount, withdrawMyAccount                                               |
| record    | createConsumption, recognizeReceipt                                                            |
| report    | getMonthlyReport, getCurrentStatus, getConsumptions, getFrequentPlaces                          |
| shop      | getPlaceDetail, getPlaceVisits, toggleLike                                                     |

명세에 등록된 operationId가 사라지거나 변경되면 생성 단계가 실패한다. 새로운 API는
`FEATURE_API_CONFIG`에 소유 feature를 지정한 뒤 생성한다.

## Swagger 작성 규칙

생성되는 함수명과 타입의 품질을 위해 서버 명세에는 다음 항목을 안정적으로 유지한다.

- 엔드포인트별 고유한 `operationId`
- 도메인별 `tags`
- 요청과 응답 schema의 `required`, `nullable`
- DTO와 필드의 `description`, `example`
- 공통 에러 응답 schema
