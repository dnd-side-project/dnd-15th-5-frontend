# WebView와 네이티브 실행

웹 화면의 Safe Area와 네이티브 기능 실행·빌드 시 확인할 사항을 설명한다.
디렉토리와 의존 방향은 [ARCHITECTURE.md](./ARCHITECTURE.md)를 따른다.

## WebView와 Safe Area

WebView 화면은 `apps/mobile/src/shared/layout/WebViewScreen`을 사용해 로딩·오류 복구와
Safe Area 처리를 통일한다.

| 환경                               | Safe Area 처리                                       |
| ---------------------------------- | ---------------------------------------------------- |
| iOS WebView                        | 모든 WebView를 전체 화면 크기로 유지하고 웹에서 처리 |
| Android WebView                    | `safeAreaMode`에 따라 네이티브 Safe Area 적용        |
| 일반 웹 페이지                     | `PageFrame`에서 상·하단 여백 확보                    |
| 지도·스티커 기록 등 자체 처리 화면 | 경로별 설정에 따라 해당 가장자리 처리를 화면에 위임  |

- 웹의 `shared/layout/page-frame`은 라우트·인증 복원·초기 로딩·오류·기록 수정의 내부 화면에 공통 프레임을 제공한다.
- `app/layouts/getPageSafeArea.ts`가 경로별 처리 주체를 정하고, `MobileLayout`이 프레임에 전달한다.
- 프레임은 상단 여백과 `--page-safe-area-top`을 함께 설정한다. 고정 화면은 `top-safe`, 높이가 고정된 화면은 `h-screen-safe-top` 또는 `h-screen-safe-bottom`으로 같은 경계를 사용한다.
- 하단 여백은 공통 프레임 또는 자체 스크롤 영역에서 확보한다.
- 기록 단계별 헤더 여백은 `features/record/sticker/constants.ts`의 `getStickerFlowLayout`에서 관리한다.

## 네이티브 기능의 역할

`native/receipt`는 영수증 촬영·앨범 선택·이미지 정규화·스캔 요청을, `native/sticker`는 스티커
촬영·사진 준비·배경 제거 연동을 관리한다. 두 기능이 공유하는 카메라 요청 처리는
`native/camera`에 둔다.

## iOS 스티커 배경 제거

- `apps/mobile/modules/chapchap-isnet`은 iOS 배경 제거용 Expo 로컬 모듈이다. Core ML 실행 실패 시 네이티브 CPU로 전환하며, 서버 업로드나 WebView 추론으로 자동 우회하지 않는다.
- 모델은 앱에 포함한다. 원본 URL·크기·체크섬은 `packages/shared/src/record/isnetModel.ts`에서 관리하고, 모델 파일은 Git에서 제외한다. 라이선스는 앱에 함께 포함한다.
- EAS는 `eas-build-pre-install`에서 모델을 준비한다. 직접 `expo prebuild`를 실행할 때도 Pod 리소스 목록 생성 전에 `sticker:prepare`를 실행한다.

```powershell
# 저장소 루트: 모델 준비 및 macOS iOS 개발 빌드
pnpm --filter @chapchap/mobile sticker:prepare
pnpm ios

# Windows: EAS iOS 개발 빌드
cd apps/mobile
pnpm dlx eas-cli build --profile development --platform ios
```

네이티브 변경은 앱을 다시 빌드·설치해야 적용된다. Jest와 `expo export`는 Swift 컴파일을 검증하지 않는다.
iOS 빌드와 실기기에서 Core ML 실행·속도·마스크 품질을 확인한다.

### 배경 제거 준비 시점과 성능 비교

모델은 홈 대신 사진 가져오기·촬영 진입에서 준비한다. 홈 렌더링과 모델 초기화가 경쟁하지 않게 하면서, 선택기·카메라를 사용하는 시간에 준비를 겹치는 방식이다. 준비가 사진 선택보다 늦게 끝나면 첫 사진 생성에서 남은 시간을 기다린다. 기기별 실측으로 홈 진입과 첫 사진 처리 시간을 함께 확인한다.

- 웹의 최초 실행은 모델 캐시가 없는 새 브라우저 프로필에서 측정한다. 디스크 캐시 비교는 모델 캐시를 유지한 채 기록 화면을 닫았다 다시 열어 새 Worker·세션을 사용한다. 세션 재사용은 같은 기록 화면에서 사진을 변경해 측정한다.
- iOS 모델은 앱에 포함되므로 런타임 다운로드가 없다. 최초 준비는 Core ML 컴파일 캐시가 없는 테스트 설치, 디스크 캐시 사용은 해당 캐시를 유지한 앱 프로세스 재시작, 세션 재사용은 같은 프로세스의 두 번째 사진 처리로 구분한다.
- 변경 전의 홈 워밍업과 변경 후의 사진 진입 준비를 같은 기기·빌드 방식·사진·네트워크·대기 시간으로 각각 5회 이상 비교한다. 앱 시작→홈 조작 가능, 사진 진입→선택 완료, 선택 완료→생성 완료 시간을 따로 기록하고 중앙값을 비교한다.
- 준비를 기다리는 지연도 포함한 사진 처리 전체 시간을 기록한다. 네이티브 `elapsedMs`는 초기 `prepare()` 이후 이미지 디코딩부터 PNG 인코딩까지 측정하며 추론 외의 이미지 처리도 포함한다. 초기 모델 준비·워밍업, 브릿지 전송, 웹의 스티커 합성 시간은 제외하므로 사용자 관점의 전체 생성 시간과 구분한다.
- 기본 스티커 작성과 기존 이미지 유지 수정에서는 모델 요청이 없는지, 사진 준비 실패 후 재시도와 WebGPU 실패 후 WASM 전환이 가능한지 확인한다. iOS는 Core ML 실패 시 CPU 전환도 별도로 확인한다.

| 플랫폼·기기·빌드 | 준비 시점 | 캐시·세션 상태 | 홈 진입 중앙값 | 사진 선택 대기 중앙값 | 첫 사진 생성 중앙값 | 두 번째 사진 생성 중앙값 |
| --- | --- | --- | --- | --- | --- | --- |
| 측정 시 기록 | 홈 / 사진 진입 | 최초 / 디스크 캐시 / 세션 재사용 | 미측정 | 미측정 | 미측정 | 미측정 |

Jest는 준비 호출 여부·중복 초기화 방지·모델 캐시·세션 재사용·취소 후 재준비·실패 복구를 검증한다. 실제 모델과 기기의 경과 시간은 위 실기기 측정과 별개다.
