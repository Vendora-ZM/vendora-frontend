'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { markAllNotificationsRead } from '@/lib/features/notifications/notificationsSlice';
import styles from './DashboardNotificationsMenu.module.css';

function formatRelativeTime(timestamp: string) {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = Math.max(now.getTime() - then.getTime(), 0);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DashboardNotificationsMenu() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const notifications = useAppSelector((state) => state.notifications.items);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open || unreadCount === 0) {
      return;
    }

    dispatch(markAllNotificationsRead());
  }, [dispatch, open, unreadCount]);

  return (
    <div className={styles.menu} ref={menuRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        aria-label={unreadCount > 0 ? `Open alerts, ${unreadCount} unread` : 'Open alerts'}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M15 17H9m8-4V9a5 5 0 1 0-10 0v4L5.5 15.5A1 1 0 0 0 6.5 17h11a1 1 0 0 0 1-1.5L17 13Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 ? <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
      </button>

      {open ? (
        <div className={styles.dropdown} role="dialog" aria-label="Dashboard alerts">
          <div className={styles.dropdownHeader}>
            <div>
              <h3>Alerts</h3>
              <p>{notifications.length > 0 ? 'Recent issues and updates from your dashboard' : 'No alerts right now'}</p>
            </div>
            {notifications.length > 0 ? (
              <button
                type="button"
                className={styles.markRead}
                onClick={() => dispatch(markAllNotificationsRead())}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                Your dashboard is quiet. New alerts will appear here.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.item} ${notification.read ? styles.read : ''} ${styles[notification.severity]}`}
                >
                  <div className={styles.itemIcon} aria-hidden="true">
                    {notification.severity === 'critical' ? (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
                        <path d="M10.3 4.9 2.8 18a1.8 1.8 0 0 0 1.6 2.7h15.2A1.8 1.8 0 0 0 21.2 18L13.7 4.9a1.9 1.9 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                    ) : notification.severity === 'warning' ? (
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
                        <path d="M10.3 4.9 2.8 18a1.8 1.8 0 0 0 1.6 2.7h15.2A1.8 1.8 0 0 0 21.2 18L13.7 4.9a1.9 1.9 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="12" cy="8" r="1" fill="currentColor" />
                      </svg>
                    )}
                  </div>

                  <div className={styles.itemBody}>
                    <div className={styles.itemTopRow}>
                      <strong>{notification.title}</strong>
                      <span>{formatRelativeTime(notification.timestamp)}</span>
                    </div>
                    <p>{notification.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
