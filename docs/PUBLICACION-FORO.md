# Servicio de Usuarios – BookShare

Repositorio: https://github.com/andres82828828/usuarios-bookshare
Documentación interactiva (Swagger): `http://localhost:3001/docs` · Especificación OpenAPI: `http://localhost:3001/openapi.json`

---

## 1. Información del servicio

**Nombre del servicio:** `usuarios-service` (Microservicio de Usuarios)

**Funciones:**

- Registrar estudiantes con correo institucional (`@uniminuto.edu.co`).
- Iniciar sesión y emitir tokens **JWT** (tipo Bearer, vigencia de 2 horas).
- **Validar tokens** para que los demás servicios sepan si quien hace una petición es un usuario autenticado y activo.
- Consultar, actualizar y eliminar perfiles. La eliminación es lógica: la cuenta queda `INACTIVO`.
- Entregar los datos de contacto de un usuario (nombre, correo y teléfono) a los servicios que los necesiten.

Tecnología: Node.js + Express, con su propia base de datos MySQL (`bookshare_usuarios`, patrón *database-per-service*).

---

## 2. Interfaces y mecanismos de comunicación

**Mecanismo:** API REST síncrona sobre HTTP con cuerpos JSON (`Content-Type: application/json`).

**URL base:** `http://localhost:3001/api/v1`
(En la integración se cambia `localhost` por la IP o el host donde quede desplegado el servicio. El puerto es 3001.)

| # | Método | Endpoint | Token | Propósito / cuándo usarlo |
|---|---|---|---|---|
| 1 | POST | `/usuarios` | No | Registrar un usuario nuevo (pantalla de registro). |
| 2 | POST | `/auth/login` | No | Iniciar sesión. Devuelve el token JWT que el frontend envía en todas las demás peticiones. |
| 3 | POST | `/auth/validar` | Sí (header o body) | **Para los demás servicios:** verificar que un token es válido y obtener el `usuario_id` de quien hace la petición. |
| 4 | GET | `/usuarios/{id}` | Sí | Consultar el perfil público de un usuario (por ejemplo, el dueño de un libro). |
| 5 | GET | `/usuarios/{id}/contacto` | Sí | Obtener nombre, correo y teléfono de un usuario (para Chat y Notificaciones). |
| 6 | PUT | `/usuarios/{id}` | Sí (solo el dueño) | Actualizar el perfil propio: nombre, correo, teléfono o contraseña. |
| 7 | DELETE | `/usuarios/{id}` | Sí (solo el dueño) | Eliminar la cuenta propia (eliminación lógica). |
| 8 | GET | `/health` (sin `/api/v1`) | No | Saber si el servicio y su base de datos están arriba (para monitoreo y el gateway). |

**Autenticación:** header `Authorization: Bearer <token>`, con el token que devuelve el login.

---

## 3. Datos de entrada y salida

### 3.1 POST `/usuarios`: Registrar usuario

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| `nombre_completo` | string | Sí | Entre 3 y 120 caracteres |
| `correo` | string | Sí | Correo válido que termine en `@uniminuto.edu.co` |
| `nombre_usuario` | string | Sí | De 3 a 40 caracteres: letras, números, `.`, `-` o `_`. Es único |
| `contrasena` | string | Sí | Mínimo 8 caracteres, con al menos una letra y un número |
| `telefono` | string | No | De 7 a 20 dígitos; puede empezar por `+` |

> También se aceptan los nombres del contrato original: `Nombre_Completo`, `Email`, `NombreUsuario`, `Contraseña`, `Teléfono`.

**Solicitud:**
```http
POST /api/v1/usuarios
Content-Type: application/json

{
  "nombre_completo": "Laura Gómez",
  "correo": "laura.gomez@uniminuto.edu.co",
  "nombre_usuario": "laura.gomez",
  "contrasena": "Libros2026",
  "telefono": "3001234567"
}
```

**Respuesta exitosa: `201 Created`** (con el header `Location: /api/v1/usuarios/41`)
```json
{
  "mensaje": "Usuario registrado correctamente",
  "usuario": {
    "usuario_id": 41,
    "nombre_completo": "Laura Gómez",
    "correo": "laura.gomez@uniminuto.edu.co",
    "nombre_usuario": "laura.gomez",
    "telefono": "3001234567",
    "estado": "ACTIVO",
    "fecha_registro": "2026-11-09T15:20:00.000Z"
  }
}
```

### 3.2 POST `/auth/login`: Iniciar sesión

| Campo | Tipo | Obligatorio |
|---|---|---|
| `nombre_usuario` | string | Sí |
| `contrasena` | string | Sí |

