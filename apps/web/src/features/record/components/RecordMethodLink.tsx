import { Link } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

type RecordMethodLinkProps = {
  description: string;
  title: string;
  to: string;
  variant: 'primary' | 'secondary';
};

export default function RecordMethodLink({
  description,
  title,
  to,
  variant,
}: RecordMethodLinkProps) {
  const isPrimary = variant === 'primary';

  return (
    <Link
      to={to}
      className={cn(
        'block w-full rounded-16 p-4 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-1',
        isPrimary
          ? 'bg-primary-500 text-neutral-00 hover:bg-primary-600 active:bg-primary-700'
          : 'bg-primary-50 text-neutral-700 hover:bg-primary-100 active:bg-primary-200'
      )}
    >
      <span className="block px-2.5 py-1 text-heading-03-semibold">{title}</span>
      <span
        className={cn(
          'mt-2 block px-2.5 text-body-01-regular',
          isPrimary ? 'text-primary-200' : 'text-neutral-500'
        )}
      >
        {description}
      </span>
    </Link>
  );
}
