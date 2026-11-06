const request = require('supertest');
const jsonwebtoken = require('jsonwebtoken');
const app = require('../src/app');
const { getRepositorio } = require('../src/repositories');

const API = '/api/v1';
const nuevoUsuario = (sufijo = '') => ({
  Nombre_Completo: 'Andrés Pérez',
  Email: `andres${sufijo}@uniminuto.edu.co`,
  NombreUsuario: `andres${sufijo}`,
  'Contraseña': 'Clave1234',
  'Teléfono': '3001234567',
});

async function registrarYLogin(sufijo = '') {
  const datos = nuevoUsuario(sufijo);
  const reg = await request(app).post(`${API}/usuarios`).send(datos);
  const log = await request(app).post(`${API}/auth/login`).send({ nombreUsuario: datos.NombreUsuario, 'Contraseña': datos['Contraseña'] });
  return { id: reg.body.usuario.usuario_id, token: log.body.token };
}

beforeEach(() => getRepositorio()._reiniciar());

describe('POST /api/v1/usuarios — Registrar usuario', () => {
  test('201: registra y no devuelve la contraseña', async () => {
    const res = await request(app).post(`${API}/usuarios`).send(nuevoUsuario());
    expect(res.status).toBe(201);
    expect(res.body.usuario).toMatchObject({ usuario_id: 1, nombre_usuario: 'andres', correo: 'andres@uniminuto.edu.co', estado: 'ACTIVO' });
    expect(JSON.stringify(res.body)).not.toMatch(/Clave1234|contrasena/i);
  });

  test('400: datos incompletos o inválidos', async () => {
    const res = await request(app).post(`${API}/usuarios`).send({ Email: 'no-es-correo', 'Contraseña': '123' });
    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('DATOS_INVALIDOS');
    const campos = res.body.error.detalles.map((d) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(['nombre_completo', 'correo', 'nombre_usuario', 'contrasena']));
  });

  test('400: rechaza correos no institucionales', async () => {
    const res = await request(app).post(`${API}/usuarios`).send({ ...nuevoUsuario(), Email: 'andres@gmail.com' });
    expect(res.status).toBe(400);
    expect(res.body.error.detalles[0].mensaje).toMatch(/institucional/);
  });

  test('409: nombre de usuario o correo duplicado', async () => {
    await request(app).post(`${API}/usuarios`).send(nuevoUsuario());
    const res = await request(app).post(`${API}/usuarios`).send(nuevoUsuario());
    expect(res.status).toBe(409);
    expect(res.body.error.codigo).toBe('USUARIO_DUPLICADO');
  });

  test('Concurrencia: dos registros simultáneos con el mismo usuario → solo uno se crea', async () => {
    const [a, b] = await Promise.all([
      request(app).post(`${API}/usuarios`).send(nuevoUsuario()),
      request(app).post(`${API}/usuarios`).send(nuevoUsuario()),
    ]);
    expect([a.status, b.status].sort()).toEqual([201, 409]);
  });

  test('400: JSON mal formado', async () => {
    const res = await request(app).post(`${API}/usuarios`).set('Content-Type', 'application/json').send('{"mal": ');
    expect(res.status).toBe(400);
    expect(res.body.error.codigo).toBe('JSON_INVALIDO');
  });
});

