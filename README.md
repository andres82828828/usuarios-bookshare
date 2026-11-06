# BookShare: microservicio de Usuarios

Servicio de registro, autenticación (JWT) y gestión de perfiles de BookShare.
Node.js + Express, MySQL propia (database-per-service), arquitectura interna en capas.

## Requisitos
- Node.js 18 o superior
- MySQL 8 (o MariaDB 10.6 o superior)

## Instalación
```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
```
En `.env` ponga el usuario y la contraseña de su MySQL (con XAMPP normalmente `DB_USER=root` y `DB_PASSWORD=` vacío).

## Base de datos con datos ficticios
```bash
npm run db:init           # crea bookshare_usuarios, la tabla usuarios y carga 40 estudiantes ficticios
```
- 40 usuarios inventados con correo @uniminuto.edu.co (36 activos y 4 inactivos para probar la eliminación lógica).
- **Contraseña de todas las cuentas:** `BookShare2026`
- **Cuenta rápida para demostración:** `demo.bookshare` / `BookShare2026`
- Archivos: `database/schema.sql` (estructura), `database/seed.sql` (datos, también se puede importar en phpMyAdmin), `database/semilla/usuarios-ficticios.csv` (listado legible, sin contraseñas).
- `npm run db:generar` vuelve a generar `seed.sql` y la semilla JSON.
- En modo memoria (`npm run start:memoria`) los mismos 40 usuarios se cargan automáticamente.

**Con phpMyAdmin (XAMPP):** pestaña *Importar* → `database/schema.sql`, y luego *Importar* → `database/seed.sql`.

## Ejecutar
```bash
npm start                # con MySQL
npm run start:memoria    # sin MySQL (datos en memoria, para demostración)
```
El servicio queda en `http://localhost:3001`.

**Documentación interactiva (Swagger):** http://localhost:3001/docs  (especificación en `/openapi.json`).
Ahí se pueden probar todos los endpoints: registrar, hacer login, copiar el token, presionar **Authorize** y usar los endpoints protegidos.

## Pruebas
```bash
npm test                         # 30 pruebas automáticas (Jest + Supertest)
bash scripts/prueba-manual.sh    # prueba de todos los endpoints con curl (servicio encendido)
```
En Windows, el script manual se corre desde Git Bash.

## Endpoints (Contrato de Interfaz, Entrega 1)
| Método | Ruta | Descripción | Token |
|---|---|---|---|
| POST | /api/v1/usuarios | Registrar usuario | No |
| POST | /api/v1/auth/login | Iniciar sesión | No |
| POST | /api/v1/auth/validar | Validar token (lo usan los otros servicios) | Sí (header o body) |
| GET | /api/v1/usuarios/{id} | Consultar perfil | Sí |
| GET | /api/v1/usuarios/{id}/contacto | Datos de contacto (Chat/Notificaciones) | Sí |
| PUT | /api/v1/usuarios/{id} | Actualizar perfil (solo el dueño) | Sí |
| DELETE | /api/v1/usuarios/{id} | Eliminar cuenta (lógica, solo el dueño) | Sí |
| GET | /health | Estado del servicio y su BD (adicional, no altera el contrato) | No |

Formato de error uniforme:
```json
{ "error": { "codigo": "USUARIO_DUPLICADO", "mensaje": "Ya existe un usuario con ese correo" } }
```

## Estructura
```
src/
  server.js / app.js        arranque y configuración de Express
  routes/                   rutas = endpoints del contrato
  docs/openapi.js           especificación OpenAPI que se muestra en /docs
  controllers/              capa de presentación (HTTP)
  middlewares/              autenticación por token y manejo de errores
  services/                 capa de lógica de negocio y validaciones
  security/                 bcrypt (contraseñas) y JWT (tokens)
  repositories/             capa de acceso a datos (MySQL y en memoria)
  config/                   variables de entorno y pool de MySQL
database/schema.sql         estructura de la base de datos propia del servicio
database/seed.sql           40 usuarios ficticios (contraseña BookShare2026)
database/semilla/           los mismos datos en JSON (modo memoria) y CSV
scripts/init-db.js          crea la BD y carga los datos (npm run db:init)
scripts/generar-semilla.js  genera los datos ficticios
tests/                      pruebas automáticas
scripts/prueba-manual.sh    prueba manual con curl
evidencias/                 resultados de las pruebas
```
