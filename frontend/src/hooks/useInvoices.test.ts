import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInvoices } from './useInvoices';
import { fetchInvoices } from '../api/invoices';

vi.mock('../api/invoices', () => ({
  fetchInvoices: vi.fn(),
}));

describe('useInvoices hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useInvoices());
    
    expect(result.current.invoices).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isCached).toBe(false);
  });

  it('should successfully fetch invoices and update states', async () => {
    const mockInvoicesResponse = {
      invoices: [
        {
          id: 1,
          invoice_number: 'INV-001',
          total: 100,
          invoice_date: '2022-01-01',
          status: 'Vigente',
          active: true,
        },
      ],
      total_count: 1,
      page: 1,
      page_size: 20,
      cached: true,
    };

    vi.mocked(fetchInvoices).mockResolvedValueOnce(mockInvoicesResponse);

    const { result } = renderHook(() => useInvoices());

    await act(async () => {
      await result.current.getInvoices('2022-01-01', '2022-01-31', 1, 20);
    });

    expect(fetchInvoices).toHaveBeenCalledWith({
      start_date: '2022-01-01',
      end_date: '2022-01-31',
      page: 1,
      page_size: 20,
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.invoices).toEqual(mockInvoicesResponse.invoices);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.isCached).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors with custom detail message', async () => {
    const apiError = {
      response: {
        data: {
          detail: 'Database connection failed',
        },
      },
    };

    vi.mocked(fetchInvoices).mockRejectedValueOnce(apiError);

    const { result } = renderHook(() => useInvoices());

    await act(async () => {
      await result.current.getInvoices('2022-01-01', '2022-01-31');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Database connection failed');
    expect(result.current.invoices).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.isCached).toBe(false);
  });

  it('should handle standard error messages', async () => {
    const standardError = new Error('Network Error');

    vi.mocked(fetchInvoices).mockRejectedValueOnce(standardError);

    const { result } = renderHook(() => useInvoices());

    await act(async () => {
      await result.current.getInvoices('2022-01-01', '2022-01-31');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network Error');
    expect(result.current.invoices).toEqual([]);
  });

  it('should handle unexpected/generic error objects', async () => {
    vi.mocked(fetchInvoices).mockRejectedValueOnce({});

    const { result } = renderHook(() => useInvoices());

    await act(async () => {
      await result.current.getInvoices('2022-01-01', '2022-01-31');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('An unexpected error occurred');
    expect(result.current.invoices).toEqual([]);
  });
});
