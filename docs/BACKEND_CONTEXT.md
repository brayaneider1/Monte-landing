# 🔧 LOOP.RAVE — Backend Context Window & Architecture
## FastAPI · PostgreSQL · Escalable desde MVP hasta plataforma

---

## 1. PROPÓSITO DE ESTE DOCUMENTO

Este archivo es la **ventana de contexto oficial** para el desarrollo del backend de LOOP.RAVE.
Antes de escribir cualquier línea de código con el asistente de IA, lee y comparte este documento.
Contiene las decisiones de arquitectura, el contrato de API con el frontend, los modelos de datos,
y las reglas de escalabilidad.

---

## 2. CONTEXTO DEL PROYECTO

### Qué hace el frontend (lo que el backend debe satisfacer)

| Acción | Endpoint consumido | Payload |
|---|---|---|
| Crear orden (checkout) | `POST /api/orders` | `{ buyer, items[] }` |
| Ver órdenes (admin) | `GET /api/admin/orders` | Header `X-Admin-Pin` |
| Registrar venta en mano | `POST /api/admin/manual-sale` | `{ buyer, items[], method }` + Header `X-Admin-Pin` |
| (futuro) Login admin JWT | `POST /api/auth/login` | `{ pin }` |
| (futuro) Webhook Wompi | `POST /api/webhooks/wompi` | payload Wompi firmado |
| (futuro) CRUD Eventos | `GET/POST/PUT /api/events` | schemas de evento |

### Estado actual del frontend
- Botón comprar → WhatsApp (temporal)
- Carrito + checkout → conectado a `api.js` con toggle mock/real
- Admin panel → PIN hardcoded en `.env` como `VITE_ADMIN_PIN`
- Variable de entorno para backend: `VITE_API_URL`

---

## 3. DECISIONES DE ARQUITECTURA

### Stack elegido
```
FastAPI 0.111+          → framework async, auto-docs, type-safe
PostgreSQL 16+          → base de datos principal
SQLAlchemy 2 (async)    → ORM con soporte async nativo
Alembic                 → migraciones de base de datos
Pydantic v2             → validación y serialización
Redis                   → caché de sesiones, rate limiting, tareas async
Celery + Redis          → background tasks (emails, notificaciones)
Docker + Docker Compose → entorno reproducible
Uvicorn + Gunicorn      → servidor de producción
```

### Patrón arquitectónico: Clean Architecture en capas

```
┌─────────────────────────────────────────────┐
│           API Layer (FastAPI Routers)        │  ← Maneja HTTP, validación de entrada
├─────────────────────────────────────────────┤
│           Service Layer                      │  ← Lógica de negocio pura
├─────────────────────────────────────────────┤
│           Repository Layer                   │  ← Acceso a datos (SQLAlchemy)
├─────────────────────────────────────────────┤
│           Database (PostgreSQL)              │  ← Persistencia
└─────────────────────────────────────────────┘
```

**Por qué esta arquitectura:**
- Los routers no tocan la DB directamente → fácil de testear
- Los servicios son el único lugar con lógica → fácil de cambiar sin romper API
- Los repositorios abstraen SQLAlchemy → si se migra a otra DB, solo cambia esta capa
- Escala horizontalmente: múltiples instancias Uvicorn detrás de un load balancer

---

## 4. ESTRUCTURA DE CARPETAS DEL PROYECTO

