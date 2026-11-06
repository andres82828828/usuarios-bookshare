// Manejo centralizado de errores: todas las respuestas de error tienen el mismo formato
const { AppError } = require('../utils/AppError');

function noEncontrado(req, res) {
  res.status(404).json({ error: { codigo: 'RUTA_NO_ENCONTRADA', mensaje: `No existe ${req.method} ${req.originalUrl}` } });
}

// eslint-disable-next-line no-unused-vars
function manejadorErrores(err, req, res, _next) {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { codigo: 'JSON_INVALIDO', mensaje: 'El cuerpo de la petición no es un JSON válido' } });
  }
  if (err instanceof AppError) {
    const cuerpo = { error: { codigo: err.codigo, mensaje: err.message } };
    if (err.detalles) cuerpo.error.detalles = err.detalles;
    return res.status(err.status).json(cuerpo);
  }
  if (process.env.NODE_ENV !== 'test') console.error('[usuarios] Error no controlado:', err);
  res.status(500).json({ error: { codigo: 'ERROR_INTERNO', mensaje: 'Error interno del servicio de Usuarios' } });
}

module.exports = { noEncontrado, manejadorErrores };
