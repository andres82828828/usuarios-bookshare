// Especificación OpenAPI del microservicio de Usuarios (se muestra en /docs con Swagger UI)
const config = require('../config');

const ref = (n) => ({ $ref: `#/components/schemas/${n}` });
const json = (schema, example) => ({ 'application/json': { schema, ...(example ? { example } : {}) } });
const err = (descripcion, codigo, mensaje) => ({
  description: descripcion,
  content: json(ref('ErrorSchema'), { error: { codigo, mensaje } }),
});
const seguro = [{ BearerAuth: [] }];
const idParam = { name: 'id', in: 'path', required: true, description: 'usuario_id', schema: { type: 'integer', minimum: 1 }, example: 1 };

module.exports = {
  openapi: '3.1.0',
  info: {
    title: 'BookShare - Microservicio de Usuarios',
    version: '1.0',
    description:
      'Registro, autenticación (JWT) y gestión de perfiles de los estudiantes de BookShare.\n\n' +
      '**Cómo probar:** 1) registre un usuario, 2) haga login y copie el `token`, ' +
      '3) presione **Authorize** y pegue el token, 4) use los endpoints protegidos (🔒).\n\n' +
      `Solo se aceptan correos institucionales **@${config.dominioInstitucional}**.`,
  },
  servers: [{ url: '/', description: 'Este servidor' }],
  tags: [
    { name: 'Usuarios', description: 'Registro y gestión de perfiles' },
    { name: 'Autenticación', description: 'Login y validación de tokens (usado por los demás microservicios)' },
    { name: 'Monitoreo', description: 'Estado del servicio' },
  ],
  paths: {
    '/api/v1/usuarios': {
      post: {
        tags: ['Usuarios'], summary: 'Registrar Usuario', operationId: 'registrarUsuario',
        requestBody: { required: true, content: json(ref('RegistroEntradaSchema'), {
          Nombre_Completo: 'Andrés Pérez', Email: 'andres.perez@uniminuto.edu.co', NombreUsuario: 'andresp', 'Contraseña': 'Clave1234', 'Teléfono': '3001234567',
        }) },
        responses: {
          201: { description: 'Usuario registrado', content: json({ type: 'object', properties: { mensaje: { type: 'string' }, usuario: ref('UsuarioOutSchema') } }) },
          400: err('Datos inválidos', 'DATOS_INVALIDOS', 'Los datos enviados no son válidos'),
          409: err('Correo o nombre de usuario ya registrado', 'USUARIO_DUPLICADO', 'Ya existe un usuario con ese correo'),
          503: err('Base de datos no disponible', 'SERVICIO_NO_DISPONIBLE', 'La base de datos de Usuarios no está disponible, intente más tarde'),
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Autenticación'], summary: 'Iniciar Sesion', operationId: 'login',
        requestBody: { required: true, content: json(ref('LoginEntradaSchema'), { nombreUsuario: 'andresp', 'Contraseña': 'Clave1234' }) },
        responses: {
          200: { description: 'Login exitoso', content: json(ref('LoginOutSchema')) },
          400: err('Faltan credenciales', 'DATOS_INVALIDOS', 'Los datos enviados no son válidos'),
          401: err('Credenciales incorrectas', 'CREDENCIALES_INVALIDAS', 'Usuario o contraseña incorrectos'),
          403: err('Cuenta eliminada', 'CUENTA_INACTIVA', 'La cuenta está inactiva'),
        },
      },
    },
    '/api/v1/auth/validar': {
      post: {
        tags: ['Autenticación'], summary: 'Validar Token', operationId: 'validarToken',
        description: 'Usado por Catálogo, Solicitudes, Préstamos, Valoraciones, Chat y Almacenamiento. El token se envía en el header `Authorization: Bearer <token>` (o en el body como `{"token": "..."}`).',
        security: seguro,
        requestBody: { required: false, content: json(ref('ValidarEntradaSchema')) },
        responses: {
          200: { description: 'Token válido', content: json(ref('ValidacionOutSchema'), { valido: true, usuario_id: 1, nombre_usuario: 'andresp', expira: '2026-10-13T23:13:48.000Z' }) },
          401: { description: 'Token inválido, expirado o de cuenta eliminada', content: json(ref('ValidacionOutSchema'), { valido: false }) },
        },
      },
    },
    '/api/v1/usuarios/{id}': {
      get: {
        tags: ['Usuarios'], summary: 'Consultar Perfil', operationId: 'consultarPerfil', security: seguro, parameters: [idParam],
        responses: {
          200: { description: 'Perfil del usuario', content: json({ type: 'object', properties: { usuario: ref('UsuarioOutSchema') } }) },
          401: err('Sin token o token inválido', 'TOKEN_INVALIDO', 'El token es inválido o ha expirado'),
          404: err('Usuario no existe', 'USUARIO_NO_ENCONTRADO', 'El usuario no existe'),
        },
      },
      put: {
        tags: ['Usuarios'], summary: 'Actualizar Perfil', operationId: 'actualizarPerfil', security: seguro, parameters: [idParam],
        description: 'Solo el dueño de la cuenta puede actualizarla. El nombre de usuario no se puede cambiar.',
        requestBody: { required: true, content: json(ref('ActualizacionEntradaSchema'), { 'Teléfono': '3109998877' }) },
        responses: {
          200: { description: 'Perfil actualizado', content: json({ type: 'object', properties: { mensaje: { type: 'string' }, usuario: ref('UsuarioOutSchema') } }) },
          400: err('Datos inválidos', 'DATOS_INVALIDOS', 'Los datos enviados no son válidos'),
          401: err('Sin token o token inválido', 'TOKEN_INVALIDO', 'El token es inválido o ha expirado'),
          403: err('Intento de modificar otra cuenta', 'ACCESO_DENEGADO', 'No tiene permiso para operar sobre este usuario'),
          404: err('Usuario no existe', 'USUARIO_NO_ENCONTRADO', 'El usuario no existe'),
          409: err('Correo ya usado por otro usuario', 'USUARIO_DUPLICADO', 'Ya existe un usuario con ese correo'),
        },
      },
      delete: {
        tags: ['Usuarios'], summary: 'Eliminar Cuenta', operationId: 'eliminarCuenta', security: seguro, parameters: [idParam],
        description: 'Eliminación lógica (estado INACTIVO). Solo el dueño de la cuenta.',
        responses: {
          200: { description: 'Cuenta eliminada', content: json({ type: 'object', properties: { mensaje: { type: 'string' } } }, { mensaje: 'Cuenta eliminada correctamente' }) },
          401: err('Sin token o token inválido', 'TOKEN_INVALIDO', 'El token es inválido o ha expirado'),
          403: err('Intento de eliminar otra cuenta', 'ACCESO_DENEGADO', 'No tiene permiso para operar sobre este usuario'),
          404: err('Usuario no existe', 'USUARIO_NO_ENCONTRADO', 'El usuario no existe'),
        },
      },
    },
    '/api/v1/usuarios/{id}/contacto': {
      get: {
        tags: ['Usuarios'], summary: 'Consultar Contacto', operationId: 'consultarContacto', security: seguro, parameters: [idParam],
        description: 'Usado por Chat / Notificaciones. Devuelve solo nombre, correo y teléfono.',
        responses: {
          200: { description: 'Datos de contacto', content: json({ type: 'object', properties: { contacto: ref('ContactoOutSchema') } }) },
          401: err('Sin token o token inválido', 'TOKEN_INVALIDO', 'El token es inválido o ha expirado'),
          404: err('Usuario no existe', 'USUARIO_NO_ENCONTRADO', 'El usuario no existe'),
        },
      },
    },
    '/health': {
      get: {
        tags: ['Monitoreo'], summary: 'Verificar Salud', operationId: 'salud',
        responses: {
          200: { description: 'Servicio y BD funcionando', content: json(ref('SaludOutSchema'), { servicio: 'usuarios', estado: 'OK', base_de_datos: 'OK' }) },
          503: { description: 'BD no disponible', content: json(ref('SaludOutSchema'), { servicio: 'usuarios', estado: 'DEGRADADO', base_de_datos: 'NO_DISPONIBLE' }) },
        },
      },
    },
  },
  components: {
    securitySchemes: { BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Pegue el token obtenido en /api/v1/auth/login (sin la palabra Bearer)' } },
    schemas: {
      RegistroEntradaSchema: {
        type: 'object', required: ['Nombre_Completo', 'Email', 'NombreUsuario', 'Contraseña'],
        properties: {
          Nombre_Completo: { type: 'string', minLength: 3, maxLength: 120 },
          Email: { type: 'string', format: 'email', description: 'Correo institucional' },
          NombreUsuario: { type: 'string', pattern: '^[a-zA-Z0-9._-]{3,40}$' },
          'Contraseña': { type: 'string', minLength: 8, description: 'Mínimo 8 caracteres, con letras y números' },
          'Teléfono': { type: 'string' },
        },
      },
      LoginEntradaSchema: {
        type: 'object', required: ['nombreUsuario', 'Contraseña'],
        properties: { nombreUsuario: { type: 'string' }, 'Contraseña': { type: 'string' } },
      },
      ValidarEntradaSchema: { type: 'object', properties: { token: { type: 'string', description: 'Opcional si se envía el header Authorization' } } },
      ActualizacionEntradaSchema: {
        type: 'object', description: 'Envíe solo los campos a cambiar',
        properties: { Nombre_Completo: { type: 'string' }, Email: { type: 'string', format: 'email' }, 'Teléfono': { type: 'string' }, 'Contraseña': { type: 'string' } },
      },
      UsuarioOutSchema: {
        type: 'object',
        properties: {
          usuario_id: { type: 'integer' }, nombre_completo: { type: 'string' }, correo: { type: 'string' }, nombre_usuario: { type: 'string' },
          telefono: { type: ['string', 'null'] }, estado: { type: 'string', enum: ['ACTIVO', 'INACTIVO'] }, fecha_registro: { type: 'string', format: 'date-time' },
        },
      },
      ContactoOutSchema: {
        type: 'object',
        properties: { usuario_id: { type: 'integer' }, nombre_completo: { type: 'string' }, correo: { type: 'string' }, telefono: { type: ['string', 'null'] } },
      },
      LoginOutSchema: {
        type: 'object',
        properties: { token: { type: 'string' }, tipo: { type: 'string', example: 'Bearer' }, expira_en: { type: 'string', example: '2h' }, usuario: ref('UsuarioOutSchema') },
      },
      ValidacionOutSchema: {
        type: 'object',
        properties: { valido: { type: 'boolean' }, usuario_id: { type: 'integer' }, nombre_usuario: { type: 'string' }, expira: { type: 'string', format: 'date-time' } },
      },
      SaludOutSchema: { type: 'object', properties: { servicio: { type: 'string' }, estado: { type: 'string' }, base_de_datos: { type: 'string' } } },
      ErrorSchema: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              codigo: { type: 'string' }, mensaje: { type: 'string' },
              detalles: { type: 'array', items: { type: 'object', properties: { campo: { type: 'string' }, mensaje: { type: 'string' } } } },
            },
          },
        },
      },
    },
  },
};
