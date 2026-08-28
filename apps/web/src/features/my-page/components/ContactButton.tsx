import { useState } from 'react';

import { ContactIcon } from '@/shared/assets/icons';
import { useToast } from '@/shared/ui/toast';

import ContactDialog, { CONTACT_EMAIL } from './ContactDialog';
import MyPageMenuItem from './MyPageMenuItem';

export default function ContactButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showToast } = useToast();

  const handleEmailCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      showToast({ type: 'success', message: '이메일 주소를 복사했어요.' });
      setIsDialogOpen(false);
    } catch {
      showToast({ type: 'error', message: '이메일 주소를 복사하지 못했어요.' });
    }
  };

  return (
    <>
      <MyPageMenuItem icon={ContactIcon} label="문의하기" onClick={() => setIsDialogOpen(true)} />

      {isDialogOpen && (
        <ContactDialog
          onClose={() => setIsDialogOpen(false)}
          onCopy={() => void handleEmailCopy()}
        />
      )}
    </>
  );
}
