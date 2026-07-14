import { DateRangePreset } from '@/lib/features/analytics/analyticsSlice';

export function getDateRange(preset: DateRangePreset): { from: string; to: string } {
  const now = new Date();
  let from = new Date();
  let to = new Date();

  switch (preset) {
    case 'last_7_days':
      from.setDate(now.getDate() - 7);
      break;
    case 'last_30_days':
      from.setDate(now.getDate() - 30);
      break;
    case 'this_month':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
  }

  // Set time components
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}
