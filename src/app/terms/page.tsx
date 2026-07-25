import { PublicPageShell } from '@/components/marketing/PublicPageShell';
import styles from '@/components/marketing/PublicPageShell.module.css';

export default function TermsPage() {
  return (
    <PublicPageShell
      eyebrow="Terms"
      title="Simple terms for using Vendora."
      intro="These terms outline the basic expectations for using the platform, keeping your account secure, and respecting the shared business workspace."
      actions={[{ href: '/login', label: 'Sign in', primary: true }]}
    >
      <section className={styles.section}>
        <div className={styles.legalBlock}>
          <h2 className={styles.legalHeading}>Account responsibility</h2>
          <p className={styles.legalText}>
            You are responsible for the activity on your account and for keeping login credentials private.
          </p>
        </div>
        <div className={styles.legalBlock}>
          <h2 className={styles.legalHeading}>Acceptable use</h2>
          <p className={styles.legalText}>
            Use the platform for legitimate business operations and do not attempt to disrupt access, compromise data,
            or misuse other users&apos; permissions.
          </p>
        </div>
        <div className={styles.legalBlock}>
          <h2 className={styles.legalHeading}>Subscriptions and access</h2>
          <p className={styles.legalText}>
            Subscription terms, service access, and plan changes are governed by the agreement in place for your
            business account.
          </p>
        </div>
        <p className={styles.note}>
          This summary is informational and does not replace formal contractual terms.
        </p>
      </section>
    </PublicPageShell>
  );
}
