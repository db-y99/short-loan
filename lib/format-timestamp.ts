/**
 * Format timestamp utility
 * Feature: chat-va-trao-doi-nhat-ky
 */

/**
 * Format timestamp to Vietnamese format
 * - Today: HH:mm
 * - Yesterday: Hôm qua HH:mm
 * - This year: dd/mm HH:mm
 * - Other years: dd/mm/yyyy HH:mm
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  const isToday = 
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  
  const isYesterday = 
    date.getDate() === now.getDate() - 1 &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  
  const isSameYear = date.getFullYear() === now.getFullYear();
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  if (isToday) {
    return `${hours}:${minutes}`;
  }
  
  if (isYesterday) {
    return `Hôm qua ${hours}:${minutes}`;
  }
  
  if (isSameYear) {
    return `${day}/${month} ${hours}:${minutes}`;
  }
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
