export const cardBrands = {
  Visa: (
    <svg viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="32" rx="4" fill="#1A1F71" />
      <text x="25" y="20" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">VISA</text>
    </svg>
  ),
  Mastercard: (
    <svg viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="32" rx="4" fill="#F9F9F9" />
      <circle cx="18" cy="16" r="9" fill="#EB001B" />
      <circle cx="32" cy="16" r="9" fill="#F79E1B" opacity="0.8" />
    </svg>
  ),
  Amex: (
    <svg viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="32" rx="4" fill="#2E77BC" />
      <text x="25" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">AMEX</text>
    </svg>
  ),
  Elo: (
    <svg viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="32" rx="4" fill="#F9F9F9" />
      <circle cx="17" cy="16" r="9" fill="#FFA200" />
      <circle cx="27" cy="16" r="9" fill="#E30E19" opacity="0.8" />
      <circle cx="37" cy="16" r="9" fill="#0C4B8D" opacity="0.7" />
    </svg>
  ),
  Hipercard: (
    <svg viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="32" rx="4" fill="#B3131B" />
      <text x="25" y="20" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">Hipercard</text>
    </svg>
  ),
  Discover: (
    <svg viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="32" rx="4" fill="#F9F9F9" />
      <rect x="0" y="0" width="50" height="32" rx="4" fill="url(#discover-grad)" />
      <text x="25" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">Discover</text>
      <defs>
        <linearGradient id="discover-grad" x1="0" y1="0" x2="50" y2="0">
          <stop offset="0%" stopColor="#FF6600" />
          <stop offset="100%" stopColor="#FF9444" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Diners: (
    <svg viewBox="0 0 50 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="50" height="32" rx="4" fill="#008080" />
      <text x="25" y="17" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial">DINERS</text>
      <text x="25" y="24" textAnchor="middle" fill="white" fontSize="4" fontWeight="bold" fontFamily="Arial">CLUB</text>
    </svg>
  ),
} as const

export type CardBrandName = keyof typeof cardBrands

export function CardBrandIcon({ brand, className }: { brand: string; className?: string }) {
  const svg = cardBrands[brand as CardBrandName]
  if (!svg) return (
    <div className={`w-10 h-7 rounded bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground font-sans ${className ?? ""}`}>
      {brand.slice(0, 2).toUpperCase()}
    </div>
  )
  return <div className={`w-10 h-7 ${className ?? ""}`}>{svg}</div>
}
