import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DateRangeForm } from './DateRangeForm';

describe('DateRangeForm', () => {
  it('renders input fields and submit button', () => {
    render(<DateRangeForm onSubmit={vi.fn()} loading={false} />);
    
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('shows error messages when fields are empty and form is submitted', () => {
    render(<DateRangeForm onSubmit={vi.fn()} loading={false} />);
    
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
  });

  it('shows error when start date is after end date', () => {
    render(<DateRangeForm onSubmit={vi.fn()} loading={false} />);
    
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2022-01-31' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2022-01-01' } });
    
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    expect(screen.getByText(/start date cannot be after end date/i)).toBeInTheDocument();
  });

  it('calls onSubmit with proper values when validation passes', () => {
    const handleSubmit = vi.fn();
    render(<DateRangeForm onSubmit={handleSubmit} loading={false} />);
    
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2022-01-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2022-01-31' } });
    
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith('2022-01-01', '2022-01-31');
  });
});
