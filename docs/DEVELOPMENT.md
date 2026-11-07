# 개발 서버 실행과 종료

루트 디렉터리에서 실행한다.

| 명령 | 동작 |
| --- | --- |
| `pnpm dev` | Turbo로 웹과 모바일 개발 서버를 함께 실행 |
| `pnpm dev:web` | 웹 개발 서버만 직접 실행 |
| `pnpm dev:mobile` | 모바일 개발 서버만 직접 실행 |

보통 실행한 터미널에서 `Ctrl+C`로 종료한다. Windows에서 일괄 작업 종료 확인이 뜨면
`Y`와 Enter를 입력한다.

## Windows에서 Turbo 종료가 멈춘 경우

`2 tasks shutting down...` 메시지가 반복되면 **새 터미널**을 열고 이 저장소의 루트에서
다음을 실행한다.

```powershell
pnpm dev:stop
```

이 명령은 이 저장소의 `node_modules`에서 실행된 `turbo run dev`와 그 하위 프로세스,
Turbo 실행용 Node·CMD 래퍼를 강제 종료한다. 다른 프로젝트의 Node 프로세스는 종료하지 않는다.
웹·모바일을 직접 실행한 서버나 Storybook·테스트·빌드 프로세스는 대상이 아니다.

종료 대상만 확인하려면 다음을 실행한다.

```powershell
pnpm dev:stop -WhatIf
```

`dev:stop`은 Windows PowerShell 전용 명령이다. 단일 앱만 작업할 때는 `dev:web` 또는
`dev:mobile`을 사용하면 Turbo의 하위 작업 종료 대기를 거치지 않는다.
