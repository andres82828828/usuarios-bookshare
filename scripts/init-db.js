// Crea la base de datos del microservicio y carga los datos ficticios.
// Usa las credenciales del archivo .env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD).
// Funciona en Windows, Linux y macOS sin necesitar el cliente "mysql" en el PATH.
// Uso:  npm run db:init
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  const cfg = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };
  let conn;
  try {
    conn = await mysql.createConnection(cfg);
  } catch (err) {
    console.error(`No se pudo conectar a MySQL en ${cfg.host}:${cfg.port} con el usuario "${cfg.user}".`);
    console.error('Revise que MySQL/XAMPP esté encendido y que DB_USER / DB_PASSWORD del archivo .env sean correctos.');
    console.error('Detalle:', err.code || err.message);
    process.exit(1);
  }
  const dir = path.join(__dirname, '..', 'database');
  try {
    console.log('1/2 Creando base de datos y tabla (database/schema.sql)...');
    await conn.query(fs.readFileSync(path.join(dir, 'schema.sql'), 'utf8'));
    console.log('2/2 Cargando usuarios ficticios (database/seed.sql)...');
    const res = await conn.query(fs.readFileSync(path.join(dir, 'seed.sql'), 'utf8'));
    const resumen = res[0][res[0].length - 1];
    console.table(resumen);
    console.log('Listo. Inicie el servicio con: npm start');
    console.log('Cuenta de prueba: demo.bookshare / BookShare2026');
  } catch (err) {
    console.error('Error al ejecutar los scripts SQL:', err.code || '', err.message);
    if (err.code === 'ER_DBACCESS_DENIED_ERROR' || err.code === 'ER_SPECIFIC_ACCESS_DENIED_ERROR') {
      console.error('El usuario de .env no puede crear bases de datos. Use root en DB_USER o cree la BD manualmente.');
    }
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})();
