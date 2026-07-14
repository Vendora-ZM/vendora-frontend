"use client";

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Animated background shapes from login design */}
        <div className={styles.backgroundShapes}>
          <div className={styles.shape1}></div>
          <div className={styles.shape2}></div>
          <div className={styles.shape3}></div>
        </div>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Stay in control.<br />
              <span className={styles.highlight}>Grow your business.</span>
            </h1>
            <p className={styles.subtitle}>
              The ultimate platform for merchants to manage, scale, and optimize their online presence. Join Vendora Technologies today.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/login" passHref legacyBehavior>
                <Button variant="primary" size="lg" style={{ background: 'var(--gradient-orange)', border: 'none' }}>
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login" passHref legacyBehavior>
                <Button variant="outline" size="lg" style={{ color: 'var(--color-white)', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          
          <div className={styles.heroImage}>
            {/* Glassmorphic Dashboard Mockup */}
            <div className={styles.mockup}>
              <div className={styles.mockupHeader}>
                <div className={styles.mockupDot} style={{ background: '#ff5f56' }} />
                <div className={styles.mockupDot} style={{ background: '#ffbd2e' }} />
                <div className={styles.mockupDot} style={{ background: '#27c93f' }} />
              </div>
              <div className={styles.mockupBody}>
                <div className={styles.mockupSidebar} />
                <div className={styles.mockupContent}>
                  <div className={styles.mockupCard}>
                    <div className={styles.mockupLine}></div>
                    <div className={`${styles.mockupLine} ${styles.short}`}></div>
                  </div>
                  <div className={styles.mockupCard}>
                    <div className={styles.mockupLine}></div>
                  </div>
                  <div className={styles.mockupCard} style={{ flexBasis: '100%', height: '120px' }}>
                    <div className={styles.mockupLine}></div>
                    <div className={`${styles.mockupLine} ${styles.short}`}></div>
                    <div className={styles.mockupLine}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Vendora Section */}
        <section className={styles.section} id="features">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Vendora?</h2>
            <p className={styles.sectionSubtitle}>
              Traditional POS systems just record sales. Vendora turns every transaction into actionable business intelligence.
            </p>
          </div>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
              </div>
              <h3 className={styles.cardTitle}>Stop the Leaks</h3>
              <p className={styles.cardDescription}>
                Eliminate manual stock counting and unknown inventory losses. Know exactly what's leaving your store.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <h3 className={styles.cardTitle}>Real-time Visibility</h3>
              <p className={styles.cardDescription}>
                Every sale, purchase, and employee action updates your inventory and analytics instantly.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              </div>
              <h3 className={styles.cardTitle}>Smarter Decisions</h3>
              <p className={styles.cardDescription}>
                Understand profit margins, purchase planning, and cashier performance without breaking a sweat.
              </p>
            </div>
          </div>
        </section>

        {/* Core Modules Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Everything You Need</h2>
            <p className={styles.sectionSubtitle}>
              A comprehensive suite of modules designed to be the operating system for your business.
            </p>
          </div>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              </div>
              <h3 className={styles.cardTitle}>Smart POS</h3>
              <p className={styles.cardDescription}>
                Lightning-fast interface with offline support, barcode scanning, split payments, and laybys.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <h3 className={styles.cardTitle}>Inventory Engine</h3>
              <p className={styles.cardDescription}>
                Track stock across multiple branches. Every movement creates an immutable audit trail.
              </p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              </div>
              <h3 className={styles.cardTitle}>Purchasing</h3>
              <p className={styles.cardDescription}>
                Manage suppliers, automate reorders, and track lead times to never run out of stock.
              </p>
            </div>
          </div>
        </section>

        {/* Target Customers */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built for Your Scale</h2>
            <p className={styles.sectionSubtitle}>
              Whether you're running a single boutique or a multi-branch supermarket, Vendora adapts to you.
            </p>
          </div>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              </div>
              <h3 className={styles.cardTitle}>Small Businesses</h3>
              <p className={styles.cardDescription}>Perfect for grocery stores, mini marts, and boutiques looking to digitize their operations.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
              </div>
              <h3 className={styles.cardTitle}>Medium Businesses</h3>
              <p className={styles.cardDescription}>Ideal for hardware stores, pharmacies, and wholesalers requiring robust inventory tracking.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 22 17 2 7 2 7 22"></polyline><path d="M7 22h10"></path></svg>
              </div>
              <h3 className={styles.cardTitle}>Large Businesses</h3>
              <p className={styles.cardDescription}>Enterprise features for multi-branch supermarkets, restaurant chains, and distributors.</p>
            </div>
          </div>
        </section>

        {/* Analytics Differentiator */}
        <section className={styles.section}>
          <div className={styles.analyticsSection}>
            <h2 className={styles.sectionTitle}>Intelligence, Not Just Reports</h2>
            <p className={styles.sectionSubtitle} style={{ marginBottom: '32px' }}>
              Vendora doesn't just show you charts. It analyzes your data and tells you what's happening and what to do next.
            </p>
            
            <div className={styles.insightCard}>
              <div className={styles.insightIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.6.8 3.1 2.5 4.5.76.76 1.23 1.52 1.41 2.5"></path></svg>
              </div>
              <div>
                <strong>Insight:</strong> Revenue increased by 18% this week due to beverage sales.
              </div>
            </div>
            
            <div className={styles.insightCard}>
              <div className={styles.insightIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff5f56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <div>
                <strong>Alert:</strong> Cooking oil sales are expected to run out in 4 days. Reorder suggested.
              </div>
            </div>
            
            <div className={styles.insightCard}>
              <div className={styles.insightIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#27c93f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              </div>
              <div>
                <strong>Opportunity:</strong> Customers buying sugar usually buy milk. Consider a bundle promotion.
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className={styles.section} id="pricing">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
            <p className={styles.sectionSubtitle}>
              Start with a <strong>30-day free trial</strong>. No credit card required. Take your time to add products, learn the system, make sales, and trust the platform.
            </p>
          </div>

          <div className={styles.pricingToggle}>
            <span className={`${styles.toggleLabel} ${!isYearly ? styles.active : ''}`} onClick={() => setIsYearly(false)}>Monthly</span>
            <div className={`${styles.toggleSwitch} ${isYearly ? styles.toggled : ''}`} onClick={() => setIsYearly(!isYearly)}>
              <div className={styles.toggleKnob}></div>
            </div>
            <span className={`${styles.toggleLabel} ${isYearly ? styles.active : ''}`} onClick={() => setIsYearly(true)}>
              Yearly <span className={styles.discountBadge}>2 Months Free</span>
            </span>
          </div>

          <div className={styles.pricingGrid}>
            {/* Starter Plan */}
            <div className={styles.pricingCard}>
              <h3 className={styles.tierName}>Starter</h3>
              <div className={styles.tierPrice}>
                <span className={styles.priceCurrency}>K</span>
                {isYearly ? '999' : '99'}
                <span className={styles.pricePeriod}>/{isYearly ? 'year' : 'month'}</span>
              </div>
              <p className={styles.tierDesc}>Perfect for single stores looking to digitize.</p>
              
              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  1 Store
                </li>
                <li className={styles.featureItem}>
                  <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  2 Users
                </li>
                <li className={styles.featureItem}>
                  <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Basic Reports
                </li>
              </ul>
              
              <Link href="/login" passHref legacyBehavior>
                <Button variant="outline" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>Start Free Trial</Button>
              </Link>
            </div>

            {/* Business Plan */}
            <div className={`${styles.pricingCard} ${styles.popular}`}>
              <div className={styles.popularBadge}>Most Popular</div>
              <h3 className={styles.tierName}>Business</h3>
              <div className={styles.tierPrice}>
                <span className={styles.priceCurrency}>K</span>
                {isYearly ? '1,990' : '199'}
                <span className={styles.pricePeriod}>/{isYearly ? 'year' : 'month'}</span>
              </div>
              <p className={styles.tierDesc}>For growing businesses with multiple locations.</p>
              
              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Up to 5 Stores
                </li>
                <li className={styles.featureItem}>
                  <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  20 Users
                </li>
                <li className={styles.featureItem}>
                  <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Advanced Reports
                </li>
              </ul>
              
              <Link href="/login" passHref legacyBehavior>
                <Button variant="primary" style={{ width: '100%', background: 'var(--gradient-orange)', border: 'none' }}>Start Free Trial</Button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className={styles.pricingCard}>
              <h3 className={styles.tierName}>Enterprise</h3>
              <div className={styles.tierPrice}>
                Custom
              </div>
              <p className={styles.tierDesc}>Tailored solutions for large-scale operations.</p>
              
              <ul className={styles.featureList}>
                <li className={styles.featureItem}>
                  <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Unlimited Stores
                </li>
                <li className={styles.featureItem}>
                  <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Unlimited Users
                </li>
                <li className={styles.featureItem}>
                  <svg className={styles.featureIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  API Access
                </li>
              </ul>
              
              <Link href="#contact" passHref legacyBehavior>
                <Button variant="outline" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>Contact Sales</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className={styles.section} style={{ paddingBottom: 0 }}>
          <div className={styles.ctaSection}>
            <h2 className={styles.sectionTitle}>Ready to take control?</h2>
            <p className={styles.sectionSubtitle} style={{ marginBottom: '32px' }}>
              Join hundreds of merchants who use Vendora as their business operating system.
            </p>
            <div className={styles.ctaGroup} style={{ justifyContent: 'center' }}>
              <Link href="/login" passHref legacyBehavior>
                <Button variant="primary" size="lg" style={{ background: 'var(--gradient-orange)', border: 'none' }}>
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
