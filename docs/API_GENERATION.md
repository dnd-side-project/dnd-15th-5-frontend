# API 코드 생성

웹 앱의 백엔드 API 타입과 TanStack Query 훅은 ChapChap OpenAPI 명세를 기준으로 Orval이 생성한다.

- 생성 설정: `apps/web/orval.config.ts`
- feature 매핑: `apps/web/openapiFeatureMap.json`
- 명세 보정: `apps/web/openapiTransformer.ts`
- 생성 결과: `apps/web/src/features/{feature}/apis/{clients,queryKeys,queries,mutations,dto}.ts`
- 공통 Axios 연결: `apps/web/src/shared/apis/orvalMutator.ts`

## 한눈에 보는 실행 순서

백엔드 Swagger 명세가 변경되면 다음 순서로 진행한다.

```text
매핑 검사 → 미매핑 API 등록 → API 생성 → 생성 결과 확인 → 수기 훅 작성 → 최종 검사
```

| 순서 | 할 일 | 명령 또는 위치 |
| --- | --- | --- |
| 1 | Swagger operationId 매핑 검사 | `pnpm api:validate` |
| 2 | 실패 메시지의 미매핑 API를 feature에 등록 | `apps/web/openapiFeatureMap.json` |
| 3 | DTO·Client·Query·Mutation 생성 | `pnpm api:generate` |
| 4 | 생성 결과와 서버 명세 일치 여부 확인 | `pnpm api:check` |
| 5 | 화면별 옵션·응답 가공이 필요할 때만 수기 훅 작성 | `features/{feature}/apis/hooks/` |
| 6 | 전체 품질 검사 | `pnpm typecheck`, `pnpm lint`, `pnpm test` |

`api:generate`가 1번 매핑 검사를 먼저 실행하므로 평소에는 바로 실행해도 된다. 매핑 오류가
발생하면 2번을 처리한 뒤 다시 실행한다. 자동 생성된 `clients.ts`, `queryKeys.ts`,
`queries.ts`, `mutations.ts`, `dto.ts`는 직접 수정하지 않는다.

## 생성 방법

저장소 루트에서 다음 명령을 실행한다.

```bash
pnpm api:generate
```

`api:generate`는 코드 생성 전에 전체 operationId 매핑을 자동 검증한다. 매핑만 별도로
검사하려면 다음 명령을 실행한다.

```bash
pnpm api:validate
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
임시 파일은 생성 후 `clients.ts`, `queryKeys.ts`, `queries.ts`, `mutations.ts`, `dto.ts`로
자동 분리되고 삭제된다.
GET 엔드포인트에는 `useQuery`와 `useSuspenseQuery`, 그 외 생성·수정·삭제 엔드포인트에는
`useMutation` 훅이 생성된다.

## Query 훅 선택 기준

생성 단계에서는 GET 엔드포인트의 사용 화면을 판단하지 않는다. GET 엔드포인트마다 일반
Query 훅과 Suspense Query 훅을 모두 만들고, 사용하는 화면의 로딩 설계에 따라 개발자가
하나를 선택한다.

| 상황 | 사용할 훅 |
| --- | --- |
| 기본 조회, 로딩·에러 상태를 컴포넌트에서 직접 처리 | `useQuery` |
| `enabled`를 사용하는 조건부 요청 | `useQuery` |
| 데이터 없이도 화면 일부를 먼저 표시할 수 있음 | `useQuery` |
| 상위에 `Suspense` 경계가 있고 데이터가 준비된 뒤 렌더링 | `useSuspenseQuery` |

특별한 이유가 없다면 `useQuery`를 기본으로 사용한다. Suspense Query 훅을 사용할 때는
반드시 상위에 `Suspense`와 에러 경계를 구성한다.

```tsx
// 로딩과 에러를 현재 컴포넌트에서 처리
const { data, isPending, isError } = useGetMonthlyReport(params);

