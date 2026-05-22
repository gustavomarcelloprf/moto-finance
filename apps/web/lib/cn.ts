import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility para concatenar classes Tailwind com merge inteligente.
 * Resolve conflitos (ex.: `px-2 px-4` → `px-4`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
