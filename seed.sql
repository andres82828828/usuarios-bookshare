-- =====================================================================
-- BookShare · Microservicio de Usuarios · DATOS FICTICIOS DE PRUEBA
-- Generado con: node scripts/generar-semilla.js
-- Todos los nombres, correos y teléfonos son inventados.
-- Contraseña de TODAS las cuentas: BookShare2026
-- Cuenta rápida para demostración: demo.bookshare / BookShare2026
-- Requiere haber ejecutado antes database/schema.sql
-- =====================================================================
USE bookshare_usuarios;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM usuarios;
ALTER TABLE usuarios AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO usuarios
  (usuario_id, nombre_completo, correo, nombre_usuario, contrasena_hash, telefono, estado, fecha_registro, fecha_actualizacion)
VALUES
  (1, 'Estudiante Demo BookShare', 'demo.bookshare@uniminuto.edu.co', 'demo.bookshare', '$2b$10$/0pGa2mzqmjtQVxPpWHQAeCeKfL7/9w9hmcaHcEq/uoZTOtZSxmC2', '3000000000', 'ACTIVO', '2026-02-02 19:02:00', '2026-02-02 19:02:00'),
  (2, 'Lina Beltrán Gómez', 'lina.beltran@uniminuto.edu.co', 'lina.beltran', '$2b$10$snWCNTdxyhxi1/CRGHiLTuiTmxxloY4FUkD1Drr5y35bTX3AsFf.m', '3007474921', 'ACTIVO', '2026-02-08 21:37:03', '2026-02-08 21:37:03'),
  (3, 'Sara Rodríguez Acosta', 'sara.rodriguez@uniminuto.edu.co', 'sara.rodriguez', '$2b$10$3lr0rKVnUo6qWuQ2xyAOGuiIWAhRbm7RDBDt/fYPy1SmyPaLt/pvS', '3142654016', 'ACTIVO', '2026-02-15 03:15:16', '2026-02-15 03:15:16'),
  (4, 'Julián Martínez Ortiz', 'julian.martinez@uniminuto.edu.co', 'julian.martinez', '$2b$10$73SzdH2y7WFtMnNmacv.w.YcvjYU.T0f4Yr6cDiksCFK4J/xFWiYm', NULL, 'ACTIVO', '2026-02-21 09:24:50', '2026-02-21 09:24:50'),
  (5, 'Esteban Acosta Rodríguez', 'esteban.acosta@uniminuto.edu.co', 'esteban.acosta', '$2b$10$hS2sm/N.V4RcgcDantZ.d.7cPsGVhxMct5795FN0UnGk2epcxYEVK', NULL, 'ACTIVO', '2026-02-27 19:47:47', '2026-02-27 19:47:47'),
  (6, 'Luisa Fernanda Gómez Ramírez', 'luisa.gomez@uniminuto.edu.co', 'luisa.gomez', '$2b$10$f8eZggLAOs6/ofoNy1wu2.EG9YOxXso0Dt2yEh/YB9NQZ07goy96m', '3133277747', 'ACTIVO', '2026-03-05 21:13:02', '2026-03-05 21:13:02'),
  (7, 'Valentina Cárdenas Castro', 'valentina.cardenas@uniminuto.edu.co', 'valentina.cardenas', '$2b$10$ocT5FV9THcxFlrxU45aU3.IHYsBmhQp/8O.FiJGxYskYzqzatjiwS', NULL, 'ACTIVO', '2026-03-12 09:34:19', '2026-03-12 09:34:19'),
  (8, 'Cristian Martínez Acosta', 'cristian.martinez@uniminuto.edu.co', 'cristian.martinez', '$2b$10$ZJTAHCxG3HYKQiIBCrlKWOorxur44nrsf13Sw36.zgy7DLtfLxHu6', '3194909768', 'INACTIVO', '2026-03-18 09:29:42', '2026-03-18 09:29:42'),
  (9, 'Laura Ortiz Acosta', 'laura.ortiz@uniminuto.edu.co', 'laura.ortiz', '$2b$10$cNR8hcRBp0IDlrUaALmzzuLkrNbdhBtKEOHDt6Fu39/L3q1okdhxK', '3130731988', 'ACTIVO', '2026-03-24 18:52:40', '2026-03-24 18:52:40'),
  (10, 'Paula Moreno Cárdenas', 'paula.moreno@uniminuto.edu.co', 'paula.moreno', '$2b$10$tWP4gjocbLjaEBmoDkeUdeAm2.J3kRb4/5VKog1qAa2QjTTw0.tU6', '3196750514', 'ACTIVO', '2026-03-30 21:40:31', '2026-03-30 21:40:31'),
  (11, 'Santiago Torres Cifuentes', 'santiago.torres@uniminuto.edu.co', 'santiago.torres', '$2b$10$SbXvgscGQnZgdaEgTYAkfeSGKy4UggGwZwD1G2Mx6QjHiLoEy8Si2', '3188227802', 'ACTIVO', '2026-04-06 07:44:18', '2026-04-06 07:44:18'),
  (12, 'Cristian Beltrán Ospina', 'cristian.beltran@uniminuto.edu.co', 'cristian.beltran', '$2b$10$GnpkdbrqJNYA5pGAAZeVauXjiI0EBar0RMMEWZrABtIFvdVt0lFra', '3019745616', 'ACTIVO', '2026-04-12 10:46:35', '2026-04-12 10:46:35'),
  (13, 'Julián Suárez Galindo', 'julian.suarez@uniminuto.edu.co', 'julian.suarez', '$2b$10$OvvgPjyH2Vg9fAm6rbiWsuodGG4iFTd7/T87zOjNQzqB7gXXMgabC', '3110132999', 'ACTIVO', '2026-04-18 17:44:44', '2026-04-18 17:44:44'),
  (14, 'Brayan López Muñoz', 'brayan.lopez@uniminuto.edu.co', 'brayan.lopez', '$2b$10$Iqy5qkkj6IzRBg4qhfx7POcjo/AcZzSS.QcmHmhzpKiklwWo4IBVG', '3198364996', 'ACTIVO', '2026-04-24 23:52:53', '2026-04-24 23:52:53'),
  (15, 'Luisa Fernanda Zambrano Cárdenas', 'luisa.zambrano@uniminuto.edu.co', 'luisa.zambrano', '$2b$10$R9volbgprnutEoHCyOQY4utzWY./SMl4XEyy7bSHFn/i7C1IuS3gm', NULL, 'ACTIVO', '2026-05-01 10:07:28', '2026-05-01 10:07:28'),
  (16, 'Yuliana Ortiz Pineda', 'yuliana.ortiz@uniminuto.edu.co', 'yuliana.ortiz', '$2b$10$IuTDyNdlY9FHGH83UWO74OVX/gzapfqoOkG4L6e3MOLAV.vTAawsC', '3207035205', 'ACTIVO', '2026-05-07 12:49:37', '2026-05-07 12:49:37'),
  (17, 'Isabella Hernández Ospina', 'isabella.hernandez@uniminuto.edu.co', 'isabella.hernandez', '$2b$10$nZz76ZoiSXArfFdnpJrov.dmo4DVtx5ByBktpi34kIVg36txFRRXG', '3009887055', 'ACTIVO', '2026-05-13 17:52:05', '2026-05-13 17:52:05'),
  (18, 'Andrés Felipe Galindo Cárdenas', 'andres.galindo@uniminuto.edu.co', 'andres.galindo', '$2b$10$xr1Zn3.Yl5mJyS5E967q3eWCPhb8KOgMrLKj8la9VoMxqKd8BEhRm', '3213376402', 'ACTIVO', '2026-05-20 01:33:19', '2026-05-20 01:33:19'),
  (19, 'David González Pineda', 'david.gonzalez@uniminuto.edu.co', 'david.gonzalez', '$2b$10$mZiMeqrCvQHUinfmkKXfpO9fu4EK4A/80ULiWL67NQIJICmKKVDQy', '3008466331', 'ACTIVO', '2026-05-26 12:17:38', '2026-05-26 12:17:38'),
  (20, 'Andrés Felipe Moreno Ortiz', 'andres.moreno@uniminuto.edu.co', 'andres.moreno', '$2b$10$6xGClgZAdAX3EhxRUrF76OqN6sBC2aa8VhJVEwgV3PbjPlB9Fur2W', '3121231549', 'INACTIVO', '2026-06-01 18:18:04', '2026-06-01 18:18:04'),
  (21, 'Diego Vargas Bermúdez', 'diego.vargas@uniminuto.edu.co', 'diego.vargas', '$2b$10$2Rn0d3XC3lyNtWR8v/WQyuSjvbvsOD6sJRrWhuRiQz29BXRHRYHnS', '3509387111', 'ACTIVO', '2026-06-08 01:41:31', '2026-06-08 01:41:31'),
  (22, 'Mariana Patiño Rincón', 'mariana.patino@uniminuto.edu.co', 'mariana.patino', '$2b$10$lUobOjX9Ru4b4Lc7abTCNuRfz88KeTjUh1cJTHrVHkFTBkghlVyGe', '3196080082', 'ACTIVO', '2026-06-14 06:22:11', '2026-06-14 06:22:11'),
  (23, 'Mariana Zambrano Díaz', 'mariana.zambrano@uniminuto.edu.co', 'mariana.zambrano', '$2b$10$9qfhO9tL6OK40Mb3erKJaeIzv2mrKJuQeTUygyfa9kwxNyKHt35cK', '3130922228', 'ACTIVO', '2026-06-20 10:58:21', '2026-06-20 10:58:21'),
  (24, 'Juliana Galindo Díaz', 'juliana.galindo@uniminuto.edu.co', 'juliana.galindo', '$2b$10$naB725xsDM2UOzRt5M6jqOZauJtHpKMOwXl.NF3IGILV3HzAPyUhi', '3206856831', 'ACTIVO', '2026-06-26 13:05:13', '2026-06-26 13:05:13'),
  (25, 'Paula Cifuentes González', 'paula.cifuentes@uniminuto.edu.co', 'paula.cifuentes', '$2b$10$.rH1NL3eA9Q3And1RJFupecGxqYT/eNDr36nMgMQs3CvVH1tQxIIm', '3137561203', 'ACTIVO', '2026-07-02 23:03:35', '2026-07-02 23:03:35'),
  (26, 'Ana María Ortiz Castro', 'ana.ortiz@uniminuto.edu.co', 'ana.ortiz', '$2b$10$Nppx6OqBTwq3jFtBGF/1vOYPy3xQaqVwv/3Ad9MvykX3lYrYMe8SS', '3503390204', 'ACTIVO', '2026-07-09 09:03:07', '2026-07-09 09:03:07'),
  (27, 'Mateo Pérez Cifuentes', 'mateo.perez@uniminuto.edu.co', 'mateo.perez', '$2b$10$8UurJwaktVy0TXeH45SH4.VOp2TXOTWfjGEjlsQjP3kXytjSmAc6O', '3219634479', 'ACTIVO', '2026-07-15 08:41:57', '2026-07-15 08:41:57'),
  (28, 'Brayan Ramírez Acosta', 'brayan.ramirez@uniminuto.edu.co', 'brayan.ramirez', '$2b$10$0HQzF/f/D.5o/wDQoe6DkO7fCScoplu.v/QlADRl5ykqRHbprSvBO', '3176468338', 'ACTIVO', '2026-07-21 15:11:40', '2026-07-21 15:11:40'),
  (29, 'Diego Patiño Rincón', 'diego.patino@uniminuto.edu.co', 'diego.patino', '$2b$10$OTJMiSJlwOSbiv84VL4TMu9Vf8MGEWHwzYETo7m4p2mqDM4iYJuce', '3191306366', 'INACTIVO', '2026-07-28 03:53:16', '2026-07-28 03:53:16'),
  (30, 'Camila Rodríguez Pérez', 'camila.rodriguez@uniminuto.edu.co', 'camila.rodriguez', '$2b$10$z8Oji2MS2QMGsOIDBIwYpeYh7lvN3idGhjLDhOIOeId/f5q/vHEfe', '3116144526', 'ACTIVO', '2026-08-03 09:58:45', '2026-08-03 09:58:45'),
  (31, 'Yuliana Martínez Quintero', 'yuliana.martinez@uniminuto.edu.co', 'yuliana.martinez', '$2b$10$J4Ev0VKFu2xTo2H3PYKIvOeAA7aiwju6XIM0/9R6nTxukouKDm4DG', '3158619619', 'ACTIVO', '2026-08-09 13:24:04', '2026-08-09 13:24:04'),
  (32, 'David Hernández Pérez', 'david.hernandez@uniminuto.edu.co', 'david.hernandez', '$2b$10$73zXYnHVXPrqr5izHC/THeN7uCm/Eif6p6IQwe6QG541CSuaIVXRi', '3121765155', 'ACTIVO', '2026-08-15 15:26:25', '2026-08-15 15:26:25'),
  (33, 'Luisa Fernanda Acosta Muñoz', 'luisa.acosta@uniminuto.edu.co', 'luisa.acosta', '$2b$10$EM9gunUHIYyIo8JfDxr4DOMLLgiIbdfv8Jt9jMjHS6Pmb.MKn737K', '3160014476', 'ACTIVO', '2026-08-21 23:41:22', '2026-08-21 23:41:22'),
  (34, 'Juan Pablo Pineda Quintero', 'juan.pineda@uniminuto.edu.co', 'juan.pineda', '$2b$10$gyOi/crcQxAZCxTDZIYijO./8b2yBA4ls69GVeusJUV6bSuETfK/6', '3506652474', 'ACTIVO', '2026-08-28 07:48:37', '2026-08-28 07:48:37'),
  (35, 'Miguel Ángel Muñoz Ramírez', 'miguel.munoz@uniminuto.edu.co', 'miguel.munoz', '$2b$10$JXwelh7ld5MviCcUSWV48uE6SPrqTYy0QS1r5.evcBmLdoygih7Q2', '3119881615', 'ACTIVO', '2026-09-03 09:30:56', '2026-09-03 09:30:56'),
  (36, 'Samuel Salazar Acosta', 'samuel.salazar@uniminuto.edu.co', 'samuel.salazar', '$2b$10$0/YQfzIdAMK9O4IAhhVSjO2x6IoJoUsQX9u3WqaUZI4BzdQdyErwK', '3121710305', 'INACTIVO', '2026-09-09 20:23:16', '2026-09-09 20:23:16'),
  (37, 'Manuela Suárez Rodríguez', 'manuela.suarez@uniminuto.edu.co', 'manuela.suarez', '$2b$10$jUERWryrAKqIfY3T.vQHfOf17iNtaZ1S8xzfhQ69GoQOrDfBcCYr2', '3190410215', 'ACTIVO', '2026-09-16 03:08:23', '2026-09-16 03:08:23'),
  (38, 'Diego Martínez Torres', 'diego.martinez@uniminuto.edu.co', 'diego.martinez', '$2b$10$NpGFTk.dr9ayb8n/5gc2H.esqNPVHe56QyZ/GfJpceQUCmxgTXFyu', '3008117059', 'ACTIVO', '2026-09-22 06:47:39', '2026-09-22 06:47:39'),
  (39, 'Jhon Fredy Bermúdez González', 'jhon.bermudez@uniminuto.edu.co', 'jhon.bermudez', '$2b$10$ilxWEFqE9G/ObQ5GXho0JuqP3T7Ew3oBexHZuCy37d4RbOQakjGyC', '3104502325', 'ACTIVO', '2026-09-28 11:45:09', '2026-09-28 11:45:09'),
  (40, 'Kevin López Rodríguez', 'kevin.lopez@uniminuto.edu.co', 'kevin.lopez', '$2b$10$ZZ5lkdi2hmK8hNqPqOwP7O2XWDXMtO6FGfK7wCyQoFCv7eIX250dO', '3003559236', 'ACTIVO', '2026-10-04 23:08:10', '2026-10-04 23:08:10');

ALTER TABLE usuarios AUTO_INCREMENT = 41;

-- Verificación rápida
SELECT estado, COUNT(*) AS total FROM usuarios GROUP BY estado;
