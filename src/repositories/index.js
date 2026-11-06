// Selecciona la implementación de la capa de datos según DATA_STORE
const config = require('../config');

let repositorio;

function getRepositorio() {
  if (!repositorio) {
    if (config.dataStore === 'memory') {
      repositorio = require('./usuarios.repository.memory').crearRepositorioMemoria();
    } else {
      repositorio = require('./usuarios.repository.mysql');
    }
  }
  return repositorio;
}

module.exports = { getRepositorio };
