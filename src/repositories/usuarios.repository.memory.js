// Capa de acceso a datos: implementación en memoria (para pruebas sin MySQL).
// Respeta las mismas reglas que la tabla real (correo y nombre_usuario únicos).
const { Errores } = require('../utils/AppError');

function crearRepositorioMemoria() {
  let filas = [];
  let siguienteId = 1;
  let disponible = true; // permite simular una caída de la base de datos en las pruebas

  const copia = (f) => (f ? { ...f } : null);
  const verificarDisponible = () => {
    if (!disponible) throw Errores.bdNoDisponible();
  };

  return {
    async crear(u) {
      verificarDisponible();
      if (filas.some((f) => f.correo === u.correo)) throw Errores.duplicado('correo');
      if (filas.some((f) => f.nombre_usuario === u.nombre_usuario)) throw Errores.duplicado('nombre de usuario');
      const fila = {
        usuario_id: siguienteId++,
        nombre_completo: u.nombre_completo,
        correo: u.correo,
        nombre_usuario: u.nombre_usuario,
        contrasena_hash: u.contrasena_hash,
        telefono: u.telefono ?? null,
        estado: 'ACTIVO',
        fecha_registro: new Date(),
      };
      filas.push(fila);
      return copia(fila);
    },
    async buscarPorId(id) {
      verificarDisponible();
      return copia(filas.find((f) => f.usuario_id === Number(id)));
    },
    async buscarPorNombreUsuario(nombreUsuario) {
      verificarDisponible();
      return copia(filas.find((f) => f.nombre_usuario === nombreUsuario));
    },
    async actualizar(id, cambios) {
      verificarDisponible();
      const fila = filas.find((f) => f.usuario_id === Number(id));
      if (!fila) return null;
      if (cambios.correo && filas.some((f) => f !== fila && f.correo === cambios.correo)) throw Errores.duplicado('correo');
      Object.assign(fila, cambios);
      return copia(fila);
    },
    async desactivar(id) {
      verificarDisponible();
      const fila = filas.find((f) => f.usuario_id === Number(id) && f.estado === 'ACTIVO');
      if (!fila) return false;
      fila.estado = 'INACTIVO';
      return true;
    },
    async ping() {
      verificarDisponible();
      return true;
    },
    // Carga los datos ficticios de database/semilla/usuarios.json
    cargarSemilla(usuarios) {
      filas = usuarios.map((u) => ({ ...u, telefono: u.telefono ?? null, fecha_registro: new Date(u.fecha_registro.replace(' ', 'T') + 'Z') }));
      siguienteId = Math.max(0, ...filas.map((f) => f.usuario_id)) + 1;
      return filas.length;
    },
    // Utilidades solo para pruebas
    _reiniciar() {
      filas = [];
      siguienteId = 1;
      disponible = true;
    },
    _simularCaida(caido) {
      disponible = !caido;
    },
  };
}

module.exports = { crearRepositorioMemoria };
