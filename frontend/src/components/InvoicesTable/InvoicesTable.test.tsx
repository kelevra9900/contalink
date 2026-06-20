import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InvoicesTable } from './InvoicesTable';
import type { Invoice } from '../../types';

const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoice_number: 'INV-001',
    total: 1500.50,
    invoice_date: '2022-01-17T09:27:44.000Z',
    status: 'Vigente',
    active: true,
  },
  {
    id: 2,
    invoice_number: 'INV-002',
    total: 2500.00,
    invoice_date: '2022-01-18T10:00:00.000Z',
    status: 'Vigente',
    active: true,
  }
];

describe('InvoicesTable', () => {
  it('renders empty state message when list is empty', () => {
    render(
      <InvoicesTable
        invoices={[]}
        totalCount={0}
        page={1}
        pageSize={10}
        isCached={false}
        onPageChange={vi.fn()}
      />
    );
    
    expect(screen.getByText(/no invoices found/i)).toBeInTheDocument();
  });

  it('renders invoices list when items are provided', () => {
    render(
      <InvoicesTable
        invoices={mockInvoices}
        totalCount={2}
        page={1}
        pageSize={10}
        isCached={false}
        onPageChange={vi.fn()}
      />
    );
    
    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('INV-002')).toBeInTheDocument();
    expect(screen.getByText('$1,500.50')).toBeInTheDocument();
    expect(screen.getByText('$2,500.00')).toBeInTheDocument();
  });

  it('shows badge as Live DB or Cached depending on isCached prop', () => {
    const { rerender } = render(
      <InvoicesTable
        invoices={mockInvoices}
        totalCount={2}
        page={1}
        pageSize={10}
        isCached={false}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/live db/i)).toBeInTheDocument();

    rerender(
      <InvoicesTable
        invoices={mockInvoices}
        totalCount={2}
        page={1}
        pageSize={10}
        isCached={true}
        onPageChange={vi.fn()}
      />
    );
    expect(screen.getByText(/cached/i)).toBeInTheDocument();
  });

  it('disables next/prev button appropriately and fires page change events', () => {
    const handlePageChange = vi.fn();
    
    render(
      <InvoicesTable
        invoices={mockInvoices}
        totalCount={15}
        page={1}
        pageSize={10}
        isCached={false}
        onPageChange={handlePageChange}
      />
    );
    
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
    
    fireEvent.click(nextButton);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it('handles missing values and rendering defaults for null/empty fields', () => {
    const incompleteInvoice = [
      {
        id: 3,
        invoice_number: null,
        total: null,
        invoice_date: null,
        status: null,
        active: false,
      }
    ];

    render(
      <InvoicesTable
        invoices={incompleteInvoice}
        totalCount={1}
        page={1}
        pageSize={10}
        isCached={false}
        onPageChange={vi.fn()}
      />
    );

    // Verify fallback defaults
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('renders pagination ellipses when skipped pages exist', () => {
    render(
      <InvoicesTable
        invoices={mockInvoices}
        totalCount={100}
        page={5}
        pageSize={10}
        isCached={false}
        onPageChange={vi.fn()}
      />
    );

    // Verify ellipses exist
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
  });
});
