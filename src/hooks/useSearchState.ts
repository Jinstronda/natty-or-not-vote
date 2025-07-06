import { useState, useCallback, useRef, useEffect, startTransition } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface SearchState {
  term: string;
  isSearching: boolean;
  isTyping: boolean;
  hasResults: boolean;
  resultCount: number;
  searchStartTime: number | null;
  searchDuration: number | null;
}

/**
 * Centralized search state management with instant feedback
 * Coordinates between SearchBar and Grid components
 */
export const useSearchState = () => {
  const queryClient = useQueryClient();
  const [searchState, setSearchState] = useState<SearchState>({
    term: '',
    isSearching: false,
    isTyping: false,
    hasResults: false,
    resultCount: 0,
    searchStartTime: null,
    searchDuration: null
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchStartTimeRef = useRef<number | null>(null);

  // Instant visual feedback when user starts typing
  const handleSearchInput = useCallback((newTerm: string) => {
    const trimmedTerm = newTerm.trim();
    
    // Immediate UI update for responsiveness
    setSearchState(prev => ({
      ...prev,
      term: newTerm,
      isTyping: true,
      isSearching: trimmedTerm.length > 0
    }));

    // Clear previous debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // If empty search, reset immediately
    if (trimmedTerm.length === 0) {
      startTransition(() => {
        setSearchState(prev => ({
          ...prev,
          isSearching: false,
          isTyping: false,
          hasResults: false,
          resultCount: 0,
          searchStartTime: null,
          searchDuration: null
        }));
      });
      return;
    }

    // Record search start time
    searchStartTimeRef.current = performance.now();
    
    // Debounced search execution
    debounceTimeoutRef.current = setTimeout(() => {
      startTransition(() => {
        setSearchState(prev => ({
          ...prev,
          isTyping: false,
          isSearching: true,
          searchStartTime: searchStartTimeRef.current
        }));
      });

      // Invalidate existing queries to trigger fresh search
      queryClient.invalidateQueries({ queryKey: ['influencers', 'infinite'] });
      
    }, 300); // 300ms debounce
    
  }, [queryClient]);

  // Called by Grid when search results arrive
  const handleSearchResults = useCallback((results: any[], hasData: boolean) => {
    const endTime = performance.now();
    const duration = searchStartTimeRef.current ? endTime - searchStartTimeRef.current : null;
    
    startTransition(() => {
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        hasResults: hasData,
        resultCount: results.length,
        searchDuration: duration
      }));
    });
  }, []);

  // Called by Grid when search starts loading
  const handleSearchStart = useCallback(() => {
    if (!searchStartTimeRef.current) {
      searchStartTimeRef.current = performance.now();
    }
    
    setSearchState(prev => ({
      ...prev,
      isSearching: true,
      searchStartTime: searchStartTimeRef.current
    }));
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    startTransition(() => {
      setSearchState({
        term: '',
        isSearching: false,
        isTyping: false,
        hasResults: false,
        resultCount: 0,
        searchStartTime: null,
        searchDuration: null
      });
    });
    
    // Clear query cache for fresh results
    queryClient.removeQueries({ queryKey: ['influencers', 'infinite'] });
  }, [queryClient]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchState,
    handleSearchInput,
    handleSearchResults,
    handleSearchStart,
    clearSearch,
    // Computed states for UI
    isActiveSearch: searchState.term.trim().length > 0,
    showLoadingIndicator: searchState.isSearching || searchState.isTyping,
    searchPerformance: searchState.searchDuration ? {
      duration: Math.round(searchState.searchDuration),
      isfast: searchState.searchDuration < 500,
      isSlow: searchState.searchDuration > 1000
    } : null
  };
};