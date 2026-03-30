// TRACED:AE-WEB-UTIL-001 — cn utility with clsx + tailwind-merge
// TRACED:FE-CN-UTILITY — cn() wraps clsx + twMerge (VERIFY:FE-CN-UTILITY)
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
