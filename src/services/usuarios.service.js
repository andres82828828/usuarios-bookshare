// Capa de lógica de negocio: gestión de cuentas de usuario
const { getRepositorio } = require('../repositories');
const password = require('../security/password');
const { Errores } = require('../utils/AppError');

// Nunca se expone la contraseña (ni su hash) hacia afuera del servicio
function aPerfil(u) {
  return {
    usuario_id: u.usuario_id,
    nombre_completo: u.nombre_completo,
    correo: u.correo,
    nombre_usuario: u.nombre_usuario,
    telefono: u.telefono,
    estado: u.estado,
    fecha_registro: u.fecha_registro,
  };
}

async function obtenerActivo(id) {
  const u = await getRepositorio().buscarPorId(id);
  if (!u || u.estado !== 'ACTIVO') throw Errores.noEncontrado();
  return u;
}

async function registrar(datos) {
  const contrasena_hash = await password.encriptar(datos.contrasena);
  const creado = await getRepositorio().crear({
    nombre_completo: datos.nombre_completo,
    correo: datos.correo,
    nombre_usuario: datos.nombre_usuario,
    contrasena_hash,
    telefono: datos.telefono,
  });
  return aPerfil(creado);
}

async function consultarPerfil(id) {
  return aPerfil(await obtenerActivo(id));
}

async function consultarContacto(id) {
  const u = await obtenerActivo(id);
  return { usuario_id: u.usuario_id, nombre_completo: u.nombre_completo, correo: u.correo, telefono: u.telefono };
}

async function actualizar(id, datos) {
  await obtenerActivo(id);
  const cambios = {};
  if (datos.nombre_completo !== undefined) cambios.nombre_completo = datos.nombre_completo;
  if (datos.correo !== undefined) cambios.correo = datos.correo;
  if (datos.telefono !== undefined) cambios.telefono = datos.telefono;
  if (datos.contrasena !== undefined) cambios.contrasena_hash = await password.encriptar(datos.contrasena);
  return aPerfil(await getRepositorio().actualizar(id, cambios));
}

async function eliminar(id) {
  const ok = await getRepositorio().desactivar(id);
  if (!ok) throw Errores.noEncontrado();
}

module.exports = { registrar, consultarPerfil, consultarContacto, actualizar, eliminar, aPerfil };
