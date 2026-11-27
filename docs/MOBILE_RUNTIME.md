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

## 사진 자원 반복 검증

사진 파일 소유권은 [RECORD_FLOW.md](./RECORD_FLOW.md#네이티브-사진-파일의-소유권)를 따른다.
실기기에서 변경 전후 동일한 사진·빌드 설정으로 아래 절차를 비교한다.

1. 앱 시작 후 유휴 상태의 프로세스 메모리와 앱 캐시 파일 수·총 크기를 기록한다. iOS는 Instruments의 Allocations/VM Tracker, Android는 Android Studio Memory Profiler와 Device Explorer를 사용한다.
2. 영수증 촬영·갤러리 선택·스티커 촬영·갤러리 선택을 각각 20회 반복한다. 성공, OCR·변환 실패, 선택 취소, 처리 중 뒤로 가기를 포함한다.
3. 각 작업이 종료된 뒤 홈에서 같은 시간 동안 기다리고 메모리와 캐시를 기록한다. 최초 모델 로딩 등 워밍업 비용과 반복마다 증가하는 비용을 구분한다.
4. 네이티브 영수증 확인 화면에서 가게 검색 왕복 시 미리보기가 유지되고, 저장·닫기·재촬영 후에는 해당 임시 파일이 사라지는지 확인한다. 갤러리 원본이 유지되는지도 확인한다.
5. 기기·OS·빌드·사진 크기와 시작/10회/20회 측정값을 이슈에 남긴다. Jest는 정리 호출과 소유권만 검증하며 실제 메모리 감소량은 실기기에서 측정한다.

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
