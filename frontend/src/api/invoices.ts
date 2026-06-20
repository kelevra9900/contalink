import { apiClient } from './client';
import type { DateRangeQuery, InvoicesResponse } from '../types';

export const fetchInvoices = async (params: DateRangeQuery): Promise<InvoicesResponse> => {
  const response = await apiClient.get<InvoicesResponse>('/invoices', {
    params: {
      start_date: params.start_date,
      end_date: params.end_date,
      page: params.page,
      page_size: params.page_size,
    },
  });
  return response.data;
};
