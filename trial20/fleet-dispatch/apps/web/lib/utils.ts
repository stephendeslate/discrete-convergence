import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TRACED: FD-SEC-003
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
