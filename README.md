# Order System API

Backend del Sistema de Comandas para restaurantes. Gestiona pedidos, productos, clientes, usuarios y unidades de negocio (multi-tenant). Construido con TypeScript + Express + Mongoose.

## Quick start (Docker — recomendado)

Requisitos: Docker Desktop.

```bash
# desde este directorio (Api/)
cp .env.example .env           # o crea tu .env manualmente, ver "Env vars" abajo
docker compose up -d           # levanta Mongo (replica set) + API
docker compose logs -f api     # ver logs en vivo
```

La API queda en `http://localhost:3000`. La DB en `localhost:27017` (para conectar con MongoDB Compass usa `mongodb://localhost:27017/?directConnection=true`).

Para parar: `docker compose down`. Para reset total (borra la data): `docker compose down -v`.

### Credenciales sembradas (seed)

Al arrancar el contenedor corre `cleanupDatabase()` + `createDataSeed()` → la DB se reinicializa con data de prueba. Usuarios creados:

| Email | Password | Rol (en su BU) | BusinessUnit |
|---|---|---|---|
| `admin.restaurant@demo.com` | `admin123` | ADMIN | Restaurant Demo |
| `admin.coffee@demo.com` | `admin123` | ADMIN | Coffee Shop Demo |

## Quick start (standalone, sin Docker)

Requisitos: Node.js 22+, MongoDB 7+ corriendo como **replica set** (las transacciones lo requieren).

```bash
npm install
cp .env.example .env           # edita MONGODB_URI si tu Mongo no está en localhost
npm run dev                    # nodemon + ts-node
```

## Env vars

Todas las variables viven en `Api/.env` (gitignored). `.env.example` tiene el template.

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP del API. Default `3000`. |
| `MONGODB_URI` | Connection string de Mongo. **Debe apuntar a un replica set.** Ejemplo local: `mongodb://localhost:27017/comandas?replicaSet=rs0&directConnection=true`. |
| `SECRET_KEY_TOKEN` | Secret para firmar JWTs. Usa solo alfanuméricos — **`$` y `%` rompen docker compose** (interpolación de variables). 32+ caracteres random. |

En el flujo Docker, `docker-compose.yml` sobreescribe `MONGODB_URI` y `PORT` para apuntar al contenedor `mongo` interno. `SECRET_KEY_TOKEN` se toma del `.env` vía `env_file`.

## Arquitectura

### Multi-tenant por BusinessUnit

Cada dato de negocio (productos, pedidos, categorías, etc.) pertenece a una `BusinessUnit`. Los usuarios pueden tener distintos roles en distintas BUs mediante la entidad `Membership`.

- `src/global/requestContext.ts` — `AsyncLocalStorage<RequestContext>` que guarda `{userID, role?, businessUnitID?}` por request. Setteado por el auth middleware.
- `src/repositories/baseRepository.ts` — cuando un repo es `scoped: true`, auto-inyecta `{businessUnit: <ctx.businessUnitID>}` en toda query. Los controllers **no** manejan el filtro manualmente.

### Autenticación (dos tokens)

1. `POST /Auth/signIn` con `{email, password}` → devuelve **user token** (`{userID}`).
2. `GET /Auth/signInBussinesUnit/:businessUnitID` con `Authorization: Bearer <userToken>` → valida que exista un `Membership` activo del usuario en esa BU; si sí, devuelve **business token** (`{userID, role, businessUnitID}`). Si no, `403 / 4031 NOT_MEMBER_OF_BUSINESS`.
3. Todas las rutas de datos usan business token vía `validateBusinessAuth`, y muchas además tienen `requireRole(...)` para restringir por rol (ADMIN/ANFITRION/WAITER/PREP_COOK).

### Repository + mapper hubs

- `src/repositories/repositoryHub.ts` — un singleton con un `BaseRepository` por entidad.
- `src/utils/mappers/mapperHub.ts` — un `BaseMapper` (entity → DTO) por entidad.
- DTOs en `src/models/DTOs/` usan `class-validator` para input (`XxxDTOIn`) y `class-transformer` con `@Expose()` para output (`XxxDTOOut`).

### Respuesta uniforme

Toda respuesta pasa por `SuccessResponse`/`ErrorResponse` en `src/utils/responseHandler.utils.ts` y tiene la forma:

```json
{
  "success": true,
  "code": 1004,
  "message": "Entity successfully retrieved",
  "data": { ... },
  "metadata": { "timestamp": "...", "path": "/..." }
}
```

Códigos de error útiles para el cliente:

