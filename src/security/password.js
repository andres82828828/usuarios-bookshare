// Módulo de seguridad: encriptación y verificación de contraseñas con bcrypt
const bcrypt = require('bcryptjs');
const config = require('../config');

const encriptar = (plano) => bcrypt.hash(plano, config.bcryptRounds);
const verificar = (plano, hash) => bcrypt.compare(plano, hash);

module.exports = { encriptar, verificar };
