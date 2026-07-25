'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './NetworkStatusBanner.module.css';

type ConnectionLike = {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

function getConnection(): ConnectionLike | null {
  if (typeof navigator === 'undefined') return null;
  return (navigator as Navigator & { connection?: ConnectionLike }).connection ?? null;
}

function isPoorConnection(connection: ConnectionLike | null) {
  if (!connection) return false;

  if (connection.saveData) return true;

  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    return true;
  }

  if (typeof connection.downlink === 'number' && connection.downlink > 0 && connection.downlink < 1.5) {
    return true;
  }

  return false;
}

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [connection, setConnection] = useState<ConnectionLike | null>(null);
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      setConnection(getConnection());
    };

    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    const currentConnection = getConnection();
    currentConnection?.addEventListener?.('change', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      currentConnection?.removeEventListener?.('change', updateStatus);
    };
  }, []);

  const status = useMemo(() => {
    if (!isOnline) {
      return {
        key: 'offline',
        visible: true,
        tone: 'offline',
        title: 'You are offline',
        message: 'Check your connection. Changes may not sync until you reconnect.',
      };
    }

    if (isPoorConnection(connection)) {
      return {
        key: 'poor',
        visible: true,
        tone: 'warning',
        title: 'Poor network connection',
        message: 'The connection is slow. Some actions may take longer than usual.',
      };
    }

    return {
      key: 'none',
      visible: false,
      tone: 'neutral',
      title: '',
      message: '',
    };
  }, [connection, isOnline]);

  useEffect(() => {
    if (!status.visible) {
      setDismissedFor(null);
      return;
    }

    if (dismissedFor && dismissedFor !== status.key) {
      setDismissedFor(null);
    }
  }, [dismissedFor, status.key, status.visible]);

  if (!status.visible || dismissedFor === status.key) return null;

  return (
    <div className={`${styles.banner} ${styles[status.tone]}`} role="status" aria-live="polite">
      <div className={styles.icon} aria-hidden="true">
        {status.tone === 'offline' ? (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M2.8 8.6C8.4 3 15.6 3 21.2 8.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M5.8 11.8C9.8 7.8 14.2 7.8 18.2 11.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M9.1 15.1C11.3 12.9 12.7 12.9 14.9 15.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="18.2" r="1.4" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 13.5C4 8.8 7.8 5 12.5 5S21 8.8 21 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M7 13.5C7 10.5 9.5 8 12.5 8S18 10.5 18 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M10.2 13.5a2.3 2.3 0 1 0 4.6 0 2.3 2.3 0 1 0-4.6 0Z" fill="currentColor" />
          </svg>
        )}
      </div>
      <div className={styles.content}>
        <strong className={styles.title}>{status.title}</strong>
        <p className={styles.message}>{status.message}</p>
      </div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={() => setDismissedFor(status.key)}
        aria-label="Dismiss network notice"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
