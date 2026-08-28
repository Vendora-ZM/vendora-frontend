'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './NetworkStatusBanner.module.css';

type ConnectionLike = {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

type BannerState = 'hidden' | 'offline' | 'poor-full' | 'poor-compact' | 'good';

const POOR_BANNER_FULL_MS = 15000;
const GOOD_BANNER_MS = 2500;

function getConnection(): ConnectionLike | null {
  if (typeof navigator === 'undefined') return null;
  return (navigator as Navigator & { connection?: ConnectionLike }).connection ?? null;
}

function isPoorConnection(connection: ConnectionLike | null) {
  if (!connection) return false;
  if (connection.saveData) return true;
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') return true;
  if (typeof connection.downlink === 'number' && connection.downlink > 0 && connection.downlink < 1.5) return true;
  return false;
}

function renderWifiIcon(state: BannerState) {
  if (state === 'offline') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M2.8 8.6C8.4 3 15.6 3 21.2 8.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5.8 11.8C9.8 7.8 14.2 7.8 18.2 11.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9.1 15.1C11.3 12.9 12.7 12.9 14.9 15.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="18.2" r="1.4" fill="currentColor" />
      </svg>
    );
  }

  if (state === 'good') {
    return (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4 13.5C4 8.8 7.8 5 12.5 5S21 8.8 21 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M7 13.5C7 10.5 9.5 8 12.5 8S18 10.5 18 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 17.2l1.6 1.6 3.4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 13.5C4 8.8 7.8 5 12.5 5S21 8.8 21 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 13.5C7 10.5 9.5 8 12.5 8S18 10.5 18 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.2 13.5a2.3 2.3 0 1 0 4.6 0 2.3 2.3 0 1 0-4.6 0Z" fill="currentColor" />
    </svg>
  );
}

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [connection, setConnection] = useState<ConnectionLike | null>(null);
  const [showPoorDetails, setShowPoorDetails] = useState(true);
  const [showGoodRecovery, setShowGoodRecovery] = useState(false);
  const hadDegradedConnection = useRef(false);

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

  const poorConnection = useMemo(() => isPoorConnection(connection), [connection]);

  useEffect(() => {
    if (!isOnline || poorConnection) {
      hadDegradedConnection.current = true;
      setShowPoorDetails(true);
      setShowGoodRecovery(false);
      return;
    }

    setShowPoorDetails(true);
    if (hadDegradedConnection.current) {
      setShowGoodRecovery(true);
      hadDegradedConnection.current = false;
    }
  }, [isOnline, poorConnection]);

  useEffect(() => {
    if (!poorConnection || !showPoorDetails) return;
    const timer = window.setTimeout(() => setShowPoorDetails(false), POOR_BANNER_FULL_MS);
    return () => window.clearTimeout(timer);
  }, [poorConnection, showPoorDetails]);

  useEffect(() => {
    if (!showGoodRecovery || poorConnection || !isOnline) return;
    const timer = window.setTimeout(() => setShowGoodRecovery(false), GOOD_BANNER_MS);
    return () => window.clearTimeout(timer);
  }, [isOnline, poorConnection, showGoodRecovery]);

  const status = useMemo(() => {
    if (!isOnline) {
      return {
        key: 'offline' as const,
        visible: true,
        tone: 'offline',
        title: 'You are offline',
        message: 'Check your connection. Changes may not sync until you reconnect.',
      };
    }

    if (poorConnection) {
      return showPoorDetails
        ? {
            key: 'poor-full' as const,
            visible: true,
            tone: 'warning',
            title: 'Poor network connection',
            message: 'The connection is slow. Some actions may take longer than usual.',
          }
        : {
            key: 'poor-compact' as const,
            visible: true,
            tone: 'warning',
            title: '',
            message: '',
          };
    }

    if (showGoodRecovery) {
      return {
        key: 'good' as const,
        visible: true,
        tone: 'good',
        title: 'Connection restored',
        message: 'Your network is stable again. Vendora will keep syncing normally.',
      };
    }

    return {
      key: 'hidden' as const,
      visible: false,
      tone: 'neutral',
      title: '',
      message: '',
    };
  }, [isOnline, poorConnection, showPoorDetails, showGoodRecovery]);

  if (!status.visible) return null;

  const isCompact = status.key === 'poor-compact';
  const isPoorExpanded = status.key === 'poor-full';

  return (
    <div
      className={`${styles.banner} ${styles[status.tone]} ${isCompact ? styles.compact : ''}`}
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        className={styles.iconButton}
        aria-label={isCompact ? 'Show poor network details' : 'Network status'}
        onClick={isCompact ? () => setShowPoorDetails(true) : undefined}
      >
        <div className={styles.icon} aria-hidden="true">
          {renderWifiIcon(status.key)}
        </div>
      </button>

      <div className={`${styles.detailsWrap} ${isCompact ? styles.detailsWrapCollapsed : styles.detailsWrapExpanded}`}>
        <div className={`${styles.content} ${isCompact ? styles.contentCollapsed : styles.contentExpanded}`}>
          {status.title ? <strong className={styles.title}>{status.title}</strong> : null}
          {status.message ? <p className={styles.message}>{status.message}</p> : null}
        </div>
      </div>

      {isPoorExpanded ? (
        <button
          type="button"
          className={styles.collapseButton}
          onClick={() => setShowPoorDetails(false)}
          aria-label="Collapse poor network details"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
