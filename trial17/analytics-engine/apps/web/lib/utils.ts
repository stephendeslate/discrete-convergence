import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TRACED: AE-FE-006 — cn() utility uses clsx + tailwind-merge for class composition

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
