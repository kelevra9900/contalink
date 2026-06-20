import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { useInvoices } from './hooks/useInvoices';

vi.mock('./hooks/useInvoices', () => ({
  useInvoices: vi.fn(),
}));

const mockInvoices = [
  {
    id: 1,
    invoice_number: 'INV-001',
    total: 1000.00,
    invoice_date: '2022-01-10T10:00:00.000Z',
    status: 'Vigente',
    active: true,
  },
  {
    id: 2,
    invoice_number: 'INV-002',
    total: 2000.00,
    invoice_date: '2022-01-15T11:00:00.000Z',
    status: 'Cancelado',
    active: false,
  },
];

describe('App component', () => {
  let mockGetInvoices: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetInvoices = vi.fn();
  });

  it('renders sidebar navigation and top navbar branding', () => {
    vi.mocked(useInvoices).mockReturnValue({
      invoices: [],
      totalCount: 0,
      loading: false,
      error: null,
      isCached: false,
      getInvoices: mockGetInvoices,
    });

    render(<App />);

    expect(screen.getByText('ProAcc')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /invoices/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /customers/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /reports/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add new/i })).toBeInTheDocument();
  });

  it('triggers initial data fetch on mount', () => {
    vi.mocked(useInvoices).mockReturnValue({
      invoices: [],
      totalCount: 0,
      loading: false,
      error: null,
      isCached: false,
      getInvoices: mockGetInvoices,
    });

    render(<App />);

    expect(mockGetInvoices).toHaveBeenCalledWith('2022-01-01', '2022-01-31', 1, 15);
  });

  it('renders LoadingSpinner when loading is true', () => {
    vi.mocked(useInvoices).mockReturnValue({
      invoices: [],
      totalCount: 0,
      loading: true,
      error: null,
      isCached: false,
      getInvoices: mockGetInvoices,
    });

    const { container } = render(<App />);

    expect(container.querySelector('[class*="skeletonContainer"]')).toBeInTheDocument();
  });

  it('renders error alert when API call fails', () => {
    vi.mocked(useInvoices).mockReturnValue({
      invoices: [],
      totalCount: 0,
      loading: false,
      error: 'Unable to reach backend API',
      isCached: false,
      getInvoices: mockGetInvoices,
    });

    render(<App />);

    expect(screen.getByText(/error retrieving data:/i)).toBeInTheDocument();
    expect(screen.getByText(/unable to reach backend api/i)).toBeInTheDocument();
  });

  it('calculates KPI metrics correctly and renders invoices table', () => {
    vi.mocked(useInvoices).mockReturnValue({
      invoices: mockInvoices,
      totalCount: 2,
      loading: false,
      error: null,
      isCached: false,
      getInvoices: mockGetInvoices,
    });

    render(<App />);

    // Total: 1000 + 2000 = 3000
    expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    // Average: 3000 / 2 = 1500
    expect(screen.getByText('$1,500.00')).toBeInTheDocument();
    // Active count: 1 (INV-001 is active)
    const activeCard = screen.getByText('Active Invoices').closest('[class*="kpiCard"]');
    expect(activeCard).toHaveTextContent('1');
    // Canceled count: 1 (INV-002 is Cancelado)
    const canceledCard = screen.getByText('Canceled Invoices').closest('[class*="kpiCard"]');
    expect(canceledCard).toHaveTextContent('1');

    // Table rows rendered
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('INV-002')).toBeInTheDocument();
  });

  it('triggers a new search query when form is submitted', () => {
    vi.mocked(useInvoices).mockReturnValue({
      invoices: [],
      totalCount: 0,
      loading: false,
      error: null,
      isCached: false,
      getInvoices: mockGetInvoices,
    });

    render(<App />);

    // Change start date and end date
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    const submitButton = screen.getByRole('button', { name: /search/i });

    fireEvent.change(startDateInput, { target: { value: '2022-02-01' } });
    fireEvent.change(endDateInput, { target: { value: '2022-02-28' } });
    fireEvent.click(submitButton);

    // Initial load call was with ('2022-01-01', '2022-01-31', 1, 15)
    // Next call should be with the new range, page reset to 1
    expect(mockGetInvoices).toHaveBeenLastCalledWith('2022-02-01', '2022-02-28', 1, 15);
  });

  it('calls getInvoices with new page on pagination change', () => {
    vi.mocked(useInvoices).mockReturnValue({
      invoices: mockInvoices,
      totalCount: 30, // 2 pages since page size is 15
      loading: false,
      error: null,
      isCached: false,
      getInvoices: mockGetInvoices,
    });

    render(<App />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(mockGetInvoices).toHaveBeenLastCalledWith('2022-01-01', '2022-01-31', 2, 15);
  });
});
