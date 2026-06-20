export interface Invoice {
  id: number;
  invoice_number: string | null;
  total: number | null;
  invoice_date: string | null;
  status: string | null;
  active: boolean;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  total_count: number;
  page: number;
  page_size: number;
  cached: boolean;
}

export interface DateRangeQuery {
  start_date: string;
  end_date: string;
  page: number;
  page_size: number;
}
