import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

/**
 * Formats published_at into a human-readable string.
 * Examples: "2 hours ago", "Today at 5:00 AM", "Yesterday at 3:30 PM"
 */
export function formatPublishedAt(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`;
  }
  return format(date, "MMM d, yyyy 'at' h:mm a");
}
