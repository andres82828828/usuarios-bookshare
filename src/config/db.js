// Pool de conexiones a la base de datos MySQL propia del servicio
const mysql = require('mysql2/promise');
const config = require('./index');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      connectTimeout: config.db.connectTimeoutMs,
      waitForConnections: true,
      connectionLimit: 10,
      timezone: 'Z', // fechas siempre en UTC, sin importar la zona horaria del servidor
    });
    // Cada conexión trabaja en UTC para que CURRENT_TIMESTAMP sea coherente
    pool.on('connection', (conn) => conn.query("SET time_zone = '+00:00'"));
  }
  return pool;
}

async function cerrarPool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = { getPool, cerrarPool };
