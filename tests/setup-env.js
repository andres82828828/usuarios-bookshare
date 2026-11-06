// Las pruebas corren contra la implementación en memoria de la capa de datos
process.env.DATA_STORE = process.env.DATA_STORE || 'memory';
process.env.NODE_ENV = 'test';
process.env.BCRYPT_ROUNDS = '4';
process.env.JWT_SECRET = 'secreto-de-pruebas';