// 상위 Suspense 경계에서 로딩을 처리
const { data } = useGetMonthlyReportSuspense(params);
```

HTTP 메서드에 따른 생성 기준은 다음과 같다.

- `GET`: `clients.ts`에 요청 함수, `queryKeys.ts`에 쿼리 키, `queries.ts`에 두 종류의 Query 훅 생성
- `POST`, `PUT`, `PATCH`, `DELETE`: `clients.ts`에 요청 함수, `mutations.ts`에 Mutation 훅 생성

## 사용 규칙

- `features/*/apis/{clients,queryKeys,queries,mutations,dto}.ts`는 직접 수정하지 않는다.
- 생성 파일은 ESLint 대상에서 제외하고 TypeScript 검사와 Orval 재생성으로 검증한다.
- 서버 명세의 비표준 응답 헤더 속성과 누락된 문자열 schema는 transformer에서 생성 전에 보정한다.
- `recognizeReceipt`는 빈 이미지 요청을 막기 위해 누락된 `requestBody.required`를 transformer에서 `true`로 보정한다.
- React의 `useCallback`과 충돌하는 OAuth `callback` operation은 생성 설정에서 `completeSocialOAuth`로 이름을 보정한다.
- 명세가 변경되면 `pnpm api:generate`를 실행하고 생성 결과를 함께 커밋한다.
- 인증, 쿠키, 타임아웃, 공통 에러 처리는 `axiosInstance.ts`에서 관리한다.
- 화면별 Query·Mutation 옵션, 응답 가공, 여러 API 조합은 각 feature의 `apis/hooks/`에서 작성한다.
- 페이지와 컴포넌트는 필요한 항목을 역할에 맞는 생성 파일에서 직접 import한다.
- Query 훅은 위의 선택 기준을 따르고, 생성 파일에 화면별 옵션을 직접 추가하지 않는다.

자동 생성 훅에 별도 옵션이 필요하면 `apis/hooks/`에 훅 하나당 파일 하나를 작성한다.

```ts
import type { GetMonthlyReportParams } from '@/features/report/apis/dto';
import { useGetMonthlyReport } from '@/features/report/apis/queries';

export const useMonthlyReportQuery = (params: GetMonthlyReportParams) => {
  return useGetMonthlyReport(params, {
    query: {
      staleTime: 1000 * 60 * 5,
    },
  });
};
```

페이지는 생성 훅 대신 화면 요구사항이 반영된 수기 훅을 사용한다.

```ts
import { useMonthlyReportQuery } from '@/features/report/apis/hooks/useMonthlyReportQuery';
```

각 feature API는 역할별 경로에서 사용한다.

```ts
import { exchangeSocialLoginCode } from '@/features/auth/apis/clients';
import type { LoginCodeExchangeRequest } from '@/features/auth/apis/dto';
import { useExchangeSocialLoginCode } from '@/features/auth/apis/mutations';
import { getStartQueryKey } from '@/features/auth/apis/queryKeys';
```

현재 매핑은 다음과 같다.

| feature   | operationId                                                                                   |
| --------- | --------------------------------------------------------------------------------------------- |
| auth      | refreshApp, refreshWeb, exchangeSocialLoginCode, agree, logoutApp, logoutWeb, start, callback |
| map       | getVisitedPlaceMarkers, getNearbyPlaces                                                       |
| my-page   | getMyAccount, updateMyAccount, withdrawMyAccount                                               |
| notification | unregisterDeviceToken, registerDeviceToken, getNotifications, hasUnread                    |
| record    | createConsumption, recognizeReceipt                                                            |
| report    | getMonthlyReport, getCurrentStatus, getConsumptions, getFrequentPlaces, issueShareLink, getSharedPersonaCard, aggregateMonthlyReport |
| shop      | getPlaceDetail, getPlaceVisits, toggleLike, searchVisitedPlaces                                |

명세에 등록된 operationId가 사라지거나 변경되면 생성 단계가 실패한다. 새로운 API는
`openapiFeatureMap.json`에 소유 feature를 지정한 뒤 생성한다.

다음 중 하나라도 발견되면 생성 전에 실패한다.

- feature에 매핑되지 않은 새 operationId
- Swagger에서 사라졌지만 매핑에는 남아 있는 operationId
- 여러 feature에 중복으로 등록한 operationId
- Swagger에서 중복된 operationId
- operationId가 없는 엔드포인트

실패 메시지에 표시된 operationId를 `openapiFeatureMap.json`의 해당 feature에 추가한 뒤
`pnpm api:generate`를 다시 실행한다.

## Swagger 작성 규칙

생성되는 함수명과 타입의 품질을 위해 서버 명세에는 다음 항목을 안정적으로 유지한다.

- 엔드포인트별 고유한 `operationId`
- 도메인별 `tags`
- 요청과 응답 schema의 `required`, `nullable`
- DTO와 필드의 `description`, `example`
- 공통 에러 응답 schema
