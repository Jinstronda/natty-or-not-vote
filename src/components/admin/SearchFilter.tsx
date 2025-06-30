import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  controversialFilter: string;
  onControversialFilterChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export function SearchFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  controversialFilter,
  onControversialFilterChange,
  totalCount,
  filteredCount,
  onClearFilters
}: SearchFilterProps) {
  const hasFilters = searchTerm || statusFilter !== 'all' || controversialFilter !== 'all';

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      {/* Search and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search influencers by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="natty">Natural</SelectItem>
              <SelectItem value="juicy">Enhanced</SelectItem>
              <SelectItem value="unclaimed">Unclaimed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Controversial Filter */}
        <Select value={controversialFilter} onValueChange={onControversialFilterChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Controversial" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="controversial">🔥 Controversial</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>
            Showing <Badge variant="secondary">{filteredCount}</Badge> of{' '}
            <Badge variant="outline">{totalCount}</Badge> influencers
          </span>
          {hasFilters && (
            <Badge variant="secondary" className="ml-2">
              Filtered
            </Badge>
          )}
        </div>

        {/* Active Filters Display */}
        {hasFilters && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {searchTerm && (
              <Badge variant="outline" className="text-xs">
                "{searchTerm}"
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="outline" className="text-xs">
                {statusFilter}
              </Badge>
            )}
            {controversialFilter !== 'all' && (
              <Badge variant="outline" className="text-xs">
                {controversialFilter}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 