'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import styles from './PublicPageShell.module.css';

type PageAction = {
  href: string;
  label: string;
  primary?: boolean;
};

type PublicPageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  actions?: PageAction[];
  children?: React.ReactNode;
};

export function PublicPageShell({ eyebrow, title, intro, actions = [], children }: PublicPageShellProps) {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.backgroundShapes} aria-hidden="true">
          <div className={styles.shape1} />
          <div className={styles.shape2} />
          <div className={styles.shape3} />
        </div>

        <nav className={styles.topNav} aria-label="Public navigation">
          <Link href="/" className={styles.topNavLink}>
            Home
          </Link>
          <Link href="/#features" className={styles.topNavLink}>
            Features
          </Link>
          <Link href="/#pricing" className={styles.topNavLink}>
            Pricing
          </Link>
          <Link href="/login" className={styles.topNavLink}>
            Login
          </Link>
        </nav>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.intro}>{intro}</p>

          {actions.length ? (
            <div className={styles.actions}>
              {actions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={action.primary ? styles.primaryAction : styles.secondaryAction}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        {children}
      </main>
      <Footer />
    </>
  );
}
