import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número como moneda en formato mexicano
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (num === null || num === undefined || isNaN(num)) {
    return '$0.00'
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Formatea un número sin símbolo de moneda
 */
export function formatNumber(value: number | string | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (num === null || num === undefined || isNaN(num)) {
    return '0'
  }

  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Formatea un porcentaje
 */
export function formatPercent(value: number | string | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (num === null || num === undefined || isNaN(num)) {
    return '0%'
  }

  return `${num.toFixed(2)}%`
}

/**
 * Formatea una fecha en formato corto
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d)
}

/**
 * Formatea solo la hora
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Calcula el cambio a devolver
 */
export function calculateChange(total: number, received: number): number {
  const change = received - total
  return change >= 0 ? change : 0
}

/**
 * Valida un código de barras
 */
export function isValidBarcode(code: string): boolean {
  return /^[0-9]{8,13}$/.test(code)
}

/**
 * Genera un SKU aleatorio
 */
export function generateSKU(prefix: string = 'PRD'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Trunca texto con ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Convierte un string a formato de nombre propio
 */
export function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Valida un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida un RFC mexicano
 */
export function isValidRFC(rfc: string): boolean {
  const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/
  return rfcRegex.test(rfc.toUpperCase())
}

/**
 * Valida un teléfono mexicano
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{10}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

/**
 * Formatea un teléfono en formato (XXX) XXX-XXXX
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length !== 10) return phone
  
  return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
}

/**
 * Calcula el descuento
 */
export function calculateDiscount(
  price: number,
  discount: number,
  isPercentage: boolean = true
): number {
  if (isPercentage) {
    return (price * discount) / 100
  }
  return discount
}

/**
 * Aplica descuento a un precio
 */
export function applyDiscount(
  price: number,
  discount: number,
  isPercentage: boolean = true
): number {
  const discountAmount = calculateDiscount(price, discount, isPercentage)
  return Math.max(0, price - discountAmount)
}

/**
 * Calcula el IVA (16% en México)
 */
export function calculateTax(amount: number, taxRate: number = 16): number {
  return (amount * taxRate) / 100
}

/**
 * Obtiene el total con IVA incluido
 */
export function getTotalWithTax(amount: number, taxRate: number = 16): number {
  return amount + calculateTax(amount, taxRate)
}

/**
 * Separa el IVA del total (cuando el precio ya incluye IVA)
 */
export function separateTax(totalWithTax: number, taxRate: number = 16): {
  subtotal: number
  tax: number
} {
  const subtotal = totalWithTax / (1 + taxRate / 100)
  const tax = totalWithTax - subtotal
  return { subtotal, tax }
}

/**
 * Convierte una cantidad a palabras (para cheques)
 */
export function numberToWords(num: number): string {
  const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
  const tens = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']
  
  if (num === 0) return 'cero'
  if (num < 10) return units[num]
  if (num >= 10 && num < 20) return teens[num - 10]
  if (num >= 20 && num < 100) {
    const ten = Math.floor(num / 10)
    const unit = num % 10
    return unit === 0 ? tens[ten] : `${tens[ten]} y ${units[unit]}`
  }
  
  return num.toString()
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Genera un ID único
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Obtiene las iniciales de un nombre
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Convierte bytes a formato legible
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy text: ', err)
    return false
  }
}

/**
 * Descarga un archivo
 */
export function downloadFile(data: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([data], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Calcula el margen de ganancia
 */
export function calculateProfit(salePrice: number, costPrice: number): {
  profit: number
  margin: number
  markup: number
} {
  const profit = salePrice - costPrice
  const margin = (profit / salePrice) * 100
  const markup = (profit / costPrice) * 100
  
  return {
    profit: Math.max(0, profit),
    margin: isFinite(margin) ? margin : 0,
    markup: isFinite(markup) ? markup : 0,
  }
}

/**
 * Convierte un color hex a RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Obtiene un color de contraste (blanco o negro) basado en el fondo
 */
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#000000'
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128 ? '#000000' : '#FFFFFF'
}

/**
 * Redondea un número a ciertos centavos (ej: 0.50, 0.10)
 */
export function roundToNearest(value: number, nearest: number = 0.5): number {
  return Math.round(value / nearest) * nearest
}

/**
 * Calcula el tiempo transcurrido en formato legible
 */
export function timeAgo(date: string | Date): string {
  const now = new Date()
  const past = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
    segundo: 1,
  }

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval)
    if (interval >= 1) {
      return `hace ${interval} ${name}${interval !== 1 ? 's' : ''}`
    }
  }

  return 'justo ahora'
}