'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BUSINESS_CATEGORIES, BUSINESS_HIGHLIGHTS, getBusinessCategory } from '@/lib/business/businessTypes';
import styles from './page.module.css';

const benefits = [
  {
    title: 'POS built for speed',
    text: 'Sell fast from phone, tablet, or desktop.',
    icon: '01',
  },
  {
    title: 'Inventory that stays clear',
    text: 'Track stock and reorder before it runs out.',
    icon: '02',
  },
  {
    title: 'AI that explains the business',
    text: 'See what changed and what to do next.',
    icon: '03',
  },
];

const productSections = [
  {
    title: 'Point of Sale',
    text: 'Sell fast from any device.',
    detail: 'Fast orders, discounts, and receipts.',
  },
  {
    title: 'Inventory management',
    text: 'See stock, movement, and what to reorder.',
    detail: 'Counts, low-stock alerts, and branch visibility.',
  },
  {
    title: 'AI Business Advisor',
    text: 'Ask questions and get clear answers.',
    detail: 'Sales insights, forecasts, and recommendations.',
  },
  {
    title: 'Sales analytics',
    text: 'Track performance by day, item, and team.',
    detail: 'Reports owners can scan quickly.',
  },
  {
    title: 'Employee management',
    text: 'Give each team member the right access.',
    detail: 'Control for cashiers, supervisors, and managers.',
  },
  {
    title: 'CRM and loyalty',
    text: 'Keep customers coming back with loyalty tools.',
    detail: 'History, repeat visits, and promotions.',
  },
  {
    title: 'Multi-store management',
    text: 'Run multiple branches from one account.',
    detail: 'Per-location access and reporting.',
  },
];

const aiInsights = [
  'Sales increased 23% because beverages sold well.',
  'You may run out of Coca-Cola in 4 days.',
  'Friday sales are usually higher.',
  'Profit margin is falling this month.',
  'John gives more discounts than the rest of the team.',
  'Consider increasing the price of Paracetamol by K2.',
];

const aiPrompts = [
  'How can I increase profits?',
  'Why are sales dropping?',
  'Which products should I discontinue?',
  'Predict next month’s sales.',
  'Suggest reorder quantities.',
  'Generate a monthly business review.',
];

const steps = [
  {
    title: 'Set up your business',
    text: 'Create your workspace and add locations.',
  },
  {
    title: 'Load your products',
    text: 'Add products, prices, and stock.',
  },
  {
    title: 'Start selling live',
    text: 'Start selling and track results.',
  },
];

const audiences = [
  {
    title: 'Owners',
    text: 'See the whole business in one place.',
  },
  {
    title: 'Store managers',
    text: 'Run daily work with clear visibility.',
  },
  {
    title: 'Cashiers',
    text: 'Use a checkout flow that is fast and simple.',
  },
  {
    title: 'Multi-location teams',
    text: 'Keep branches aligned and visible.',
  },
];

