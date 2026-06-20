import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders correctly with skeleton elements and rows', () => {
    const { container } = render(<LoadingSpinner />);
    
    // Check that we render the skeleton wrapper
    const skeletonContainer = container.querySelector('[class*="skeletonContainer"]');
    expect(skeletonContainer).toBeInTheDocument();

    // Check table header is rendered
    const tableHeader = container.querySelector('[class*="tableHeader"]');
    expect(tableHeader).toBeInTheDocument();

    // Check that there are 5 skeleton rows
    const rows = container.querySelectorAll('[class*="row"]');
    expect(rows).toHaveLength(5);
  });
});
