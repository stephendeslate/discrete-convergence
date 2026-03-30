import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TRACED:EM-FE-002
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
