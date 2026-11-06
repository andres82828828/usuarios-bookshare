// Configuración central del microservicio (leída de variables de entorno)
require('dotenv').config({ quiet: true });

module.exports = {
  port: parseInt(process.env.PORT || '3001', 10),
  // "mysql" en producción; "memory" para pruebas o para correr sin base de datos
  dataStore: process.argv.includes('--memoria') ? 'memory' : (process.env.DATA_STORE || 'mysql'),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'bookshare',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bookshare_usuarios',
    connectTimeoutMs: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '5000', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'cambiar-este-secreto-en-produccion',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    issuer: 'bookshare-usuarios',
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  // Solo se permite el registro con correo institucional
  dominioInstitucional: (process.env.DOMINIO_INSTITUCIONAL || 'uniminuto.edu.co').toLowerCase(),
};
