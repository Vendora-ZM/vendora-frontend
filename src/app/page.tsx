'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BUSINESS_CATEGORIES, BUSINESS_HIGHLIGHTS, getBusinessCategory } from '@/lib/business/businessTypes';
import styles from './page.module.css';

const benefits = [
  {
    title: 'POS built for speed',
    text: 'Sell from a smartphone, tablet, or computer with a checkout flow that keeps the line moving.',
    icon: '01',
  },
  {
    title: 'Inventory that stays clear',
    text: 'Track stock across products, locations, and transfers so you can reorder before you run out.',
    icon: '02',
  },
  {
    title: 'AI that explains the business',
    text: 'See why sales changed, what may run out next, and what action to take before the week ends.',
    icon: '03',
  },
];

const productSections = [
  {
    title: 'Point of Sale',
    text: 'Sell from a smartphone, tablet, or computer with a clean checkout flow that works for busy counters.',
    detail: 'Fast orders, quick discounts, receipts, and easy staff handoff.',
  },
  {
    title: 'Inventory management',
    text: 'Keep tabs on what is in stock, what moved, and what needs to be reordered next.',
    detail: 'Simple stock counts, low stock alerts, and branch-aware stock visibility.',
  },
  {
    title: 'AI Business Advisor',
    text: 'Ask questions in plain language and get useful explanations instead of just numbers.',
    detail: 'Sales explanations, demand forecasts, cash flow signals, and smart recommendations.',
  },
  {
    title: 'Sales analytics',
    text: 'Understand performance by day, item, category, employee, and payment method.',
    detail: 'Clear reports that help owners see what is happening at a glance.',
  },
  {
    title: 'Employee management',
    text: 'Assign roles, permissions, and PIN access so each team member sees the right tools.',
    detail: 'Better control for cashiers, supervisors, and managers.',
  },
  {
    title: 'CRM and loyalty',
    text: 'Keep customers coming back with saved profiles, loyalty, and discount-aware workflows.',
    detail: 'Customer history, repeat visits, and promotions in one place.',
  },
  {
    title: 'Multi-store management',
    text: 'Run several branches from one account while still keeping each location distinct.',
    detail: 'Location-level access, reporting, and operational control.',
  },
];

const productHighlights = [
  'Fast checkout on mobile, tablet, and desktop',
  'Live stock visibility before products run out',
  'Simple role-based access for every team',
  'Reports that owners can actually read quickly',
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

            <div className={styles.heroStats}>
              {productHighlights.map((item) => (
                <div key={item} className={styles.heroStat}>
                  <span className={styles.heroStatLabel}>Why it matters</span>
                  <strong className={styles.heroStatValue}>{item}</strong>
                </div>
              ))}
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
            <h2 className={styles.sectionTitle}>What Vendora helps merchants do.</h2>
            <p className={styles.sectionSubtitle}>
              A quick breakdown of the platform, written in simple words so buyers can see the value before sign-up.
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
            <h2 className={styles.sectionTitle}>Pick a category, then choose a more specific business type.</h2>
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
              <h2 className={styles.sectionTitle}>ChatGPT-style advice inside your POS.</h2>
              <p className={styles.sectionSubtitle}>
                Vendora should not just show charts. It should explain what happened, what may happen next, and what
                the owner should do about it.
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
