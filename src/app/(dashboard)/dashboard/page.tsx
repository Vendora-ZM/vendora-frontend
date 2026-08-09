'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { setDateRangePreset, setLocationId, DateRangePreset } from '@/lib/features/analytics/analyticsSlice';
import { useGetSalesTrendsQuery, useGetTopProductsQuery } from '@/lib/features/analytics/analyticsApi';
import { useGetAccountsQuery } from '@/lib/features/accounts/accountsApi';
import { useGetSalesQuery } from '@/lib/features/sales/salesApi';
import { useGetBalancesQuery } from '@/lib/features/inventory/inventoryApi';
import { useGetProductsQuery } from '@/lib/features/products/productsApi';
import { useGetCustomersQuery } from '@/lib/features/customers/customersApi';
import { useGetLocationsQuery } from '@/lib/features/locations/locationsApi';
import { logout } from '@/lib/features/auth/authSlice';
import { setNotifications, type NotificationItem } from '@/lib/features/notifications/notificationsSlice';
import { getDateRange } from '@/lib/utils/dateRange';
import { Product } from '@/types/product';
import { Sale, SaleStatus } from '@/types/sale';
import styles from './page.module.css';

const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
];

const STATUS_LABELS: Record<SaleStatus, string> = {
  draft: 'Draft',
  completed: 'Completed',
  refunded: 'Refunded',
  cancelled: 'Cancelled',
};

