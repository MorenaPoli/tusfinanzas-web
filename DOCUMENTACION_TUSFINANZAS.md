# DOCUMENTACION TECNICA COMPLETA - TusFinanzas

## Indice

1. [Objetivo del Producto](#1-objetivo-del-producto)
2. [Funcionalidades Existentes](#2-funcionalidades-existentes)
3. [Funcionalidades Planificadas](#3-funcionalidades-planificadas)
4. [Flujo del Usuario](#4-flujo-del-usuario)
5. [Estructura de Navegacion](#5-estructura-de-navegacion)
6. [Lista de Pantallas](#6-lista-de-pantallas)
7. [Componentes Reutilizables](#7-componentes-reutilizables)
8. [Diseno del Sistema](#8-diseno-del-sistema)
9. [Assets Utilizados](#9-assets-utilizados)
10. [Animaciones](#10-animaciones)
11. [Estado de Desarrollo](#11-estado-de-desarrollo)
12. [Estructura de Carpetas](#12-estructura-de-carpetas)
13. [Tecnologias Recomendadas](#13-tecnologias-recomendadas)
14. [Codigo Exportable - Backend](#14-codigo-exportable---backend)
15. [Codigo Exportable - Frontend](#15-codigo-exportable---frontend)
16. [Decisiones de UX](#16-decisiones-de-ux)
17. [Detalles Importantes para Desarrolladores](#17-detalles-importantes-para-desarrolladores)

---

## 1. Objetivo del Producto

**TusFinanzas** es una aplicacion web de finanzas personales SaaS (Software as a Service) que permite a los usuarios:

- Registrar y categorizar todos sus movimientos financieros (ingresos, gastos, inversiones, bienes/capital, deudas)
- Visualizar su patrimonio neto en tiempo real
- Recibir consejos financieros personalizados de un "Experto IA" que adapta sus respuestas segun el pais del usuario
- Establecer metas de ahorro con seguimiento de progreso
- Obtener un resumen mensual con graficos de tendencia y distribucion
- Operar bajo un modelo freemium (gratis/Pro/Familiar) con integracion de MercadoPago para pagos

### Modelo de Negocio
- **Plan Gratis**: 30 transacciones/mes, 5 mensajes IA/dia, graficos basicos
- **Plan Pro ($4.99/mes)**: Transacciones ilimitadas, IA ilimitado, graficos avanzados, exportar CSV/Excel, soporte prioritario
- **Plan Familiar ($8.99/mes)**: Todo lo de Pro + hasta 5 familiares, categorias compartidas, metas familiares, resumen grupal

---

## 2. Funcionalidades Existentes

### 2.1 Autenticacion y Usuarios
- Registro e inicio de sesion con email/password (bcrypt + JWT)
- Registro e inicio de sesion con OAuth 2.0 (Kimi Platform)
- Seleccion de pais durante el registro (12 paises latinoamericanos + Espana + USA)
- Roles de usuario (user/admin)
- Perfil de usuario con nombre, email, pais

### 2.2 Transacciones (CRUD Completo)
- Crear transacciones con: tipo, categoria, monto, descripcion, fecha
- Tipos: Ingreso, Gasto, Inversion, Bien/Capital, Deuda
- Categorias por tipo (ej: Sueldo, Freelance para ingresos; Comida, Vivienda, Transporte para gastos)
- Listado filtrable por tipo
- Agrupamiento por mes
- Eliminacion con confirmacion
- Limite de 30 transacciones/mes para usuarios free

### 2.3 Dashboard Principal
- Patrimonio neto calculado (ingresos - gastos + inversiones + capital - deudas)
- 4 tarjetas de estadisticas rapidas (Ingresos, Gastos, Capital, Ahorro %)
- Frase motivacional del dia contextualizada al estado financiero
- Lista de movimientos recientes (ultimos 5)
- Grafico de tendencia de patrimonio
- Banner de upgrade para usuarios free

### 2.4 Experto IA (Chat)
- Chat interactivo con contexto financiero del usuario
- Respuestas ultra-especificas por pais (Argentina, Mexico, Colombia, Chile, Peru, Espana, etc.)
- Recomendaciones con tickers reales (VOO, VTI, VXUS, BNDW)
- Brokers especificos por pais (IOL, GBM+, CetesDirecto, LarrainVial, etc.)
- Exchanges de crypto por pais
- Notas fiscales por pais
- Limite de 5 mensajes/dia para usuarios free
- Persistencia de conversaciones en base de datos

### 2.5 Resumen Mensual
- Grafico de barras: tendencia de 6 meses
- Grafico de torta: distribucion de gastos por categoria
- Selector de mes
- Ingresos vs Gastos vs Balance

### 2.6 Metas de Ahorro
- Crear metas con nombre, monto objetivo, fecha limite, icono
- 12 iconos disponibles
- Barra de progreso visual por meta
- Progreso general acumulado
- CRUD completo

### 2.7 Sistema de Pagos (MercadoPago)
- Creacion de preferencias de pago via MercadoPago SDK
- Planes: Pro mensual ($4.99), Pro anual ($39.99), Familiar mensual ($8.99), Familiar anual ($69.99)
- Webhook para activacion automatica de suscripciones
- Paginas de exito, fallo y pendiente

### 2.8 Panel de Administracion
- Estadisticas: usuarios, transacciones, usuarios Pro, tickets abiertos
- Tabla de usuarios registrados
- Tabla de transacciones
- Tabla de tickets de soporte
- Proteccion por rol admin

### 2.9 Soporte
- Formulario de contacto
- Creacion de tickets en base de datos
- Visualizacion de mis tickets

### 2.10 Sistema de Frases
- Generacion de frases motivacionales contextualizadas
- Frase del dia
- Estado financiero (Excelente, Bueno, Regular, Critico)

### 2.11 Landing Page
- Hero con gradiente, mockup, CTA
- 6 funciones principales
- 3 pasos de uso
- 6 testimonios
- Tabla comparativa Free vs Pro vs Familiar
- Precios con toggle mensual/anual
- FAQ acordeon
- Footer

---

## 3. Funcionalidades Planificadas

### Alta Prioridad
- **Exportar CSV/Excel**: Boton para descargar todas las transacciones (plan Pro)
- **Notificaciones push**: Recordatorios de pagos, alertas de presupuesto
- **Presupuestos mensuales**: Limite por categoria con alertas
- **Graficos avanzados**: Proyeccion de patrimonio, comparacion anual (plan Pro)
- **Modo oscuro/claro**: Toggle de tema

### Media Prioridad
- **Cuentas familiares**: Invitar hasta 5 familiares (plan Familiar)
- **Categorias personalizadas**: Crear categorias propias
- **Recurrentes**: Transacciones automaticas mensuales (sueldo, alquiler)
- **Recordatorios**: Fechas de vencimiento de tarjetas, impuestos
- **Importar bancario**: Conexion con APIs bancarias

### Baja Prioridad
- **Modo offline**: Funcionamiento sin conexion con sincronizacion
- **Widget para home screen**: Acceso rapido desde el movil
- **API publica**: Para integraciones de terceros
- **App nativa**: React Native o Flutter
- **Dark mode automatico**: Segun hora del dia

---

## 4. Flujo del Usuario

### 4.1 Usuario Nuevo (Free)
```
Landing Page → Registro (email/pais/contrasena) → Dashboard
                                          ↓
                        OAuth Kimi (alternativa) → Dashboard
```

### 4.2 Usuario Recurrente (Free)
```
Login → Dashboard → Agregar Transaccion → Ver Transacciones → Resumen
   ↓       ↓              ↓                      ↓               ↓
  Chat   Metas    (tipo → formulario)    (filtros, lista)   (graficos)
```

### 4.3 Conversion a Pro
```
Dashboard (banner upgrade) → Checkout → MercadoPago → Payment Success
     ↓                           ↓           ↓              ↓
  Limite alcanzado          Elegir plan   Pagar        Plan activado
```

### 4.4 Flujo Admin
```
Login como admin → Sidebar "Admin" → Panel con estadisticas
                                              ↓
                                    Usuarios | Transacciones | Tickets
```

---

## 5. Estructura de Navegacion

### Desktop (Sidebar fijo izquierdo, 256px)
```
[Logo TusFinanzas]
[Card de usuario]

[Inicio]      → /dashboard
[Movimientos] → /transactions
[Agregar]     → /add          (boton destacado con gradiente)
[Resumen]     → /summary
[Experto]     → /chat
[Metas]       → /goals

[Soporte]     → /support
[Admin]*      → /admin        (solo si role === 'admin')
[Cerrar sesion]

[Main Content Area]
```

### Mobile (Bottom Navigation Bar)
```
[🏠 Inicio] [📄 Movimientos] [➕ Agregar (FAB)] [📊 Resumen] [🤖 Experto]
```
Metas, Soporte y Admin accesibles desde el menu del dashboard.

---

## 6. Lista de Pantallas

| # | Ruta | Nombre | Protegida | Rol |
|---|------|--------|-----------|-----|
| 1 | `/` | Landing Page | No | - |
| 2 | `/auth` | Login/Registro | No | - |
| 3 | `/dashboard` | Dashboard Principal | Si | user |
| 4 | `/transactions` | Lista de Transacciones | Si | user |
| 5 | `/add` | Agregar Transaccion | Si | user |
| 6 | `/summary` | Resumen Mensual | Si | user |
| 7 | `/chat` | Experto IA | Si | user |
| 8 | `/goals` | Metas de Ahorro | Si | user |
| 9 | `/quotes` | Frases Financieras | Si | user |
| 10 | `/support` | Soporte/Contacto | Si | user |
| 11 | `/checkout` | Suscribirse (Pagos) | Si | user |
| 12 | `/payment/success` | Pago Exitoso | Si | user |
| 13 | `/payment/failure` | Pago Fallido | No | - |
| 14 | `/payment/pending` | Pago Pendiente | Si | user |
| 15 | `/admin` | Panel Admin | Si | admin |

---

## 7. Componentes Reutilizables

### shadcn/ui (instalados)
Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, ButtonGroup, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, Dialog, Drawer, DropdownMenu, Field, HoverCard, Input, InputGroup, InputOTP, Item, Kbd, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Spinner, Switch, Table, Tabs, Textarea, Toggle, ToggleGroup, Tooltip

### Componentes custom
- **AuthLayout**: Layout para paginas de autenticacion
- **AuthLayoutSkeleton**: Loading state del layout

---

## 8. Diseno del Sistema

### 8.1 Colores

#### Backgrounds
| Nombre | Hex | Uso |
|--------|-----|-----|
| App Background | `#0A0A0A` | Fondo principal de toda la app |
| Card Background | `#111111` | Tarjetas, contenedores |
| Card Hover | `#1A1A1A` | Estado hover de tarjetas |
| Input Background | `#1A1A1A` | Campos de formulario |
| Sidebar Background | `#0A0A0A` con `backdrop-blur-xl` | Sidebar desktop |

#### Gradiente Principal
```
from: #FF2D92 (rosa/magenta)
via: #8B5CF6 (violeta)
to: #6366F1 (indigo)
```
Usado en: CTA buttons, badges Pro, progress bars, active indicators.

#### Colores Funcionales
| Nombre | Hex | Uso |
|--------|-----|-----|
| Cyan | `#00E5FF` | Ingresos, balance positivo |
| Pink/Red | `#FF4D6A` | Gastos, alertas, deudas |
| Green | `#10B981` | Capital, inversiones, exito |
| Yellow | `#FFD166` | Ahorro %, warnings, badges |
| Purple | `#8B5CF6` | Inversiones, badges Familiar |
| Teal | `#06B6D4` | Ahorro, elementos secundarios |

#### Texto
| Nivel | Color | Uso |
|-------|-------|-----|
| Primario | `#FFFFFF` | Titulos, valores importantes |
| Secundario | `rgba(255,255,255,0.6)` | Descripciones, labels |
| Terciario | `rgba(255,255,255,0.4)` | Fechas, metadatos |
| Inactivo | `rgba(255,255,255,0.2)` | Placeholders, disabled |

#### Bordes
```css
border: 1px solid rgba(255, 255, 255, 0.06);   /* Default */
border: 1px solid rgba(255, 255, 255, 0.08);   /* Hover/active */
border: 1px solid rgba(255, 255, 255, 0.12);   /* Focus */
```

### 8.2 Tipografias
- **Primaria**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Rendering**: `-webkit-font-smoothing: antialiased`
- **Tamanos**:
  - Hero title: 40px bold
  - Section title: 18-24px bold
  - Card title: 16px semibold
  - Body: 14px regular
  - Small/Caption: 12px
  - Micro: 10px (labels, badges)

### 8.3 Espaciados
- **Border radius cards**: 16-20px (`rounded-2xl`)
- **Border radius inputs**: 16px (`rounded-2xl`) o full (`rounded-full`)
- **Border radius buttons**: 20px (small) a 24px (large)
- **Padding cards**: 16-20px
- **Gap entre cards**: 16px
- **Page padding**: 24px horizontal
- **Section gap**: 24px

### 8.4 Iconografia
- **Libreria**: Lucide React (`lucide-react`)
- **Estilo**: Outline/stroke, no fill. Tamanos: 16px (inline), 18px (nav), 20px (cards), 24px (hero)

### 8.5 Estilo Visual
- **Glassmorphism**: Backdrop blur en navbar y sidebar
- **Neon glow**: Sombra rosa en elementos activos (`shadow-[0_0_30px_rgba(255,45,146,0.3)]`)
- **Gradient overlays**: Degradados suaves como fondos de tarjetas
- **Minimal**: Sin bordes duros, todo redondeado, espacios generosos

---

## 9. Assets Utilizados

| Asset | Tipo | Ubicacion | Uso |
|-------|------|-----------|-----|
| `logo.jpg` | Imagen | `/public/logo.jpg` | Logo en navbar, sidebar, avatar fallback, favicon, chat |

El logo es un diamante con flecha ascendente en gradiente rosa a violeta. Si se recrea, usar una imagen similar o un SVG con ese concepto.

---

## 10. Animaciones

### Libreria: Framer Motion

| Elemento | Animacion | Configuracion |
|----------|-----------|---------------|
| Cards entrada | fade + slideY | `initial={{opacity:0, y:10}}` `animate={{opacity:1, y:0}}` |
| Sidebar dot | layout animation | `layoutId="sidebar-dot"` |
| Nav indicator | layout animation | `layoutId="nav-indicator"` |
| Chat bubbles | fade + slideX | `initial={{opacity:0, x: +/- 10}}` |
| FAB | scale on tap | `whileTap={{ scale: 0.9 }}` |
| Buttons | scale on tap | `whileTap={{ scale: 0.97 }}` |
| Chat typing | bounce dots | `animate-bounce` con delay stagger |
| Progress bars | width transition | `transition={{ duration: 1 }}` |
| Form sections | height expand | `AnimatePresence` + `initial={{ height:0 }}` |
| Hero elements | stagger fade in | Delay 0.1s entre elementos |

---

## 11. Estado de Desarrollo

| Pantalla | Estado | Notas |
|----------|--------|-------|
| Landing Page | Completo | Todo funcional, responsive |
| Auth (email/password) | Completo | Registro, login, JWT, pais |
| Auth (OAuth Kimi) | Completo | Flujo completo funciona |
| Dashboard | Completo | Stats, frase, movimientos, banner upgrade |
| Transacciones | Completo | CRUD, filtros, por mes, confirmacion delete |
| Agregar Transaccion | Completo | 2 pasos, categorias por tipo |
| Resumen | Completo | Barras 6 meses, torta categorias, selector mes |
| Experto IA | Completo | Por pais, persistencia, limite free |
| Metas de Ahorro | Completo | CRUD, progreso, iconos |
| Frases | Completo | Contextual, regenerable |
| Checkout | Completo | Planes, toggle mensual/anual |
| Payment Success/Failure/Pending | Completo | Post-pago |
| Soporte | Completo | Tickets, formulario |
| Panel Admin | Completo | Stats, tablas, proteccion rol |
| MercadoPago | Completo | Preferencias, webhook |

---

## 12. Estructura de Carpetas

```
project/
|-- api/                          # Backend (tRPC + Hono)
|   |-- auth-router.ts            # Router OAuth Kimi
|   |-- local-auth-router.ts      # Router email/password + JWT
|   |-- finance-router.ts         # Transacciones, frases, chat IA
|   |-- subscription-router.ts    # Suscripciones freemium
|   |-- mercadopago-router.ts     # Pagos MercadoPago
|   |-- admin-router.ts           # Panel admin
|   |-- support-router.ts         # Tickets de soporte
|   |-- goals-router.ts           # Metas de ahorro
|   |-- router.ts                 # Composicion de routers
|   |-- middleware.ts             # Autenticacion (public/authed/admin)
|   |-- context.ts                # Contexto tRPC (Kimi + local auth)
|   |-- boot.ts                   # Entry point Hono server
|   |-- kimis/
|   |   |-- auth.ts               # OAuth flow + token verification
|   |   |-- session.ts            # JWT sign/verify
|   |   |-- platform.ts           # API calls a Kimi
|   |   |-- types.ts              # Tipos TypeScript Kimi
|   |-- lib/
|   |   |-- cookies.ts            # Cookie helpers
|   |   |-- env.ts                # Variables de entorno
|   |   |-- http.ts               # HTTP helpers
|   |-- queries/
|   |   |-- connection.ts         # Conexion Drizzle ORM
|   |   |-- users.ts              # Queries de usuario
|
|-- contracts/                    # Tipos compartidos frontend/backend
|   |-- constants.ts              # Session config, paths
|   |-- errors.ts                 # Error helpers
|   |-- types.ts                  # Tipos compartidos
|
|-- db/                           # Database schema y config
|   |-- schema.ts                 # Tablas (users, transactions, etc.)
|   |-- relations.ts              # Relaciones Drizzle
|   |-- seed.ts                   # Datos de seed
|
|-- src/                          # Frontend React
|   |-- sections/                 # Pantallas principales
|   |   |-- LandingPage.tsx
|   |   |-- AuthPage.tsx
|   |   |-- Dashboard.tsx
|   |   |-- Transactions.tsx
|   |   |-- AddTransaction.tsx
|   |   |-- Summary.tsx
|   |   |-- AIChat.tsx
|   |   |-- Quotes.tsx
|   |   |-- Goals.tsx
|   |   |-- Checkout.tsx
|   |   |-- PaymentSuccess.tsx
|   |   |-- PaymentFailure.tsx
|   |   |-- PaymentPending.tsx
|   |   |-- Support.tsx
|   |   |-- AdminPanel.tsx
|   |   |-- Layout.tsx
|   |-- pages/                    # Paginas auxiliares
|   |   |-- Login.tsx
|   |   |-- NotFound.tsx
|   |-- hooks/
|   |   |-- useAuth.ts            # Auth hook (Kimi + local)
|   |   |-- useSubscription.ts    # Hook de suscripcion
|   |   |-- use-mobile.ts         # Hook responsive
|   |-- providers/
|   |   |-- trpc.tsx              # Provider tRPC client
|   |-- components/
|   |   |-- ui/                   # shadcn/ui components
|   |   |-- AuthLayout.tsx
|   |   |-- AuthLayoutSkeleton.tsx
|   |-- lib/
|   |   |-- utils.ts              # cn() helper
|   |-- types/
|   |   |-- index.ts              # Tipos del frontend
|   |-- App.tsx                   # Router principal
|   |-- main.tsx                  # Entry point React
|   |-- index.css                 # Variables CSS + tema oscuro
|   |-- const.ts                  # Constantes
|
|-- public/
|   |-- logo.jpg                  # Logo de la app
|
|-- index.html                    # HTML entry point (class="dark")
|-- vite.config.ts                # Config Vite + Hono dev server
|-- tailwind.config.js            # Config Tailwind + tema
|-- tsconfig.json                 # TypeScript config
|-- package.json                  # Dependencias
|-- .env                          # Variables de entorno
|-- .env.example                  # Ejemplo de variables
|-- drizzle.config.ts             # Config Drizzle ORM
```

---

## 13. Tecnologias Recomendadas

### Stack Exacto Actual

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Frontend Framework | React | 19 |
| Language | TypeScript | 5.6+ |
| Build Tool | Vite | 7.3 |
| Styling | Tailwind CSS | 3.4 |
| Componentes UI | shadcn/ui | latest |
| Animaciones | Framer Motion | 11+ |
| Iconos | Lucide React | latest |
| Routing | react-router | 7 |
| Backend Framework | Hono | latest |
| API | tRPC | 11.x |
| ORM | Drizzle ORM | latest |
| Database | MySQL | 8.0+ |
| Auth OAuth | jose (JWT) | latest |
| Auth Local | bcryptjs + jsonwebtoken | latest |
| Payments | MercadoPago SDK | latest |
| Query Client | @tanstack/react-query | 5+ |
| Transformer | superjson | latest |

### Para migrar a otro hosting
- **Recomendado**: Vercel (frontend) + Railway/Render (backend) + PlanetScale/Railway MySQL
- **Alternativa**: Un solo VPS en DigitalOcean/Linode con Docker
- **Base de datos**: Cualquier MySQL 8.0+ compatible
- **No depende de Kimi** para nada excepto el login OAuth opcional

---



## 14. Codigo Exportable - Backend

### 14.1 Database Schema (db/schema.ts)

```typescript
import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
  date,
} from "drizzle-orm/mysql-core";

// Users (OAuth Kimi)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Local Users (email/password)
export const localUsers = mysqlTable("local_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 50 }).default("Argentina"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

// Transactions
export const transactions = mysqlTable("transactions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["income", "expense", "investment", "debt", "asset"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: varchar("description", { length: 500 }),
  date: date("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Daily Quotes
export const dailyQuotes = mysqlTable("daily_quotes", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  text: text("text").notNull(),
  type: mysqlEnum("type", ["excellent", "good", "regular", "critical"]).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyQuote = typeof dailyQuotes.$inferSelect;
export type InsertDailyQuote = typeof dailyQuotes.$inferInsert;

// Chat Messages
export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// Subscriptions (Freemium)
export const subscriptions = mysqlTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  plan: mysqlEnum("plan", ["free", "pro", "family"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "past_due"]).default("active").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Support Tickets
export const supportTickets = mysqlTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  userEmail: varchar("userEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

// Savings Goals
export const savingsGoals = mysqlTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  targetAmount: decimal("targetAmount", { precision: 15, scale: 2 }).notNull(),
  currentAmount: decimal("currentAmount", { precision: 15, scale: 2 }).default("0").notNull(),
  deadline: date("deadline"),
  icon: varchar("icon", { length: 50 }).default("\ud83c\udfaf"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = typeof savingsGoals.$inferInsert;
```

### 14.2 Database Connection (api/queries/connection.ts)

```typescript
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@db/schema";

const globalForDb = globalThis as unknown as {
  conn: mysql.Pool | undefined;
};

const pool =
  globalForDb.conn ??
  mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.conn = pool;

export function getDb() {
  return drizzle({ client: pool, schema });
}
```

### 14.3 Middleware (api/middleware.ts)

```typescript
import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

function requireRole(role: string) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}

export const authedQuery = t.procedure.use(requireAuth);
export const adminQuery = authedQuery.use(requireRole("admin"));
```

### 14.4 Context (api/context.ts)

```typescript
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyLocalToken } from "./local-auth-router";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try Kimi OAuth first
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Kimi auth failed, try local auth
  }

  // If no user from Kimi, try local auth token
  if (!ctx.user) {
    try {
      const localToken = opts.req.headers.get("x-local-auth-token");
      if (localToken) {
        const decoded = verifyLocalToken(localToken);
        if (decoded) {
          const db = getDb();
          const users = await db
            .select()
            .from(localUsers)
            .where(eq(localUsers.id, decoded.userId));
          if (users.length > 0) {
            const u = users[0];
            ctx.user = {
              id: u.id,
              unionId: `local_${u.id}`,
              name: u.name,
              email: u.email,
              avatar: null,
              role: u.role,
              createdAt: u.createdAt,
              updatedAt: u.updatedAt,
              lastSignInAt: u.lastSignInAt,
            } as User;
          }
        }
      }
    } catch {
      // Local auth also failed
    }
  }

  return ctx;
}
```

### 14.5 Local Auth Router (api/local-auth-router.ts)

```typescript
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "tusfinanzas-secret-key-2026";

function signToken(userId: number, email: string, role: string): string {
  return jwt.sign({ userId, email, role, type: "local" }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyLocalToken(token: string): { userId: number; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && typeof decoded === "object" && decoded.type === "local") {
      return { userId: decoded.userId, email: decoded.email, role: decoded.role };
    }
    return null;
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        email: z.string().email("Email invalido"),
        password: z.string().min(6, "Minimo 6 caracteres"),
        name: z.string().min(2).max(100),
        country: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(localUsers).where(eq(localUsers.email, input.email));
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "Ya existe una cuenta con ese email" });
      }
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const result = await db.insert(localUsers).values({
        email: input.email,
        password: hashedPassword,
        name: input.name,
        country: input.country || "Argentina",
      });
      const userId = Number(result[0].insertId);
      const token = signToken(userId, input.email, "user");
      return { token, user: { id: userId, email: input.email, name: input.name, role: "user" } };
    }),

  login: publicQuery
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const users = await db.select().from(localUsers).where(eq(localUsers.email, input.email));
      if (users.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email o contrasena incorrectos" });
      }
      const user = users[0];
      const valid = await bcrypt.compare(input.password, user.password);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email o contrasena incorrectos" });
      }
      await db.update(localUsers).set({ lastSignInAt: new Date() }).where(eq(localUsers.id, user.id));
      const token = signToken(user.id, user.email, user.role);
      return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, country: user.country } };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const token = ctx.req?.headers?.get?.("x-local-auth-token") || "";
    if (!token) return null;
    const decoded = verifyLocalToken(token);
    if (!decoded) return null;
    const db = getDb();
    const users = await db.select().from(localUsers).where(eq(localUsers.id, decoded.userId));
    if (users.length === 0) return null;
    const user = users[0];
    return { id: user.id, email: user.email, name: user.name, role: user.role, country: user.country };
  }),
});
```

### 14.6 Finance Router (api/finance-router.ts) - Simplificado

```typescript
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { transactions, dailyQuotes, chatMessages, subscriptions } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const financeRouter = createRouter({
  getTotals: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select().from(transactions).where(eq(transactions.userId, ctx.user.id));
    const income = rows.filter(r => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
    const expense = rows.filter(r => r.type === "expense").reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
    const investment = rows.filter(r => r.type === "investment").reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
    const debt = rows.filter(r => r.type === "debt").reduce((s, r) => s + Math.abs(Number(r.amount)), 0);
    const asset = rows.filter(r => r.type === "asset").reduce((s, r) => s + Number(r.amount), 0);
    return { income, expense, investment, debt, asset, netWorth: income - expense + investment + asset - debt };
  }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(transactions).where(eq(transactions.userId, ctx.user.id)).orderBy(desc(transactions.createdAt));
  }),

  create: authedQuery
    .input(z.object({ type: z.enum(["income", "expense", "investment", "debt", "asset"]), category: z.string(), amount: z.string(), description: z.string().optional(), date: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // Check free plan limit
      const planRows = await db.select().from(subscriptions).where(eq(subscriptions.userId, ctx.user.id));
      const plan = planRows[0]?.plan || "free";
      if (plan === "free") {
        const allTx = await db.select().from(transactions).where(eq(transactions.userId, ctx.user.id));
        const monthStr = new Date().toISOString().slice(0, 7);
        const thisMonthCount = allTx.filter(t => String(t.date).slice(0, 7) === monthStr).length;
        if (thisMonthCount >= 30) {
          throw new TRPCError({ code: "FORBIDDEN", message: "FREE_LIMIT_REACHED: Alcanzaste el limite de 30 transacciones por mes." });
        }
      }
      const result = await db.insert(transactions).values({ userId: ctx.user.id, ...input, amount: input.amount });
      return { id: Number(result[0].insertId) };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(transactions).where(eq(transactions.id, input.id));
      return { success: true };
    }),

  // Chat messages
  listChatMessages: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(chatMessages).where(eq(chatMessages.userId, ctx.user.id)).orderBy(chatMessages.createdAt);
  }),

  createChatMessage: authedQuery
    .input(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      // Check free plan limit (5/day)
      const planRows = await db.select().from(subscriptions).where(eq(subscriptions.userId, ctx.user.id));
      const plan = planRows[0]?.plan || "free";
      if (plan === "free") {
        const todayStr = new Date().toISOString().slice(0, 10);
        const allMsgs = await db.select().from(chatMessages).where(eq(chatMessages.userId, ctx.user.id));
        const todayUserMsgs = allMsgs.filter(m => m.role === "user" && m.createdAt.toISOString().slice(0, 10) === todayStr).length;
        if (todayUserMsgs >= 5 && input.role === "user") {
          throw new TRPCError({ code: "FORBIDDEN", message: "FREE_CHAT_LIMIT: Alcanzaste el limite de 5 mensajes por dia." });
        }
      }
      const result = await db.insert(chatMessages).values({ userId: ctx.user.id, role: input.role, content: input.content });
      return { id: Number(result[0].insertId) };
    }),

  clearChat: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db.delete(chatMessages).where(eq(chatMessages.userId, ctx.user.id));
    return { success: true };
  }),
});
```

### 14.7 MercadoPago Router (api/mercadopago-router.ts)

```typescript
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subscriptions } from "@db/schema";
import { eq } from "drizzle-orm";

let _pref: any = null;
let _pay: any = null;

function getPref() {
  if (_pref) return _pref;
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "MP not configured" });
  const { MercadoPagoConfig, Preference } = require("mercadopago");
  _pref = new Preference(new MercadoPagoConfig({ accessToken: token }));
  return _pref;
}

function getPay() {
  if (_pay) return _pay;
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MP not configured");
  const { MercadoPagoConfig, Payment } = require("mercadopago");
  _pay = new Payment(new MercadoPagoConfig({ accessToken: token }));
  return _pay;
}

const PLANS = {
  pro: { monthly: 4.99, yearly: 39.99, title: "TusFinanzas Pro", desc: "Transacciones ilimitadas, Experto IA ilimitado, graficos avanzados" },
  family: { monthly: 8.99, yearly: 69.99, title: "TusFinanzas Familiar", desc: "Todo lo de Pro + hasta 5 familiares" },
};

async function activatePlan(externalRef: string) {
  const [userIdStr, plan, billing] = externalRef.split(":");
  const userId = Number(userIdStr);
  if (!userId || !plan) return;
  const db = getDb();
  const months = billing === "yearly" ? 12 : 1;
  const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
  const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  if (existing.length > 0) {
    await db.update(subscriptions).set({ plan: plan as "pro" | "family", status: "active", expiresAt }).where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({ userId, plan: plan as "pro" | "family", status: "active", expiresAt });
  }
}

export const mercadoPagoRouter = createRouter({
  createPreference: authedQuery
    .input(z.object({ plan: z.enum(["pro", "family"]), billing: z.enum(["monthly", "yearly"]) }))
    .mutation(async ({ ctx, input }) => {
      const cfg = PLANS[input.plan];
      const amount = input.billing === "monthly" ? cfg.monthly : cfg.yearly;
      const period = input.billing === "monthly" ? "mes" : "ano";
      const origin = process.env.APP_URL || "https://tusfinanzas.app";
      const body = {
        items: [{ id: `${input.plan}-${input.billing}`, title: `${cfg.title} (${period})`, description: cfg.desc, quantity: 1, currency_id: "USD", unit_price: amount, category_id: "software" }],
        payer: { name: ctx.user.name || "Usuario", email: ctx.user.email || "usuario@tusfinanzas.app" },
        external_reference: `${ctx.user.id}:${input.plan}:${input.billing}`,
        back_urls: { success: `${origin}/payment/success`, failure: `${origin}/payment/failure`, pending: `${origin}/payment/pending` },
        auto_return: "approved" as const,
        notification_url: `${origin}/api/trpc/mercadopago.webhook`,
      };
      const resp = await getPref().create({ body });
      return { preferenceId: resp.id, initPoint: resp.init_point, sandboxInitPoint: resp.sandbox_init_point };
    }),

  webhook: publicQuery
    .input(z.object({ topic: z.string().optional(), id: z.string().optional(), type: z.string().optional(), "data.id": z.string().optional() }).optional())
    .mutation(async ({ input }) => {
      const paymentId = input?.["data.id"] || input?.id;
      const topic = input?.topic || input?.type;
      if (!paymentId || topic !== "payment") return { received: true };
      try {
        const data = await getPay().get({ id: Number(paymentId) });
        if (data.status === "approved" && data.external_reference) {
          await activatePlan(data.external_reference);
        }
      } catch (err) { console.error("MP webhook error:", err); }
      return { received: true };
    }),
});
```

---

## 15. Codigo Exportable - Frontend

### 15.1 Main Entry (src/main.tsx)

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

### 15.2 CSS del Tema (src/index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 4%;
    --foreground: 0 0% 98%;
    --card: 0 0% 6%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 6%;
    --popover-foreground: 0 0% 98%;
    --primary: 320 100% 58%;
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 10%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 12%;
    --muted-foreground: 0 0% 60%;
    --accent: 0 0% 12%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14%;
    --input: 0 0% 14%;
    --ring: 320 100% 58%;
    --radius: 0.625rem;
    --sidebar-background: 0 0% 6%;
    --sidebar-foreground: 0 0% 90%;
    --sidebar-primary: 320 100% 58%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 0 0% 12%;
    --sidebar-accent-foreground: 0 0% 90%;
    --sidebar-border: 0 0% 14%;
    --sidebar-ring: 320 100% 58%;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
::selection { background: rgba(255,45,146,0.3); color: white; }
```

### 15.3 HTML (index.html)

```html
<!doctype html>
<html lang="es" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/jpeg" href="/logo.jpg" />
    <title>TusFinanzas - Controla tu dinero</title>
  </head>
  <body class="dark">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 15.4 Router Principal (src/App.tsx)

```tsx
import { Routes, Route, Navigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import LandingPage from '@/sections/LandingPage'
import AuthPage from '@/sections/AuthPage'
import Dashboard from '@/sections/Dashboard'
import AddTransaction from '@/sections/AddTransaction'
import Transactions from '@/sections/Transactions'
import Summary from '@/sections/Summary'
import Quotes from '@/sections/Quotes'
import AIChat from '@/sections/AIChat'
import Support from '@/sections/Support'
import Checkout from '@/sections/Checkout'
import PaymentSuccess from '@/sections/PaymentSuccess'
import PaymentFailure from '@/sections/PaymentFailure'
import PaymentPending from '@/sections/PaymentPending'
import AdminPanel from '@/sections/AdminPanel'
import Goals from '@/sections/Goals'
import Layout from '@/sections/Layout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FF2D92] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/summary" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
        <Route path="/quotes" element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      </Route>
      <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
      <Route path="/payment/failure" element={<PaymentFailure />} />
      <Route path="/payment/pending" element={<ProtectedRoute><PaymentPending /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

### 15.5 Auth Hook (src/hooks/useAuth.ts)

```typescript
import { useCallback } from 'react';
import { trpc } from '@/providers/trpc';

const LOCAL_TOKEN_KEY = 'tusfinanzas_auth_token';

export function useAuth(_opts?: { redirectOnUnauthenticated?: boolean }) {
  const utils = trpc.useUtils();

  const { data: localUser, isLoading: localLoading } = trpc.localAuth.me.useQuery(undefined, {
    retry: false, enabled: !!getLocalToken(),
  });

  const { data: kimiUser, isLoading: kimiLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false, enabled: !localUser && !getLocalToken(),
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { utils.invalidate(); },
  });

  const user = localUser || kimiUser || null;
  const isLoading = localLoading && kimiLoading;
  const isAuthenticated = !!user;

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    logoutMutation.mutate();
    setTimeout(() => { window.location.href = '/'; }, 100);
  }, [logoutMutation]);

  return { user, isLoading, isAuthenticated, logout, isAdmin: user?.role === 'admin' };
}

export function getLocalToken(): string | null {
  return localStorage.getItem(LOCAL_TOKEN_KEY);
}
export function setLocalToken(token: string) {
  localStorage.setItem(LOCAL_TOKEN_KEY, token);
}
```

### 15.6 tRPC Provider (src/providers/trpc.tsx)

```tsx
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        const token = localStorage.getItem('tusfinanzas_auth_token');
        return token ? { 'x-local-auth-token': token } : {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, { ...(init ?? {}), credentials: "include" });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

---

## 16. Decisiones de UX

### 16.1 Tema Oscuro Obligatorio
La aplicacion es 100% tema oscuro. No existe modo claro. La decision se baso en:
- Aplicaciones financieras profesionales usan dark mode (bancos, brokers)
- Reduce fatiga visual para uso prolongado
- Los gradientes rosa/violeta funcionan mejor sobre fondo oscuro
- El usuario objetivo (18-45 anos) prefiere dark mode

### 16.2 Mobile-First
Todas las pantallas estan disenadas para mobile (390px) como viewport base. El sidebar desktop es un extra. Esto se decidio porque:
- El 80% de los usuarios de finanzas personales usan mobile
- MercadoPago es predominantemente mobile
- Instagram/Redes sociales que traen trafico son mobile

### 16.3 Bottom Navigation en Mobile
- El boton "Agregar" es un FAB (Floating Action Button) centrado y destacado con gradiente
- Solo 4 items + FAB para no saturar
- Los items secundarios (Metas, Soporte, Admin) se acceden desde el dashboard

### 16.4 Dos Pasos para Agregar Transaccion
Primero se selecciona el tipo (Ingreso/Gasto/Inversion/Capital/Deuda) y luego el formulario. Esto:
- Reduce la carga cognitiva (no muestra todas las categorias a la vez)
- Permite filtrar categorias por tipo
- Hace el flujo mas rapido en mobile

### 16.5 Experto IA como Chat (no como boton)
- Conversacional en lugar de formularios
- Contexto financiero del usuario integrado
- Persistencia de conversaciones para continuidad
- Respuestas con pasos numerados y acciones concretas

### 16.6 Limites Free Visibles Siempre
- Barra de progreso de transacciones mensuales en el dashboard
- Contador de mensajes IA restantes
- Banner de upgrade no intrusivo pero visible
- Los limites se aplican en backend (no solo frontend)

### 16.7 Confirmacion Antes de Eliminar
- Alert dialog nativo del navegador antes de borrar transacciones
- Previene perdida accidental de datos

### 16.8 Landing Page como Single Page
- Scroll unico con secciones bien definidas
- Testimonios para generar confianza
- Tabla comparativa clara Free/Pro/Familiar
- FAQ acordeon para dudas comunes

### 16.9 Registro con Email + Pais
- El pais es obligatorio durante el registro
- Esto permite personalizar las respuestas del Experto IA desde el primer momento
- No se usa geolocalizacion (privacidad)

### 16.10 Logo Integrado en Todos Lados
- El logo personalizado aparece en: navbar, sidebar, dashboard, chat IA, landing page, footer
- Esto refuerza la marca en cada interaccion

---

## 17. Detalles Importantes para Desarrolladores

### 17.1 Variables de Entorno Requeridas
```env
DATABASE_URL=mysql://user:pass@host:port/db
JWT_SECRET=una_clave_secreta_larga_y_aleatoria
MERCADOPAGO_ACCESS_TOKEN=TEST-... (desarrollo) o APP_USR-... (produccion)
APP_URL=https://tudominio.com
APP_ID=(solo si usas OAuth Kimi)
APP_SECRET=(solo si usas OAuth Kimi)
VITE_KIMI_AUTH_URL=(solo si usas OAuth Kimi)
OWNER_UNION_ID=(ID del admin, solo OAuth Kimi)
```

### 17.2 Base de Datos
- MySQL 8.0+ requerido
- Ejecutar `npm run db:push` para sincronizar schema
- Las tablas se crean automaticamente si no existen
- No usar `db:push --force` en produccion (borra datos)

### 17.3 Autenticacion Dual
- El sistema soporta DOS metodos de auth simultaneamente: email/password y OAuth Kimi
- El contexto tRPC intenta Kimi primero, luego local auth
- El header `x-local-auth-token` se envia en TODAS las peticiones tRPC

### 17.4 MercadoPago
- En desarrollo usar credenciales de TEST
- El webhook necesita una URL publica accesible
- Las URLs de retorno deben coincidir con el dominio configurado
- Tarjetas de prueba: 5031 7557 3453 0604, codigo 123, vencimiento 12/30, titular APRO

### 17.5 Planes y Limites
- Nuevo usuario = plan "free" automatico
- Verificacion de limites en BACKEND (no confiar en frontend)
- 30 transacciones/mes free, 5 mensajes IA/dia free
- Las suscripciones tienen fecha de expiracion

### 17.6 Admin
- El primer usuario con `OWNER_UNION_ID` se convierte en admin (OAuth)
- Para local auth, cambiar `role` directamente en la base de datos
- El link de Admin solo aparece si `user.role === 'admin'`

### 17.7 Caché
- Si el deploy no refleja cambios: el CDN puede tener cache agresivo
- Agregar `?v=N` a assets o usar hashes diferentes en cada build

### 17.8 Responsive
- Breakpoint: `lg:` = 1024px+ (desktop con sidebar)
- Por debajo de 1024px: bottom nav, sin sidebar
- Mobile: 390px viewport base

### 17.9 Iconos
- Usar Lucide React exclusivamente
- Tamanos: 16px inline, 18px nav, 20px cards, 24px hero
- Estilo outline/stroke, nunca fill

### 17.10 Colores - NO USAR CLASES DE TAILWIND CON NOMBRE
- NO usar `text-black`, `text-gray-900`, `bg-black` sin verificar el fondo
- El fondo SIEMPRE es `#0A0A0A` (casi negro)
- El texto SIEMPRE debe ser blanco o blanco con opacidad
- Si se usa un componente shadcn/ui, verificar que herede los colores del tema oscuro

### 17.11 Migracion Fuera de Kimi - Checklist
1. Copiar TODO el codigo del repositorio
2. Configurar variables de entorno (.env)
3. Crear base de datos MySQL y ejecutar `npm run db:push`
4. Instalar dependencias: `npm install`
5. Para auth local: NO se necesita nada de Kimi
6. Para auth OAuth: configurar APP_ID, APP_SECRET, VITE_KIMI_AUTH_URL
7. Configurar MercadoPago token
8. Build: `npm run build`
9. Servir `dist/` con cualquier servidor Node.js
10. El backend se ejecuta como parte del build (api/boot.ts)

### 17.12 Performance
- El bundle JS es ~1MB (grande por Recharts + Framer Motion)
- Considerar code-splitting con `React.lazy()` para secciones grandes
- Las imagenes deben estar optimizadas (logo.jpg ~76KB es aceptable)

---

**Documentacion generada el 2026-07-08**
**Version del codigo documentada: 10b0e842 (ultimo deploy)**
