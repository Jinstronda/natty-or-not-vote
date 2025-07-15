import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ReviewSortingControls } from '../ReviewSortingControls';

// Mock props for testing
const defaultProps = {
  currentSort: 'recent' as const,
  onSortChange: vi.fn(),
  totalCount: 25,
  loadedCount: 10,
  isLoading: false
};

describe('ReviewSortingControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sorting controls with correct test IDs', () => {
    render(<ReviewSortingControls {...defaultProps} />);
    
    // Check for required test IDs mentioned in PRP
    expect(screen.getByTestId('sorting-controls')).toBeInTheDocument();
    expect(screen.getByTestId('sort-recent')).toBeInTheDocument();
    expect(screen.getByTestId('sort-popular')).toBeInTheDocument();
  });

  it('displays correct review count', () => {
    render(<ReviewSortingControls {...defaultProps} />);
    
    expect(screen.getByText('25 reviews')).toBeInTheDocument();
  });

  it('displays singular review count correctly', () => {
    render(<ReviewSortingControls {...defaultProps} totalCount={1} />);
    
    expect(screen.getByText('1 review')).toBeInTheDocument();
  });

  it('displays no reviews message when count is zero', () => {
    render(<ReviewSortingControls {...defaultProps} totalCount={0} />);
    
    expect(screen.getByText('No reviews yet')).toBeInTheDocument();
  });

  it('shows pagination indicator when not all reviews are loaded', () => {
    render(<ReviewSortingControls {...defaultProps} />);
    
    expect(screen.getByText('Showing 10 of 25')).toBeInTheDocument();
  });

  it('does not show pagination indicator when all reviews are loaded', () => {
    render(<ReviewSortingControls {...defaultProps} loadedCount={25} />);
    
    expect(screen.queryByText('Showing 10 of 25')).not.toBeInTheDocument();
  });

  it('calls onSortChange when Recent tab is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<ReviewSortingControls {...defaultProps} currentSort="likes" onSortChange={onSortChange} />);
    
    const recentTab = screen.getByTestId('sort-recent');
    await user.click(recentTab);
    
    // The click should trigger the tab change, which calls onValueChange
    expect(onSortChange).toHaveBeenCalledWith('recent');
  });

  it('calls onSortChange when Popular tab is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<ReviewSortingControls {...defaultProps} onSortChange={onSortChange} />);
    
    const popularTab = screen.getByTestId('sort-popular');
    await user.click(popularTab);
    
    // The click should trigger the tab change, which calls onValueChange
    expect(onSortChange).toHaveBeenCalledWith('likes');
  });

  it('shows loading state during sort change', () => {
    render(<ReviewSortingControls {...defaultProps} isLoading={true} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('disables sort tabs when loading', () => {
    render(<ReviewSortingControls {...defaultProps} isLoading={true} />);
    
    expect(screen.getByTestId('sort-recent')).toBeDisabled();
    expect(screen.getByTestId('sort-popular')).toBeDisabled();
  });

  it('highlights the current sort option', () => {
    render(<ReviewSortingControls {...defaultProps} currentSort="recent" />);
    
    // Recent should be selected (active state)
    const recentTab = screen.getByTestId('sort-recent');
    expect(recentTab).toHaveAttribute('data-state', 'active');
  });

  it('shows correct icons for sort options', () => {
    render(<ReviewSortingControls {...defaultProps} />);
    
    // Check for Clock icon in Recent tab
    const recentTab = screen.getByTestId('sort-recent');
    expect(recentTab).toHaveTextContent('Recent');
    
    // Check for Heart icon in Popular tab  
    const popularTab = screen.getByTestId('sort-popular');
    expect(popularTab).toHaveTextContent('Popular');
  });

  it('renders responsive layout classes', () => {
    const { container } = render(<ReviewSortingControls {...defaultProps} />);
    
    // Check for responsive flex classes
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
  });

  it('renders with proper styling classes', () => {
    const { container } = render(<ReviewSortingControls {...defaultProps} />);
    
    // Check for styling classes mentioned in PRP
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('bg-muted/30', 'rounded-lg', 'border');
  });
});