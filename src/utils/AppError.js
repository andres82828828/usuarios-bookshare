// Error de aplicación con código HTTP y código de negocio, para respuestas uniformes
class AppError extends Error {
  constructor(status, codigo, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

const Errores = {
  validacion: (detalles) => new AppError(400, 'DATOS_INVALIDOS', 'Los datos enviados no son válidos', detalles),
  credenciales: () => new AppError(401, 'CREDENCIALES_INVALIDAS', 'Usuario o contraseña incorrectos'),
  tokenAusente: () => new AppError(401, 'TOKEN_AUSENTE', 'Se requiere el header Authorization: Bearer <token>'),
  tokenInvalido: () => new AppError(401, 'TOKEN_INVALIDO', 'El token es inválido o ha expirado'),
  prohibido: () => new AppError(403, 'ACCESO_DENEGADO', 'No tiene permiso para operar sobre este usuario'),
  cuentaInactiva: () => new AppError(403, 'CUENTA_INACTIVA', 'La cuenta está inactiva'),
  noEncontrado: () => new AppError(404, 'USUARIO_NO_ENCONTRADO', 'El usuario no existe'),
  duplicado: (campo) => new AppError(409, 'USUARIO_DUPLICADO', `Ya existe un usuario con ese ${campo}`),
  bdNoDisponible: () => new AppError(503, 'SERVICIO_NO_DISPONIBLE', 'La base de datos de Usuarios no está disponible, intente más tarde'),
};

module.exports = { AppError, Errores };
