import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number) {
  const formatted = value.toFixed(2).replace(".", ",")
  return formatted.endsWith(",00") ? formatted.slice(0, -3) : formatted
}
