// Normalización y validación de los datos de entrada.
// Acepta los nombres de campo usados en el contrato (Nombre_Completo, Email, NombreUsuario,
// Contraseña, Teléfono) y también su forma en minúscula/snake_case.
const config = require('../config');
const { Errores } = require('../utils/AppError');

const ALIAS = {
  nombre_completo: ['nombre_completo', 'Nombre_Completo', 'nombreCompleto'],
  correo: ['correo', 'Email', 'email'],
  nombre_usuario: ['nombre_usuario', 'NombreUsuario', 'nombreUsuario'],
  contrasena: ['contrasena', 'Contraseña', 'contraseña', 'Contrasena', 'password'],
  telefono: ['telefono', 'Teléfono', 'teléfono', 'Telefono'],
};

function normalizar(body = {}) {
  const salida = {};
  for (const [campo, alias] of Object.entries(ALIAS)) {
    const clave = alias.find((a) => body[a] !== undefined);
    if (clave !== undefined) {
      const valor = body[clave];
      salida[campo] = typeof valor === 'string' ? valor.trim() : valor;
    }
  }
  return salida;
}

const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_USUARIO = /^[a-zA-Z0-9._-]{3,40}$/;
const RE_TELEFONO = /^\+?[0-9 ]{7,20}$/;

function reglas(datos, { parcial }) {
  const errores = [];
  const presente = (c) => datos[c] !== undefined && datos[c] !== null && datos[c] !== '';

  if (!parcial || datos.nombre_completo !== undefined) {
    if (!presente('nombre_completo') || typeof datos.nombre_completo !== 'string' || datos.nombre_completo.length < 3 || datos.nombre_completo.length > 120)
      errores.push({ campo: 'nombre_completo', mensaje: 'Obligatorio, entre 3 y 120 caracteres' });
  }
  if (!parcial || datos.correo !== undefined) {
    if (!presente('correo') || !RE_CORREO.test(datos.correo))
      errores.push({ campo: 'correo', mensaje: 'Debe ser un correo válido' });
    else if (!datos.correo.toLowerCase().endsWith('@' + config.dominioInstitucional))
      errores.push({ campo: 'correo', mensaje: `Debe ser un correo institucional (@${config.dominioInstitucional})` });
  }
  if (!parcial) {
    if (!presente('nombre_usuario') || !RE_USUARIO.test(datos.nombre_usuario))
      errores.push({ campo: 'nombre_usuario', mensaje: 'Obligatorio, 3 a 40 caracteres: letras, números, punto, guion o guion bajo' });
  }
  if (!parcial || datos.contrasena !== undefined) {
    if (!presente('contrasena') || typeof datos.contrasena !== 'string' || datos.contrasena.length < 8 || !/[0-9]/.test(datos.contrasena) || !/[a-zA-Z]/.test(datos.contrasena))
      errores.push({ campo: 'contrasena', mensaje: 'Mínimo 8 caracteres, con al menos una letra y un número' });
  }
  if (presente('telefono') && !RE_TELEFONO.test(String(datos.telefono)))
    errores.push({ campo: 'telefono', mensaje: 'Teléfono no válido' });

  return errores;
}

function validarRegistro(body) {
  const datos = normalizar(body);
  const errores = reglas(datos, { parcial: false });
  if (errores.length) throw Errores.validacion(errores);
  datos.correo = datos.correo.toLowerCase();
  return datos;
}

function validarActualizacion(body) {
  const datos = normalizar(body);
  if (datos.nombre_usuario !== undefined) {
    throw Errores.validacion([{ campo: 'nombre_usuario', mensaje: 'El nombre de usuario no se puede modificar' }]);
  }
  if (Object.keys(datos).length === 0) {
    throw Errores.validacion([{ campo: '*', mensaje: 'Debe enviar al menos un campo para actualizar' }]);
  }
  const errores = reglas(datos, { parcial: true });
  if (errores.length) throw Errores.validacion(errores);
  if (datos.correo) datos.correo = datos.correo.toLowerCase();
  return datos;
}

function validarLogin(body) {
  const datos = normalizar(body);
  const errores = [];
  if (!datos.nombre_usuario) errores.push({ campo: 'nombre_usuario', mensaje: 'Obligatorio' });
  if (!datos.contrasena) errores.push({ campo: 'contrasena', mensaje: 'Obligatorio' });
  if (errores.length) throw Errores.validacion(errores);
  return datos;
}

function validarId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw Errores.validacion([{ campo: 'id', mensaje: 'Debe ser un entero positivo' }]);
  return id;
}

module.exports = { validarRegistro, validarActualizacion, validarLogin, validarId, normalizar };
