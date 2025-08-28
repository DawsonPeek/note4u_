import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encodeTeacherId(id: string): string {
  return btoa(id).replace(/[+/=]/g, (char) => {
    switch (char) {
      case '+': return '-'
      case '/': return '_'
      case '=': return ''
      default: return char
    }
  })
}

export function decodeTeacherId(encodedId: string): string {
  const base64 = encodedId.replace(/[-_]/g, (char) => {
    switch (char) {
      case '-': return '+'
      case '_': return '/'
      default: return char
    }
  })

  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)

  try {
    return atob(padded)
  } catch (error) {
    throw new Error('ID teacher non valido')
  }
}
