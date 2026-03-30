import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TRACED: EM-FE-001 — Utility function for conditional class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
