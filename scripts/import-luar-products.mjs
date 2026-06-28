#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore, Timestamp } from "firebase-admin/firestore"

const SOURCE_ORIGIN = "https://www.luar.com.br"
const SOURCE_BASE_URL = `${SOURCE_ORIGIN}/`
const CATEGORY_ENDPOINT = `${SOURCE_BASE_URL}prg/buscarProdutoCategorias.php`
const PRODUCTS_COLLECTION = "products"
const DEFAULT_SERVICE_ACCOUNT_PATH = "public/tsara-ab3fc-firebase-adminsdk-fbsvc-82add8080a.json"

const categories = [
  { id: "4", sourceName: "Esotéricos e Indianos", tsaraCategory: "Rituais", slug: "esotericos" },
  { id: "5", sourceName: "Religiosos", tsaraCategory: "Rituais", slug: "religiosos" },
  { id: "6", sourceName: "Taças e Copos", tsaraCategory: "Acessórios", slug: "tacasecopos" },
  { id: "7", sourceName: "Louças", tsaraCategory: "Acessórios", slug: "loucas" },
  { id: "8", sourceName: "Imagens Religiosas", tsaraCategory: "Rituais", slug: "imagensreligiosas" },
  { id: "9", sourceName: "Linha Jablonex", tsaraCategory: "Acessórios", slug: "jablonex" },
  { id: "10", sourceName: "Livros e Tarôs", tsaraCategory: "Oráculos", slug: "livros" },
  { id: "11", sourceName: "Ferramentas", tsaraCategory: "Acessórios", slug: "ferramentas" },
  { id: "12", sourceName: "Incensos e Defumadores", tsaraCategory: "Incensos", slug: "incensosedefumadores" },
  { id: "13", sourceName: "Velas Magia", tsaraCategory: "Velas", slug: "velasmagia" },
  { id: "14", sourceName: "Tabacaria", tsaraCategory: "Acessórios", slug: "tabacaria" },
  { id: "15", sourceName: "Chapéus", tsaraCategory: "Acessórios", slug: "chapeus" },
]

function loadLocalEnv() {
  for (const filename of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), filename)
    if (!fs.existsSync(filePath)) continue

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
      if (!match) continue

      const [, key, rawValue] = match
      if (process.env[key] !== undefined) continue

      process.env[key] = rawValue
        .replace(/^(['"])(.*)\1$/, "$2")
        .replace(/\\n/g, "\n")
    }
  }
}

function parseArgs(argv) {
  const options = {
    write: false,
    activeOnly: false,
    overwriteCommerce: false,
    categoryIds: [],
    limit: 0,
    batchSize: 450,
    serviceAccountPath: "",
  }

  for (const arg of argv) {
    if (arg === "--write") options.write = true
    else if (arg === "--active-only") options.activeOnly = true
    else if (arg === "--overwrite-commerce") options.overwriteCommerce = true
    else if (arg.startsWith("--category=")) {
      options.categoryIds = arg.split("=")[1].split(",").map((id) => id.trim()).filter(Boolean)
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.split("=")[1]) || 0
    } else if (arg.startsWith("--batch-size=")) {
      options.batchSize = Math.min(Number(arg.split("=")[1]) || 450, 500)
    } else if (arg.startsWith("--service-account=")) {
      options.serviceAccountPath = arg.split("=")[1].trim()
    } else if (arg === "--help" || arg === "-h") {
      printHelp()
      process.exit(0)
    }
  }

  return options
}

function printHelp() {
  console.log(`
Importa produtos reais da Luar para o Firestore do TSARA.

Uso:
  npm run import:luar
  npm run import:luar -- --write
  npm run import:luar -- --category=4,10 --limit=20

Credencial para gravação:
  Por padrão: public/tsara-ab3fc-firebase-adminsdk-fbsvc-82add8080a.json
  Ou defina: TSARA_FIREBASE_SERVICE_ACCOUNT / GOOGLE_APPLICATION_CREDENTIALS

Opções:
  --write                grava no Firestore; sem isso roda em dry-run
  --service-account=...  caminho para o JSON da Firebase Admin SDK
  --category=4,10        importa só categorias específicas da Luar
  --limit=20             limita a quantidade total, útil para teste
  --active-only          ignora produtos inativos na origem
  --overwrite-commerce   reinicia preço/estoque como "sob consulta" em produtos já importados
  --batch-size=450       tamanho do lote de escrita, máximo 500
`)
}

