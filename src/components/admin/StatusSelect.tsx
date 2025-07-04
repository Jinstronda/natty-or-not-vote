import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusSelectProps {
  currentStatus: string;
  isLoading: boolean;
  onStatusChange: (newStatus: string) => void;
  influencerName: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'select' | 'badge';
}

export function StatusSelect({
  currentStatus,
  isLoading,
  onStatusChange,
  influencerName,
  size = 'sm',
  variant = 'select'
}: StatusSelectProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'natty':
      case 'natural':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'juicy':
      case 'enhanced':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'unclaimed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'natty':
        return 'Natural';
      case 'juicy':
        return 'Enhanced';
      case 'unclaimed':
        return 'Unclaimed';
      default:
        return status || 'Unclaimed';
    }
  };

  const selectSizes = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base'
  };

  if (variant === 'badge') {
    return (
      <Badge 
        className={cn(
          'inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity',
          getStatusColor(currentStatus)
        )}
        title={`Click to change status for ${influencerName}`}
      >
        {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
        {getStatusDisplay(currentStatus)}
      </Badge>
    );
  }

  return (
    <Select 
      value={currentStatus?.toLowerCase() || 'unclaimed'} 
      onValueChange={onStatusChange}
      disabled={isLoading}
    >
      <SelectTrigger 
        className={cn(
          selectSizes[size],
          'min-w-[100px] focus:ring-2 focus:ring-blue-500'
        )}
        title={`Change status for ${influencerName}`}
      >
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          <SelectValue>
            <span className={cn(
              'px-2 py-1 rounded-md text-xs font-medium',
              getStatusColor(currentStatus)
            )}>
              {getStatusDisplay(currentStatus)}
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="natty" className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Natural</span>
          </div>
        </SelectItem>
        <SelectItem value="juicy" className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Enhanced</span>
          </div>
        </SelectItem>
        <SelectItem value="unclaimed" className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Unclaimed</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'natty':
      case 'natural':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'juicy':
      case 'enhanced':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'unclaimed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'natty':
        return 'Natural';
      case 'juicy':
        return 'Enhanced';
      case 'unclaimed':
        return 'Unclaimed';
      default:
        return status || 'Unclaimed';
    }
  };

  const badgeSizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <Badge 
      className={cn(
        badgeSizes[size],
        getStatusColor(status)
      )}
    >
      {getStatusDisplay(status)}
    </Badge>
  );
} 