describe('POST /api/v1/auth/login — Iniciar sesión', () => {
  test('200: devuelve token JWT y datos básicos', async () => {
    await request(app).post(`${API}/usuarios`).send(nuevoUsuario());
    const res = await request(app).post(`${API}/auth/login`).send({ nombreUsuario: 'andres', 'Contraseña': 'Clave1234' });
    expect(res.status).toBe(200);
    expect(res.body.tipo).toBe('Bearer');
    expect(res.body.token.split('.')).toHaveLength(3);
    expect(res.body.usuario.nombre_usuario).toBe('andres');
  });

  test('401: contraseña incorrecta o usuario inexistente (mismo mensaje)', async () => {
    await request(app).post(`${API}/usuarios`).send(nuevoUsuario());
    const a = await request(app).post(`${API}/auth/login`).send({ nombreUsuario: 'andres', 'Contraseña': 'otraClave9' });
    const b = await request(app).post(`${API}/auth/login`).send({ nombreUsuario: 'nadie', 'Contraseña': 'otraClave9' });
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body).toEqual(b.body);
  });

  test('400: faltan credenciales', async () => {
    const res = await request(app).post(`${API}/auth/login`).send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/validar — Validar token (usado por otros servicios)', () => {
  test('200: token válido devuelve valido=true y usuario_id', async () => {
    const { id, token } = await registrarYLogin();
    const res = await request(app).post(`${API}/auth/validar`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ valido: true, usuario_id: id });
  });

  test('También acepta el token en el body', async () => {
    const { token } = await registrarYLogin();
    const res = await request(app).post(`${API}/auth/validar`).send({ token });
    expect(res.body.valido).toBe(true);
  });

  test('401: token alterado', async () => {
    const { token } = await registrarYLogin();
    const res = await request(app).post(`${API}/auth/validar`).set('Authorization', `Bearer ${token}x`);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ valido: false });
  });

  test('401: token expirado', async () => {
    const { id } = await registrarYLogin();
    const vencido = jsonwebtoken.sign({ sub: String(id), exp: Math.floor(Date.now() / 1000) - 60 }, 'secreto-de-pruebas', { issuer: 'bookshare-usuarios' });
    const res = await request(app).post(`${API}/auth/validar`).set('Authorization', `Bearer ${vencido}`);
    expect(res.status).toBe(401);
    expect(res.body.valido).toBe(false);
  });

  test('401: token de una cuenta ya eliminada', async () => {
    const { id, token } = await registrarYLogin();
    await request(app).delete(`${API}/usuarios/${id}`).set('Authorization', `Bearer ${token}`);
    const res = await request(app).post(`${API}/auth/validar`).set('Authorization', `Bearer ${token}`);
    expect(res.body.valido).toBe(false);
  });

  test('401: sin token', async () => {
    const res = await request(app).post(`${API}/auth/validar`);
    expect(res.status).toBe(401);
    expect(res.body.error.codigo).toBe('TOKEN_AUSENTE');
  });
});

