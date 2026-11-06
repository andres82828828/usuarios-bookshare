-- Base de datos exclusiva del microservicio de Usuarios (database-per-service)
CREATE DATABASE IF NOT EXISTS bookshare_usuarios
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bookshare_usuarios;

CREATE TABLE IF NOT EXISTS usuarios (
  usuario_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_completo  VARCHAR(120) NOT NULL,
  correo           VARCHAR(120) NOT NULL,
  nombre_usuario   VARCHAR(40)  NOT NULL,
  contrasena_hash  VARCHAR(100) NOT NULL,
  telefono         VARCHAR(20)  NULL,
  estado           ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  fecha_registro   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Las restricciones UNIQUE resuelven la concurrencia en el registro:
  -- si dos peticiones intentan crear el mismo correo/usuario a la vez, solo una gana.
  CONSTRAINT uq_usuarios_correo UNIQUE (correo),
  CONSTRAINT uq_usuarios_nombre_usuario UNIQUE (nombre_usuario)
) ENGINE=InnoDB;