```
loop-rave-api/
├── app/
│   ├── main.py                     # Entry point FastAPI, CORS, routers
│   ├── config.py                   # Settings con Pydantic BaseSettings
│   ├── database.py                 # Engine async, sesiones, Base
│   │
│   ├── models/                     # SQLAlchemy ORM models (tablas)
│   │   ├── __init__.py
│   │   ├── event.py                # Modelo Event
│   │   ├── order.py                # Modelo Order
│   │   ├── order_item.py           # Modelo OrderItem (líneas de orden)
│   │   └── buyer.py                # Modelo Buyer (comprador)
│   │
│   ├── schemas/                    # Pydantic schemas (in/out de API)
│   │   ├── event.py
│   │   ├── order.py
│   │   └── buyer.py
│   │
│   ├── repositories/               # Acceso a datos puro
│   │   ├── event_repo.py
│   │   └── order_repo.py
│   │
│   ├── services/                   # Lógica de negocio
│   │   ├── order_service.py        # Crear orden, validar stock, etc.
│   │   ├── payment_service.py      # Integración Wompi
│   │   └── notification_service.py # Emails, WhatsApp API (futuro)
│   │
│   ├── api/                        # Routers organizados por dominio
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── orders.py           # POST /orders
│   │   │   ├── events.py           # GET/POST /events
│   │   │   ├── admin.py            # /admin/* (protegido)
│   │   │   ├── auth.py             # /auth/login (JWT futuro)
│   │   │   └── webhooks.py         # /webhooks/wompi
│   │   └── router.py               # Agrega todos los sub-routers bajo /api/v1
│   │
│   ├── core/
│   │   ├── security.py             # JWT, hashing, verificación Wompi firma
│   │   ├── dependencies.py         # get_db, get_current_admin, etc.
│   │   └── exceptions.py           # HTTP exceptions personalizadas
│   │
│   └── background/
│       ├── celery_app.py           # Configuración Celery
│       └── tasks.py                # send_ticket_email, notify_webhook, etc.
│
├── migrations/                     # Alembic
│   ├── env.py
│   └── versions/
│
├── tests/
│   ├── conftest.py                 # Fixtures: test DB, cliente async
│   ├── test_orders.py
│   ├── test_admin.py
│   └── test_events.py
│
├── docker/
│   ├── Dockerfile
│   └── Dockerfile.worker           # Celery worker
│
├── docker-compose.yml              # PostgreSQL + Redis + API + Worker
├── docker-compose.prod.yml         # Producción con Nginx
├── .env.example
├── requirements.txt
├── alembic.ini
└── README.md
```

---

## 5. MODELOS DE DATOS (Base de datos)

### `events` — Eventos de LOOP.RAVE
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
slug            VARCHAR(60) UNIQUE NOT NULL          -- "selvatica", "monte-2026"
name            VARCHAR(120) NOT NULL
tagline         TEXT
description     TEXT
date_event      TIMESTAMPTZ NOT NULL
date_display    VARCHAR(40)                          -- "08 AGO 2026"
time_display    VARCHAR(60)
venue           VARCHAR(120)
location        VARCHAR(120)
price           INTEGER NOT NULL                     -- en COP (centavos no, pesos)
price_display   VARCHAR(30)                          -- "$10.000 COP"
price_label     VARCHAR(80)
ticket_url      TEXT                                 -- WhatsApp o URL pasarela
theme_id        VARCHAR(20)                          -- "selvatica" | "monte"
lineup          JSONB                                -- array de { name, category, genre }
capacity        INTEGER                              -- cupos totales (NULL = ilimitado)
is_active       BOOLEAN DEFAULT true
is_published    BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

### `buyers` — Compradores (de-duplicados por documento)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            VARCHAR(120) NOT NULL
doc             VARCHAR(20) NOT NULL                 -- cédula
doc_type        VARCHAR(10) DEFAULT 'CC'
email           VARCHAR(120)
phone           VARCHAR(20)
created_at      TIMESTAMPTZ DEFAULT now()

UNIQUE(doc, doc_type)                               -- un registro por persona
```

### `orders` — Órdenes de compra
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
order_ref       VARCHAR(20) UNIQUE NOT NULL          -- "LR-XXXXXXXX" (código legible)
buyer_id        UUID REFERENCES buyers(id)
method          VARCHAR(20) NOT NULL                 -- 'online' | 'efectivo' | 'datáfono' | 'nequi'
status          VARCHAR(20) NOT NULL DEFAULT 'pending_payment'
                -- pending_payment | confirmed | cancelled | refunded
payment_ref     TEXT                                 -- referencia Wompi / datáfono
payment_meta    JSONB                                -- webhook payload completo de Wompi
subtotal        INTEGER NOT NULL                     -- suma de items en COP
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
created_by      VARCHAR(30) DEFAULT 'web'            -- 'web' | 'admin'
```

