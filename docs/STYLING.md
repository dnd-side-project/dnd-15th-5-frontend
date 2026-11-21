# 스타일링 구현 규칙

시각적 원칙과 공통 UI 사용 기준은 [DESIGN.md](../DESIGN.md)를 따른다.

## 공유 토큰

- 웹은 Tailwind CSS, 모바일은 Uniwind를 사용한다.
- 색상·타이포그래피·그림자·모서리 반경은 `packages/shared/design`의 `@theme` CSS에서 정의한다.
- 웹은 `apps/web/src/app/styles/index.css`, 모바일은 `apps/mobile/src/global.css`에서 토큰을 읽는다.
- 시안에 없는 토큰을 임의로 만들지 않는다. 기본 색상 팔레트가 비활성화되어 있어 정의되지 않은 색상 클래스는 생성되지 않는다.
- variant가 2~3개를 넘으면 CVA, 단순한 조건부 클래스는 `cn()`과 삼항·객체로 처리한다.

## 타이포그래피

타이포그래피 토큰은 크기·행간·굵기를 함께 적용한다.
웹은 가변 글꼴을 사용하므로 `text-body-01-bold`처럼 토큰만 지정한다.

모바일은 Android에서 번들 글꼴의 굵기를 적용하기 위해 토큰과 같은 굵기의 글꼴 유틸리티를 함께 지정한다.

```tsx
<Text className="font-pretendard-bold text-body-01-bold">
```

`regular`·`medium`·`semibold`·`bold`를 각각 `font-pretendard-{굵기}`와 짝지어 사용한다.
모바일 글꼴은 `app.json`의 expo-font 설정과 `global.css`에서 관리한다.

행간은 `140%` 대신 `1.4` 같은 단위 없는 배수를 사용한다. 시안의 `Auto`는 `normal`로 둔다.
