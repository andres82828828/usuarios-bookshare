// Capa de acceso a datos: implementación sobre MySQL
const { getPool } = require('../config/db');
const { Errores } = require('../utils/AppError');

const ERRORES_CONEXION = new Set([
  'ECONNREFUSED', 'ECONNRESET', 'EPIPE', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'ENOTFOUND', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR',
]);

// Traduce errores de MySQL a errores de la aplicación
function traducir(err) {
  if (err && err.code === 'ER_DUP_ENTRY') {
    const campo = /nombre_usuario/.test(err.message) ? 'nombre de usuario' : 'correo';
    return Errores.duplicado(campo);
  }
  if (err && ERRORES_CONEXION.has(err.code)) return Errores.bdNoDisponible();
  return err;
}

// Conexiones del pool que la BD cerró (por ejemplo, si MySQL/XAMPP se reinició)
const CONEXION_CORTADA = new Set(['ECONNRESET', 'EPIPE', 'PROTOCOL_CONNECTION_LOST']);

async function consulta(sql, params) {
  try {
    const [resultado] = await getPool().execute(sql, params);
    return resultado;
  } catch (err) {
    // El pool descarta la conexión rota; se reintenta una vez con una conexión nueva
    if (CONEXION_CORTADA.has(err.code)) {
      try {
        const [resultado] = await getPool().execute(sql, params);
        return resultado;
      } catch (err2) {
        throw traducir(err2);
      }
    }
    throw traducir(err);
  }
}

const COLUMNAS = 'usuario_id, nombre_completo, correo, nombre_usuario, contrasena_hash, telefono, estado, fecha_registro';

module.exports = {
  async crear(u) {
    const r = await consulta(
      'INSERT INTO usuarios (nombre_completo, correo, nombre_usuario, contrasena_hash, telefono) VALUES (?, ?, ?, ?, ?)',
      [u.nombre_completo, u.correo, u.nombre_usuario, u.contrasena_hash, u.telefono ?? null]
    );
    return this.buscarPorId(r.insertId);
  },

  async buscarPorId(id) {
    const filas = await consulta(`SELECT ${COLUMNAS} FROM usuarios WHERE usuario_id = ?`, [id]);
    return filas[0] || null;
  },

  async buscarPorNombreUsuario(nombreUsuario) {
    const filas = await consulta(`SELECT ${COLUMNAS} FROM usuarios WHERE nombre_usuario = ?`, [nombreUsuario]);
    return filas[0] || null;
  },

  async actualizar(id, cambios) {
    const campos = Object.keys(cambios);
    if (campos.length === 0) return this.buscarPorId(id);
    const set = campos.map((c) => `${c} = ?`).join(', ');
    await consulta(`UPDATE usuarios SET ${set} WHERE usuario_id = ?`, [...campos.map((c) => cambios[c]), id]);
    return this.buscarPorId(id);
  },

  // Eliminación lógica: se conserva el registro para no romper referencias en otros servicios
  async desactivar(id) {
    const r = await consulta("UPDATE usuarios SET estado = 'INACTIVO' WHERE usuario_id = ? AND estado = 'ACTIVO'", [id]);
    return r.affectedRows > 0;
  },

  async ping() {
    await consulta('SELECT 1', []);
    return true;
  },
};
