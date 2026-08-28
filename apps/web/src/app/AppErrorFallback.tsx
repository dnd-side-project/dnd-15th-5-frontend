import { StateView } from '@/shared/ui/state-view';

type AppErrorFallbackProps = {
  onRetry?: () => void;
};

/** 복구할 수 없는 앱 오류가 발생했을 때 새로고침 동작과 함께 표시하는 공통 화면입니다. */
export default function AppErrorFallback({ onRetry }: AppErrorFallbackProps) {
  const handleRetry = onRetry ?? (() => window.location.reload());

  return (
    <main className="flex min-h-screen justify-center bg-neutral-100">
      <div className="mobile-frame flex min-h-screen items-center bg-neutral-00 px-4 pb-safe-bottom">
        <StateView
          actionLabel="다시 시도하기"
          description="잠시 후 다시 시도해주세요."
          headingAs="h1"
          onAction={handleRetry}
          title="화면을 불러오지 못했어요"
          variant="error"
        />
      </div>
    </main>
  );
}
