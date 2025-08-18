import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  // Merge conditional class names (clsx) and resolve Tailwind conflicts (tailwind-merge)
  return twMerge(clsx(...inputs))
}
