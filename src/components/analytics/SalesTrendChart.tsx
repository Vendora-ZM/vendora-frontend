'use client';

import React, { useMemo } from 'react';
import { useAppSelector } from '@/lib/store';
import { useGetSalesTrendsQuery } from '@/lib/features/analytics/analyticsApi';
import { useGetBusinessQuery } from '@/lib/features/business/businessApi';
import { useGetMeQuery } from '@/lib/features/profile/profileApi';
import { getDateRange } from '@/lib/utils/dateRange';
import { formatCurrency } from '@/lib/utils/currency';
import type { SalesTrendPoint } from '@/types/analytics';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import styles from './AnalyticsWidgets.module.css';

export const SalesTrendChart: React.FC = () => {
  const { dateRangePreset, locationId } = useAppSelector((s) => s.analytics);
  const { from, to } = useMemo(() => getDateRange(dateRangePreset), [dateRangePreset]);
  const { data: me } = useGetMeQuery();
  const { data: business } = useGetBusinessQuery(me?.business_id ?? '', {
    skip: !me?.business_id,
  });
  const currencyCode = business?.currency_code;

  const { data = [], isLoading } = useGetSalesTrendsQuery({ from, to, location_id: locationId });

  const chartData = useMemo(() => {
    return data.map((d: SalesTrendPoint) => ({
      date: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      Revenue: d.revenue / 100,
      Cost: d.cost / 100,
      Profit: (d.revenue - d.cost - d.refund_amount) / 100,
    }));
  }, [data]);

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <h3 className={styles.widgetTitle}>Sales Trends</h3>
      </div>
      <div className={styles.chartContainer}>
        {isLoading ? (
          <div className={styles.loading}>Loading chart data...</div>
        ) : chartData.length === 0 ? (
          <div className={styles.empty}>No data available for this period.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A84DD" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1A84DD" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#8C9098" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis
                stroke="#8C9098"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(Number(value), { currencyCode, maximumFractionDigits: 0, minimumFractionDigits: 0 })}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(value) => {
                  const amount = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
                  return formatCurrency(amount, { currencyCode });
                }}
              />
              <Legend verticalAlign="top" height={36} />
              <Area type="monotone" dataKey="Revenue" stroke="#1A84DD" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="Profit" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