function formatCurrency(amount: number) {
  return `K${(amount / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatDateTime(iso: string) {
  const value = new Date(iso);
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ' ' + value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getCustomerName(customer: { first_name: string; last_name: string } | undefined) {
  if (!customer) return 'Walk-in customer';
  return `${customer.first_name} ${customer.last_name}`.trim();
}

function isUnauthorizedError(error: unknown) {
  return Boolean(
    error &&
    typeof error === 'object' &&
    'status' in error &&
    (error as { status?: number | string }).status === 401
  );
}

function normalizeQuestion(question: string) {
  return question.trim().toLowerCase();
}

function matchesQuestion(question: string, keywords: string[]) {
  const normalized = normalizeQuestion(question);
  return keywords.some((keyword) => normalized.includes(keyword));
}

export default function DashboardOverview() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { dateRangePreset, locationId } = useAppSelector((s) => s.analytics);
  const advisorPrompts = [
    'How can I increase profits?',
    'Why are sales dropping?',
    'Which products should I discontinue?',
    'Predict next month’s sales.',
    'Suggest reorder quantities.',
    'Recommend price increases.',
    'Identify slow-moving stock.',
    'Benchmark performance.',
  ];
  const [selectedPrompt, setSelectedPrompt] = useState(advisorPrompts[0]);
  const [questionDraft, setQuestionDraft] = useState(advisorPrompts[0]);
  const { from, to } = useMemo(() => getDateRange(dateRangePreset), [dateRangePreset]);

  const { data: locationsRaw = [] } = useGetLocationsQuery();
  const { data: salesTrends = [], isLoading: trendsLoading, error: trendsError } = useGetSalesTrendsQuery({
    from,
    to,
    location_id: locationId,
  });
  const { data: topProducts = [], isLoading: topProductsLoading, error: topProductsError } = useGetTopProductsQuery({
    from,
    to,
    location_id: locationId,
    limit: 5,
  });
  const { data: salesResponse, isLoading: salesLoading, error: salesError } = useGetSalesQuery({
    start_date: from,
    end_date: to,
    location_id: locationId,
    limit: 10,
    offset: 0,
  });
  const { data: balances = [], isLoading: balancesLoading, error: balancesError } = useGetBalancesQuery({
    location_id: locationId,
  });
  const { data: accounts = [] } = useGetAccountsQuery();
  const { data: productsRaw = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery({});
  const { data: customersRaw = [], isLoading: customersLoading, error: customersError } = useGetCustomersQuery({});

  const productsMap = useMemo(
    () => Object.fromEntries(productsRaw.map((product: Product) => [product.id, product])),
    [productsRaw]
  );

  const customersMap = useMemo(
    () =>
      Object.fromEntries(
        customersRaw.map((customer) => [customer.id, customer])
      ),
    [customersRaw]
  );

  const selectedLocation = locationsRaw.find((location) => location.id === locationId);
  const selectedPeriod = DATE_PRESETS.find((preset) => preset.value === dateRangePreset)?.label ?? 'Selected period';

  const totalRevenue = salesTrends.reduce((sum, row) => sum + row.revenue, 0);
  const totalCost = salesTrends.reduce((sum, row) => sum + row.cost, 0);
  const totalRefunds = salesTrends.reduce((sum, row) => sum + row.refund_amount, 0);
  const totalProfit = totalRevenue - totalCost - totalRefunds;
  const totalSalesCount = salesTrends.reduce((sum, row) => sum + row.sale_count, 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const inventoryValue = useMemo(
    () =>
      balances.reduce((sum, balance) => {
        const product = productsMap[balance.product_id];
        const quantityOnHand = Number(balance.quantity_on_hand || 0);
        const costPrice = product?.cost_price ?? 0;
        return sum + quantityOnHand * costPrice;
      }, 0),
    [balances, productsMap]
  );

  const recentSales = useMemo(() => {
    const rows = salesResponse?.data ?? [];
    return [...rows]
      .sort((a: Sale, b: Sale) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [salesResponse]);

  const employeeMap = useMemo(
    () =>
      new Map(
        accounts.map((account) => [
          account.user_id,
          `${account.first_name} ${account.last_name}`.trim() || account.email,
        ])
      ),
    [accounts]
  );

  const recentSalesSummary = useMemo(() => {
    const paymentTotals = new Map<string, number>();
    let totalDiscount = 0;
    let totalTax = 0;
    let totalRefunded = 0;
    let totalCompleted = 0;
    let refundCount = 0;
    let suspiciousDiscountSale:
      | {
          sale: Sale;
          employeeLabel: string;
          discountShare: number;
        }
      | null = null;

    recentSales.forEach((sale) => {
      totalDiscount += sale.discount_amount ?? 0;
      totalTax += sale.tax_amount ?? 0;

      if (sale.status === 'refunded') {
        refundCount += 1;
        totalRefunded += sale.total_amount ?? 0;
      }

      if (sale.status === 'completed') {
        totalCompleted += sale.total_amount ?? 0;
      }

      sale.payments.forEach((payment) => {
        paymentTotals.set(payment.method, (paymentTotals.get(payment.method) ?? 0) + (payment.amount ?? 0));
      });

      const discountShare = sale.total_amount > 0 ? sale.discount_amount / sale.total_amount : 0;
      if (sale.discount_amount > 0 && (!suspiciousDiscountSale || discountShare > suspiciousDiscountSale.discountShare)) {
        suspiciousDiscountSale = {
          sale,
          employeeLabel: sale.created_by ? employeeMap.get(sale.created_by) ?? `User ${sale.created_by.slice(0, 8)}` : 'Unassigned',
          discountShare,
        };
      }
    });

    const cashTotal = paymentTotals.get('cash') ?? 0;
    const paymentTotal = [...paymentTotals.values()].reduce((sum, amount) => sum + amount, 0);
    const topPayment =
      [...paymentTotals.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;

    return {
      totalDiscount,
      totalTax,
      totalRefunded,
      refundCount,
      totalCompleted,
      cashShare: paymentTotal > 0 ? cashTotal / paymentTotal : 0,
      topPayment,
      suspiciousDiscountSale,
    };
  }, [employeeMap, recentSales]);

  const lowStockAlerts = useMemo(() => {
    return balances
      .map((balance) => {
        const product = productsMap[balance.product_id];
        const available = Number(balance.quantity_available || 0);

        return product
          ? {
              product,
              available,
            }
          : null;
      })
      .filter((item): item is { product: Product; available: number } => item !== null)
      .filter((item) => item.available <= 5)
      .sort((a, b) => a.available - b.available)
      .slice(0, 3);
  }, [balances, productsMap]);

  const graphData = useMemo(() => {
    return [...salesTrends]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)
      .map((point) => ({
        label: new Date(point.date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: point.revenue / 100,
        revenue: point.revenue,
      }));
  }, [salesTrends]);

  const graphMax = Math.max(...graphData.map((point) => point.value), 1);
  const aiAdvisor = useMemo(() => {
    const midpoint = Math.max(1, Math.ceil(graphData.length / 2));
    const earlyPeriodRevenue = graphData.slice(0, midpoint).reduce((sum, point) => sum + point.revenue, 0);
    const latePeriodRevenue = graphData.slice(midpoint).reduce((sum, point) => sum + point.revenue, 0);
    const revenueDelta =
      earlyPeriodRevenue > 0 ? ((latePeriodRevenue - earlyPeriodRevenue) / earlyPeriodRevenue) * 100 : 0;
    const bestProduct = topProducts[0];
    const urgentStock = lowStockAlerts[0];
    const bestProductSold = bestProduct ? Number(bestProduct.quantity_sold) || 0 : 0;
    const positiveTrend = revenueDelta >= 0;
    const cashSharePercent = recentSalesSummary.cashShare * 100;

    const insights: { title: string; text: string; tone: 'positive' | 'warning' | 'neutral' }[] = [];

    if (graphData.length > 1) {
      insights.push({
        title: 'Sales momentum',
        text: `The later part of the selected period is ${Math.abs(revenueDelta).toFixed(1)}% ${
          positiveTrend ? 'ahead of' : 'behind'
        } the earlier days.`,
        tone: positiveTrend ? 'positive' : 'warning',
      });
    }

    if (bestProduct) {
      insights.push({
        title: 'Top seller',
        text: `${bestProduct.product_name} leads with ${bestProductSold.toLocaleString()} sold and ${formatCurrency(
          bestProduct.revenue
        )} in revenue.`,
        tone: 'positive',
      });
    }

    if (urgentStock) {
      insights.push({
        title: 'Stock risk',
        text: `${urgentStock.product.name} is down to ${urgentStock.available} unit${
          urgentStock.available === 1 ? '' : 's'
        }. Reorder soon to avoid lost sales.`,
        tone: urgentStock.available <= 2 ? 'warning' : 'neutral',
      });
    }

    if (recentSalesSummary.refundCount > 0) {
      insights.push({
        title: 'Refund watch',
        text: `${recentSalesSummary.refundCount.toLocaleString()} sale${recentSalesSummary.refundCount === 1 ? '' : 's'} were refunded in the recent feed, totaling ${formatCurrency(recentSalesSummary.totalRefunded)}.`,
        tone: 'warning',
      });
    }

    if (recentSalesSummary.suspiciousDiscountSale) {
      insights.push({
        title: 'Discount watch',
        text: `${recentSalesSummary.suspiciousDiscountSale.employeeLabel} gave the largest recent discount on ${recentSalesSummary.suspiciousDiscountSale.sale.sale_number}. That discount represented ${formatPercent(
          recentSalesSummary.suspiciousDiscountSale.discountShare * 100
        )} of the sale.`,
        tone: recentSalesSummary.suspiciousDiscountSale.discountShare > 0.2 ? 'warning' : 'neutral',
      });
    }

    if (recentSalesSummary.totalTax > 0) {
      insights.push({
        title: 'Tax summary',
        text: `Recent sales collected ${formatCurrency(recentSalesSummary.totalTax)} in tax, so there is a live tax trail to review before month-end reporting.`,
        tone: 'neutral',
      });
    }

    if (recentSalesSummary.totalDiscount > 0) {
      insights.push({
        title: 'Discount summary',
        text: `Recent sales included ${formatCurrency(recentSalesSummary.totalDiscount)} in discounts, which is worth comparing against margin before the next promotion.`,
        tone: recentSalesSummary.totalDiscount > totalRevenue * 0.15 ? 'warning' : 'neutral',
      });
    }

    if (recentSalesSummary.cashShare > 0) {
      insights.push({
        title: 'Cash flow pulse',
        text:
          cashSharePercent >= 60
            ? `Cash sales are carrying ${formatPercent(cashSharePercent)} of recent payments, which is healthy for short-term cash flow.`
            : `Only ${formatPercent(cashSharePercent)} of recent payments are cash, so card and mobile money timing will matter more for cash flow planning.`,
        tone: cashSharePercent >= 60 ? 'positive' : 'neutral',
      });
    }

    if (profitMargin < 15) {
      insights.push({
        title: 'Margin watch',
        text: `Profit margin is ${profitMargin.toFixed(1)}%, so pricing or cost control needs attention.`,
        tone: 'warning',
      });
    } else if (profitMargin < 25) {
      insights.push({
        title: 'Margin watch',
        text: `Profit margin is ${profitMargin.toFixed(1)}%. There is still room to improve pricing or mix.`,
        tone: 'neutral',
      });
    }

    if (insights.length === 0) {
      insights.push({
        title: 'Advisor ready',
        text: 'Once sales start flowing, Vendora will surface demand, margin, and inventory signals here.',
        tone: 'neutral',
      });
    }

    const healthScore = Math.max(
      42,
      Math.min(
        98,
        Math.round(
          68 +
            (positiveTrend ? 10 : -8) +
            (profitMargin >= 25 ? 10 : profitMargin >= 15 ? 2 : -12) +
            (urgentStock ? -8 : 4) +
            (bestProduct ? 4 : 0)
        )
      )
    );

    return {
      healthScore,
      summary:
        graphData.length > 1
          ? positiveTrend
            ? 'The dashboard is trending upward, and the advisor is watching for the next stock or margin risk.'
            : 'Sales are softer in the later part of the period, so the advisor is highlighting recovery actions.'
          : 'As more sales come in, the advisor will explain trends, highlight risks, and suggest next steps.',
      insights,
      prompts: [
        'How can I increase profits?',
        'Why are sales dropping?',
        'Which products should I discontinue?',
        'Predict next month’s sales.',
        'Suggest reorder quantities.',
        'Recommend price increases.',
        'Identify suspicious refunds.',
        'Show cash flow risk.',
        'Summarize tax due.',
        'Which employee discounts too much?',
        'Identify slow-moving stock.',
        'Benchmark performance.',
      ],
    };
  }, [formatCurrency, graphData, lowStockAlerts, profitMargin, recentSalesSummary, topProducts]);

  const advisorResponse = useMemo(() => {
    const topSeller = topProducts[0];
    const urgentStock = lowStockAlerts[0];
    const secondStock = lowStockAlerts[1];
    const slowMoving = [...productsRaw]
      .filter((product) => Number(product.quantity_sold ?? 0) <= 3)
      .sort((a, b) => Number(a.quantity_sold ?? 0) - Number(b.quantity_sold ?? 0))
      .slice(0, 3);
    const salesTrendLabel =
      graphData.length > 1
        ? graphData[graphData.length - 1].revenue >= graphData[0].revenue
          ? 'rising'
          : 'softening'
        : 'steady';
    const matchedQuestion = normalizeQuestion(selectedPrompt);

    if (matchesQuestion(matchedQuestion, ['profit', 'profits', 'margin', 'increase profit'])) {
      return {
        answer:
          profitMargin < 15
            ? 'Profit is tight right now. Focus on raising prices on low-elasticity items, cutting deep discounting, and pushing your strongest margin products more often.'
            : 'You have room to grow profit by nudging prices on fast movers, reducing avoidable discounts, and keeping stock on the items that sell with the best margin.',
        bullets: [
          topSeller ? `${topSeller.product_name} is the clearest product to bundle or spotlight.` : 'Spotlight your best-selling products first.',
          urgentStock
            ? `${urgentStock.product.name} is close to running out, so missed sales are likely on busy days.`
            : 'Keep an eye on the products that are closest to the reorder point.',
          'Review discounting rules so staff only discount when there is a real reason.',
        ],
        actions: ['Raise prices', 'Tighten discounts', 'Bundle top sellers'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['sales drop', 'sales dropping', 'sales down', 'decline', 'falling'])) {
      return {
        answer:
          salesTrends.length > 1
            ? `Sales are ${salesTrendLabel}. The advisor sees the change mainly in recent daily revenue, and low stock on fast movers can also make the drop feel worse.`
            : 'There is not enough sales history yet, but the advisor will explain whether the pattern is seasonal, stock-related, or pricing-related once more data arrives.',
        bullets: [
          `Recent sales momentum is ${salesTrendLabel}.`,
          urgentStock
            ? `${urgentStock.product.name} is low, which can suppress sales if customers expect it to be available.`
            : 'No urgent stock shortage is showing in the current snapshot.',
          'Compare the last 7 days against the previous week to separate demand changes from stock issues.',
        ],
        actions: ['Check stockouts', 'Compare weeks', 'Review pricing'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['discontinue', 'stop selling', 'remove', 'slow mover', 'slow-moving', 'slow moving'])) {
      return {
        answer:
          slowMoving.length > 0
            ? `Start by reviewing ${slowMoving[0].name}. It has very little recent movement, so it is a candidate for discontinuation, deeper discounting, or a smaller reorder size.`
            : 'No strongly slow-moving products are obvious yet. The advisor would normally look for items with weak sales, low repeat demand, and space pressure.',
        bullets: slowMoving.length > 0
          ? slowMoving.map((product) => `${product.name} has only ${Number(product.quantity_sold ?? 0).toLocaleString()} recent units sold.`)
          : ['Watch for products that have not moved in several weeks.', 'Look at items with repeated stock sitting on the shelf.'],
        actions: ['Review slow movers', 'Discount old stock', 'Pause reorders'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['predict', 'forecast', 'next month', 'sales next month'])) {
      return {
        answer:
          graphData.length > 1
            ? `If the current trend continues, next month should look ${salesTrendLabel}. The advisor expects sales to stay close to the current run rate unless stockouts or promotions change the pattern.`
            : 'There is not enough history to make a confident forecast yet, but the advisor will grow more accurate as more sales are recorded.',
        bullets: [
          'Forecasts improve when the dashboard has more daily sales history.',
          topSeller ? `${topSeller.product_name} will likely keep contributing if stock stays available.` : 'Fast movers usually shape the next forecast most strongly.',
          urgentStock ? `Reorder ${urgentStock.product.name} before demand peaks.` : 'Keep stock levels stable on your fastest movers.',
        ],
        actions: ['View forecast', 'Plan reorders', 'Run promotion'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['reorder', 'reorder quantities', 'restock', 'replenish', 'stock up'])) {
      const urgentQty = urgentStock ? Math.max(10, Math.ceil(10 - urgentStock.available + 5)) : 0;
      return {
        answer:
          urgentStock
            ? `I would reorder ${urgentQty} units of ${urgentStock.product.name} first, then ${secondStock ? secondStock.product.name : 'your next top mover'} after that.`
            : 'Nothing is close to a critical reorder point in the current snapshot. Keep your best sellers topped up and review the last week of sales before ordering more.',
        bullets: urgentStock
          ? [
              `${urgentStock.product.name} is at ${urgentStock.available} unit${urgentStock.available === 1 ? '' : 's'} available.`,
              secondStock
                ? `${secondStock.product.name} is the next item to watch closely.`
                : 'No second urgent item is visible yet.',
            ]
          : ['Keep a safety stock buffer on top sellers.', 'Use sales trends to decide on medium-priority items.'],
        actions: ['Reorder now', 'Check stock levels', 'Review fast movers'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['price increase', 'price increases', 'raise prices', 'pricing'])) {
      return {
        answer:
          topSeller
            ? `Consider a small price increase on ${topSeller.product_name} first if demand is steady and customers keep buying it.`
            : 'The advisor would normally recommend price increases on fast-moving, low-friction items first.',
        bullets: [
          'Start with products that sell often and trigger few customer complaints.',
          profitMargin < 15
            ? 'Margin pressure is a good reason to review pricing now.'
            : 'Protect the strongest-margin items from unnecessary discounting.',
          'Test small increases instead of changing every price at once.',
        ],
        actions: ['Test higher price', 'Watch margin', 'Compare demand'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['cash flow', 'cashflow', 'liquidity', 'cash inflow', 'cash outflow'])) {
      const cashSharePercent = recentSalesSummary.cashShare * 100;
      return {
        answer:
          recentSalesSummary.cashShare > 0
            ? cashSharePercent >= 60
              ? `Cash flow looks healthy right now because ${formatPercent(cashSharePercent)} of recent payments are cash.`
              : `Cash flow is more dependent on card and mobile money timing because only ${formatPercent(cashSharePercent)} of recent payments are cash.`
            : 'There is not enough payment history yet to estimate cash flow, but Vendora will start showing a clearer pattern as more sales are recorded.',
        bullets: [
          recentSalesSummary.topPayment
            ? `${recentSalesSummary.topPayment[0]} is the most common recent payment method.`
            : 'No payment mix is visible yet.',
          recentSalesSummary.totalCompleted > 0
            ? `${formatCurrency(recentSalesSummary.totalCompleted)} in completed sales is feeding the current cash picture.`
            : 'No completed sales are in the recent sample yet.',
          'Use this together with expenses and supplier payments for a fuller cash plan.',
        ],
        actions: ['Review cash mix', 'Track collections', 'Plan payments'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['refund', 'refunds', 'suspicious refund', 'suspicious refunds'])) {
      return {
        answer:
          recentSalesSummary.refundCount > 0
            ? `${recentSalesSummary.refundCount.toLocaleString()} recent sale${recentSalesSummary.refundCount === 1 ? '' : 's'} were refunded, totaling ${formatCurrency(recentSalesSummary.totalRefunded)}.`
            : 'No refunded sales are showing in the current sample, so refund risk looks quiet for now.',
        bullets: [
          recentSalesSummary.refundCount > 0
            ? 'Check whether refunds cluster around a product, shift, or employee.'
            : 'Keep watching the refunded-sales panel as more transactions come in.',
          recentSalesSummary.suspiciousDiscountSale
            ? `${recentSalesSummary.suspiciousDiscountSale.employeeLabel} also applied the largest discount on ${recentSalesSummary.suspiciousDiscountSale.sale.sale_number}.`
            : 'No unusually discounted sale stands out in the recent sample.',
          recentSalesSummary.totalRefunded > 0
            ? `Refunds removed ${formatCurrency(recentSalesSummary.totalRefunded)} from the recent sample.`
            : 'No refund amount is showing in the recent sample.',
        ],
        actions: ['Review refunds', 'Audit discounts', 'Check receipt notes'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['discount', 'discounts too much', 'who is discounting', 'too much discount'])) {
      return {
        answer:
          recentSalesSummary.suspiciousDiscountSale
            ? `${recentSalesSummary.suspiciousDiscountSale.employeeLabel} applied the largest recent discount on ${recentSalesSummary.suspiciousDiscountSale.sale.sale_number}.`
            : 'No clear discount outlier is visible in the current sample, but the advisor will keep watching for repeated deep discounts.',
        bullets: [
          recentSalesSummary.suspiciousDiscountSale
            ? `That sale discounted ${formatPercent(recentSalesSummary.suspiciousDiscountSale.discountShare * 100)} of the ticket value.`
            : 'No sale in the recent feed has a standout discount ratio.',
          'Look at the item mix if the discount was used to clear stock or rescue a slow sale.',
          'Set a clear approval rule for larger discounts so it is easier to spot abuse.',
        ],
        actions: ['Review discount policy', 'Check employee sales', 'Tighten approvals'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['tax', 'tax summary', 'taxes', 'monthly review', 'business review'])) {
      return {
        answer:
          recentSalesSummary.totalTax > 0
            ? `Vendora can already see ${formatCurrency(recentSalesSummary.totalTax)} in tax from the recent sales sample, which is a good base for a month-end summary.`
            : 'There is not enough tax activity in the current sample yet, but the advisor will summarize tax automatically as sales accumulate.',
        bullets: [
          recentSalesSummary.totalTax > 0
            ? 'Use this figure to sanity-check month-end reporting.'
            : 'Tax detail will become more useful as more completed sales are recorded.',
          totalRefunds > 0 ? `${formatCurrency(totalRefunds)} in refunds is already affecting the period totals.` : 'No refund drag is visible in the current trend window.',
          profitMargin >= 25
            ? 'Healthy margin gives you some room if taxes or supplier costs tick up.'
            : 'Margin is tighter, so tax and cost control matter more.',
        ],
        actions: ['Open sales report', 'Review tax totals', 'Export monthly review'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['slow-moving stock', 'slow moving stock', 'slow movers', 'slow-moving', 'slow moving'])) {
      return {
        answer:
          slowMoving.length > 0
            ? `${slowMoving[0].name} is the clearest slow-moving item right now. It deserves either a smaller reorder, a promotion, or a pause on replenishment.`
            : 'No obvious slow movers are standing out yet. As more days of sales accumulate, this panel will become more precise.',
        bullets: slowMoving.length > 0
          ? slowMoving.map((product) => `${product.name} has only ${Number(product.quantity_sold ?? 0).toLocaleString()} recent units sold.`)
          : ['Use this panel to catch items sitting too long.', 'Review items with frequent stock but weak turnover.'],
        actions: ['Promote stock', 'Reduce reorder', 'Review shelf space'],
      };
    }

    if (matchesQuestion(matchedQuestion, ['benchmark', 'performance', 'compare', 'how are we doing'])) {
      return {
        answer:
          graphData.length > 1
            ? `Overall, this period looks ${salesTrendLabel} with ${profitMargin.toFixed(1)}% margin and ${summary.totalSales.toLocaleString()} sales in view.`
            : 'There is not enough data for a full benchmark yet, but the advisor will compare sales, margin, and stock as the dataset grows.',
        bullets: [
          `Profit margin is ${profitMargin.toFixed(1)}%.`,
          `${summary.totalSales.toLocaleString()} sales are loaded in the current view.`,
          `${balances.length.toLocaleString()} stock records are helping power the inventory side of the benchmark.`,
        ],
        actions: ['Open report', 'Compare periods', 'Track trends'],
      };
    }

    return {
      answer:
        selectedPrompt === advisorPrompts[0]
          ? aiAdvisor.summary
          : `I can answer questions about profits, sales trends, reorder timing, pricing, slow movers, and benchmark performance. Try rephrasing "${selectedPrompt}" using one of those topics.`,
      bullets: aiAdvisor.insights.map((insight) => insight.text).slice(0, 3),
      actions: aiAdvisor.prompts.slice(0, 3),
    };
  }, [
    aiAdvisor.insights,
    aiAdvisor.prompts,
    aiAdvisor.summary,
    balances.length,
    graphData,
    lowStockAlerts,
    productsRaw,
    profitMargin,
    salesTrends.length,
    selectedPrompt,
    summary.totalSales,
    topProducts,
    recentSalesSummary,
    totalRefunds,
  ]);

  function handleAdvisorSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuestion = questionDraft.trim();
    if (!nextQuestion) return;
    setSelectedPrompt(nextQuestion);
  }

  function handlePromptClick(prompt: string) {
    setQuestionDraft(prompt);
    setSelectedPrompt(prompt);
  }
  const hasError = Boolean(
    trendsError || topProductsError || salesError || balancesError || productsError || customersError
  );
  const isLoading =
    trendsLoading ||
    topProductsLoading ||
    salesLoading ||
    balancesLoading ||
    productsLoading ||
    customersLoading;

  useEffect(() => {
    const unauthorized =
      isUnauthorizedError(trendsError) ||
      isUnauthorizedError(topProductsError) ||
      isUnauthorizedError(salesError) ||
      isUnauthorizedError(balancesError) ||
      isUnauthorizedError(productsError) ||
      isUnauthorizedError(customersError);

    if (unauthorized) {
      dispatch(logout());
      router.replace('/login');
    }
  }, [
    dispatch,
    router,
    trendsError,
    topProductsError,
    salesError,
    balancesError,
    productsError,
    customersError,
  ]);

  useEffect(() => {
    const nextNotifications: NotificationItem[] = [
      ...lowStockAlerts.map((item) => ({
        id: `low-stock-${item.product.id}`,
        title: item.available <= 2 ? 'Critical low stock' : 'Low stock alert',
        message: `${item.product.name} is down to ${item.available} unit${item.available === 1 ? '' : 's'} available.`,
        severity: item.available <= 2 ? 'critical' : 'warning',
        timestamp: new Date().toISOString(),
        read: false,
      } satisfies NotificationItem)),
    ];

    if (hasError) {
      nextNotifications.unshift({
        id: 'dashboard-data-warning',
        title: 'Dashboard data issue',
        message: 'Some dashboard data could not load. The rest of the dashboard is still live.',
        severity: 'info',
        timestamp: new Date().toISOString(),
        read: false,
      } satisfies NotificationItem);
    }

    dispatch(setNotifications(nextNotifications));
  }, [dispatch, hasError, lowStockAlerts]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Live overview for {selectedPeriod.toLowerCase()}
            {selectedLocation ? ` at ${selectedLocation.name}` : ' across all locations'}.
          </p>
        </div>

        <div className={styles.controls}>
          <div className={styles.presetGroup} aria-label="Dashboard date range">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`${styles.presetBtn} ${dateRangePreset === preset.value ? styles.presetBtnActive : ''}`}
                onClick={() => dispatch(setDateRangePreset(preset.value))}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <label className={styles.locationField} htmlFor="dashboard-location">
            <span>Location</span>
            <select
              id="dashboard-location"
              className={styles.locationSelect}
              value={locationId ?? ''}
              onChange={(e) => dispatch(setLocationId(e.target.value || undefined))}
            >
              <option value="">All locations</option>
              {locationsRaw.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {hasError && (
        <div className={styles.errorBanner}>
          Some dashboard data could not be loaded. The rest of the dashboard is still live.
        </div>
      )}

      <div className={styles.aiAdvisorCard}>
        <div className={styles.aiAdvisorHeader}>
          <div>
            <span className={styles.aiAdvisorEyebrow}>AI Business Advisor</span>
            <h2 className={styles.aiAdvisorTitle}>Plain-English advice based on live sales and stock data.</h2>
            <p className={styles.aiAdvisorText}>{aiAdvisor.summary}</p>
          </div>

          <div className={styles.aiScoreCard}>
            <span className={styles.aiScoreLabel}>Business health score</span>
            <strong className={styles.aiScoreValue}>{aiAdvisor.healthScore}/100</strong>
            <span className={styles.aiScoreHint}>Updated from revenue, margin, and stock signals.</span>
          </div>
        </div>

        <div className={styles.aiConversation}>
          <div className={styles.aiConversationHeader}>
            <div>
              <span className={styles.aiConversationLabel}>Ask the advisor</span>
              <h3 className={styles.aiConversationTitle}>{selectedPrompt}</h3>
            </div>
            <p className={styles.aiConversationHint}>
              Ask a custom question or pick a shortcut. Answers are generated from the live dashboard data already loaded on this screen.
            </p>
          </div>

          <div className={styles.aiPromptPills}>
            {advisorPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className={`${styles.aiPromptPillButton} ${selectedPrompt === prompt ? styles.aiPromptPillButtonActive : ''}`}
                onClick={() => handlePromptClick(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className={styles.aiQuestionForm} onSubmit={handleAdvisorSubmit}>
            <label className={styles.aiQuestionLabel} htmlFor="advisor-question">
              Ask your own question
            </label>
            <div className={styles.aiQuestionRow}>
              <input
                id="advisor-question"
                type="text"
                className={styles.aiQuestionInput}
                value={questionDraft}
                onChange={(event) => setQuestionDraft(event.target.value)}
                placeholder="For example: Why are sales down this week?"
              />
              <button type="submit" className={styles.aiQuestionButton}>
                Ask
              </button>
            </div>
          </form>

          <div className={styles.aiAnswerCard}>
            <div className={styles.aiAnswerLabel}>Vendora says</div>
            <p className={styles.aiAnswerText}>{advisorResponse.answer}</p>
            <div className={styles.aiAnswerBullets}>
              {advisorResponse.bullets.map((bullet) => (
                <div key={bullet} className={styles.aiAnswerBullet}>
                  {bullet}
                </div>
              ))}
            </div>
            <div className={styles.aiAnswerActions}>
              {advisorResponse.actions.map((action) => (
                <span key={action} className={styles.aiAnswerAction}>
                  {action}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.aiInsightGrid}>
          {aiAdvisor.insights.map((insight) => (
            <article key={insight.title} className={styles.aiInsightCard}>
              <span
                className={`${styles.aiInsightTone} ${
                  insight.tone === 'positive'
                    ? styles.tonePositive
                    : insight.tone === 'warning'
                      ? styles.toneWarning
                      : styles.toneNeutral
                }`}
              >
                {insight.title}
              </span>
              <p>{insight.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Revenue</h3>
            <div className={`${styles.statIcon} ${styles.iconSales}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
          </div>
          <p className={styles.statValue}>{isLoading ? 'Loading…' : formatCurrency(totalRevenue)}</p>
          <span className={`${styles.statTrend} ${styles.positive}`}>
            {totalSalesCount.toLocaleString()} sales in the selected period
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Profit</h3>
            <div className={`${styles.statIcon} ${styles.iconProfit}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="12" y1="2" x2="12" y2="6" />
              </svg>
            </div>
          </div>
          <p className={styles.statValue}>{isLoading ? 'Loading…' : formatCurrency(totalProfit)}</p>
          <span className={`${styles.statTrend} ${styles.positive}`}>Margin {profitMargin.toFixed(1)}%</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Inventory Value</h3>
            <div className={`${styles.statIcon} ${styles.iconInventory}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          </div>
          <p className={styles.statValue}>{isLoading ? 'Loading…' : formatCurrency(inventoryValue)}</p>
          <span className={styles.statTrend}>{balances.length.toLocaleString()} stock records</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Customers</h3>
            <div className={`${styles.statIcon} ${styles.iconCustomers}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <p className={styles.statValue}>{isLoading ? 'Loading…' : customersRaw.length.toLocaleString()}</p>
          <span className={`${styles.statTrend} ${styles.negative}`}>Live customer count</span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              Revenue Trend
              <span className={styles.sectionHint}>Last 7 days in the selected range</span>
            </div>
            <div className={styles.graphContainer}>
              {graphData.length === 0 ? (
                <div className={styles.emptyState}>
                  {isLoading ? 'Loading revenue data…' : 'No revenue data available for this period.'}
                </div>
              ) : (
                graphData.map((point) => (
                  <div key={`${point.label}-${point.revenue}`} className={styles.barCol}>
                    <div className={styles.barWrapper}>
                      <div
                        className={styles.barFill}
                        style={{ height: `${Math.max((point.value / graphMax) * 100, 4)}%` }}
                      />
                      <span className={styles.barValue}>{formatCurrency(point.revenue)}</span>
                    </div>
                    <span className={styles.barLabel}>{point.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>Recent Activity</div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5}>
                        <div className={styles.tableLoading}>Loading recent sales…</div>
                      </td>
                    </tr>
                  ) : recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className={styles.emptyState}>No sales found for the selected filters.</div>
                      </td>
                    </tr>
                  ) : (
                    recentSales.map((sale) => {
                      const statusClass = styles[sale.status as keyof typeof styles] ?? styles.processing;
                      const customer = sale.customer_id ? customersMap[sale.customer_id] : undefined;

                      return (
                        <tr key={sale.id}>
                          <td style={{ fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                            {sale.sale_number}
                          </td>
                          <td>{getCustomerName(customer)}</td>
                          <td>{formatDateTime(sale.completed_at ?? sale.created_at)}</td>
                          <td>
                            <span className={`${styles.badge} ${statusClass}`}>
                              {STATUS_LABELS[sale.status]}
                            </span>
                          </td>
                          <td>{formatCurrency(sale.total_amount ?? 0)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>Alerts</div>
            <div className={styles.alertsContainer}>
              {lowStockAlerts.length === 0 ? (
                <div className={styles.emptyState}>
                  {isLoading ? 'Loading stock alerts…' : 'No urgent stock alerts right now.'}
                </div>
              ) : (
                lowStockAlerts.map((item) => {
                  const isCritical = item.available <= 2;
                  return (
                    <div
                      key={item.product.id}
                      className={`${styles.alertItem} ${isCritical ? styles.critical : ''}`}
                    >
                      <div className={styles.alertIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isCritical ? '#EF4444' : '#F59E0B'} strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <div className={styles.alertContent}>
                        <h4>{isCritical ? 'Critical Low Stock' : 'Low Stock Alert'}</h4>
                        <p>
                          {item.product.name} is down to {item.available} unit{item.available === 1 ? '' : 's'} available.
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>Top Products</div>
            <ul className={styles.productList}>
              {topProductsLoading ? (
                <li className={styles.productItem}>
                  <span className={styles.emptyState}>Loading top products…</span>
                </li>
              ) : topProducts.length === 0 ? (
                <li className={styles.productItem}>
                  <span className={styles.emptyState}>No product sales in this period.</span>
                </li>
              ) : (
                topProducts.map((product) => (
                  <li key={product.product_id} className={styles.productItem}>
                    <div className={styles.productInfo}>
                      <span className={styles.productName}>{product.product_name}</span>
                      <span className={styles.productSales}>
                        Item code (SKU) {product.sku} · {product.quantity_sold} sold
                      </span>
                    </div>
                    <span className={styles.productRevenue}>{formatCurrency(product.revenue)}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
