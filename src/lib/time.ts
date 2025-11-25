/**
 * Converts a relative time string (e.g., "2 hours ago") to a Date object
 * @param relativeTime - The relative time string from the API
 * @returns Date object representing the published time
 */
export function parseRelativeTime(relativeTime: string): Date {
  const now = new Date();
  const match = relativeTime.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
  
  if (!match) {
    // If we can't parse it, return current time
    return now;
  }

  const [, amount, unit] = match;
  const value = parseInt(amount, 10);

  switch (unit.toLowerCase()) {
    case 'second':
      return new Date(now.getTime() - value * 1000);
    case 'minute':
      return new Date(now.getTime() - value * 60 * 1000);
    case 'hour':
      return new Date(now.getTime() - value * 60 * 60 * 1000);
    case 'day':
      return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
    case 'week':
      return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - value * 365 * 24 * 60 * 60 * 1000);
    default:
      return now;
  }
}

/**
 * Converts a Date to a relative time string (e.g., "2 hours ago")
 * @param date - The date to convert
 * @returns Relative time string
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}