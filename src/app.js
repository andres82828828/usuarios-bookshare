// Construcción de la aplicación Express (separada de server.js para poder probarla)
const express = require('express');
const rutas = require('./routes');
const { getRepositorio } = require('./repositories');
const { noEncontrado, manejadorErrores } = require('./middlewares/error.middleware');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// Endpoint de salud (adicional al contrato; no modifica los endpoints acordados).
// Permite a la API/monitoreo saber si el servicio y su base de datos responden.
app.get('/health', async (_req, res) => {
  try {
    await getRepositorio().ping();
    res.json({ servicio: 'usuarios', estado: 'OK', base_de_datos: 'OK' });
  } catch {
    res.status(503).json({ servicio: 'usuarios', estado: 'DEGRADADO', base_de_datos: 'NO_DISPONIBLE' });
  }
});

// Documentación interactiva (Swagger UI) en /docs y especificación en /openapi.json
const swaggerUi = require('swagger-ui-express');
const openapi = require('./docs/openapi');
app.get('/openapi.json', (_req, res) => res.json(openapi));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, {
  customSiteTitle: 'BookShare - Usuarios',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/', (_req, res) => res.redirect('/docs'));

app.use('/api/v1', rutas);
app.use(noEncontrado);
app.use(manejadorErrores);

module.exports = app;
