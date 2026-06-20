import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchInvoices } from './invoices';
import { apiClient } from './client';

describe('invoices API client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls apiClient.get with correct path and parameters', async () => {
    const mockData = {
      invoices: [
        {
          id: 1,
          invoice_number: 'INV-100',
          total: 100.5,
          invoice_date: '2022-01-01',
          status: 'Vigente',
          active: true,
        },
      ],
      total_count: 1,
      page: 1,
      page_size: 15,
      cached: false,
    };

    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      data: mockData,
    });

    const queryParams = {
      start_date: '2022-01-01',
      end_date: '2022-01-31',
      page: 1,
      page_size: 15,
    };

    const result = await fetchInvoices(queryParams);

    expect(getSpy).toHaveBeenCalledWith('/invoices', {
      params: {
        start_date: '2022-01-01',
        end_date: '2022-01-31',
        page: 1,
        page_size: 15,
      },
    });
    expect(result).toEqual(mockData);
  });
});
