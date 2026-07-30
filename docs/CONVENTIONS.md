# 프론트엔드 코드 컨벤션

## 1. Naming Convention

### Directory

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 디렉토리 | `kebab-case` | `user-profile` |

### File

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| Component | `PascalCase` | `ReceiptCard.tsx` |
| 일반 TypeScript | `camelCase` | `formatDate.ts` |
| Custom Hook | `use + camelCase` | `useReceipt.ts` |
| Schema | `camelCase` | `receiptSchema.ts` |
| Store | `camelCase` | `authStore.ts` |
| Asset | `kebab-case` | `ic-arrow-left.svg` |
| Page Component | `PascalCase + Page` | `MainPage.tsx` |
| Storybook | `컴포넌트명 + .stories` | `ReceiptCard.stories.tsx` |

- Storybook 파일은 대상 컴포넌트와 같은 위치에 둔다
- 스키마가 늘어나면 `schemas/` 폴더로 분리한다

### Number

- 숫자는 두 자리로 통일
- `01`, `02`, `03`

---

## 2. Function & Variable

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| Component | `PascalCase` | `ReceiptCard` |
| Page Component | `PascalCase + Page` | `MainPage` |
| 변수 | `camelCase` | `receiptList` |
| 함수 | `camelCase` | `formatDate` |
| 이벤트 함수 | `handle + 동사` | `handleSubmit` |
| Event Props | `on + 동사` | `onSubmit` |

### 함수 선언 방식

- Page, Component는 선언식 함수로 작성
- 그 외 함수는 화살표 함수로 작성

```tsx
// Page, Component
export default function Page() {}

// 그 외
const change = () => {};
export const get = () => {};
```

### 이벤트 이름

- 대상이 명확하도록 작성
- `handleReceiptSubmit`
- `handleModalClose`

### 축약어

- 의미를 알기 어려운 축약어 지양
- `usrInfo` → `userInfo`
- `rptData` → `reportData`

---

## 3. Boolean

| Prefix | 사용 기준 | 예시 |
| --- | --- | --- |
| `is` | 상태 | `isLoading` |
| `has` | 보유 여부 | `hasToken` |

---

## 4. Constant

| 대상 | 규칙 | 예시 |
| --- | --- | --- |
| 일반 상수 | `UPPER_SNAKE_CASE` | `API_BASE_URL` |
| CVA 스타일 상수 | `camelCase` | `buttonVariants` |

---

## 5. Props & Type

- `interface` 대신 `type` 사용
- Component Props는 `ComponentNameProps`
- HTML Element Props 확장 시 `ComponentProps` 사용
- Type Import는 `import type` 사용
- 공통 Type이 아니면 Feature 내부에서 관리
- `features/{feature}/types.ts`에는 DTO 타입만 작성
- Component Props 등 그 외 타입은 사용하는 파일 안에 선언

---

## 6. Import

### 경로

- 절대 경로 별칭 `@/` 사용
- 같은 폴더 내부는 상대 경로 허용
- 과도한 상대 경로 사용 지양

---

## 7. `index.ts`

- 외부에서 사용할 항목만 Export
- Export된 항목만 관리
- 내부 파일 전체 Export 금지
- 모든 폴더에 생성하지 않음
- 순환 참조 주의

---

## 8. Asset

### Format

| 형식 | 사용 기준 |
| --- | --- |
| SVG | 아이콘, 로고, 단순 일러스트 |
| PNG | 투명 이미지, 복잡한 UI 이미지 |

### Prefix

| Prefix | 대상 |
| --- | --- |
| `ic-` | Icon |
| `img-` | Image |
| `logo-` | Logo |

### Rule

- `kebab-case`
- 숫자는 두 자리
- 추가 전 경량화
- 중복 Asset 확인
- 역할이 드러나는 이름 사용

---

## 9. TSDoc

### 작성 대상

- 공통 Component
- 사용 방법이 복잡한 Component
- 중요한 제약이 있는 Hook
- 재사용되는 Utility

### 작성 내용

- 역할
- 주요 동작
- 사용 시 주의사항
- 필요 시 `@example`
- `@param`은 선택

> 단순한 Feature 내부 Component는 생략 가능

---

## 10. Comment

| Prefix | 사용 기준 |
| --- | --- |
| `TODO` | 추후 구현 또는 수정 |
| `BUG` | 확인된 버그 |
| `NOTE` | 중요한 제약 또는 동작 |
| `OPTIMIZE` | 성능 개선 및 리팩토링 |
| `INFO` | 참고 정보 |

### Rule

- 주석만 보고 작업 내용을 이해할 수 있도록 작성
- 작업 완료 후 제거
- TODO Tree 사용 권장

---

Git/브랜치/커밋/PR 컨벤션은 [GITFLOW.md](./GITFLOW.md)를, 기술 스택과 폴더 구조는 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.