**Solicitud:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{ "nombre_usuario": "demo.bookshare", "contrasena": "BookShare2026" }
```

**Respuesta exitosa: `200 OK`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "expira_en": "2h",
  "usuario": {
    "usuario_id": 1,
    "nombre_completo": "Estudiante Demo BookShare",
    "correo": "demo.bookshare@uniminuto.edu.co",
    "nombre_usuario": "demo.bookshare",
    "telefono": "3000000000",
    "estado": "ACTIVO",
    "fecha_registro": "2026-02-02T19:02:00.000Z"
  }
}
```

### 3.3 POST `/auth/validar`: Validar token (para los demás servicios)

El token se envía de una de estas dos formas:

| Dónde | Campo | Tipo | Obligatorio |
|---|---|---|---|
| Header | `Authorization: Bearer <token>` | string | Uno de los dos |
| Body | `token` | string | Uno de los dos |

Además de revisar la firma y la vigencia del token, el servicio confirma en la base de datos que la cuenta sigue **activa**.

**Solicitud:**
```http
POST /api/v1/auth/validar
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
o también:
```http
POST /api/v1/auth/validar
Content-Type: application/json

{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Token válido: `200 OK`**
```json
{
  "valido": true,
  "usuario_id": 1,
  "nombre_usuario": "demo.bookshare",
  "expira": "2026-11-09T17:20:00.000Z"
}
```
**Token inválido, vencido o de una cuenta eliminada: `401 Unauthorized`**
```json
{ "valido": false }
```

### 3.4 GET `/usuarios/{id}`: Consultar perfil

| Parámetro | Ubicación | Tipo | Obligatorio |
|---|---|---|---|
| `id` | ruta | entero > 0 | Sí |
| `Authorization` | header | `Bearer <token>` | Sí |

```http
GET /api/v1/usuarios/1
Authorization: Bearer <token>
```
**`200 OK`**
```json
{
  "usuario": {
    "usuario_id": 1,
    "nombre_completo": "Estudiante Demo BookShare",
    "correo": "demo.bookshare@uniminuto.edu.co",
    "nombre_usuario": "demo.bookshare",
    "telefono": "3000000000",
    "estado": "ACTIVO",
    "fecha_registro": "2026-02-02T19:02:00.000Z"
  }
}
```

### 3.5 GET `/usuarios/{id}/contacto`: Datos de contacto

Usa los mismos parámetros que 3.4.

```http
GET /api/v1/usuarios/1/contacto
Authorization: Bearer <token>
```
**`200 OK`**
```json
{
  "contacto": {
    "usuario_id": 1,
    "nombre_completo": "Estudiante Demo BookShare",
    "correo": "demo.bookshare@uniminuto.edu.co",
    "telefono": "3000000000"
  }
}
```

### 3.6 PUT `/usuarios/{id}`: Actualizar perfil (solo el dueño)

El `id` de la ruta debe ser el mismo usuario del token. Se envía **al menos uno** de estos campos:

| Campo | Tipo | Obligatorio | Regla |
|---|---|---|---|
| `nombre_completo` | string | No | Entre 3 y 120 caracteres |
| `correo` | string | No | Correo institucional y único |
| `telefono` | string | No | De 7 a 20 dígitos |
| `contrasena` | string | No | Mínimo 8 caracteres, con letra y número |

> El `nombre_usuario` **no se puede modificar**.

```http
PUT /api/v1/usuarios/1
Authorization: Bearer <token>
Content-Type: application/json

{ "telefono": "3109876543" }
```
**`200 OK`**
```json
{
  "mensaje": "Perfil actualizado correctamente",
  "usuario": { "usuario_id": 1, "nombre_completo": "Estudiante Demo BookShare", "correo": "demo.bookshare@uniminuto.edu.co", "nombre_usuario": "demo.bookshare", "telefono": "3109876543", "estado": "ACTIVO", "fecha_registro": "2026-02-02T19:02:00.000Z" }
}
```

### 3.7 DELETE `/usuarios/{id}`: Eliminar cuenta (solo el dueño)

```http
DELETE /api/v1/usuarios/1
Authorization: Bearer <token>
```
**`200 OK`**
```json
{ "mensaje": "Cuenta eliminada correctamente" }
```
Después de eliminarla, el usuario no puede iniciar sesión, `/auth/validar` responde `valido: false` y los GET de ese usuario responden 404.

### 3.8 GET `/health`

```http
GET /health
```
**`200 OK`**: `{ "servicio": "usuarios", "estado": "OK", "base_de_datos": "OK" }`
**`503`**: `{ "servicio": "usuarios", "estado": "DEGRADADO", "base_de_datos": "NO_DISPONIBLE" }`

---

## 4. Manejo de errores

Todos los errores tienen el mismo formato:
```json
{
  "error": {
    "codigo": "DATOS_INVALIDOS",
    "mensaje": "Los datos enviados no son válidos",
    "detalles": [
      { "campo": "correo", "mensaje": "Debe ser un correo institucional (@uniminuto.edu.co)" }
    ]
  }
}
```
`detalles` solo aparece en los errores de validación. Para decidir qué hacer, lean el campo `codigo`; el texto de `mensaje` puede cambiar.

| HTTP | `codigo` | Cuándo ocurre | Endpoints |
|---|---|---|---|
| 400 | `DATOS_INVALIDOS` | Faltan campos, tienen un formato incorrecto, el `id` no es un entero positivo o se intenta cambiar el `nombre_usuario` | 1, 2, 4, 5, 6, 7 |
| 400 | `JSON_INVALIDO` | El cuerpo no es un JSON válido | Todos los que reciben body |
| 401 | `CREDENCIALES_INVALIDAS` | El usuario o la contraseña son incorrectos | 2 |
| 401 | `TOKEN_AUSENTE` | No se envió el header `Authorization: Bearer <token>` | 3, 4, 5, 6, 7 |
| 401 | `TOKEN_INVALIDO` | El token está alterado o vencido | 4, 5, 6, 7 |
| 401 | *(cuerpo `{ "valido": false }`)* | El token es inválido, está vencido o la cuenta está inactiva | 3 |
| 403 | `ACCESO_DENEGADO` | Se intenta modificar o eliminar un usuario distinto al del token | 6, 7 |
| 403 | `CUENTA_INACTIVA` | Login de una cuenta eliminada | 2 |
| 404 | `USUARIO_NO_ENCONTRADO` | El usuario no existe o está inactivo | 4, 5, 6, 7 |
| 404 | `RUTA_NO_ENCONTRADA` | El endpoint no existe | Cualquiera |
| 409 | `USUARIO_DUPLICADO` | El correo o el nombre de usuario ya están registrados | 1, 6 |
| 503 | `SERVICIO_NO_DISPONIBLE` | La base de datos de Usuarios no responde. Se puede reintentar más tarde | Todos |
| 500 | `ERROR_INTERNO` | Error inesperado | Todos |

---

## 5. Integración con otros servicios

| Servicio consumidor | Operaciones que usa | Para qué |
|---|---|---|
| **Frontend / API Gateway** | `POST /usuarios`, `POST /auth/login`, `GET/PUT/DELETE /usuarios/{id}`, `GET /health` | Registro, login, pantalla de perfil y monitoreo |
| **Todos los servicios con endpoints protegidos** (Libros/Catálogo, Préstamos/Intercambios, Chat, Notificaciones) | `POST /auth/validar` | Confirmar que el token que reciben es válido y obtener el `usuario_id` de quien hace la petición |
| **Libros / Catálogo** | `GET /usuarios/{id}` | Mostrar los datos del dueño de una publicación |
| **Préstamos / Intercambios** | `GET /usuarios/{id}`, `GET /usuarios/{id}/contacto` | Verificar que las partes existen y están activas, y obtener su contacto |
| **Chat** | `GET /usuarios/{id}/contacto` | Mostrar el nombre del otro participante |
| **Notificaciones** | `GET /usuarios/{id}/contacto` | Obtener el correo o el teléfono al que se envía la notificación |

**Flujo recomendado para los demás servicios:**
1. El frontend hace el login en Usuarios y recibe el token.
2. El frontend llama a su servicio con `Authorization: Bearer <token>`.
3. Su servicio reenvía ese token a `POST /api/v1/auth/validar`.
4. Si recibe `200` y `valido: true`, usa el `usuario_id` de la respuesta. Si recibe `401`, rechaza la petición con 401.

Así nadie tiene que conocer el secreto del JWT ni acceder a nuestra base de datos.

**Datos de prueba:** hay 40 usuarios ficticios cargados. La cuenta de demostración es `demo.bookshare` con contraseña `BookShare2026`, y todas las cuentas ficticias usan esa misma contraseña. El servicio también puede correr sin MySQL con `npm run start:memoria`.

---

## 6. Comunicación y colaboración

- Si necesitan algún dato, endpoint o ajuste, escríbannos en los comentarios de esta publicación.
- Si cambiamos algún endpoint, parámetro o estructura, actualizaremos esta publicación y avisaremos a los servicios afectados.
- **A los demás equipos:** confírmennos qué operaciones van a consumir y si necesitan algún campo adicional del usuario (por ejemplo, programa académico o sede). Así podemos agregarlo sin romper el contrato actual.
