import { Outlet } from 'react-router-dom';

/** 좌우 여백이 필요한 페이지에 16px 패딩을 적용한다. */
export default function PaddedLayout() {
  return (
    <div className="px-4">
      <Outlet />
    </div>
  );
}
