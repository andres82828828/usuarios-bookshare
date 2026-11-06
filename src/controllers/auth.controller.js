// Capa de presentación: controladores de autenticación
const servicio = require('../services/auth.service');
const { validarLogin } = require('../services/validaciones');
const { extraerToken } = require('../middlewares/auth.middleware');
const { Errores } = require('../utils/AppError');
const { envolver } = require('./usuarios.controller');

module.exports = {
  login: envolver(async (req, res) => {
    const resultado = await servicio.login(validarLogin(req.body));
    res.json(resultado);
  }),

  // Acepta el token en el header Authorization o en el body { "token": "..." }
  validar: envolver(async (req, res) => {
    const token = extraerToken(req) || (req.body && req.body.token);
    if (!token) throw Errores.tokenAusente();
    const resultado = await servicio.validarToken(token);
    res.status(resultado.valido ? 200 : 401).json(resultado);
  }),
};
