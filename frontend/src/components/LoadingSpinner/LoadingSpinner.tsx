import React from 'react';
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner: React.FC = () => {
  // Generate 5 skeleton rows
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.header}>
        <div className={`${styles.titlePlaceholder} ${styles.shimmer}`}></div>
        <div className={`${styles.badgePlaceholder} ${styles.shimmer}`}></div>
      </div>
      
      {/* Skeleton Table Header */}
      <div className={styles.tableHeader}>
        <div className={`${styles.headerCol} ${styles.shimmer}`} style={{ width: '5%' }}></div>
        <div className={`${styles.headerCol} ${styles.shimmer}`} style={{ width: '25%' }}></div>
        <div className={`${styles.headerCol} ${styles.shimmer}`} style={{ width: '30%' }}></div>
        <div className={`${styles.headerCol} ${styles.shimmer}`} style={{ width: '15%' }}></div>
        <div className={`${styles.headerCol} ${styles.shimmer}`} style={{ width: '10%' }}></div>
        <div className={`${styles.headerCol} ${styles.shimmer}`} style={{ width: '15%' }}></div >
      </div>

      {/* Skeleton Rows */}
      {skeletonRows.map((index) => (
        <div key={index} className={styles.row}>
          <div className={`${styles.cell} ${styles.shimmer}`} style={{ width: '5%' }}></div>
          <div className={`${styles.cell} ${styles.shimmer}`} style={{ width: '25%' }}></div>
          <div className={`${styles.cell} ${styles.shimmer}`} style={{ width: '30%' }}></div>
          <div className={`${styles.cell} ${styles.shimmer}`} style={{ width: '15%' }}></div>
          <div className={`${styles.cell} ${styles.shimmer}`} style={{ width: '10%' }}></div>
          <div className={`${styles.cell} ${styles.shimmer}`} style={{ width: '15%' }}></div>
        </div>
      ))}
    </div>
  );
};