### `order_items` — Líneas de cada orden
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
order_id        UUID REFERENCES orders(id) ON DELETE CASCADE
event_id        UUID REFERENCES events(id)
event_name      VARCHAR(120)                         -- snapshot al momento de compra
qty             INTEGER NOT NULL DEFAULT 1
price_unit      INTEGER NOT NULL                     -- precio unitario snapshot
total           INTEGER NOT NULL                     -- qty × price_unit
```

### `admin_users` — (Fase 2, cuando haya más de un admin)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
username        VARCHAR(40) UNIQUE NOT NULL
hashed_pin      TEXT NOT NULL                        -- bcrypt del PIN
is_active       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT now()
```

---

## 6. CONTRATO DE API — Endpoints en detalle

### Base URL: `/api/v1`

---

#### `POST /orders` — Crear orden (checkout web)
```json
// REQUEST
{
  "buyer": {
    "name": "Juan Pérez",
    "doc": "12345678",
    "email": "juan@mail.com",
    "phone": "+57300000000"         // opcional
  },
  "items": [
    {
      "eventId": "selvatica",       // slug del evento
      "eventName": "SELVÁTICA",
      "qty": 2,
      "priceUnit": 10000,
      "total": 20000
    }
  ]
}

// RESPONSE 201
{
  "id": "550e8400-...",
  "orderRef": "LR-ABC123",
  "status": "pending_payment",
  "subtotal": 20000,
  "createdAt": "2026-08-01T10:00:00Z"
}
```

---

#### `GET /admin/orders` — Listar órdenes (admin)
- Header: `Authorization: Bearer <jwt_token>`
- Query params: `?event_id=selvatica&method=efectivo&status=confirmed&page=1&limit=50`

```json
// RESPONSE 200
{
  "total": 42,
  "page": 1,
  "items": [
    {
      "id": "...",
      "orderRef": "LR-ABC123",
      "buyer": { "name": "Juan", "doc": "123", "email": "..." },
      "items": [...],
      "method": "online",
      "status": "confirmed",
      "subtotal": 20000,
      "createdAt": "..."
    }
  ]
}
```

---

#### `POST /admin/manual-sale` — Venta en mano (admin)
- Header: `Authorization: Bearer <jwt_token>`

```json
// REQUEST (mismo que createOrder + method)
{
  "buyer": { "name": "...", "doc": "...", "email": "..." },
  "items": [...],
  "method": "efectivo"             // "efectivo" | "datáfono" | "nequi" | "otro"
}

// RESPONSE 201 — status directo "confirmed"
```

---

#### `POST /auth/login` — Login admin (Fase 1: PIN simple)
```json
// REQUEST
{ "pin": "1234" }

// RESPONSE 200
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 28800             // 8 horas
}
```

---

#### `POST /webhooks/wompi` — Recibir confirmación de pago
- Verifica firma HMAC-SHA256 con `WOMPI_EVENTS_SECRET`
- Actualiza `order.status` a `confirmed`
- Dispara tarea Celery: enviar email con boleta

---

#### `GET /events` — Listar eventos activos (público)
```json
// RESPONSE 200
[
  {
    "id": "...",
    "slug": "selvatica",
    "name": "SELVÁTICA",
    "tagline": "...",
    "dateDisplay": "08 AGO 2026",
    "price": 10000,
    "priceDisplay": "$10.000 COP",
    ...
  }
]
```

> 💡 **Cuando este endpoint esté listo, el frontend puede dejar de usar `events.json` y consumir la API directamente.**

---

## 7. SEGURIDAD

