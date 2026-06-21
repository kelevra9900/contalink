# --- ETAPA DE COMPILACIÓN ---
FROM node:20-alpine AS build

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar archivos de definición de paquetes
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias congeladas
RUN pnpm install --frozen-lockfile

# Copiar el código fuente
COPY . .

# Definir la variable de entorno para que el frontend use rutas relativas /api en producción
ENV VITE_API_BASE_URL=""

# Compilar la aplicación React/Vite para producción
RUN pnpm run build

# --- ETAPA DE PRODUCCIÓN (NGINX) ---
FROM nginx:1.25-alpine

# Eliminar la configuración por defecto de Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los estáticos compilados desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