function normalizeText(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

function normalizeName(value) {
  return normalizeText(value).replace(/\s+/g, " ")
}

function toAbsoluteImageUrl(value) {
  const cleaned = normalizeText(value)
  if (!cleaned) return null

  try {
    return new URL(cleaned, SOURCE_BASE_URL).toString()
  } catch {
    return null
  }
}

function parseImages(rawProduct) {
  const images = []
  const rawImages = String(rawProduct.imagem_produto || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  for (const image of rawImages) {
    const url = toAbsoluteImageUrl(image)
    if (url && !images.includes(url)) images.push(url)
  }

  const expanded = toAbsoluteImageUrl(rawProduct.imagem_ampliada)
  if (expanded && !images.includes(expanded)) images.push(expanded)

  return images
}

function buildSourceUrl(productId) {
  return `${SOURCE_BASE_URL}detalhes.html?id=${encodeURIComponent(productId)}`
}

function toTsaraProduct(rawProduct, category) {
  const id = String(rawProduct.id || "").trim()
  const images = parseImages(rawProduct)
  const featured = String(rawProduct.destaque_produto || "0") === "1"
  const active = String(rawProduct.status_produto || "0") === "1"
  const name = normalizeName(rawProduct.nome_produto)
  const description = normalizeText(rawProduct.descricao_produto)

  return {
    docId: `luar-${id}`,
    sourceId: id,
    payload: {
      name,
      category: category.tsaraCategory,
      image: images[0] || "",
      images,
      badge: featured ? "Destaque" : null,
      status: active ? "active" : "inactive",
      featured,
      description,
      source: {
        provider: "luar",
        id,
        url: buildSourceUrl(id),
        categoryId: category.id,
        categoryName: category.sourceName,
        categoryUrl: `${SOURCE_BASE_URL}${category.slug}.html?cat=${category.id}`,
        images,
      },
    },
    active,
    sourceCategoryId: category.id,
    sourceCategoryName: category.sourceName,
  }
}

async function postJson(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "user-agent": "TSARA Luar importer",
    },
    body: new URLSearchParams(data),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} em ${url}`)
  }

  const text = await response.text()
  if (!text.trim()) return null

  return JSON.parse(text)
}

async function fetchCategory(category) {
  const data = await postJson(CATEGORY_ENDPOINT, { id: category.id })
  const records = Array.isArray(data?.retorno) ? data.retorno : []
  return records.map((record) => toTsaraProduct(record, category)).filter((product) => product.sourceId && product.payload.name)
}

async function fetchProducts(options) {
  const selectedCategories = options.categoryIds.length
    ? categories.filter((category) => options.categoryIds.includes(category.id))
    : categories

  if (selectedCategories.length === 0) {
    throw new Error("Nenhuma categoria válida selecionada.")
  }

  const productsById = new Map()
  const counts = []

  for (const category of selectedCategories) {
    const products = await fetchCategory(category)
    counts.push({ category, count: products.length })

    for (const product of products) {
      if (options.activeOnly && !product.active) continue
      if (!productsById.has(product.docId)) productsById.set(product.docId, product)
      if (options.limit > 0 && productsById.size >= options.limit) break
    }

    if (options.limit > 0 && productsById.size >= options.limit) break
  }

  return {
    counts,
    products: Array.from(productsById.values()),
  }
}

function resolveServiceAccountPath(options) {
  return options.serviceAccountPath
    || process.env.TSARA_FIREBASE_SERVICE_ACCOUNT
    || process.env.GOOGLE_APPLICATION_CREDENTIALS
    || DEFAULT_SERVICE_ACCOUNT_PATH
}

function readServiceAccount(options) {
  const serviceAccountPath = path.resolve(process.cwd(), resolveServiceAccountPath(options))

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Arquivo de service account não encontrado: ${serviceAccountPath}`)
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))

  if (typeof serviceAccount.private_key === "string") {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n")
  }

  return { serviceAccount, serviceAccountPath }
}

function initializeAdmin(options) {
  if (getApps().length) return { app: getApps()[0], serviceAccountPath: "já inicializado" }

  const { serviceAccount, serviceAccountPath } = readServiceAccount(options)
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  })

  return { app, serviceAccountPath }
}

