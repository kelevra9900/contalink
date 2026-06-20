import React, { useState } from 'react';
import { useInvoices } from './hooks/useInvoices';
import { DateRangeForm } from './components/DateRangeForm/DateRangeForm';
import { InvoicesTable } from './components/InvoicesTable/InvoicesTable';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import styles from './App.module.css';

const App: React.FC = () => {
  const { invoices, totalCount, loading, error, isCached, getInvoices } = useInvoices();
  
  // Tracking query parameters across pagination changes
  const [activeQuery, setActiveQuery] = useState<{ start: string; end: string }>({
    start: '2022-01-01',
    end: '2022-01-31'
  });
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // Run initial fetch on mount
  React.useEffect(() => {
    getInvoices(activeQuery.start, activeQuery.end, 1, pageSize);
  }, []);

  const handleSearchSubmit = (startDate: string, endDate: string) => {
    setActiveQuery({ start: startDate, end: endDate });
    setPage(1);
    getInvoices(startDate, endDate, 1, pageSize);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    getInvoices(activeQuery.start, activeQuery.end, newPage, pageSize);
  };


  // KPI Dynamic Metrics
  const calculatedStats = React.useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return { totalSales: 0, averageVal: 0, activeCount: 0, canceledCount: 0 };
    }
    const totalSales = invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
    const averageVal = totalSales / invoices.length;
    const activeCount = invoices.filter(inv => inv.active).length;
    const canceledCount = invoices.filter(inv => inv.status?.trim().toLowerCase() === 'cancelado').length;

    return { totalSales, averageVal, activeCount, canceledCount };
  }, [invoices]);

  const displayTotalSales = `$${calculatedStats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const displayAverageVal = `$${calculatedStats.averageVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className={styles.appLayout}>
      {/* SaaS Left Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandLogo}>P</div>
          <span className={styles.brandName}>ProAcc</span>
        </div>
        
        <nav className={styles.sidebarMenu}>
          <div className={styles.menuLabel}>Menu</div>
          
          <a href="#" className={styles.navItem}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            Dashboard
          </a>

          <a href="#" className={`${styles.navItem} ${styles.activeNavItem}`}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Invoices
          </a>

          <a href="#" className={styles.navItem}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Customers
          </a>

          <a href="#" className={styles.navItem}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Reports
          </a>

          <a href="#" className={styles.navItem}>
            <svg className={styles.navIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Page Shell */}
      <div className={styles.mainWrapper}>
        {/* Top Navbar */}
        <header className={styles.navbar}>
          <div className={styles.navbarSearch}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search billing number..." className={styles.searchInput} disabled />
          </div>
          
          <div className={styles.navbarActions}>
            <button className={styles.actionButton} aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <button className={styles.actionButton} aria-label="Add new">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div className={styles.userAvatar}>JD</div>
          </div>
        </header>

        {/* Dashboard Content Area */}
        <main className={styles.dashboardBody}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Invoices</h1>
          </div>

          {/* KPI Analytics Metric Cards */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Total Sales</span>
                <span className={styles.kpiValue}>{displayTotalSales}</span>
              </div>
              <div className={styles.kpiIconWrapper}>
                <svg className={styles.kpiIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Average Amount</span>
                <span className={styles.kpiValue}>{displayAverageVal}</span>
              </div>
              <div className={styles.kpiIconWrapper}>
                <svg className={styles.kpiIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Active Invoices</span>
                <span className={styles.kpiValue}>{calculatedStats.activeCount}</span>
              </div>
              <div className={styles.kpiIconWrapper}>
                <svg className={styles.kpiIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Canceled Invoices</span>
                <span className={styles.kpiValue}>{calculatedStats.canceledCount}</span>
              </div>
              <div className={styles.kpiIconWrapper}>
                <svg className={styles.kpiIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
            </div>
          </div>

          {/* Date Range Query Area */}
          <DateRangeForm
            onSubmit={handleSearchSubmit}
            loading={loading}
            initialStartDate={activeQuery.start}
            initialEndDate={activeQuery.end}
          />


          {error && (
            <div className={styles.errorAlert}>
              <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong>Error retrieving data:</strong> {error}
              </div>
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            activeQuery && (
              <InvoicesTable
                invoices={invoices}
                totalCount={totalCount}
                page={page}
                pageSize={pageSize}
                isCached={isCached}
                onPageChange={handlePageChange}
              />
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
