'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BUSINESS_CATEGORIES, getBusinessCategory } from '@/lib/business/businessTypes';
import styles from './Header.module.css';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBusinessTypesOpen, setIsBusinessTypesOpen] = useState(false);
  const [selectedBusinessTypeCategory, setSelectedBusinessTypeCategory] = useState(BUSINESS_CATEGORIES[0].value);

  const activeBusinessCategory = useMemo(
    () => getBusinessCategory(selectedBusinessTypeCategory),
    [selectedBusinessTypeCategory]
  );
  const activeBusinessHighlights = useMemo(
    () => activeBusinessCategory.types.slice(0, 6),
    [activeBusinessCategory.types]
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsBusinessTypesOpen(false);
  };

  const toggleBusinessTypes = () => {
    setIsBusinessTypesOpen((open) => !open);
    setIsMobileMenuOpen(false);
  };

  const chooseBusinessCategory = (value: string) => {
    setSelectedBusinessTypeCategory(value);
    setIsBusinessTypesOpen(true);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logos/vendora_logo_white_background.png"
            alt="Vendora"
            width={340}
            height={100}
            className={styles.logoImage}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className={styles.navDesktop}>
          <Link href="/#features" className={styles.link}>Features</Link>
          <Link href="/#products" className={styles.link}>Products</Link>
          <div className={styles.dropdownWrap}>
            <button
              type="button"
              className={`${styles.link} ${styles.dropdownButton} ${isBusinessTypesOpen ? styles.dropdownButtonActive : ''}`}
              onClick={toggleBusinessTypes}
              aria-expanded={isBusinessTypesOpen}
              aria-haspopup="true"
            >
              Business types
            </button>

            {isBusinessTypesOpen && (
              <div className={styles.dropdownPanel}>
                <div className={styles.dropdownPanelHeader}>
                  <div>
                    <span className={styles.dropdownEyebrow}>Recommended business types</span>
                    <h3 className={styles.dropdownTitle}>{activeBusinessCategory.label}</h3>
                    <p className={styles.dropdownText}>{activeBusinessCategory.description}</p>
                  </div>
                  <Link href="/signup" className={styles.dropdownCta} onClick={() => setIsBusinessTypesOpen(false)}>
                    Start with this type
                  </Link>
                </div>

                <div className={styles.dropdownLayout}>
                  <div className={styles.dropdownCategoryList}>
                    {BUSINESS_CATEGORIES.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        className={`${styles.dropdownCategoryButton} ${selectedBusinessTypeCategory === category.value ? styles.dropdownCategoryButtonActive : ''}`}
                        onClick={() => chooseBusinessCategory(category.value)}
                      >
                        <strong>{category.label}</strong>
                        <span>{category.types.length} options</span>
                      </button>
                    ))}
                  </div>

                  <div className={styles.dropdownTypeList}>
                    {activeBusinessCategory.types.map((type) => (
                      <span key={type} className={styles.dropdownTypeChip}>
                        {type}
                      </span>
                    ))}
                    <div className={styles.dropdownHighlightRow}>
                      {activeBusinessHighlights.map((item) => (
                        <div key={item} className={styles.dropdownHighlightCard}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link href="/#ai-advisor" className={styles.link}>AI Advisor</Link>
          <Link href="/#pricing" className={styles.link}>Pricing</Link>
          <Link href="/#contact" className={styles.link}>Contact</Link>
        </nav>
        
        {/* Desktop Actions */}
        <div className={styles.actionsDesktop}>
          <Link href="/login" className={`${styles.actionLink} ${styles.outlineAction}`}>
            Login
          </Link>
          <Link href="/signup" className={`${styles.actionLink} ${styles.primaryAction}`}>
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          className={styles.mobileMenuBtn} 
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.navMobile}>
            <Link href="/#features" className={styles.mobileLink} onClick={toggleMobileMenu}>Features</Link>
            <Link href="/#products" className={styles.mobileLink} onClick={toggleMobileMenu}>Products</Link>
            <button
              type="button"
              className={styles.mobileLinkButton}
              onClick={() => setIsBusinessTypesOpen((open) => !open)}
            >
              Business types
            </button>
            {isBusinessTypesOpen && (
              <div className={styles.mobileDropdown}>
                <div className={styles.mobileDropdownHeader}>
                  <strong>{activeBusinessCategory.label}</strong>
                  <span>{activeBusinessCategory.description}</span>
                </div>
                <div className={styles.mobileDropdownChips}>
                  {activeBusinessCategory.types.map((type) => (
                    <span key={type} className={styles.mobileDropdownChip}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Link href="/#ai-advisor" className={styles.mobileLink} onClick={toggleMobileMenu}>AI Advisor</Link>
            <Link href="/#pricing" className={styles.mobileLink} onClick={toggleMobileMenu}>Pricing</Link>
            <Link href="/#contact" className={styles.mobileLink} onClick={toggleMobileMenu}>Contact</Link>
          </nav>
          <div className={styles.actionsMobile}>
            <Link href="/login" className={`${styles.actionLink} ${styles.outlineAction} ${styles.mobileAction}`} onClick={toggleMobileMenu}>
              Login
            </Link>
            <Link href="/signup" className={`${styles.actionLink} ${styles.primaryAction} ${styles.mobileAction}`} onClick={toggleMobileMenu}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
