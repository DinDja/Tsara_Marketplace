# TSARA

Plataforma web completa para loja esoterica + agendamentos de consultas, com painel administrativo, autenticacao, carrinho, checkout com InfinitePay e persistencia no Firebase.

## Visao geral

O sistema possui dois grandes blocos:

- **Experiencia publica (cliente)**: home, catalogo de produtos, pagina de produto, carrinho, checkout, consultas, agendamento e area da conta.
- **Painel administrativo**: dashboard, CRUD de produtos, consultas, agendamentos, pedidos, clientes, cupons, configuracoes e semeacao de dados.

Stack principal:

- **Next.js 16 (App Router)**
- **React 19 + TypeScript**
- **Tailwind CSS + Radix UI (shadcn-style components)**
- **Firebase (Auth + Firestore)**
- **InfinitePay (checkout e verificacao de pagamento)**
- **Framer Motion + Sonner**

---

## Principais funcionalidades

### Cliente

- Navegacao institucional (hero, produtos, consultas, sobre, depoimentos)
- Catalogo de produtos com categorias
- Pagina de detalhes do produto
- Carrinho com:
  - controle de quantidade
  - validacao de estoque
  - cupom
  - calculo de frete
  - selecao de endereco
- Checkout com InfinitePay
- Pagina de sucesso de pagamento com verificacao
- Meus pedidos (filtros, busca e detalhes)
- Consultas e agendamentos
- Minha conta e minhas consultas

### Admin

- Dashboard consolidado
- Gestao de agendamentos
- Gestao de tipos de consulta
- CRUD de produtos
- Gestao de pedidos (inclui alteracao de status)
- Gestao de clientes
- Gestao de cupons
- Tela de configuracoes
- Tela de sementes para popular dados iniciais

---

## Estrutura de pastas

```text
app/
  admin/
    agendamentos/
    clientes/
    configuracoes/
    consultas/
    cupons/
    pedidos/
    produtos/
    sementes/
  agendamento/
  api/
    infinitepay/
      invoices/public/checkout/links/
      invoices/public/checkout/payment_check/
      webhook/
  carrinho/
  consultas/
  conta/
  login/
  meus-pedidos/
  minhas-consultas/
  pagamento/sucesso/
  produto/[id]/
  produtos/

components/
  ui/
  header, hero, products, consultations, testimonials, footer...

lib/
  contexts/
    auth-context.tsx
    cart-context.tsx
  firebase/
    config.ts
  hooks/
  services/
    auth, products, orders, appointments, consultations, clients,
    coupons, dashboard, shipping, infinitePay, reviews, account...
  types.ts

firestore.rules
```

---

## Rotas importantes

### Publicas

- `/` - Home
- `/produtos` - Catalogo
- `/produto/[id]` - Detalhe do produto
- `/consultas` - Lista de consultas
- `/agendamento` - Agendar consulta
- `/carrinho` - Carrinho e checkout
- `/pagamento/sucesso` - Retorno de pagamento
- `/login` - Login/cadastro

### Usuario autenticado

- `/conta`
- `/meus-pedidos`
- `/minhas-consultas`

### Admin

- `/admin`
- `/admin/agendamentos`
- `/admin/consultas`
- `/admin/produtos`
- `/admin/pedidos`
- `/admin/clientes`
- `/admin/cupons`
- `/admin/configuracoes`
- `/admin/sementes`

### API (proxy InfinitePay)

- `POST /api/infinitepay/invoices/public/checkout/links`
- `POST /api/infinitepay/invoices/public/checkout/payment_check`
- `POST /api/infinitepay/webhook`

---

## Requisitos

- Node.js 20+
- NPM (ou pnpm/yarn, se preferir)
- Projeto Firebase ativo com Auth + Firestore

---

## Instalacao e execucao

```bash
npm install
npm run dev
```

App local: `http://localhost:3000`

Build de producao:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

---

## Configuracao

### Firebase

Arquivo: `lib/firebase/config.ts`

- Ajuste o objeto `firebaseConfig` para o seu projeto.
- Colecoes utilizadas:
  - `products`
  - `appointments`
  - `clients`
  - `orders`
  - `users`
  - `coupons`
  - `reviews`

Regras de seguranca: `firestore.rules`

