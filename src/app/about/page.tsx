import Link from 'next/link';
import { PublicPageShell } from '@/components/marketing/PublicPageShell';
import styles from '@/components/marketing/PublicPageShell.module.css';

export default function AboutPage() {
  return (
    <PublicPageShell
      eyebrow="About Vendora"
      title="We build software that helps merchants stay in control."
      intro="Vendora is designed for businesses that need a clearer way to sell, manage stock, and coordinate teams across locations. The goal is simple: make the day-to-day easier and the business more visible."
      actions={[
        { href: '/login?mode=register', label: 'Start free', primary: true },
        { href: '/#features', label: 'See how it works' },
      ]}
    >
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What we care about</h2>
        <div className={styles.cardGrid}>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Clarity</h3>
            <p className={styles.cardText}>People should understand the system quickly and use it without friction.</p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Control</h3>
            <p className={styles.cardText}>Business owners need a single place to manage locations, permissions, and performance.</p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Momentum</h3>
            <p className={styles.cardText}>The platform should help merchants move faster, not slow them down with complexity.</p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Trust</h3>
            <p className={styles.cardText}>Access control, live data, and transparent workflows should support every team.</p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Built for the way retail actually works</h2>
        <p className={styles.sectionText}>
          Vendora combines point of sale, inventory, customers, locations, and analytics so teams can work from one
          shared source of truth instead of juggling separate tools.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Want to see the product?</h2>
        <div className={styles.actions}>
          <Link href="/login?mode=register" className={styles.primaryAction}>
            Create an account
          </Link>
          <Link href="/#contact" className={styles.secondaryAction}>
            Contact us
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
