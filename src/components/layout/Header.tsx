'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
          <Link href="/#business-types" className={styles.link}>Business types</Link>
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
            <Link href="/#business-types" className={styles.mobileLink} onClick={toggleMobileMenu}>Business types</Link>
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
