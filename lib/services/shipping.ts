export interface CepResult {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  estado: string
}

export interface FreightOption {
  name: string
  price: number
  days: number
}

const REGION_BASE = [
  { prefix: "0", name: "Grande SP", base: 0 },
  { prefix: "1", name: "Interior SP", base: 8 },
  { prefix: "2", name: "RJ", base: 15 },
  { prefix: "3", name: "MG", base: 18 },
  { prefix: "4", name: "BA/SE", base: 25 },
  { prefix: "5", name: "PE/AL/PB/RN", base: 30 },
  { prefix: "6", name: "CE/PI/MA/PA/AM/AC/AP/RR", base: 40 },
  { prefix: "7", name: "DF/GO/MT/MS/TO", base: 22 },
  { prefix: "8", name: "PR/SC", base: 22 },
  { prefix: "9", name: "RS", base: 28 },
]

function getRegionBase(cep: string): number {
  const prefix = cep?.replace(/\D/g, "")[0] || "0"
  return REGION_BASE.find((r) => r.prefix === prefix)?.base ?? 15
}

export async function lookupCep(cep: string): Promise<CepResult | null> {
  const clean = cep.replace(/\D/g, "")
  if (clean.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    const data = await res.json()
    if (data.erro) return null
    return {
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf,
    }
  } catch {
    return null
  }
}

export function calculateShipping(cep: string, itemCount: number): FreightOption[] {
  const base = getRegionBase(cep)
  const weight = Math.max(1, Math.ceil(itemCount * 0.3))
  const distance = base + weight * 2

  return [
    { name: "PAC", price: Math.max(9.9, Math.round((8 + distance * 0.5) * 100) / 100), days: Math.max(5, 5 + Math.floor(distance / 8)) },
    { name: "Sedex", price: Math.max(14.9, Math.round((15 + distance * 0.8) * 100) / 100), days: Math.max(1, 1 + Math.floor(distance / 15)) },
  ]
}
