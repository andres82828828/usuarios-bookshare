// Definición de rutas: exactamente los endpoints del Contrato de Interfaz (Entrega 1)
const { Router } = require('express');
const usuarios = require('../controllers/usuarios.controller');
const auth = require('../controllers/auth.controller');
const { requiereToken, soloPropietario } = require('../middlewares/auth.middleware');

const r = Router();

r.post('/usuarios', usuarios.registrar);                                        // Registrar usuario
r.post('/auth/login', auth.login);                                              // Iniciar sesión
r.post('/auth/validar', auth.validar);                                          // Validar token (otros servicios)
r.get('/usuarios/:id', requiereToken, usuarios.consultarPerfil);                // Consultar perfil
r.get('/usuarios/:id/contacto', requiereToken, usuarios.consultarContacto);     // Datos de contacto (Chat/Notificaciones)
r.put('/usuarios/:id', requiereToken, soloPropietario, usuarios.actualizar);    // Actualizar perfil
r.delete('/usuarios/:id', requiereToken, soloPropietario, usuarios.eliminar);   // Eliminar cuenta

module.exports = r;