| Código | HTTP | Significado |
|---|---|---|
| `4010` | 401 | MISSING_TOKEN |
| `4011` | 401 | INVALID_TOKEN |
| `4012` | 401 | EXPIRED_TOKEN |
| `4013` | 401 | INVALID_TOKEN_TYPE (usaste user token donde iba business token) |
| `4014` | 400 | VALIDATION_ERROR (lista detallada en `data`) |
| `4030` | 403 | FORBIDDEN (rol insuficiente) |
| `4031` | 403 | NOT_MEMBER_OF_BUSINESS |
| `4290` | 429 | RATE_LIMIT_EXCEEDED |

### Seguridad aplicada

- `helmet()` con defaults.
- `cors({ origin: '*' })` — **abrir whitelist específica antes de producción**.
- Rate limit global: 100 req/min por IP. `/Auth/*`: 5 req/min por IP.
- `requireRole` middleware por endpoint — ver [src/routes/](src/routes/).
- Transacción Mongo en `createBusinessUnit` para atomicidad de BU + Membership ADMIN del creador.
- Last-admin guard en `PUT/DELETE /BusinessUnit/:id/members/:id` — no se puede dejar una BU sin ADMIN activo.

## Endpoints principales

Todas las rutas devuelven el envelope estándar. Lista corta:

| Método | Ruta | Auth | Rol permitido |
|---|---|---|---|
| POST | `/Auth/signUp` | — | público (`role` en body es ignorado) |
| POST | `/Auth/signIn` | — | público |
| GET | `/Auth/signInBussinesUnit/:businessUnitID` | user token | cualquier autenticado con membership activa |
| GET | `/BusinessUnit/:businessUnitID/members` | business | ADMIN, ANFITRION |
| POST/PUT/DELETE | `/BusinessUnit/:businessUnitID/members[/:membershipID]` | business | ADMIN |
| POST | `/BusinessUnit/createBusinessUnit` | user token | cualquier autenticado (el creador se vuelve ADMIN automáticamente) |
| GET | `/Products/*`, `/Orders/*`, `/Customers/*`, etc. | business | cualquier miembro |
| POST/PUT/DELETE | `/Products/*`, `/Categories/*`, `/Currencies/*`, `/Components/*`, `/ProductionAreas/*` | business | ADMIN |
| POST `/Orders/createOrder` | — | business | ADMIN, ANFITRION, WAITER |
| PUT `/Orders/updateOrder/:id` | — | business | ADMIN, ANFITRION, WAITER |
| DELETE `/Orders/deleteOrder/:id` | — | business | ADMIN, ANFITRION |

Detalle completo en los archivos `src/routes/*.routes.ts`.

## Estructura del código

```
src/
├── app.ts, index.ts          # entry + bootstrap
├── global/                   # config, definitions (enums, populate configs), requestContext, logs
├── database/                 # connection.ts + seeds.ts
├── middlewares/              # auth, validation, requireRole
├── models/
│   ├── database/             # Mongoose schemas
│   ├── DTOs/                 # in/out DTOs con class-validator + class-transformer
│   ├── helpers/              # pagination, sort, tokenData
│   └── response/             # ApiResponse envelope
├── repositories/             # BaseRepository genérico + repositoryHub singleton
├── utils/                    # encrypt, functions, mappers/, responseHandler, token
├── controllers/              # un handler por endpoint
└── routes/                   # un router por entidad, aplica middlewares de auth/role/validation
```

## Convenciones y tips

- Comentarios mezclan español e inglés — los controllers usan dividers uppercase (`//GET TOKEN DATA`, `//VALIDATE`, etc.) como guía visual.
- Rutas son verb-style (`/getAllOrders`, `/createOrder`) en vez de REST-resource-style. Mantener el patrón al añadir rutas nuevas.
- Hot reload en Docker usa polling (`CHOKIDAR_USEPOLLING=true`) porque los eventos de filesystem en bind mounts de Windows no siempre propagan desde el host al container.
- Las órdenes embeben snapshots de customer/owner/product/component/currency al crearse — renombrar un producto **no** actualiza pedidos existentes (intencional).
- El `repositoryHub` tiene dos tipos de repos: `scoped: true` (auto-filtran por BU) y `scoped: false` (globales, para `User` y `BusinessUnit`).

## Caveats conocidos

- **`SECRET_KEY_TOKEN` con `$` o `%`**: docker compose los interpreta como sintaxis de interpolación. El valor que llega al container queda truncado. Workaround: usa solo alfanuméricos, o escapa `$` como `$$` en `.env`. Los JWTs siguen funcionando porque firma y verificación usan el mismo secret truncado, pero el efectivo no es el que escribiste.
- **`cors({ origin: '*' })` abierto** — necesario cerrar la whitelist antes de producción (o al menos restringir en staging).
- **Sin refresh tokens**: los tokens expiran a las 24h y el cliente debe re-loguearse. Roadmap (P1).
- **Sin tests automatizados** todavía. Smoke testing manual post-refactor. Roadmap (P2).