### Fase 1 (MVP) — PIN simple
- `VITE_ADMIN_PIN` en el frontend se compara contra `ADMIN_PIN` hasheado en el backend
- El backend devuelve un JWT de corta duración (8h)
- El frontend guarda el token en `sessionStorage` (no `localStorage`)

### Fase 2 (crecimiento) — Multi-admin
- Tabla `admin_users` con PIN hasheado (bcrypt)
- JWT con `sub = user_id`, `role = admin | superadmin`
- Middleware de autorización por rol en los routers

### CORS
```python
origins = [
    "https://loop.rave",           # producción
    "https://www.loop.rave",
    "http://localhost:5173",        # Vite dev
]
```

### Rate limiting
- `POST /orders` → máx 5 req/min por IP
- `POST /auth/login` → máx 10 intentos/15 min por IP
- Usando Redis + `slowapi`

### Wompi webhook
- Verificar header `X-Wompi-Signature` con `HMAC-SHA256(payload, WOMPI_EVENTS_SECRET)`
- Si la firma no coincide → `403 Forbidden` inmediato

---

## 8. VARIABLES DE ENTORNO (.env)

```bash
# Base de datos
DATABASE_URL=postgresql+asyncpg://loop:password@localhost:5432/looprave

# Redis
REDIS_URL=redis://localhost:6379/0

# Seguridad
SECRET_KEY=tu_clave_secreta_muy_larga_aqui_minimo_32_chars
ADMIN_PIN=1234
JWT_EXPIRE_HOURS=8

# Wompi (cuando esté listo)
WOMPI_PUBLIC_KEY=pub_prod_XXXX
WOMPI_PRIVATE_KEY=prv_prod_XXXX
WOMPI_EVENTS_SECRET=prod_events_XXXX

# Email (Gmail SMTP o SendGrid)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@loop.rave
SMTP_PASS=tu_app_password

# App
APP_ENV=development            # development | production
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=INFO
```

---

## 9. ESTRATEGIA DE ESCALABILIDAD

### Nivel 1 — MVP (ahora)
```
Internet → FastAPI (1 instancia) → PostgreSQL
                                 → Redis (caché)
```
- 1 servidor VPS (2 vCPU, 4 GB RAM) es suficiente para <500 órdenes/evento
- Docker Compose en una sola máquina

### Nivel 2 — Crecimiento (>3 eventos simultáneos, merch, blog)
```
Internet → Nginx (SSL termination)
              → FastAPI × 3 instancias (load balancing)
              → PostgreSQL (con read replica)
              → Redis Cluster
              → Celery Workers × 2
```
- Railway, Render o AWS ECS para el API
- Supabase o RDS para PostgreSQL managed
- Upstash para Redis managed

### Nivel 3 — Plataforma (multi-organizador, marketplace)
```
Internet → API Gateway (Kong / CloudFlare)
              → Microservicios:
                  events-service    (FastAPI)
                  orders-service    (FastAPI)
                  payments-service  (FastAPI)
                  notifications-service (FastAPI + Celery)
              → PostgreSQL por servicio (separación de datos)
              → Message queue (RabbitMQ / AWS SQS)
```
- Esta fase solo si LOOP se convierte en plataforma para otras organizaciones

> **Regla de oro de escalabilidad:** No sobre-ingenieres. Empieza en Nivel 1, diseña para que el Nivel 2 sea posible sin reescribir nada.

---

## 10. PLAN DE IMPLEMENTACIÓN — FASES

### Fase 0 — Setup (1-2 días)
- [ ] Crear repo `loop-rave-api` en GitHub
- [ ] Setup FastAPI + SQLAlchemy async + Alembic
- [ ] Docker Compose: PostgreSQL + Redis + API
- [ ] Primera migración con tablas base
- [ ] Health check endpoint `GET /health`

### Fase 1 — MVP funcional (3-5 días)
- [ ] CRUD básico de eventos (solo GET público por ahora)
- [ ] `POST /api/v1/orders` — crear orden
- [ ] `GET /api/v1/admin/orders` — listar con PIN simple
- [ ] `POST /api/v1/admin/manual-sale` — venta en mano
- [ ] `POST /api/v1/auth/login` — devuelve JWT
- [ ] CORS configurado para el frontend
- [ ] Conectar `VITE_API_URL` en el frontend → quitar mock localStorage

