import Link from 'next/link';
import { PublicPageShell } from '@/components/marketing/PublicPageShell';
import styles from '@/components/marketing/PublicPageShell.module.css';

export default function SignupPage() {
  return (
    <PublicPageShell
      eyebrow="Start here"
      title="Turn interest into your first live sales workspace."
      intro="Create your account, set up your business, and get a clean path into Vendora’s dashboard. The signup flow is designed to get teams selling quickly instead of making them wade through setup noise."
      actions={[
        { href: '/login?mode=register', label: 'Create your account', primary: true },
        { href: '/login', label: 'I already have an account' },
      ]}
    >
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What happens after you sign up</h2>
        <div className={styles.cardGrid}>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>1. Create the business</h3>
            <p className={styles.cardText}>Add your business name and basic details to create your workspace.</p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>2. Add products and locations</h3>
            <p className={styles.cardText}>Load inventory, create branches, and assign the right access to your team.</p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>3. Start working live</h3>
            <p className={styles.cardText}>Move from setup to checkout, reporting, and management in one flow.</p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>4. Keep growing</h3>
            <p className={styles.cardText}>Use live dashboards and location analytics to guide the next decision.</p>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why merchants start with Vendora</h2>
        <ul className={styles.bulletList}>
          <li className={styles.bulletItem}>A focused checkout flow that is easy for staff to learn.</li>
          <li className={styles.bulletItem}>Inventory, sales, and customer information in one system.</li>
          <li className={styles.bulletItem}>Role-based access so owners and teams see the right tools.</li>
          <li className={styles.bulletItem}>Multiple locations managed from a single dashboard.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Ready to begin?</h2>
        <p className={styles.sectionText}>
          If you are evaluating Vendora for your store, the fastest way to understand the platform is to create the
          business, explore the dashboard, and see how the workflows feel from the inside.
        </p>
        <div className={styles.actions}>
          <Link href="/login?mode=register" className={styles.primaryAction}>
            Get started now
          </Link>
          <Link href="/#pricing" className={styles.secondaryAction}>
            View pricing
          </Link>
        </div>
      </section>
    </PublicPageShell>
  );
}
