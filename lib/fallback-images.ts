const consultationFallbacks = [
  "https://s2-techtudo.glbimg.com/8PLtIGjtl3oDZZXFGhOHj55J3Eo=/0x0:4868x2738/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_08fbf48bc0524877943fe86e43087e7a/internal_photos/bs/2022/d/L/3lKeaFSy6Fz3CD5Q3HhQ/petr-sidorov-d3szbcaemhq-unsplash.jpg",
  "https://lotusesoterismo.com.br/wp-content/uploads/elementor/thumbs/consulta-de-tarot-shutterstock_1886510446-2022-f-qqyodq7vw0na2p16vt835eoyrizvk0q5xi5lzz795g.jpg",
  "https://unolife.com.br/wp-content/uploads/2025/08/porque-fazer-uma-consulta-de-tarot-1024x576.webp",
  "https://www.astrocentro.com.br/blog/wp-content/uploads/2025/10/como-funciona-consulta-tarot.webp",
  "https://i0.wp.com/domdefluir.com/wp-content/uploads/2022/03/consulta-de-tarot.png?fit=512%2C385&ssl=1",
]

export function getConsultationFallbackImage(): string {
  const index = Math.floor(Math.random() * consultationFallbacks.length)
  return consultationFallbacks[index]
}
