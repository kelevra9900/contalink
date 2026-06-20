import React from 'react';
import styles from './InvoicesTable.module.css';
import type { Invoice } from '../../types';

interface InvoicesTableProps {
  invoices: Invoice[];
  totalCount: number;
  page: number;
  pageSize: number;
  isCached: boolean;
  onPageChange: (newPage: number) => void;
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices,
  totalCount,
  page,
  pageSize,
  isCached,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  if (invoices.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <svg
            className={styles.emptyIllustration}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <circle cx="10" cy="15" r="3" />
            <line x1="12" y1="15" x2="16" y2="19" />
          </svg>
          <p className={styles.emptyText}>
            No invoices found. Please adjust your date range search filter.
          </p>
        </div>
      </div>
    );
  }

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalCount);

  const getStatusClass = (status: string) => {
    switch (status.trim().toLowerCase()) {
      case 'vigente':
        return styles.statusVigente;
      case 'pagado':
        return styles.statusPagado;
      case 'cancelado':
        return styles.statusCancelado;
      default:
        return styles.statusDefault;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart} · ${timePart}`;
    } catch {
      return 'N/A';
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== -1) {
        pages.push(-1);
      }
    }
    return pages;
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3 className={styles.title}>Results</h3>
        <span className={`${styles.badge} ${isCached ? styles.cachedBadge : styles.liveBadge}`}>
          {isCached ? 'Cached (Fast)' : 'Live DB'}
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Invoice Number</th>
              <th className={styles.th}>Date &amp; Time</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Active</th>
              <th className={styles.th} style={{ textAlign: 'right' }}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className={styles.tr}>
                <td className={styles.td}>{invoice.id}</td>
                <td className={styles.td} style={{ fontWeight: 600 }}>{invoice.invoice_number || 'N/A'}</td>
                <td className={styles.td}>{formatDate(invoice.invoice_date || '')}</td>
                <td className={styles.td}>
                  {invoice.status ? (
                    <span className={`${styles.statusBadge} ${getStatusClass(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className={styles.td}>
                  <span className={`${styles.statusBadge} ${invoice.active ? styles.statusVigente : styles.statusCancelado}`}>
                    {invoice.active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.amountCol}`} style={{ textAlign: 'right' }}>
                  ${invoice.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className={styles.pagination}>
        <div className={styles.paginationInfo}>
          Showing <span style={{ fontWeight: 600 }}>{startRecord}</span> to <span style={{ fontWeight: 600 }}>{endRecord}</span> of <span style={{ fontWeight: 600 }}>{totalCount}</span> entries
        </div>
        <div className={styles.paginationControls}>
          <button
            className={styles.pageButton}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            Previous
          </button>
          
          {getPageNumbers().map((pageNum, idx) => (
            pageNum === -1 ? (
              <span key={`ellipsis-${idx}`} style={{ padding: '0 0.5rem', color: 'var(--text-muted)' }}>...</span>
            ) : (
              <button
                key={`page-${pageNum}`}
                className={`${styles.pageButton} ${pageNum === page ? styles.activePage : ''}`}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </button>
            )
          ))}

          <button
            className={styles.pageButton}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