async function loadExistingLuarProducts(db) {
  const snapshot = await db
    .collection(PRODUCTS_COLLECTION)
    .where("source.provider", "==", "luar")
    .get()

  const existing = new Map()
  for (const document of snapshot.docs) {
    existing.set(document.id, document.data())
  }
  return existing
}

function buildWritePayload(product, existing, options) {
  const now = Timestamp.now()
  const payload = {
    ...product.payload,
    updatedAt: now,
    source: {
      ...product.payload.source,
      importedAt: now,
    },
  }

  if (!existing) {
    Object.assign(payload, {
      createdAt: now,
      price: 0,
      rating: 0,
      reviews: 0,
      stock: 0,
      sold: 0,
      freeShipping: false,
      priceOnRequest: true,
      stockManaged: false,
    })
    return payload
  }

  if (options.overwriteCommerce) {
    Object.assign(payload, {
      price: 0,
      originalPrice: null,
      stock: 0,
      priceOnRequest: true,
      stockManaged: false,
    })
    return payload
  }

  const hasConfiguredPrice = typeof existing.price === "number" && existing.price > 0 && existing.priceOnRequest !== true
  const hasConfiguredStock = existing.stockManaged !== false && typeof existing.stock === "number"

  if (!hasConfiguredPrice) {
    Object.assign(payload, {
      price: 0,
      originalPrice: null,
      priceOnRequest: true,
    })
  }

  if (!hasConfiguredStock) {
    Object.assign(payload, {
      stock: 0,
      stockManaged: false,
    })
  }

  return payload
}

async function writeProducts(products, options) {
  const { app, serviceAccountPath } = initializeAdmin(options)
  const db = getFirestore(app)
  const existing = await loadExistingLuarProducts(db)
  const productsCollection = db.collection(PRODUCTS_COLLECTION)

  let batch = db.batch()
  let batchCount = 0
  let written = 0
  let created = 0
  let updated = 0

  for (const product of products) {
    const previous = existing.get(product.docId)
    const payload = buildWritePayload(product, previous, options)

    batch.set(productsCollection.doc(product.docId), payload, { merge: true })
    batchCount += 1
    written += 1
    if (previous) updated += 1
    else created += 1

    if (batchCount >= options.batchSize) {
      await batch.commit()
      batch = db.batch()
      batchCount = 0
      console.log(`Gravados ${written}/${products.length} produtos...`)
    }
  }

  if (batchCount > 0) await batch.commit()

  return {
    serviceAccountPath,
    written,
    created,
    updated,
  }
}

function printSummary(products, counts, options) {
  console.log(options.write ? "Modo: gravação no Firestore" : "Modo: dry-run, nada será gravado")
  console.log("")
  console.log("Categorias lidas:")
  for (const { category, count } of counts) {
    console.log(`- ${category.id} ${category.sourceName}: ${count}`)
  }

  const active = products.filter((product) => product.active).length
  const inactive = products.length - active
  const withoutImages = products.filter((product) => !product.payload.image).length

  console.log("")
  console.log(`Produtos únicos preparados: ${products.length}`)
  console.log(`Ativos: ${active}`)
  console.log(`Inativos: ${inactive}`)
  console.log(`Sem imagem principal: ${withoutImages}`)

  const sample = products.slice(0, 5)
  if (sample.length) {
    console.log("")
    console.log("Amostra:")
    for (const product of sample) {
      console.log(`- ${product.docId}: ${product.payload.name} [${product.sourceCategoryName} -> ${product.payload.category}]`)
    }
  }
}

async function main() {
  loadLocalEnv()
  const options = parseArgs(process.argv.slice(2))
  const { counts, products } = await fetchProducts(options)

  printSummary(products, counts, options)

  if (!options.write) {
    console.log("")
    console.log("Para gravar, execute: npm run import:luar -- --write")
    return
  }

  const result = await writeProducts(products, options)
  console.log("")
  console.log(`Firestore atualizado via Firebase Admin SDK (${result.serviceAccountPath}).`)
  console.log(`Criados: ${result.created}`)
  console.log(`Atualizados: ${result.updated}`)
  console.log(`Total gravado: ${result.written}`)
}

main().catch((error) => {
  console.error("")
  console.error("Falha ao importar produtos da Luar:")
  console.error(error?.message || error)
  process.exit(1)
})
