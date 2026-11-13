// Genera los datos ficticios del microservicio de Usuarios:
//   database/semilla/usuarios.json  -> usado por el modo memoria
//   database/seed.sql               -> para MySQL / MariaDB / phpMyAdmin (XAMPP)
// Todos los nombres, correos y teléfonos son INVENTADOS.
// Uso: node scripts/generar-semilla.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const CONTRASENA_DEMO = 'BookShare2026';
const DOMINIO = 'uniminuto.edu.co';

// Generador pseudoaleatorio con semilla fija: siempre produce los mismos datos
let s = 20261013;
const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const NOMBRES = ['Valentina', 'Santiago', 'Mariana', 'Sebastián', 'Isabella', 'Mateo', 'Daniela', 'Nicolás', 'Camila', 'Samuel',
  'Laura', 'Juan Pablo', 'Sofía', 'David', 'Gabriela', 'Alejandro', 'Paula', 'Felipe', 'Natalia', 'Julián',
  'Juliana', 'Andrés Felipe', 'Manuela', 'Esteban', 'Luisa Fernanda', 'Tomás', 'Carolina', 'Kevin', 'Ana María', 'Brayan',
  'Sara', 'Cristian', 'Lina', 'Jhon Fredy', 'Angie', 'Diego', 'Yuliana', 'Miguel Ángel'];
const APELLIDOS = ['Rodríguez', 'Gómez', 'Martínez', 'López', 'González', 'Hernández', 'Díaz', 'Pérez', 'Ramírez', 'Torres',
  'Moreno', 'Rojas', 'Vargas', 'Castro', 'Ortiz', 'Rincón', 'Suárez', 'Cárdenas', 'Pineda', 'Quintero',
  'Muñoz', 'Salazar', 'Beltrán', 'Cifuentes', 'Galindo', 'Ospina', 'Patiño', 'Zambrano', 'Bermúdez', 'Acosta'];

const sinTildes = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/gi, 'n');
const slug = (t) => sinTildes(t).toLowerCase().split(' ')[0];

const usuarios = [];
const usados = new Set();

// Cuenta fija para demostraciones (fácil de recordar)
usuarios.push({ nombre_completo: 'Estudiante Demo BookShare', nombre_usuario: 'demo.bookshare', correo: `demo.bookshare@${DOMINIO}`, telefono: '3000000000', estado: 'ACTIVO' });
usados.add('demo.bookshare');

while (usuarios.length < 40) {
  const nombre = pick(NOMBRES);
  const ap1 = pick(APELLIDOS);
  let ap2 = pick(APELLIDOS);
  if (ap2 === ap1) continue;
  let usuario = `${slug(nombre)}.${slug(ap1)}`;
  if (usados.has(usuario)) usuario = `${usuario}${slug(ap2).slice(0, 1)}`;
  if (usados.has(usuario)) continue;
  usados.add(usuario);
  const prefijo = pick(['300', '301', '304', '310', '311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '350']);
  const telefono = rnd() < 0.12 ? null : prefijo + String(Math.floor(rnd() * 1e7)).padStart(7, '0');
  usuarios.push({
    nombre_completo: `${nombre} ${ap1} ${ap2}`,
    nombre_usuario: usuario,
    correo: `${usuario}@${DOMINIO}`,
    telefono,
    estado: 'ACTIVO',
  });
}
// Algunas cuentas eliminadas (eliminación lógica) para probar ese caso
[7, 19, 28, 35].forEach((i) => { usuarios[i].estado = 'INACTIVO'; });

// Fechas de registro repartidas entre febrero y octubre de 2026, en orden
const inicio = Date.UTC(2026, 1, 2, 13, 0, 0);
const fin = Date.UTC(2026, 9, 10, 23, 0, 0);
usuarios.forEach((u, i) => {
  const base = inicio + ((fin - inicio) * i) / usuarios.length;
  const f = new Date(base + Math.floor(rnd() * 36e5 * 8));
  u.fecha_registro = f.toISOString().slice(0, 19).replace('T', ' ');
});

// Hash real de la contraseña (cada usuario con su propia sal)
usuarios.forEach((u) => { u.contrasena_hash = bcrypt.hashSync(CONTRASENA_DEMO, 10); });
usuarios.forEach((u, i) => { u.usuario_id = i + 1; });

// ---- JSON para el modo memoria ----
const dirSemilla = path.join(__dirname, '..', 'database', 'semilla');
fs.mkdirSync(dirSemilla, { recursive: true });
fs.writeFileSync(path.join(dirSemilla, 'usuarios.json'), JSON.stringify(usuarios, null, 2) + '\n');

// ---- SQL para MySQL / MariaDB ----
const q = (v) => (v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const filas = usuarios.map((u) =>
  `  (${u.usuario_id}, ${q(u.nombre_completo)}, ${q(u.correo)}, ${q(u.nombre_usuario)}, ${q(u.contrasena_hash)}, ${q(u.telefono)}, ${q(u.estado)}, ${q(u.fecha_registro)}, ${q(u.fecha_registro)})`);
const sql = `-- =====================================================================
-- BookShare · Microservicio de Usuarios · DATOS FICTICIOS DE PRUEBA
-- Generado con: node scripts/generar-semilla.js
-- Todos los nombres, correos y teléfonos son inventados.
-- Contraseña de TODAS las cuentas: ${CONTRASENA_DEMO}
-- Cuenta rápida para demostración: demo.bookshare / ${CONTRASENA_DEMO}
-- Requiere haber ejecutado antes database/schema.sql
-- =====================================================================
SET NAMES utf8mb4;
USE bookshare_usuarios;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM usuarios;
ALTER TABLE usuarios AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO usuarios
  (usuario_id, nombre_completo, correo, nombre_usuario, contrasena_hash, telefono, estado, fecha_registro, fecha_actualizacion)
VALUES
${filas.join(',\n')};

ALTER TABLE usuarios AUTO_INCREMENT = ${usuarios.length + 1};

-- Verificación rápida
SELECT estado, COUNT(*) AS total FROM usuarios GROUP BY estado;
`;
fs.writeFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), sql);

console.log(`Generados ${usuarios.length} usuarios ficticios (${usuarios.filter((u) => u.estado === 'INACTIVO').length} inactivos).`);
console.log(`Contraseña de todas las cuentas: ${CONTRASENA_DEMO}`);
