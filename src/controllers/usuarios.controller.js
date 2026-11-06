// Capa de presentación: controladores de usuarios (reciben HTTP, delegan en servicios)
const servicio = require('../services/usuarios.service');
const { validarRegistro, validarActualizacion, validarId } = require('../services/validaciones');

const envolver = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  registrar: envolver(async (req, res) => {
    const datos = validarRegistro(req.body);
    const usuario = await servicio.registrar(datos);
    res.status(201).location(`/api/v1/usuarios/${usuario.usuario_id}`).json({ mensaje: 'Usuario registrado correctamente', usuario });
  }),

  consultarPerfil: envolver(async (req, res) => {
    const usuario = await servicio.consultarPerfil(validarId(req.params.id));
    res.json({ usuario });
  }),

  consultarContacto: envolver(async (req, res) => {
    const contacto = await servicio.consultarContacto(validarId(req.params.id));
    res.json({ contacto });
  }),

  actualizar: envolver(async (req, res) => {
    const id = validarId(req.params.id);
    const usuario = await servicio.actualizar(id, validarActualizacion(req.body));
    res.json({ mensaje: 'Perfil actualizado correctamente', usuario });
  }),

  eliminar: envolver(async (req, res) => {
    await servicio.eliminar(validarId(req.params.id));
    res.json({ mensaje: 'Cuenta eliminada correctamente' });
  }),

  envolver,
};
