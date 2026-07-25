'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import styles from './page.module.css';

const benefits = [
  {
    title: 'Sell without friction',
    text: 'Give staff a clear checkout flow that keeps the line moving and reduces mistakes at the counter.',
    icon: '01',
  },
  {
    title: 'Stay stocked with confidence',
    text: 'Watch inventory move across products and locations so you can reorder before you run out.',
    icon: '02',
  },
  {
    title: 'Control access by role',
    text: 'Keep owners, managers, and cashiers focused on the tools and permissions they actually need.',
    icon: '03',
  },
];

const steps = [
  {
    title: 'Set up your business',
    text: 'Create your workspace, add locations, and define who can see what.',
  },
  {
    title: 'Load your products',
    text: 'Bring in your catalog, pricing, categories, and stock levels.',
  },
  {
    title: 'Start selling live',
    text: 'Use the POS, review sales, and track performance from the dashboard.',
  },
];

const audiences = [
  {
    title: 'Owners',
    text: 'Get a single view of the business without digging through separate systems.',
  },
  {
    title: 'Store managers',
    text: 'Run daily operations with clear visibility across sales, stock, and teams.',
  },
  {
    title: 'Cashiers',
    text: 'Move fast with a checkout flow that is simple to learn and easy to use.',
  },
  {
    title: 'Multi-location teams',
    text: 'Keep each branch aligned while still viewing the performance of the full business.',
  },
];

