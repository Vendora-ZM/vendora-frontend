import { PublicPageShell } from '@/components/marketing/PublicPageShell';
import styles from '@/components/marketing/PublicPageShell.module.css';

export default function PrivacyPage() {
  return (
    <PublicPageShell
      eyebrow="Privacy"
      title="How Vendora handles your information."
      intro="This page summarizes the privacy approach used across the platform. It is designed to keep business data, account access, and operational history secure while still making the product useful."
      actions={[{ href: '/login', label: 'Sign in', primary: true }]}
    >
      <section className={styles.section}>
        <div className={styles.legalBlock}>
          <h2 className={styles.legalHeading}>What we collect</h2>
          <p className={styles.legalText}>
            We may collect account details, business profile information, product data, sales activity, and other
            information you choose to add while using the platform.
          </p>
        </div>
        <div className={styles.legalBlock}>
          <h2 className={styles.legalHeading}>How we use it</h2>
          <p className={styles.legalText}>
            Data is used to operate the dashboard, support access control, generate analytics, and help your team
            manage day-to-day business activity.
          </p>
        </div>
        <div className={styles.legalBlock}>
          <h2 className={styles.legalHeading}>How we protect it</h2>
          <p className={styles.legalText}>
            Access is controlled through authenticated sessions and role-based permissions. We also keep business data
            separated by account and location context.
          </p>
        </div>
        <p className={styles.note}>
          This summary is for convenience and does not replace a formal privacy policy or legal advice.
        </p>
      </section>
    </PublicPageShell>
  );
}
