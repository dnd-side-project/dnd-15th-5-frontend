# 프론트엔드 코드 컨벤션

## 1. Naming Convention

### Directory

| 대상     | 규칙         | 예시           |
| -------- | ------------ | -------------- |
| 디렉토리 | `kebab-case` | `user-profile` |

### File

| 대상            | 규칙                    | 예시                      |
| --------------- | ----------------------- | ------------------------- |
| Component       | `PascalCase`            | `ReceiptCard.tsx`         |
| 일반 TypeScript | `camelCase`             | `formatDate.ts`           |
| Custom Hook     | `use + camelCase`       | `useReceipt.ts`           |
| Schema          | `camelCase`             | `receiptSchema.ts`        |
| Store           | `camelCase`             | `authStore.ts`            |
| Asset           | `kebab-case`            | `ic-arrow-left.svg`       |
| Page Component  | `PascalCase + Page`     | `MainPage.tsx`            |
| Screen Component (모바일) | `PascalCase + Screen` | `HomeScreen.tsx`      |
| Storybook       | `컴포넌트명 + .stories` | `ReceiptCard.stories.tsx` |

- Storybook 파일은 대상 컴포넌트와 같은 위치에 둔다
- 스키마가 늘어나면 `schemas/` 폴더로 분리한다

### Number

- 숫자는 두 자리로 통일한다.
- 한 자리 숫자는 앞에 `0`을 붙인다.
- `01`, `02`, `03`

---

## 2. Function & Variable

| 대상           | 규칙                | 예시           |
| -------------- | ------------------- | -------------- |
| Component      | `PascalCase`        | `ReceiptCard`  |
| Page Component | `PascalCase + Page` | `MainPage`     |
| Screen Component (모바일) | `PascalCase + Screen` | `HomeScreen` |
| 변수           | `camelCase`         | `receiptList`  |
| 함수           | `camelCase`         | `formatDate`   |
| 이벤트 함수    | `handle + 동사`     | `handleSubmit` |
| Event Props    | `on + 동사`         | `onSubmit`     |

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

## 3. 코드 작성 원칙

- 하나의 함수는 하나의 역할만 담당한다.
- 중복되는 코드는 함수나 컴포넌트로 분리해 재사용한다.
- UI 렌더링 로직과 데이터 처리 로직을 분리한다.
- early return 등을 활용해 불필요한 중첩을 최소화한다.
- 매직 넘버를 직접 사용하지 않고 의미가 드러나는 상수로 분리한다.

---

## 4. Boolean

| Prefix | 사용 기준 | 예시        |
| ------ | --------- | ----------- |
| `is`   | 상태      | `isLoading` |
| `has`  | 보유 여부 | `hasToken`  |

---

## 5. Constant

| 대상            | 규칙               | 예시             |
| --------------- | ------------------ | ---------------- |
| 일반 상수       | `UPPER_SNAKE_CASE` | `API_BASE_URL`   |
| CVA 스타일 상수 | `camelCase`        | `buttonVariants` |

---

## 6. Props & Type

- `interface` 대신 `type` 사용
- Component Props는 `ComponentNameProps`
- HTML Element Props 확장 시 `ComponentProps` 사용
- Type Import는 `import type` 사용
- 공통 Type이 아니면 Feature 내부에서 관리
- Swagger DTO는 자동 생성된 `features/{feature}/apis/dto.ts`에서 가져오기
- 화면별 API 옵션을 적용한 훅은 `features/{feature}/apis/hooks/`에 훅 하나당 파일 하나로 작성
- `features/{feature}/types.ts`에는 DTO가 아닌 feature 공통 타입 작성
- Component Props 등 그 외 타입은 사용하는 파일 안에 선언

---

## 7. Import

### 경로

- 절대 경로 별칭 `@/` 사용
- 같은 폴더 내부는 상대 경로 허용
- 과도한 상대 경로 사용 지양

---

## 8. `index.ts`

- 외부에서 사용할 항목만 Export
- Export된 항목만 관리
- 내부 파일 전체 Export 금지
- 모든 폴더에 생성하지 않음
- 순환 참조 주의

---

## 9. Asset

### Format

| 형식 | 사용 기준                     |
| ---- | ----------------------------- |
| SVG  | 아이콘, 로고, 단순 일러스트   |
| PNG  | 투명 이미지, 복잡한 UI 이미지 |

### Prefix

| Prefix  | 대상  |
| ------- | ----- |
| `ic-`   | Icon  |
| `img-`  | Image |
| `logo-` | Logo  |

### Rule

- `kebab-case`
- 숫자는 두 자리
- 추가 전 경량화
- 중복 Asset 확인
- 역할이 드러나는 이름 사용
- 웹 전용 에셋은 `apps/web/src/shared/assets`, 모바일 전용 에셋은 `apps/mobile/src/shared/assets`에서 관리
- 웹과 모바일이 같은 원본을 사용하는 에셋은 `packages/shared/assets`에서 관리
- SVG 추가·수정 후 `pnpm optimize:icons` 실행
- `pnpm check:icons`로 최적화 상태를 검사하며, Husky pre-commit과 `pnpm lint`에서도 자동 검사

---

## 10. TSDoc

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

## 11. Comment

| Prefix     | 사용 기준             |
| ---------- | --------------------- |
| `TODO`     | 추후 구현 또는 수정   |
| `BUG`      | 확인된 버그           |
| `NOTE`     | 중요한 제약 또는 동작 |
| `OPTIMIZE` | 성능 개선 및 리팩토링 |
| `INFO`     | 참고 정보             |

### Rule

- 주석만 보고 작업 내용을 이해할 수 있도록 작성
- 작업 완료 후 제거
- TODO Tree 사용 권장

---

Git/브랜치/커밋/PR 컨벤션은 [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)를, 기술 스택과 폴더 구조는 [ARCHITECTURE.md](./ARCHITECTURE.md)를 참고하세요.
