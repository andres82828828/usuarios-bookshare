# Imagen del microservicio de Usuarios de BookShare
FROM node:22-alpine

WORKDIR /app

# Primero solo las dependencias, para aprovechar la caché de Docker
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Código del servicio y datos de semilla (los usa el modo memoria)
COPY src ./src
COPY database ./database

ENV NODE_ENV=production \
    PORT=3001

# No correr como root dentro del contenedor
USER node

EXPOSE 3001

# Docker marca el contenedor como "healthy" cuando /health responde 200
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
