#!/usr/bin/env bash
# Prueba manual de todos los endpoints del microservicio de Usuarios con curl.
# Uso: con el servicio corriendo (npm start), ejecutar:  bash scripts/prueba-manual.sh
B=${BASE_URL:-http://localhost:3001}
J='Content-Type: application/json'
U="prueba$RANDOM"

echo '### 1. GET /health'
curl -s -w ' [HTTP %{http_code}]' $B/health; echo

echo; echo '### 2. POST /api/v1/usuarios (registro)'
curl -s -w ' [HTTP %{http_code}]' -X POST $B/api/v1/usuarios -H "$J" \
  -d "{\"Nombre_Completo\":\"Andrés Pérez\",\"Email\":\"$U@uniminuto.edu.co\",\"NombreUsuario\":\"$U\",\"Contraseña\":\"Clave1234\",\"Teléfono\":\"3001234567\"}"; echo

echo; echo '### 3. POST /api/v1/usuarios (el mismo usuario otra vez -> 409)'
curl -s -w ' [HTTP %{http_code}]' -X POST $B/api/v1/usuarios -H "$J" \
  -d "{\"Nombre_Completo\":\"Andrés Pérez\",\"Email\":\"$U@uniminuto.edu.co\",\"NombreUsuario\":\"$U\",\"Contraseña\":\"Clave1234\"}"; echo

echo; echo '### 4. POST /api/v1/auth/login'
LOGIN=$(curl -s -X POST $B/api/v1/auth/login -H "$J" -d "{\"nombreUsuario\":\"$U\",\"Contraseña\":\"Clave1234\"}")
echo "$LOGIN"
TOKEN=$(echo "$LOGIN" | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
ID=$(echo "$LOGIN" | node -pe 'JSON.parse(require("fs").readFileSync(0)).usuario.usuario_id')

echo; echo '### 5. POST /api/v1/auth/validar (como lo llamaría Préstamos o Catálogo)'
curl -s -w ' [HTTP %{http_code}]' -X POST $B/api/v1/auth/validar -H "Authorization: Bearer $TOKEN"; echo

echo; echo "### 6. GET /api/v1/usuarios/$ID"
curl -s -w ' [HTTP %{http_code}]' $B/api/v1/usuarios/$ID -H "Authorization: Bearer $TOKEN"; echo

echo; echo "### 7. GET /api/v1/usuarios/$ID/contacto"
curl -s -w ' [HTTP %{http_code}]' $B/api/v1/usuarios/$ID/contacto -H "Authorization: Bearer $TOKEN"; echo

echo; echo "### 8. PUT /api/v1/usuarios/$ID"
curl -s -w ' [HTTP %{http_code}]' -X PUT $B/api/v1/usuarios/$ID -H "$J" -H "Authorization: Bearer $TOKEN" -d '{"Teléfono":"3109998877"}'; echo

echo; echo "### 9. DELETE /api/v1/usuarios/$ID"
curl -s -w ' [HTTP %{http_code}]' -X DELETE $B/api/v1/usuarios/$ID -H "Authorization: Bearer $TOKEN"; echo

echo; echo '### 10. POST /api/v1/auth/validar después de eliminar la cuenta'
curl -s -w ' [HTTP %{http_code}]' -X POST $B/api/v1/auth/validar -H "Authorization: Bearer $TOKEN"; echo

echo; echo '### 11. Concurrencia: 5 registros simultáneos del mismo usuario'
C="conc$RANDOM"
for i in 1 2 3 4 5; do
  curl -s -o /dev/null -w "petición $i -> HTTP %{http_code}\n" -X POST $B/api/v1/usuarios -H "$J" \
    -d "{\"Nombre_Completo\":\"Usuario Concurrente\",\"Email\":\"$C@uniminuto.edu.co\",\"NombreUsuario\":\"$C\",\"Contraseña\":\"Clave1234\"}" &
done
wait
