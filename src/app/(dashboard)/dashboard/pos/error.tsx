'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { getFriendlyErrorMessage, isBillingAccessError } from '@/lib/errors/apiError';
import styles from './page.module.css';

export default function PosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const billingLocked = isBillingAccessError(error);
  const message = getFriendlyErrorMessage(error, 'We could not load the POS right now. Please try again.');

  return (
    <div className={styles.stateShell}>
      <div className={styles.stateCard}>
        <span className={styles.stateBadge}>{billingLocked ? 'Billing locked' : 'Load error'}</span>
        <h2 className={styles.stateTitle}>
          {billingLocked ? 'Billing is required to use the POS' : 'We could not load the POS'}
        </h2>
        <p className={styles.stateText}>{message}</p>
        <div className={styles.stateActions}>
          <Button type="button" size="lg" variant="primary" onClick={reset}>
            Try again
          </Button>
          {billingLocked ? (
            <Button type="button" size="lg" variant="outline" onClick={() => router.push('/dashboard/billing')}>
              Open Billing
            </Button>
          ) : (
            <Link href="/dashboard" className={styles.secondaryLink}>
              Go back to dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
