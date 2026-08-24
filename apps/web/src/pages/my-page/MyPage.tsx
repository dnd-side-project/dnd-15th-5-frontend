import { LogoutButton } from '@/features/my-page';

export default function MyPage() {
  return (
    <main className="flex min-h-full flex-col">
      {/* TODO: 마이페이지 디자인 시안 확정 후 수정 필요 */}
      <h1 className="pt-6 text-title-02-semibold text-neutral-900">마이페이지</h1>
      <div className="mt-auto pb-8">
        <LogoutButton />
      </div>
    </main>
  );
}