describe('GET /api/v1/usuarios/{id} y /contacto', () => {
  test('200: consultar perfil con token', async () => {
    const { id, token } = await registrarYLogin();
    const res = await request(app).get(`${API}/usuarios/${id}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.usuario.usuario_id).toBe(id);
  });

  test('200: consultar contacto (solo datos de contacto)', async () => {
    const { id, token } = await registrarYLogin();
    const res = await request(app).get(`${API}/usuarios/${id}/contacto`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.contacto).sort()).toEqual(['correo', 'nombre_completo', 'telefono', 'usuario_id']);
  });

  test('401: sin token', async () => {
    const res = await request(app).get(`${API}/usuarios/1`);
    expect(res.status).toBe(401);
  });

  test('404: usuario inexistente', async () => {
    const { token } = await registrarYLogin();
    const res = await request(app).get(`${API}/usuarios/999`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.error.codigo).toBe('USUARIO_NO_ENCONTRADO');
  });

  test('400: id no numérico', async () => {
    const { token } = await registrarYLogin();
    const res = await request(app).get(`${API}/usuarios/abc`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/v1/usuarios/{id} — Actualizar perfil', () => {
  test('200: actualiza el teléfono propio', async () => {
    const { id, token } = await registrarYLogin();
    const res = await request(app).put(`${API}/usuarios/${id}`).set('Authorization', `Bearer ${token}`).send({ 'Teléfono': '3109998877' });
    expect(res.status).toBe(200);
    expect(res.body.usuario.telefono).toBe('3109998877');
  });

  test('200: cambiar contraseña permite login con la nueva', async () => {
    const { id, token } = await registrarYLogin();
    await request(app).put(`${API}/usuarios/${id}`).set('Authorization', `Bearer ${token}`).send({ 'Contraseña': 'NuevaClave99' });
    const res = await request(app).post(`${API}/auth/login`).send({ nombreUsuario: 'andres', 'Contraseña': 'NuevaClave99' });
    expect(res.status).toBe(200);
  });

  test('403: no puede modificar el perfil de otro usuario', async () => {
    const a = await registrarYLogin('a');
    const b = await registrarYLogin('b');
    const res = await request(app).put(`${API}/usuarios/${b.id}`).set('Authorization', `Bearer ${a.token}`).send({ 'Teléfono': '3000000000' });
    expect(res.status).toBe(403);
  });

  test('400: no se permite cambiar el nombre de usuario', async () => {
    const { id, token } = await registrarYLogin();
    const res = await request(app).put(`${API}/usuarios/${id}`).set('Authorization', `Bearer ${token}`).send({ NombreUsuario: 'otro' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/v1/usuarios/{id} — Eliminar cuenta', () => {
  test('200: elimina (lógicamente) y luego el perfil da 404 y el login da 403', async () => {
    const otro = await registrarYLogin('x');
    const { id, token } = await registrarYLogin();
    const del = await request(app).delete(`${API}/usuarios/${id}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
    const perfil = await request(app).get(`${API}/usuarios/${id}`).set('Authorization', `Bearer ${otro.token}`);
    expect(perfil.status).toBe(404);
    const login = await request(app).post(`${API}/auth/login`).send({ nombreUsuario: 'andres', 'Contraseña': 'Clave1234' });
    expect(login.status).toBe(403);
    expect(login.body.error.codigo).toBe('CUENTA_INACTIVA');
  });
});

describe('Fallos de la base de datos y rutas', () => {
  test('503: si la base de datos no responde, el servicio informa en vez de caerse', async () => {
    getRepositorio()._simularCaida(true);
    const res = await request(app).post(`${API}/usuarios`).send(nuevoUsuario());
    expect(res.status).toBe(503);
    expect(res.body.error.codigo).toBe('SERVICIO_NO_DISPONIBLE');
    const salud = await request(app).get('/health');
    expect(salud.status).toBe(503);
  });

  test('200: /health con base de datos disponible', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toEqual({ servicio: 'usuarios', estado: 'OK', base_de_datos: 'OK' });
  });

  test('404: ruta inexistente', async () => {
    const res = await request(app).get(`${API}/no-existe`);
    expect(res.status).toBe(404);
  });
});

describe('Datos ficticios (semilla)', () => {
  const semilla = require('../database/semilla/usuarios.json');

  test('la semilla tiene 40 usuarios institucionales sin duplicados', () => {
    expect(semilla).toHaveLength(40);
    expect(new Set(semilla.map((u) => u.correo)).size).toBe(40);
    expect(new Set(semilla.map((u) => u.nombre_usuario)).size).toBe(40);
    expect(semilla.every((u) => u.correo.endsWith('@uniminuto.edu.co'))).toBe(true);
  });

  test('un usuario de la semilla puede iniciar sesión y uno inactivo no', async () => {
    getRepositorio().cargarSemilla(semilla);
    const ok = await request(app).post(`${API}/auth/login`).send({ nombreUsuario: 'demo.bookshare', 'Contraseña': 'BookShare2026' });
    expect(ok.status).toBe(200);
    const inactivo = semilla.find((u) => u.estado === 'INACTIVO');
    const no = await request(app).post(`${API}/auth/login`).send({ nombreUsuario: inactivo.nombre_usuario, 'Contraseña': 'BookShare2026' });
    expect(no.status).toBe(403);
    const nuevo = await request(app).post(`${API}/usuarios`).send(nuevoUsuario('zz'));
    expect(nuevo.body.usuario.usuario_id).toBe(41);
  });
});
