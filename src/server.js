// Punto de arranque del microservicio de Usuarios
const path = require('path');
const fs = require('fs');
const app = require('./app');
const config = require('./config');
const { getRepositorio } = require('./repositories');

// En modo memoria se cargan los usuarios ficticios para que el servicio arranque con datos
let detalle = config.dataStore;
if (config.dataStore === 'memory' && !process.argv.includes('--vacio')) {
  const archivo = path.join(__dirname, '..', 'database', 'semilla', 'usuarios.json');
  if (fs.existsSync(archivo)) {
    const n = getRepositorio().cargarSemilla(JSON.parse(fs.readFileSync(archivo, 'utf8')));
    detalle += `, ${n} usuarios ficticios cargados`;
  }
}

const server = app.listen(config.port, () => {
  console.log(`[usuarios] Microservicio escuchando en http://localhost:${config.port} (datos: ${detalle})`);
  console.log(`[usuarios] Documentación: http://localhost:${config.port}/docs`);
});

// Apagado ordenado
const cerrar = () => server.close(() => process.exit(0));
process.on('SIGINT', cerrar);
process.on('SIGTERM', cerrar);
