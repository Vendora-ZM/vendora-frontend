import React from 'react';
import styles from './page.module.css';

export default function DashboardOverview() {
  // Mock data for the graph
  const graphData = [
    { day: 'Mon', value: 40 },
    { day: 'Tue', value: 65 },
    { day: 'Wed', value: 45 },
    { day: 'Thu', value: 80 },
    { day: 'Fri', value: 95 },
    { day: 'Sat', value: 100 },
    { day: 'Sun', value: 75 },
  ];

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Welcome back! Here's what's happening today.</p>
      </div>
      
      {/* Top Metrics Row */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Today's Sales</h3>
            <div className={`${styles.statIcon} ${styles.iconSales}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            </div>
          </div>
          <p className={styles.statValue}>K4,250</p>
          <span className={`${styles.statTrend} ${styles.positive}`}>+12% from yesterday</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Today's Profit</h3>
            <div className={`${styles.statIcon} ${styles.iconProfit}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="22"></line><line x1="12" y1="2" x2="12" y2="6"></line></svg>
            </div>
          </div>
          <p className={styles.statValue}>K1,120</p>
          <span className={`${styles.statTrend} ${styles.positive}`}>+5% from yesterday</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Inventory Value</h3>
            <div className={`${styles.statIcon} ${styles.iconInventory}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
          </div>
          <p className={styles.statValue}>K45,300</p>
          <span className={styles.statTrend}>Cost of goods currently in stock</span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Active Customers</h3>
            <div className={`${styles.statIcon} ${styles.iconCustomers}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>
          <p className={styles.statValue}>1,204</p>
          <span className={`${styles.statTrend} ${styles.negative}`}>-2% from last month</span>
        </div>
      </div>
      
      {/* Main Content Layout */}
      <div className={styles.mainGrid}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Revenue Graph */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              Revenue (Past 7 Days)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-grey)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
            <div className={styles.graphContainer}>
              {graphData.map((d, i) => (
                <div key={i} className={styles.barCol}>
                  <div className={styles.barWrapper}>
                    <div className={styles.barFill} style={{ height: `${d.value}%` }}></div>
                  </div>
                  <span className={styles.barLabel}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
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
                  <tr>
                    <td>#ORD-001</td>
                    <td>John Doe</td>
                    <td>10:45 AM</td>
                    <td><span className={`${styles.badge} ${styles.completed}`}>Completed</span></td>
                    <td>K150.00</td>
                  </tr>
                  <tr>
                    <td>#ORD-002</td>
                    <td>Jane Smith</td>
                    <td>9:20 AM</td>
                    <td><span className={`${styles.badge} ${styles.processing}`}>Processing</span></td>
                    <td>K85.50</td>
                  </tr>
                  <tr>
                    <td>#ORD-003</td>
                    <td>Bob Johnson</td>
                    <td>Yesterday</td>
                    <td><span className={`${styles.badge} ${styles.completed}`}>Completed</span></td>
                    <td>K320.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Alerts & Insights */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              Alerts
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-orange)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <div className={styles.alertsContainer}>
              <div className={`${styles.alertItem} ${styles.critical}`}>
                <div className={styles.alertIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <div className={styles.alertContent}>
                  <h4>Critical Low Stock</h4>
                  <p>Coca-Cola 500ml is down to 2 units.</p>
                </div>
              </div>
              <div className={styles.alertItem}>
                <div className={styles.alertIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <div className={styles.alertContent}>
                  <h4>Low Stock Alert</h4>
                  <p>Cooking Oil 2L is running low (14 units remaining).</p>
                </div>
              </div>
              <div className={styles.alertItem}>
                <div className={styles.alertIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div className={styles.alertContent}>
                  <h4>Expiring Soon</h4>
                  <p>10 units of Bread expiring tomorrow.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>
              Top Products
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-grey)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <ul className={styles.productList}>
              <li className={styles.productItem}>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>Baking Flour 2kg</span>
                  <span className={styles.productSales}>42 units sold</span>
                </div>
                <span className={styles.productRevenue}>K840</span>
              </li>
              <li className={styles.productItem}>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>Sugar 1kg</span>
                  <span className={styles.productSales}>38 units sold</span>
                </div>
                <span className={styles.productRevenue}>K380</span>
              </li>
              <li className={styles.productItem}>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>Fresh Milk 1L</span>
                  <span className={styles.productSales}>24 units sold</span>
                </div>
                <span className={styles.productRevenue}>K480</span>
              </li>
              <li className={styles.productItem}>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>Eggs (Tray)</span>
                  <span className={styles.productSales}>18 units sold</span>
                </div>
                <span className={styles.productRevenue}>K900</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
