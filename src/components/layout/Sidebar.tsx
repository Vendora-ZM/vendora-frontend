'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useLogoutMutation } from '@/lib/features/auth/authApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { useAppDispatch } from '@/lib/store';
import { logout } from '@/lib/features/auth/authSlice';
import { useAppSelector } from '@/lib/store';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: '/dashboard', label: 'Overview', exact: true },
  { href: '/dashboard/pos', label: 'POS (Point of Sale)', exact: false },
  { href: '/dashboard/products', label: 'Products', exact: false },
  { href: '/dashboard/categories', label: 'Categories', exact: false },
  { href: '/dashboard/inventory', label: 'Inventory', exact: false },
  { href: '/dashboard/locations', label: 'Locations', exact: false },
  { href: '/dashboard/accounts', label: 'Accounts', exact: false },
  { href: '/dashboard/orders', label: 'Orders', exact: false },
  { href: '/dashboard/sales', label: 'Sales', exact: false },
  { href: '/dashboard/customers', label: 'Customers', exact: false },
  { href: '/dashboard/analytics', label: 'Analytics', exact: false },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: me } = useGetMeQuery();
  const authPermissions = useAppSelector((state) => state.auth.permissions);
  const [logoutApi] = useLogoutMutation();
  const canManageAccounts = Boolean(
    me?.permissions?.includes('users.manage') || authPermissions.includes('users.manage')
  );

  const handleLogout = async () => {
    try {
      await logoutApi({}).unwrap();
    } catch (e) {
      console.error('Logout failed on backend', e);
    }
    // Always clear local state and redirect to login
    dispatch(logout());
    router.push('/login');
  };

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logo} onClick={onClose}>
            <Image
              src="/logos/vendora_logo_trans_background.png"
              alt="Vendora"
              width={160}
              height={150}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
          {/* Close button for mobile */}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            link.href === '/dashboard/accounts' && !canManageAccounts ? null : (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.link} ${isActive(link.href, link.exact) ? styles.active : ''}`}
                onClick={onClose}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>

        <div className={styles.footer}>
          {canManageAccounts ? (
            <Link href="/dashboard/accounts" className={`${styles.link} ${styles.ctaLink}`} onClick={onClose}>
              Invite member
            </Link>
          ) : null}
          <Link href="/settings" className={styles.link} onClick={onClose}>
            Settings
          </Link>
          <button className={`${styles.link} ${styles.logoutBtn}`} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
