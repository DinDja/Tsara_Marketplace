import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tsara | Sabedoria Ancestral & Artigos Esotéricos",
    short_name: "Tsara",
    description: "Descubra a magia do autoconhecimento com consultas de Tarot e Baralho Cigano.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    orientation: "portrait",
    scope: "/",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
    categories: ["lifestyle", "wellness", "shopping"],
  }
}