### Fase 2 — Pagos reales (2-3 días post-Wompi)
- [ ] `POST /api/v1/webhooks/wompi` con verificación de firma
- [ ] Celery task: enviar email de confirmación con PDF de boleta
- [ ] Actualizar estado de órdenes por webhook
- [ ] Panel admin muestra órdenes confirmadas vs pendientes

### Fase 3 — Gestión de contenido (futuro)
- [ ] CRUD completo de eventos desde admin web
- [ ] Upload de imágenes (S3 / Cloudinary)
- [ ] Blog posts API
- [ ] Módulo de merch con inventario

---

## 11. CONVENCIONES DE CÓDIGO

### Naming
- **Archivos**: `snake_case.py`
- **Clases**: `PascalCase`
- **Funciones/variables**: `snake_case`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Endpoints**: `kebab-case` (`/manual-sale`)

### Async everywhere
```python
# SIEMPRE async en routes y services
@router.post("/orders")
async def create_order(payload: OrderCreate, db: AsyncSession = Depends(get_db)):
    return await order_service.create(db, payload)
```

### Dependency injection
```python
# core/dependencies.py
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

async def get_current_admin(token: str = Depends(oauth2_scheme)) -> AdminUser:
    # verifica JWT, devuelve admin o lanza 401
```

### Error handling
```python
# Usar HTTPException con mensajes en español (es el idioma del cliente)
raise HTTPException(
    status_code=400,
    detail="El evento no tiene cupos disponibles."
)
```

---

## 12. INSTRUCCIONES PARA EL ASISTENTE DE IA

### Al iniciar una sesión de backend

1. **Lee este documento primero** y confirma que lo tienes en contexto
2. **No inventes nombres de endpoints** — usa los definidos en la sección 6
3. **No cambies los schemas del frontend** — el contrato en la sección 2 es fijo
4. **Prefiere async** — toda función que toque DB debe ser `async`
5. **Usa el patrón Repository** — nunca hagas queries en los routers directamente
6. **Versiona los endpoints** — todo bajo `/api/v1/`

### Prompts optimizados para continuar trabajo

**Para crear un nuevo endpoint:**
```
Contexto: backend FastAPI de LOOP.RAVE (ver BACKEND_CONTEXT.md).
Necesito implementar el endpoint [NOMBRE] definido en la sección 6.
Estructura: Router → Service → Repository.
DB: SQLAlchemy async. Schema ya definido en schemas/.
```

**Para agregar un modelo:**
```
Contexto: LOOP.RAVE FastAPI backend.
Agrega el modelo [NOMBRE] según el schema de la sección 5.
Incluye la migración Alembic correspondiente.
```

**Para debugging:**
```
Contexto: LOOP.RAVE FastAPI backend, stack: FastAPI + SQLAlchemy async + PostgreSQL.
Error: [pegar error completo]
Archivo relevante: [nombre del archivo]
```

---

## 13. PREGUNTAS ABIERTAS PARA DEFINIR

- [ ] **¿Hosting?** ¿Railway, Render, VPS propio (Hetzner/DO)?
- [ ] **¿Dominio API?** ¿`api.loop.rave` o `loop.rave/api`?
- [ ] **¿Email de confirmación?** ¿Qué debe decir la boleta? ¿Con QR?
- [ ] **¿Cuántos admins?** ¿Solo tú o hay más operadores?
- [ ] **¿Stock/cupos por evento?** ¿Se maneja en la DB o manualmente?
- [ ] **¿Merch por backend?** ¿O sigue con WhatsApp?

---

*Última actualización: 2026-06-17 | Versión: 1.0.0*
*Frontend repo: brayaneider1/Monte-landing (branch: develop)*
*Backend repo: pendiente de crear*
