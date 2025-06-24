
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchBar = ({ searchTerm, onSearchChange }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    // TODO: Implement search functionality
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 group">
          <Input
            type="text"
            placeholder="Search for fitness influencers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="pl-10 h-12 text-lg bg-input border-border focus:border-primary peer"
          />
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-all duration-200 ease-gentle ${
            isFocused || searchTerm 
              ? 'text-primary scale-110' 
              : 'text-muted-foreground scale-100'
          } peer-hover:text-primary/70`} />
          
          {/* Subtle glow effect when focused */}
          <div className={`absolute inset-0 rounded-md transition-opacity duration-300 ease-gentle pointer-events-none ${
            isFocused 
              ? 'opacity-100 shadow-lg shadow-primary/10' 
              : 'opacity-0'
          }`} />
        </div>
        <Button 
          type="submit" 
          size="lg" 
          className="h-12 px-8 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 ease-gentle"
        >
          Search
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;
