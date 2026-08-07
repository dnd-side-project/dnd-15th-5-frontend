import { Link } from 'react-router-dom';

const POC_LINKS = [
  {
    label: '카메라',
    description: '영수증 촬영 화면 확인',
    path: '/record/receipt/camera',
  },
  {
    label: '지도',
    description: '현재 위치 지도 확인',
    path: '/home',
  },
  {
    label: '인풋',
    description: '수기 입력과 키보드 확인',
    path: '/record/manual',
  },
] as const;

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-col justify-center py-10">
      <div>
        <p className="text-sm font-semibold text-orange-500">chapchap PoC</p>
        <h1 className="mt-2 text-2xl font-bold text-neutral-900">기능을 확인해보세요</h1>
        <p className="mt-2 text-sm text-neutral-500">테스트할 화면을 선택하면 바로 이동합니다.</p>
      </div>

      <nav aria-label="PoC 화면 이동" className="mt-8 grid gap-3">
        {POC_LINKS.map(({ label, description, path }) => (
          <Link
            className="flex min-h-18 items-center justify-between rounded-xl bg-neutral-100 px-5 py-4 transition-colors active:bg-neutral-200"
            key={path}
            to={path}
          >
            <span>
              <span className="block font-semibold text-neutral-900">{label}</span>
              <span className="mt-1 block text-sm text-neutral-500">{description}</span>
            </span>
            <span aria-hidden="true" className="text-xl text-neutral-400">
              ›
            </span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
