const brands: { regex: RegExp; name: string; color: string }[] = [
  { regex: /^4/, name: "Visa", color: "#1A1F71" },
  { regex: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/, name: "Mastercard", color: "#EB001B" },
  { regex: /^3[47]/, name: "Amex", color: "#2E77BC" },
  { regex: /^(6011|65|64[4-9]|622)/, name: "Discover", color: "#FF6600" },
  { regex: /^3(?:0[0-5]|[68])/, name: "Diners", color: "#008080" },
  { regex: /^(606282|3841|637|638|639)/, name: "Hipercard", color: "#B3131B" },
  { regex: /^(636368|438935|504175|451416|50904|627780|636297)/, name: "Elo", color: "#0B4EA2" },
]

export function detectCardBrand(number: string): { name: string; color: string } | null {
  const clean = number.replace(/\D/g, "")
  for (const b of brands) {
    if (b.regex.test(clean)) return { name: b.name, color: b.color }
  }
  return null
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
      return digits.slice(0, 2) + "/" + digits.slice(2)
}

