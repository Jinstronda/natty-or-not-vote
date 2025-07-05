import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePaginatedReviews } from '../usePaginatedReviews';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => ({
                data: [
                  {
                    id: '1',
                    user_id: 'user1',
                    influencer_id: 'inf1',
                    vote: 'natty',
                    content: 'Test review 1',
                    timestamp: '2024-01-01T00:00:00Z',
                    likes: 5,
                    dislikes: 1,
                    profiles: { username: 'testuser1', profile_picture_url: null }
                  },
                  {
                    id: '2',
                    user_id: 'user2',
                    influencer_id: 'inf1',
                    vote: 'juicy',
                    content: 'Test review 2',
                    timestamp: '2024-01-02T00:00:00Z',
                    likes: 10,
                    dislikes: 0,
                    profiles: { username: 'testuser2', profile_picture_url: 'pic.jpg' }
                  }
                ],
                error: null
              }))
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock the timeout utility
vi.mock('@/utils/loadingTimeout', () => ({
  withDatabaseTimeout: vi.fn((fn) => fn())
}));

describe('usePaginatedReviews', () => {
  const defaultOptions = {
    influencerId: 'test-influencer-id',
    pageSize: 10,
    sortBy: 'recent' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => usePaginatedReviews(defaultOptions));

    expect(result.current.reviews).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.sortBy).toBe('recent');
    expect(result.current.stats.totalCount).toBe(0);
  });

  it('provides changeSorting function', () => {
    const { result } = renderHook(() => usePaginatedReviews(defaultOptions));

    expect(typeof result.current.changeSorting).toBe('function');
  });

  it('provides refresh function', () => {
    const { result } = renderHook(() => usePaginatedReviews(defaultOptions));

    expect(typeof result.current.refresh).toBe('function');
  });

  it('provides loadMore function', () => {
    const { result } = renderHook(() => usePaginatedReviews(defaultOptions));

    expect(typeof result.current.loadMore).toBe('function');
  });

  it('provides initialLoad function', () => {
    const { result } = renderHook(() => usePaginatedReviews(defaultOptions));

    expect(typeof result.current.initialLoad).toBe('function');
  });

  it('calculates stats correctly', () => {
    const { result } = renderHook(() => usePaginatedReviews(defaultOptions));

    // Initially should have zero stats
    expect(result.current.stats.totalCount).toBe(0);
    expect(result.current.stats.loadedCount).toBe(0);
    expect(result.current.stats.currentPageDisplay).toBe(1);
    expect(result.current.stats.hasNextPage).toBe(true);
  });

  it('updates sortBy when changeSorting is called', async () => {
    const { result } = renderHook(() => usePaginatedReviews(defaultOptions));

    await act(async () => {
      await result.current.changeSorting('likes');
    });

    expect(result.current.sortBy).toBe('likes');
  });

  it('does not call changeSorting for same sort option', async () => {
    const { result } = renderHook(() => usePaginatedReviews(defaultOptions));

    // Should not change anything if same sort is requested
    await act(async () => {
      await result.current.changeSorting('recent');
    });

    expect(result.current.sortBy).toBe('recent');
  });

  it('supports different sort options', () => {
    const { result: recentResult } = renderHook(() => 
      usePaginatedReviews({ ...defaultOptions, sortBy: 'recent' })
    );
    
    const { result: likesResult } = renderHook(() => 
      usePaginatedReviews({ ...defaultOptions, sortBy: 'likes' })
    );

    expect(recentResult.current.sortBy).toBe('recent');
    expect(likesResult.current.sortBy).toBe('likes');
  });

  it('maintains consistent API interface', () => {
    const { result } = renderHook(() => usePaginatedReviews(defaultOptions));

    // Check all required properties exist
    expect(result.current).toHaveProperty('reviews');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('hasMore');
    expect(result.current).toHaveProperty('sortBy');
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('loadMore');
    expect(result.current).toHaveProperty('changeSorting');
    expect(result.current).toHaveProperty('refresh');
    expect(result.current).toHaveProperty('initialLoad');
  });

  it('handles different page sizes', () => {
    const { result: smallPage } = renderHook(() => 
      usePaginatedReviews({ ...defaultOptions, pageSize: 5 })
    );
    
    const { result: largePage } = renderHook(() => 
      usePaginatedReviews({ ...defaultOptions, pageSize: 20 })
    );

    // Both should initialize correctly regardless of page size
    expect(smallPage.current.reviews).toEqual([]);
    expect(largePage.current.reviews).toEqual([]);
  });
});