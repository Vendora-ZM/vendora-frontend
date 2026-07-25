'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/Button';
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
            width={140}
            height={40}
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className={styles.navDesktop}>
          <Link href="/#features" className={styles.link}>Features</Link>
          <Link href="/#pricing" className={styles.link}>Pricing</Link>
          <Link href="/#contact" className={styles.link}>Contact</Link>
        </nav>
        
        {/* Desktop Actions */}
        <div className={styles.actionsDesktop}>
          <Link href="/login">
            <Button variant="outline" size="sm">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">Get Started</Button>
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
            <Link href="/#pricing" className={styles.mobileLink} onClick={toggleMobileMenu}>Pricing</Link>
            <Link href="/#contact" className={styles.mobileLink} onClick={toggleMobileMenu}>Contact</Link>
          </nav>
          <div className={styles.actionsMobile}>
            <Link href="/login" onClick={toggleMobileMenu} style={{ width: '100%' }}>
              <Button variant="outline" style={{ width: '100%' }}>Login</Button>
            </Link>
            <Link href="/signup" onClick={toggleMobileMenu} style={{ width: '100%' }}>
              <Button variant="primary" style={{ width: '100%' }}>Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
