import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TRACED: EM-UI-001
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
