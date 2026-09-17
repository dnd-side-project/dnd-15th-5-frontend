# Mixpanel UT 측정 가이드

## 적용 범위

웹 앱의 Mixpanel 프로젝트 토큰이 설정된 환경에서 웹과 네이티브 영수증 화면의 아래 데이터를 수집한다.

| 요구 데이터 | Mixpanel 데이터 | 분석 방법 |
| --- | --- | --- |
| 화면별 체류시간 | `Screen Exited.duration_seconds` | Insights에서 `screen_name`별 평균·중앙값 |
| 퍼널 전환율/이탈 | `Screen Viewed`, `UI State Viewed`, `UT Task Completed` | Funnels에서 미션별 순서 지정 |
| 클릭·탭/히트맵 | `$mp_click`, Heatmap, Session Replay | Autocapture 클릭 이벤트와 Heatmaps |
| 과업 완료율 | `UT Task Completed` | 시작 이벤트 사용자 대비 완료 이벤트 사용자 비율 |
| 네이티브 영수증 단계 완료 | `Step Completed` | `step_name`, `completion_reason`, `input_method`로 단계별 성공 분석 |
| 단계 시도·재시도 | `Step Attempted` | `attempt_number`, `retry_count`, `is_retry`로 시도 및 재시도 분석 |

화면 코드 매핑은 다음과 같다.

| 기획 화면 코드 | 실제 상태 |
| --- | --- |
| `MAP_Main` | `/home` |
| `MAP_PlaceDetail_FirstVisitToast` | 첫 방문 소비기록 생성 후 홈의 장소 시트와 Toast가 표시된 상태 |
| `MAP_PlaceDetail_02` | `/home/shop/:shopId` |
| `REP02` | `/report` |
| `REC_ReceiptScan` | 네이티브 영수증 촬영·사진 선택 및 OCR 화면 |
| `REC_ReceiptConfirm` | 네이티브 영수증 인식 결과 확인·저장 화면 |

네이티브 화면은 메인 WebView의 Mixpanel 세션으로 이벤트를 전달한다. 화면 포커스와 앱 활성 상태를
기준으로 `Screen Viewed`/`Screen Exited`를 수집하며, 이탈 이벤트에는 `duration_seconds`가 포함된다.
OCR 성공과 소비기록 저장 성공은 각각 `Step Completed`로 수집한다. `app = mobile` 속성으로 웹
이벤트와 구분할 수 있다.

로그인 사용자는 `/accounts/me`의 `userId`를 Mixpanel `distinct_id`로 사용한다. 웹 이벤트와
WebView로 전달된 네이티브 이벤트가 같은 사용자에게 연결되며, 로그아웃·인증 만료 시에는
Mixpanel 식별 상태를 초기화해 다음 로그인 계정과 데이터가 섞이지 않도록 한다.

모든 이벤트에는 브라우저 프로필 또는 앱 WebView 설치 단위의 익명 `device_id`를 공통 속성으로
등록한다. 동일 계정이 일반 웹사이트와 TestFlight 앱에서 접속하면 `distinct_id`는 같고
`device_id`는 환경별로 다르므로 사용자 기준과 접속 환경 기준을 각각 분석할 수 있다. 브라우저
저장소 삭제 또는 앱 재설치 후에는 새로운 `device_id`가 생성된다.

영수증 OCR, 영수증 저장, 방문 가게 검색은 실행할 때마다 `Step Attempted`를 전송한다. 첫 시도는
`attempt_number = 1`, `retry_count = 0`, `is_retry = false`이며 두 번째 시도부터
`is_retry = true`가 된다. 사용자가 해당 단계에서 헤맨 정도는 사용자별 `retry_count`의 최댓값이나
`is_retry = true`인 이벤트 수로 집계한다. 검색어와 영수증 입력값은 이벤트 속성에 포함하지 않는다.

첫 방문 완료 화면은 동일하지만 입력 방식에 따라 아래처럼 구분한다.

| 미션 | `mission_id` | `record_method` |
| --- | --- | --- |
| 직접 기록 후 첫 방문 완료 | `MAP_MAIN_TO_FIRST_VISIT_TOAST_MANUAL` | `manual` |
| 영수증 기록 후 첫 방문 완료 | `MAP_MAIN_TO_FIRST_VISIT_TOAST_RECEIPT` | `receipt` |
| 장소 상세 진입 | `MAP_MAIN_TO_PLACE_DETAIL_02` | 없음 |
| 리포트 진입 | `MAP_MAIN_TO_REP02` | 없음 |

## 환경 변수

배포 환경에 다음 값을 설정한다.

```dotenv
VITE_MIXPANEL_PROJECT_TOKEN=Mixpanel 프로젝트 토큰
VITE_MIXPANEL_SESSION_REPLAY_PERCENT=100
```

UT 참여자가 적은 기간에는 Replay 비율을 `100`으로 두고, 일반 운영에서는 월 무료 Replay 한도에
맞춰 낮춘다. 토큰이 비어 있으면 SDK는 초기화되지 않으며 어떤 이벤트도 전송하지 않는다.

## 권장 Funnel

각 퍼널의 첫 단계는 `Screen Viewed`에서 `screen_name = MAP_Main`으로 필터링한다.

1. 직접 기록 첫 방문 완료: `UI State Viewed`의
   `mission_id = MAP_MAIN_TO_FIRST_VISIT_TOAST_MANUAL`
2. 영수증 기록 첫 방문 완료: `UI State Viewed`의
   `mission_id = MAP_MAIN_TO_FIRST_VISIT_TOAST_RECEIPT`
3. 장소 상세 진입: `Screen Viewed`의 `screen_name = MAP_PlaceDetail_02`
4. 리포트 진입: `Screen Viewed`의 `screen_name = REP02`

완료율만 한 화면에서 비교할 때는 두 번째 단계를 `UT Task Completed`로 두고 `target_screen`을
각 목표 코드로 필터링한다. 분석 단위는 이벤트 수가 아니라 고유 사용자로 설정한다.

## 개인정보 및 이벤트 사용량

- Replay에서는 모든 입력값과 `data-mp-mask`가 지정된 사용자별 텍스트를 마스킹한다.
- `data-mp-mask`는 텍스트 노드만 보호하므로 민감한 값을 `aria-label`, `dateTime` 같은 DOM 속성에 넣지 않는다. 접근성 이름이 필요하면 정적 문구나 마스킹된 텍스트를 참조하는 `aria-labelledby`를 사용한다.
- 프로필·가게 사진처럼 `data-mp-block`이 지정된 이미지는 차단하고, 앱 일러스트와 스티커는 화면 분석을 위해 표시한다. 동영상, Canvas, 네트워크, 콘솔은 수집하지 않는다.
- URL 쿼리와 동적 장소 ID 대신 고정된 `screen_path`와 `screen_name`을 명시 이벤트에 사용한다.
- Autocapture는 클릭만 활성화하며 입력, 스크롤, 폼 제출, rage/dead click은 비활성화한다.
- 클릭 요소는 `data-analytics-id`로 식별하며 화면 텍스트는 이벤트에 담지 않는다.
