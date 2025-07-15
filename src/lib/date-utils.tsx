import React, { useState, useEffect } from 'react';

/**
 * Custom hook to prevent hydration errors with date formatting
 * Returns null on server-side and formatted date on client-side
 */
export function useClientDate(date: Date, options?: Intl.DateTimeFormatOptions): string | null {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // Only format date on client-side to avoid hydration mismatch
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    setFormattedDate(date.toLocaleDateString('en-US', defaultOptions));
  }, [date, options]);

  return formattedDate;
}

/**
 * Component that safely renders dates without hydration errors
 */
interface SafeDateProps {
  date: Date;
  options?: Intl.DateTimeFormatOptions;
  fallback?: string;
  className?: string;
}

export function SafeDate({ date, options, fallback = '...', className }: SafeDateProps) {
  const formattedDate = useClientDate(date, options);
  
  return (
    <span className={className}>
      {formattedDate || fallback}
    </span>
  );
}

/**
 * Utility function for consistent date formatting
 */
export function formatDateSafe(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Utility function for relative time formatting (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}
