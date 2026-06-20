import { useState, useCallback } from 'react';
import { fetchInvoices } from '../api/invoices';
import type { Invoice } from '../types';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);

  const getInvoices = useCallback(async (
    startDate: string,
    endDate: string,
    page: number = 1,
    pageSize: number = 20
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchInvoices({
        start_date: startDate,
        end_date: endDate,
        page,
        page_size: pageSize,
      });
      setInvoices(response.invoices);
      setTotalCount(response.total_count);
      setIsCached(response.cached);
    } catch (err) {
      const errorObj = err as { response?: { data?: { detail?: string } }; message?: string };
      const apiError = errorObj.response?.data?.detail || errorObj.message || 'An unexpected error occurred';
      setError(apiError);
      setInvoices([]);
      setTotalCount(0);
      setIsCached(false);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    invoices,
    totalCount,
    loading,
    error,
    isCached,
    getInvoices,
  };
};
