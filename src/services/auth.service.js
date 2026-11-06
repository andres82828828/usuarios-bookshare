// Capa de lógica de negocio: autenticación y validación de tokens
const { getRepositorio } = require('../repositories');
const password = require('../security/password');
const jwt = require('../security/jwt');
const config = require('../config');
const { Errores } = require('../utils/AppError');
const { aPerfil } = require('./usuarios.service');

async function login({ nombre_usuario, contrasena }) {
  const u = await getRepositorio().buscarPorNombreUsuario(nombre_usuario);
  // Mismo mensaje si el usuario no existe o si la contraseña falla (no revelar cuál fue)
  if (!u || !(await password.verificar(contrasena, u.contrasena_hash))) throw Errores.credenciales();
  if (u.estado !== 'ACTIVO') throw Errores.cuentaInactiva();
  return {
    token: jwt.firmar(u),
    tipo: 'Bearer',
    expira_en: config.jwt.expiresIn,
    usuario: aPerfil(u),
  };
}

// Usado por los demás microservicios. Además de verificar la firma y la vigencia,
// confirma en la base de datos que la cuenta sigue activa (evita aceptar tokens de
// cuentas eliminadas después de emitido el token).
async function validarToken(token) {
  let payload;
  try {
    payload = jwt.verificar(token);
  } catch {
    return { valido: false };
  }
  const u = await getRepositorio().buscarPorId(Number(payload.sub));
  if (!u || u.estado !== 'ACTIVO') return { valido: false };
  return {
    valido: true,
    usuario_id: u.usuario_id,
    nombre_usuario: u.nombre_usuario,
    expira: new Date(payload.exp * 1000).toISOString(),
  };
}

module.exports = { login, validarToken };
