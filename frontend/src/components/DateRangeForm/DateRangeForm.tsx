import React, { useState } from 'react';
import styles from './DateRangeForm.module.css';

interface DateRangeFormProps {
  onSubmit: (startDate: string, endDate: string) => void;
  loading: boolean;
  initialStartDate?: string;
  initialEndDate?: string;
}

export const DateRangeForm: React.FC<DateRangeFormProps> = ({
  onSubmit,
  loading,
  initialStartDate = '',
  initialEndDate = '',
}) => {
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [errors, setErrors] = useState<{ start?: string; end?: string; form?: string }>({});
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const validate = (): boolean => {
    const tempErrors: { start?: string; end?: string; form?: string } = {};
    let isValid = true;

    if (!startDate) {
      tempErrors.start = 'Start date is required';
      isValid = false;
    }

    if (!endDate) {
      tempErrors.end = 'End date is required';
      isValid = false;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        tempErrors.form = 'Start date cannot be after end date';
        isValid = false;
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(startDate, endDate);
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <form className={`${styles.formCard} ${isShaking ? styles.shake : ''}`} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>Query Invoices</h2>
      <div className={styles.subtitle}>Specify a date range to filter and review your client billing records.</div>
      
      <div className={styles.grid}>
        <div className={styles.inputGroup}>
          <label htmlFor="startDate" className={styles.label}>
            <svg
              className={styles.labelIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            className={`${styles.input} ${errors.start ? styles.inputError : ''}`}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setErrors((prev) => ({ ...prev, start: undefined, form: undefined }));
            }}
          />
          <span className={styles.errorText}>
            {errors.start && (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.start}
              </>
            )}
          </span>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="endDate" className={styles.label}>
            <svg
              className={styles.labelIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            className={`${styles.input} ${errors.end ? styles.inputError : ''}`}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setErrors((prev) => ({ ...prev, end: undefined, form: undefined }));
            }}
          />
          <span className={styles.errorText}>
            {errors.end && (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.end}
              </>
            )}
          </span>
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              'Searching...'
            ) : (
              <>
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Search
              </>
            )}
          </button>
        </div>
      </div>

      
      {errors.form && (
        <div className={styles.formError}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong>Error: </strong> {errors.form}
          </div>
        </div>
      )}
    </form>
  );
};