### Importacao de produtos da Luar

O projeto inclui um importador real para `https://www.luar.com.br`, usando os endpoints publicos que o proprio catalogo da Luar usa.

Primeiro rode em dry-run para conferir volumes, categorias e amostras:

```bash
npm run import:luar
```

Para gravar no Firestore, use uma chave da Firebase Admin SDK. O importador procura por padrao em:

```bash
public/tsara-ab3fc-firebase-adminsdk-fbsvc-82add8080a.json
```

Depois execute:

```bash
npm run import:luar -- --write
```

Voce tambem pode informar outro caminho:

```bash
npm run import:luar -- --write --service-account=./firebase-adminsdk.json
```

ou via variavel:

```bash
TSARA_FIREBASE_SERVICE_ACCOUNT=./firebase-adminsdk.json
```

Opcoes uteis:

```bash
npm run import:luar -- --category=4,10 --limit=20
npm run import:luar -- --write --active-only
npm run import:luar -- --write --overwrite-commerce
```

Observacao: a Luar publica nome, descricao, status, destaque e imagens, mas nao publica preco nem estoque numerico. Por isso, produtos importados entram como `priceOnRequest: true` e `stockManaged: false`, aparecendo no catalogo como "Sob consulta" ate que preco e estoque sejam preenchidos no TSARA.

### InfinitePay

Arquivo: `lib/infinitePay/config.ts`

- Variavel suportada:
  - `INFINITEPAY_HANDLE`

Se nao informar, o sistema usa `DEFAULT_HANDLE` do proprio arquivo.

---

## Autenticacao e autorizacao

- Auth via Firebase Authentication (email/senha e Google).
- Perfil de usuario no Firestore em `users/{uid}`.
- Acesso admin depende de `role: "admin"` no documento do usuario.

Para promover um usuario para admin, ajuste manualmente no Firestore:

```json
{
  "role": "admin"
}
```

---

## Fluxo de pedidos e estoque

Fluxo resumido:

1. Cliente adiciona item no carrinho
2. Carrinho valida disponibilidade
3. Checkout cria pedido + link de pagamento
4. Retorno em `/pagamento/sucesso` verifica pagamento
5. Pedido vai para `processing`
6. Produto tem `sold` incrementado e `stock` decrementado

Validacoes de estoque aplicadas:

- bloqueio de produto sem estoque nos botoes de compra
- limite de quantidade no carrinho
- revalidacao de estoque antes de fechar checkout

---

## Seeds (dados iniciais)

No admin, acesse:

- `/admin/sementes`

Permite criar dados iniciais de:

- Produtos
- Tipos de consulta

Atencao: a semeacao nao evita duplicatas automaticamente.

---

## PWA

- Manifesto em `app/manifest.ts`
- Registro de Service Worker em `components/pwa-register.tsx`
- Banner de instalacao com opcao de fechar

---

## Padroes tecnicos

- Estado global simples via Context API (`AuthProvider`, `CartProvider`)
- Acesso a dados centralizado em `lib/services/*`
- Hooks de consumo em `lib/hooks/*`
- UI modular com componentes reutilizaveis em `components/ui/*`

---

## Observacoes importantes

- Em `next.config.mjs`, o projeto esta com `typescript.ignoreBuildErrors = true`.
  - Recomendacao: em producao, remover essa opcao para nao mascarar erros de tipo.
- Imagens estao com `images.unoptimized = true`.

---

## Troubleshooting rapido

### Nao consigo entrar no admin

- Verifique se o usuario possui `role: "admin"` em `users/{uid}`.

### Checkout nao abre

- Verifique `INFINITEPAY_HANDLE` e conectividade com endpoints `/api/infinitepay/...`.

### Dados nao aparecem no painel

- Confirme regras do Firestore e permissao do usuario autenticado.

### Estoque estranho no carrinho

- Limpe o carrinho local e reabra (`localStorage` chave `tsara-cart`) ou remova itens invalidos pela UI.

---

## Roadmap sugerido

- Testes automatizados (unitarios + integracao)
- Webhook completo de pagamento (atualizacao server-side robusta)
- Observabilidade (logs estruturados + monitoramento)
- Hardening de regras e politicas de deploy

---

## Licenca

Projeto privado (`private: true` no `package.json`).
