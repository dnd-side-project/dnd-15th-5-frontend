import { useState } from 'react';

import { useWithdrawAccount } from '@/features/my-page/apis/hooks/useWithdrawAccount';
import { AccountRemoveIcon } from '@/shared/assets/icons';

import MyPageMenuItem from './MyPageMenuItem';
import WithdrawAccountDialog from './WithdrawAccountDialog';

export default function WithdrawAccountButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isLoading, withdraw } = useWithdrawAccount();

  return (
    <>
      <MyPageMenuItem
        icon={AccountRemoveIcon}
        label="회원탈퇴"
        onClick={() => setIsDialogOpen(true)}
      />

      {isDialogOpen && (
        <WithdrawAccountDialog
          isLoading={isLoading}
          onCancel={() => setIsDialogOpen(false)}
          onConfirm={() => void withdraw()}
        />
      )}
    </>
  );
}
