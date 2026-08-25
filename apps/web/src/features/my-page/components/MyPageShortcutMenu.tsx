import { AccountRecordIcon, LikeIcon, NotificationDefaultIcon } from '@/shared/assets/icons';

import type { ComponentType, SVGProps } from 'react';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type ShortcutCardProps = {
  icon: IconComponent;
  label: string;
  onClick?: () => void;
};

function ShortcutCard({ icon: Icon, label, onClick }: ShortcutCardProps) {
  const content = (
    <>
      <Icon className="size-6.25 text-primary-500" aria-hidden="true" />
      <span className="text-body-02-medium text-neutral-700">{label}</span>
    </>
  );

  if (!onClick) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-16 bg-neutral-50 py-3">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-16 bg-neutral-50 py-3 outline-none hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-primary-300"
      onClick={onClick}
    >
      {content}
    </button>
  );
}

type MyPageShortcutMenuProps = {
  onRecordClick: () => void;
  onNotificationClick: () => void;
};

export default function MyPageShortcutMenu({
  onRecordClick,
  onNotificationClick,
}: MyPageShortcutMenuProps) {
  return (
    <div className="flex gap-2 p-4">
      <ShortcutCard icon={LikeIcon} label="좋아요" />
      <ShortcutCard icon={AccountRecordIcon} label="누적 기록" onClick={onRecordClick} />
      <ShortcutCard
        icon={NotificationDefaultIcon}
        label="알림 설정"
        onClick={onNotificationClick}
      />
    </div>
  );
}
