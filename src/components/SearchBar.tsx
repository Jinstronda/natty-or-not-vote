
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { useCallback, startTransition } from "react";
import { useSearchState } from "@/hooks/useSearchState";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isGridLoading?: boolean; // Signal from grid about loading state
}

const SearchBar = ({ searchTerm, onSearchChange, isGridLoading = false }: SearchBarProps) => {
  const { 
    searchState, 
    handleSearchInput, 
    clearSearch, 
    showLoadingIndicator,
    searchPerformance,
    isActiveSearch
  } = useSearchState();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Trigger immediate search on form submit
    startTransition(() => {
      onSearchChange(searchTerm);
    });
  }, [searchTerm, onSearchChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Instant visual feedback through search state
    handleSearchInput(value);
    
    // Update parent component
    onSearchChange(value);
  }, [handleSearchInput, onSearchChange]);

  const handleClear = useCallback(() => {
    clearSearch();
    onSearchChange('');
  }, [clearSearch, onSearchChange]);

  // Spinner appears only when a search request is in-flight (not merely typing)
  const isSpinnerActive = searchState.isSearching || isGridLoading;
  // Input visual style should still react on typing/searching
  const isBusy = showLoadingIndicator || isGridLoading;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search for fitness influencers..."
            value={searchTerm}
            onChange={handleInputChange}
            className={`
              pl-10 pr-10 h-12 text-lg bg-input border-border focus:border-primary 
              transition-all duration-200 focus:ring-2 focus:ring-primary/20
              ${isBusy ? 'bg-primary/5 border-primary/30' : ''}
              ${isSpinnerActive ? 'bg-muted/50' : ''}
            `}
            autoComplete="off"
            spellCheck="false"
          />
          
          {/* Dynamic search icon with instant feedback */}
          {isSpinnerActive ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          ) : (
            <Search className={`
              absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 
              transition-colors duration-200
              ${isSpinnerActive ? 'text-primary' : 'text-muted-foreground'}
            `} />
          )}
          
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Button 
          type="submit" 
          size="lg" 
          className={`
            h-12 px-8 transition-all duration-200 
            ${isBusy ? 'bg-primary/80' : ''}
          `}
          disabled={isBusy}
        >
          {isSpinnerActive ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </span>
          ) : (
            'Search'
          )}
        </Button>
      </form>
      
    </div>
  );
};

export default SearchBar;
