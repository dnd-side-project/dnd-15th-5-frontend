import { Dialog as BaseDialog } from '@base-ui/react/dialog';

import { cn } from '@/shared/lib/cn';

import type { ReactNode, RefObject } from 'react';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  actionsClassName?: string;
  popupClassName?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Base UI의 접근성·포커스·스크롤 관리를 적용한 공통 모달 프레임입니다.
 * 제목과 설명은 접근성 이름으로 연결되며, 액션 버튼은 `actions` 슬롯에 전달합니다.
 * 바깥 영역 클릭으로 닫히지 않으며, Escape와 닫기 요청은 `onOpenChange`로 전달됩니다.
 *
 * @example
 * ```tsx
 * <Dialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="변경 사항을 저장할까요?"
 *   description="저장하지 않으면 수정 내용이 사라져요."
 *   actions={<DialogActionButton tone="primary" onClick={handleSave}>저장하기</DialogActionButton>}
 * >
 *   <p>다이얼로그에 추가로 표시할 내용을 넣습니다.</p>
 * </Dialog>
 * ```
 *
 * @param props - 다이얼로그 표시와 콘텐츠를 설정하는 속성입니다.
 * @param props.open - 다이얼로그의 열림 상태입니다.
 * @param props.onOpenChange - Escape 등으로 열림 상태 변경을 요청할 때 호출됩니다. 외부 클릭은 닫기 동작으로 처리하지 않습니다.
 * @param props.title - 다이얼로그 제목이며 스크린 리더의 이름으로 사용됩니다.
 * @param props.description - 제목 아래 표시할 설명이자 스크린 리더가 읽을 설명입니다.
 * @param props.children - 설명과 액션 영역 사이에 표시할 본문입니다.
 * @param props.actions - 다이얼로그 하단에 표시할 버튼 등의 액션 요소입니다.
 * @param props.actionsClassName - 액션 영역의 기본 간격을 재정의하거나 추가하는 클래스입니다.
 * @param props.popupClassName - 다이얼로그 패널에 추가할 클래스입니다. 너비 등 패널 스타일을 조정할 때 사용합니다.
 * @param props.initialFocusRef - 열릴 때 초기 포커스를 둘 요소의 ref입니다. 전달하지 않으면 Base UI의 기본 포커스 동작을 따릅니다.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  actionsClassName,
  popupClassName,
  initialFocusRef,
}: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange} disablePointerDismissal>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="mobile-frame fixed inset-0 z-dialog bg-neutral-900/30 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none" />
        <BaseDialog.Viewport className="mobile-frame pointer-events-none fixed inset-0 z-dialog flex items-center justify-center px-4">
          <BaseDialog.Popup
            initialFocus={initialFocusRef}
            className={cn(
              'pointer-events-auto w-full rounded-30 bg-neutral-00 px-4 pt-8 pb-4 transition-[opacity,transform] duration-200 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 motion-reduce:transition-none',
              popupClassName
            )}
          >
            <BaseDialog.Title className="text-center text-title-01-bold text-neutral-700">
              {title}
            </BaseDialog.Title>
            {description && (
              <BaseDialog.Description className="mt-2 text-center text-body-01-regular text-neutral-500">
                {description}
              </BaseDialog.Description>
            )}
            {children}
            {actions && <div className={cn('mt-8 flex gap-3', actionsClassName)}>{actions}</div>}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
