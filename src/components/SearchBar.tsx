
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useMemo, useCallback, startTransition, useDeferredValue } from "react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => {
  // Use React 19's useDeferredValue for smooth search experience
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  // Debounced search implementation with useCallback for performance
  const debouncedSearch = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Use startTransition for non-urgent updates
        startTransition(() => {
          onSearchChange(value);
        });
      }, 300); // 300ms debounce
    };
  }, [onSearchChange]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Trigger immediate search on form submit
    startTransition(() => {
      onSearchChange(searchTerm);
    });
  }, [searchTerm, onSearchChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update UI immediately for responsive feel
    onSearchChange(value);
    // Trigger debounced search
    debouncedSearch(value);
  }, [debouncedSearch, onSearchChange]);

  const handleClear = useCallback(() => {
    startTransition(() => {
      onSearchChange('');
    });
  }, [onSearchChange]);

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
              ${deferredSearchTerm !== searchTerm ? 'bg-muted/50' : ''}
            `}
            autoComplete="off"
            spellCheck="false"
          />
          <Search className={`
            absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 
            transition-colors duration-200
            ${deferredSearchTerm !== searchTerm ? 'text-primary animate-pulse' : 'text-muted-foreground'}
          `} />
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
            ${deferredSearchTerm !== searchTerm ? 'animate-pulse bg-primary/80' : ''}
          `}
          disabled={deferredSearchTerm !== searchTerm}
        >
          {deferredSearchTerm !== searchTerm ? 'Searching...' : 'Search'}
        </Button>
      </form>
      
      {/* Search status indicator */}
      {searchTerm && (
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {deferredSearchTerm !== searchTerm ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Searching for "{searchTerm}"...
            </span>
          ) : (
            <span>
              {searchTerm === deferredSearchTerm && searchTerm ? `Showing results for "${searchTerm}"` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
