import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TRACED: AE-FE-006
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
