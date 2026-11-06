// Módulo de seguridad: firma y verificación de tokens JWT
const jwt = require('jsonwebtoken');
const config = require('../config');

function firmar(usuario) {
  return jwt.sign(
    { sub: String(usuario.usuario_id), nombre_usuario: usuario.nombre_usuario },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn, issuer: config.jwt.issuer }
  );
}

// Devuelve el payload si el token es válido; lanza error si es inválido o expiró
function verificar(token) {
  return jwt.verify(token, config.jwt.secret, { issuer: config.jwt.issuer });
}

module.exports = { firmar, verificar };
