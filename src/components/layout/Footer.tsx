import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Image
                src="/logos/vendora_logo_trans_background.png"
                alt="Vendora"
                width={140}
                height={40}
                style={{ objectFit: 'contain' }}
              />
            </Link>
            <p className={styles.description}>
              The ultimate platform for merchants to manage, scale, and optimize their online presence.
            </p>
          </div>
          
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Product</h3>
            <div className={styles.linkList}>
              <Link href="#features" className={styles.link}>Features</Link>
              <Link href="#pricing" className={styles.link}>Pricing</Link>
              <Link href="#integrations" className={styles.link}>Integrations</Link>
            </div>
          </div>
          
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Company</h3>
            <div className={styles.linkList}>
              <Link href="#about" className={styles.link}>About Us</Link>
              <Link href="#careers" className={styles.link}>Careers</Link>
              <Link href="#contact" className={styles.link}>Contact</Link>
            </div>
          </div>
          
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Resources</h3>
            <div className={styles.linkList}>
              <Link href="#blog" className={styles.link}>Blog</Link>
              <Link href="#help" className={styles.link}>Help Center</Link>
              <Link href="#community" className={styles.link}>Community</Link>
            </div>
          </div>
        </div>
        
        <div className={styles.bottomSection}>
          <p>&copy; {new Date().getFullYear()} Vendora Technologies. All rights reserved.</p>
          <div className={styles.legalLinks}>
            <Link href="#privacy" className={styles.legalLink}>Privacy Policy</Link>
            <Link href="#terms" className={styles.legalLink}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