const faqItems = [
  {
    question: 'Who is Vendora built for?',
    answer:
      'Vendora is for merchants managing sales, stock, customers, and locations.',
  },
  {
    question: 'Can I use it across multiple branches?',
    answer:
      'Yes. Vendora supports multiple branches with branch-level analytics.',
  },
  {
    question: 'How do teams get access?',
    answer:
      'Create roles and permissions for each user.',
  },
  {
    question: 'What is the fastest way to get started?',
    answer:
      'Create an account, add products, and start using the dashboard.',
  },
];

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedBusinessCategory, setSelectedBusinessCategory] = useState(BUSINESS_CATEGORIES[0].value);
  const activeBusinessCategory = getBusinessCategory(selectedBusinessCategory);
  const activeBusinessHighlights = BUSINESS_HIGHLIGHTS[activeBusinessCategory.value] ?? BUSINESS_HIGHLIGHTS.other;

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
            <span className={styles.kicker}>The all-in-one OS for growing businesses</span>
            <h1 className={styles.title}>
              Sell faster with fewer stock surprises.
            </h1>
            <p className={styles.subtitle}>
              Keep checkout moving and stock visible from one place.
            </p>
            <div className={styles.heroOutcomeStrip}>
              <span className={styles.heroOutcomeLabel}>Merchant outcome</span>
              <strong className={styles.heroOutcomeValue}>Faster sales. Clear stock. Calm operations.</strong>
            </div>
            <div className={`${styles.ctaGroup} ${styles.dualCtaGroup}`}>
              <Link href="/signup" className={styles.primaryButton}>
                Start free trial
              </Link>
              <Link href="/login" className={styles.secondaryButton}>
                Sign in
              </Link>
            </div>
          </div>

          <div className={styles.heroImage}>
            <div className={styles.heroVisualFrame}>
              <div className={styles.heroVisualBadge}>Real merchant outcome</div>
              <div className={styles.heroVisualCopy}>
                <strong>Sell more with less guesswork.</strong>
                <span>Fast checkout, clear stock, better decisions.</span>
              </div>
              <div className={styles.heroPhotoWrap}>
                <Image
                  src="/images/landing-hero-outcome.png"
                  alt="Merchant confidently serving customers in a modern, well-stocked shop"
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 560px"
                  className={styles.heroPhoto}
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="features">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>The Vendora Advantage</span>
            <h2 className={styles.sectionTitle}>Tools for smoother operations.</h2>
            <p className={styles.sectionSubtitle}>
              Vendora brings the selling tools, analytics, and AI guidance into one system so the platform feels
              useful from day one.
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

        <section className={styles.section} id="products">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Products</span>
            <h2 className={styles.sectionTitle}>What Vendora helps you do.</h2>
            <p className={styles.sectionSubtitle}>
              A quick look at what the platform helps you do.
            </p>
          </div>

          <div className={styles.productGrid}>
            {productSections.map((item) => (
              <article key={item.title} className={styles.productCard}>
                <h3 className={styles.productTitle}>{item.title}</h3>
                <p className={styles.productText}>{item.text}</p>
                <p className={styles.productDetail}>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} id="business-types">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Business types</span>
            <h2 className={styles.sectionTitle}>Pick your business type.</h2>
            <p className={styles.sectionSubtitle}>
              Vendora can shape the setup around what you sell, whether you run a shop, restaurant, clinic, or service
              business.
            </p>
          </div>

          <div className={styles.businessTypeShell}>
            <div className={styles.businessTypeTabs}>
              {BUSINESS_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  className={`${styles.businessTypeTab} ${selectedBusinessCategory === category.value ? styles.businessTypeTabActive : ''}`}
                  onClick={() => setSelectedBusinessCategory(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className={styles.businessTypePanel}>
              <div className={styles.businessTypePanelHeader}>
                <div>
                  <span className={styles.sectionEyebrow}>Recommended for</span>
                  <h3 className={styles.businessTypePanelTitle}>{activeBusinessCategory.label}</h3>
                  <p className={styles.businessTypePanelText}>{activeBusinessCategory.description}</p>
                </div>
                <div className={styles.businessTypeBadge}>
                  <span>Category</span>
                  <strong>{activeBusinessCategory.label}</strong>
                </div>
              </div>

              <div className={styles.businessTypeList}>
                {activeBusinessCategory.types.map((type) => (
                  <span key={type} className={styles.businessTypeChip}>
                    {type}
                  </span>
                ))}
              </div>

              <div className={styles.businessTypeHighlights}>
                {activeBusinessHighlights.map((highlight) => (
                  <div key={highlight} className={styles.businessTypeHighlightCard}>
                    <span className={styles.businessTypeHighlightLabel}>Built for this type</span>
                    <strong>{highlight}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="ai-advisor">
          <div className={styles.analyticsBanner}>
            <div className={styles.analyticsCopy}>
              <span className={styles.sectionEyebrow}>AI Dashboard</span>
              <h2 className={styles.sectionTitle}>Meet your AI co-pilot.</h2>
              <p className={styles.sectionSubtitle}>
                See sales trends, forecasts, and next steps in real time.
              </p>
            </div>

            <div className={styles.analyticsColumns}>
              <article className={styles.analyticsCard}>
                <h3 className={styles.analyticsCardTitle}>Insights</h3>
                <ul className={styles.analyticsList}>
                  {aiInsights.map((insight) => (
                    <li key={insight} className={styles.analyticsItem}>{insight}</li>
                  ))}
                </ul>
              </article>

              <article className={styles.analyticsCard}>
                <h3 className={styles.analyticsCardTitle}>Questions owners can ask</h3>
                <ul className={styles.analyticsList}>
                  {aiPrompts.map((prompt) => (
                    <li key={prompt} className={styles.analyticsItem}>{prompt}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.splitLayout}>
            <div className={styles.splitPanel}>
              <span className={styles.sectionEyebrow}>How it works</span>
              <h2 className={styles.sectionTitle}>From setup to selling.</h2>
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
              <h2 className={styles.sectionTitle}>Built for every team.</h2>
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
            <h2 className={styles.sectionTitle}>Simple pricing.</h2>
            <p className={styles.sectionSubtitle}>
              Start with a trial, then pick the right plan.
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
              <p className={styles.tierDesc}>For single-location merchants.</p>
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
              <p className={styles.tierDesc}>For growing multi-branch businesses.</p>
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
              <p className={styles.tierDesc}>For larger teams with custom needs.</p>
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
              <h2 className={styles.sectionTitle}>Give your team one place to work.</h2>
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
            <h2 className={styles.sectionTitle}>Common questions.</h2>
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
            <h2 className={styles.sectionTitle}>Ready to try Vendora?</h2>
            <p className={styles.sectionSubtitle}>
              Start a trial and explore the flow.
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







