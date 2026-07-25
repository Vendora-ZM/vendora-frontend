'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardNotificationsMenu } from '@/components/layout/DashboardNotificationsMenu';
import { NetworkStatusBanner } from '@/components/layout/NetworkStatusBanner';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.mainContent}>
        <header className={styles.topHeader}>
          {/* Hamburger — only visible on mobile */}
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className={styles.search}>
            <input type="text" placeholder="Search..." className={styles.searchInput} />
          </div>

          <div className={styles.headerRight}>
            <div className={styles.profile}>
              <div className={styles.avatar}>M</div>
              <span className={styles.merchantName}>Merchant Store</span>
            </div>

            <DashboardNotificationsMenu />
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>

        <NetworkStatusBanner />
      </div>
    </div>
  );
}
