'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { setDateRangePreset, DateRangePreset } from '@/lib/features/analytics/analyticsSlice';
import styles from './AnalyticsToolbar.module.css';

export const AnalyticsToolbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dateRangePreset } = useAppSelector((s) => s.analytics);

  const presets: { value: DateRangePreset; label: string }[] = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
  ];

  return (
    <div className={styles.toolbar}>
      <div className={styles.presets}>
        {presets.map((preset) => (
          <button
            key={preset.value}
            className={`${styles.presetBtn} ${dateRangePreset === preset.value ? styles.active : ''}`}
            onClick={() => dispatch(setDateRangePreset(preset.value))}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};
