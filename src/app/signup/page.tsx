'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PublicPageShell } from '@/components/marketing/PublicPageShell';
import styles from '@/components/marketing/PublicPageShell.module.css';

type BusinessCategory = {
  label: string;
  value: string;
  types: string[];
  description: string;
};

const businessCategories: BusinessCategory[] = [
  {
    label: 'Retail & Commerce',
    value: 'retail-commerce',
    description: 'For merchants who sell products in-store, online, or both.',
    types: [
      'Retail Store',
      'Supermarket',
      'Online Store',
      'Boutique / Fashion Store',
      'Shoe Store',
      'Electronics Store',
      'Furniture Store',
      'Home & Kitchen Store',
      'Hardware Store',
      'Building Materials Store',
      'Bookstore',
      'Gift Shop',
      'Toy Store',
      'Jewelry Store',
      'Cosmetics & Beauty Store',
      'Florist',
      'Stationery Store',
      'Sports & Fitness Store',
      'Wholesale Store',
    ],
  },
  {
    label: 'Food & Beverage',
    value: 'food-beverage',
    description: 'For businesses serving meals, drinks, and baked goods.',
    types: ['Restaurant', 'Fast Food Restaurant', 'Café', 'Bakery', 'Bar and Pub', 'Butchery'],
  },
  {
    label: 'Pharmacy & Healthcare',
    value: 'pharmacy-healthcare',
    description: 'For pharmacies, clinics, and medical supply businesses.',
    types: [
      'Pharmacy',
      'Clinic and Hospital',
      'Agro - Veterinary Store',
      'Optical Shop',
      'Laboratory',
      'Physiotherapy Centre',
      'Gym and Wellness Centre',
      'Medical Supplies Store',
    ],
  },
  {
    label: 'Beauty & Personal Care',
    value: 'beauty-personal-care',
    description: 'For appointment-based service providers and personal grooming shops.',
    types: ['Salon', 'Barbershop', 'Spa', 'Nail Studio', 'Tattoo Studio'],
  },
  {
    label: 'Services',
    value: 'services',
    description: 'For businesses that sell labour, repairs, or delivery services.',
    types: [
      'Laundry',
      'Dry Cleaning',
      'Car Wash',
      'Auto Repair Garage',
      'Printing Shop',
      'Photography Studio',
      'Courier Service',
      'Cleaning Services',
      'Repair Shop',
      'Tailoring Shop',
    ],
  },
  {
    label: 'Hospitality',
    value: 'hospitality',
    description: 'For accommodation and guest services.',
    types: ['Hotel', 'Motel', 'Lodge', 'Guest House', 'Resort', 'Hostel', 'Airbnb Property / House for Rent'],
  },
  {
    label: 'Entertainment',
    value: 'entertainment',
    description: 'For venues and entertainment-focused operations.',
    types: ['Cinema', 'Gaming Centre', 'Event Centre'],
  },
  {
    label: 'Manufacturing',
    value: 'manufacturing',
    description: 'For businesses that make goods in-house.',
    types: [
      'Manufacturing Company',
      'Food Processing',
      'Beverage Manufacturing',
      'Textile Manufacturing',
      'Furniture Manufacturing',
      'Pharmaceutical Manufacturing',
    ],
  },
  {
    label: 'Automotive',
    value: 'automotive',
    description: 'For dealerships, parts shops, and fuel stations.',
    types: ['Car Dealership', 'Spare Parts Store', 'Fuel Station', 'Auto Accessories Store'],
  },
  {
    label: 'Education',
    value: 'education',
    description: 'For schools, colleges, and training providers.',
    types: ['School', 'University / College', 'Training Centre'],
  },
  {
    label: 'Professional Services',
    value: 'professional-services',
    description: 'For firms that sell specialist knowledge and advisory work.',
    types: ['Accounting Firm', 'Law Firm', 'Consulting Firm', 'Marketing Agency', 'Software Company'],
  },
  {
    label: 'Religious & Non-Profit Organizations',
    value: 'non-profit',
    description: 'For organizations serving communities and causes.',
    types: ['Religious Bookshop', 'NGO', 'Charity', 'Foundation'],
  },
  {
    label: 'Other',
    value: 'other',
    description: 'For a custom business type not listed above.',
    types: ['Other (Custom Business Type)'],
  },
];

const businessHighlights: Record<string, string[]> = {
  'retail-commerce': ['Barcode-friendly checkout', 'Stock control', 'Branch management'],
  'food-beverage': ['Table service', 'Modifiers', 'Kitchen-friendly sales'],
  'pharmacy-healthcare': ['Expiry-aware inventory', 'Dose-sensitive selling', 'Controlled access'],
  'beauty-personal-care': ['Appointments', 'Customer profiles', 'Staff commissions'],
  services: ['Bookings', 'Service line items', 'Team permissions'],
  hospitality: ['Room or property sales', 'Multi-location views', 'Guest-ready receipts'],
  entertainment: ['Event sales', 'Fast payments', 'Attendance-aware workflows'],
  manufacturing: ['Production tracking', 'Bulk materials', 'Warehouse control'],
  automotive: ['Parts catalog', 'Quick lookup', 'Branch inventory'],
  education: ['Student-oriented sales', 'Membership options', 'Team access'],
  'professional-services': ['Client records', 'Professional billing', 'Simple receipts'],
  'non-profit': ['Donation tracking', 'Member records', 'Simple admin tools'],
  other: ['Custom setup', 'Flexible fields', 'General POS workflows'],
};

export default function SignupPage() {
  const [selectedCategory, setSelectedCategory] = useState(businessCategories[0].value);
  const [selectedType, setSelectedType] = useState(businessCategories[0].types[0]);
  const category = useMemo(
    () => businessCategories.find((entry) => entry.value === selectedCategory) ?? businessCategories[0],
    [selectedCategory]
  );
  const highlightPills = businessHighlights[category.value] ?? businessHighlights.other;

  const handleCategoryChange = (value: string) => {
    const nextCategory = businessCategories.find((entry) => entry.value === value) ?? businessCategories[0];
    setSelectedCategory(nextCategory.value);
    setSelectedType(nextCategory.types[0]);
  };

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
        <h2 className={styles.sectionTitle}>Choose your business type</h2>
        <p className={styles.sectionText}>
          Start with the category that best matches the business you run. Vendora can then surface the right tools
          faster, instead of making every business feel the same.
        </p>

        <div className={styles.selectorGrid}>
          <article className={styles.selectorPanel}>
            <div className={styles.selectorFields}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="categorySelect">Business category</label>
                <select
                  id="categorySelect"
                  className={styles.selectField}
                  value={selectedCategory}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                >
                  {businessCategories.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="typeSelect">Business type</label>
                <select
                  id="typeSelect"
                  className={styles.selectField}
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                >
                  {category.types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <p className={styles.fieldHint}>More specific options appear after you choose a category.</p>
              </div>
            </div>

            <div className={styles.selectorNotes}>
              <span className={styles.noteBadge}>Recommended for</span>
              <p className={styles.selectorText}>{category.description}</p>
            </div>
          </article>

          <article className={styles.selectorSummary}>
            <h3 className={styles.selectorSummaryTitle}>{category.label}</h3>
            <p className={styles.selectorSummaryType}>{selectedType}</p>
            <div className={styles.selectorPills}>
              {highlightPills.map((pill) => (
                <span key={pill} className={styles.selectorPill}>
                  {pill}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

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