const faqItems = [
  {
    question: 'Who is Vendora built for?',
    answer:
      'Vendora is built for merchants who want to manage sales, stock, customers, and locations from one place.',
  },
  {
    question: 'Can I use it across multiple branches?',
    answer:
      'Yes. Vendora is designed to handle multiple locations with focused analytics for each branch.',
  },
  {
    question: 'How do teams get access?',
    answer:
      'You create roles and assign permissions so each user only sees the parts of the platform they should use.',
  },
  {
    question: 'What is the fastest way to get started?',
    answer:
      'Create an account, set up your business, add products, and begin using the dashboard right away.',
  },
];

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.backgroundShapes}>
          <div className={styles.shape1} />
          <div className={styles.shape2} />
          <div className={styles.shape3} />
        </div>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.kicker}>Built for stores, branches, and growing teams</span>
            <h1 className={styles.title}>
              Run sales, stock, and locations from one clear platform.
            </h1>
            <p className={styles.subtitle}>
              Vendora helps merchants sell faster, stay stocked, and manage teams with role-based access and live
              visibility across the business.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/signup" className={styles.primaryButton}>
                Start free trial
              </Link>
              <Link href="/login" className={styles.secondaryButton}>
                Sign in
              </Link>
            </div>
            <div className={styles.heroPills}>
              <span className={styles.heroPill}>Multi-location ready</span>
              <span className={styles.heroPill}>Role-based access</span>
              <span className={styles.heroPill}>Live inventory</span>
              <span className={styles.heroPill}>Fast checkout</span>
            </div>
          </div>

          <div className={styles.heroImage}>
            <div className={styles.mockup}>
              <div className={styles.mockupHeader}>
                <div className={styles.mockupDot} style={{ background: '#ff5f56' }} />
                <div className={styles.mockupDot} style={{ background: '#ffbd2e' }} />
                <div className={styles.mockupDot} style={{ background: '#27c93f' }} />
              </div>
              <div className={styles.mockupBody}>
                <div className={styles.mockupSidebar}>
                  <div className={styles.mockupLine} />
                  <div className={`${styles.mockupLine} ${styles.short}`} />
                  <div className={`${styles.mockupLine} ${styles.shorter}`} />
                </div>
                <div className={styles.mockupContent}>
                  <div className={styles.mockupCard}>
                    <strong>Sales today</strong>
                    <span>See the numbers that matter now.</span>
                  </div>
                  <div className={styles.mockupCard}>
                    <strong>Low stock alerts</strong>
                    <span>Know what to reorder before it runs out.</span>
                  </div>
                  <div className={styles.mockupCard}>
                    <strong>Branch access</strong>
                    <span>Give each team only what they need.</span>
                  </div>
                  <div className={styles.mockupCard}>
                    <strong>Top products</strong>
                    <span>Spot what is moving fastest across the business.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="features">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Why teams switch</span>
            <h2 className={styles.sectionTitle}>Less noise. More control. Better decisions.</h2>
            <p className={styles.sectionSubtitle}>
              The site should explain the product quickly, so we focus on the outcomes merchants care about most.
            </p>
          </div>

          <div className={styles.grid}>
            {benefits.map((benefit) => (
              <article key={benefit.title} className={styles.card}>
                <div className={styles.cardIcon}>{benefit.icon}</div>
                <h3 className={styles.cardTitle}>{benefit.title}</h3>
                <p className={styles.cardDescription}>{benefit.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.splitLayout}>
            <div className={styles.splitPanel}>
              <span className={styles.sectionEyebrow}>How it works</span>
              <h2 className={styles.sectionTitle}>A simple path from setup to live work.</h2>
              <div className={styles.stepList}>
                {steps.map((step, index) => (
                  <article key={step.title} className={styles.stepItem}>
                    <div className={styles.stepNumber}>{index + 1}</div>
                    <div className={styles.stepCopy}>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.splitPanel}>
              <span className={styles.sectionEyebrow}>Built for</span>
              <h2 className={styles.sectionTitle}>The people who keep the business moving.</h2>
              <div className={styles.cardGrid}>
                {audiences.map((audience) => (
                  <article key={audience.title} className={styles.miniCard}>
                    <h3 className={styles.cardTitle}>{audience.title}</h3>
                    <p className={styles.cardDescription}>{audience.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="pricing">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Pricing</span>
            <h2 className={styles.sectionTitle}>Simple pricing that is easy to explain.</h2>
            <p className={styles.sectionSubtitle}>
              Start with a trial, then choose the plan that matches the size of your operation.
            </p>
          </div>

          <div className={styles.pricingToggle}>
            <span className={`${styles.toggleLabel} ${!isYearly ? styles.active : ''}`} onClick={() => setIsYearly(false)}>
              Monthly
            </span>
            <div className={`${styles.toggleSwitch} ${isYearly ? styles.toggled : ''}`} onClick={() => setIsYearly(!isYearly)}>
              <div className={styles.toggleKnob} />
            </div>
            <span className={`${styles.toggleLabel} ${isYearly ? styles.active : ''}`} onClick={() => setIsYearly(true)}>
              Yearly <span className={styles.discountBadge}>2 months free</span>
            </span>
          </div>

          <div className={styles.pricingGrid}>
            <div className={styles.pricingCard}>
              <h3 className={styles.tierName}>Starter</h3>
              <div className={styles.tierPrice}>
                <span className={styles.priceCurrency}>K</span>
                {isYearly ? '999' : '99'}
                <span className={styles.pricePeriod}>/{isYearly ? 'year' : 'month'}</span>
              </div>
              <p className={styles.tierDesc}>For single-location merchants who want to get organized quickly.</p>
              <ul className={styles.featureList}>
                <li className={styles.featureItem}>1 store</li>
                <li className={styles.featureItem}>Essential POS and inventory tools</li>
                <li className={styles.featureItem}>Basic reporting</li>
              </ul>
              <Link href="/signup" className={styles.planButton}>
                Start free trial
              </Link>
            </div>

            <div className={`${styles.pricingCard} ${styles.popular}`}>
              <div className={styles.popularBadge}>Most popular</div>
              <h3 className={styles.tierName}>Growth</h3>
              <div className={styles.tierPrice}>
                <span className={styles.priceCurrency}>K</span>
                {isYearly ? '1,990' : '199'}
                <span className={styles.pricePeriod}>/{isYearly ? 'year' : 'month'}</span>
              </div>
              <p className={styles.tierDesc}>For businesses that are expanding into more than one branch.</p>
              <ul className={styles.featureList}>
                <li className={styles.featureItem}>Multiple locations</li>
                <li className={styles.featureItem}>Role-based access</li>
                <li className={styles.featureItem}>Advanced reporting</li>
              </ul>
              <Link href="/signup" className={styles.planButtonPrimary}>
                Start free trial
              </Link>
            </div>

            <div className={styles.pricingCard}>
              <h3 className={styles.tierName}>Enterprise</h3>
              <div className={styles.tierPrice}>Custom</div>
              <p className={styles.tierDesc}>For larger teams that need tailored workflows and rollout support.</p>
              <ul className={styles.featureList}>
                <li className={styles.featureItem}>Unlimited locations</li>
                <li className={styles.featureItem}>Custom access needs</li>
                <li className={styles.featureItem}>Priority onboarding</li>
              </ul>
              <Link href="/#contact" className={styles.planButton}>
                Contact sales
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section} id="contact">
          <div className={styles.contactStrip}>
            <div>
              <span className={styles.sectionEyebrow}>Ready to move faster?</span>
              <h2 className={styles.sectionTitle}>Give your team one place to sell and manage the business.</h2>
              <p className={styles.sectionSubtitle}>
                If you are evaluating Vendora, the fastest path is to create a workspace and explore the dashboard
                from the inside.
              </p>
            </div>
            <div className={styles.contactActions}>
              <Link href="/signup" className={styles.primaryButton}>
                Get started
              </Link>
              <Link href="/login" className={styles.secondaryButton}>
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Questions buyers ask</span>
            <h2 className={styles.sectionTitle}>Keep the page clear enough to decide.</h2>
          </div>
          <div className={styles.faqList}>
            {faqItems.map((item) => (
              <article key={item.question} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{item.question}</h3>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} style={{ paddingBottom: 0 }}>
          <div className={styles.ctaSection}>
            <h2 className={styles.sectionTitle}>Ready to see Vendora in action?</h2>
            <p className={styles.sectionSubtitle}>
              Start a trial, explore the flow, and let the platform show how it supports your business.
            </p>
            <div className={styles.ctaGroup} style={{ justifyContent: 'center' }}>
              <Link href="/signup" className={styles.primaryButton}>
                Start free trial
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
