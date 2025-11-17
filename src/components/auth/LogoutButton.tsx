import { LogoutModal } from '@/components/auth/LogoutModal';
import { LogoutIcon } from '@/components/icons/LogoutIcon';
import { useState } from 'react';

export function LogoutButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        <LogoutIcon width={32} height={32} color='black' />
      </button>
      <LogoutModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
