// Middleware de autenticación: exige un token válido en las rutas protegidas
const jwt = require('../security/jwt');
const { Errores } = require('../utils/AppError');

function extraerToken(req) {
  const h = req.headers.authorization || '';
  const [tipo, token] = h.split(' ');
  return tipo === 'Bearer' && token ? token : null;
}

function requiereToken(req, _res, next) {
  const token = extraerToken(req);
  if (!token) return next(Errores.tokenAusente());
  try {
    const payload = jwt.verificar(token);
    req.usuarioAutenticado = { usuario_id: Number(payload.sub), nombre_usuario: payload.nombre_usuario };
    next();
  } catch {
    next(Errores.tokenInvalido());
  }
}

// Solo el dueño de la cuenta puede modificarla o eliminarla
function soloPropietario(req, _res, next) {
  if (req.usuarioAutenticado.usuario_id !== Number(req.params.id)) return next(Errores.prohibido());
  next();
}

module.exports = { requiereToken, soloPropietario, extraerToken };
