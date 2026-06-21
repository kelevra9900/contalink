#!/bin/bash

# Script de configuración inicial para servidor AWS EC2 (Ubuntu 22.04 / 24.04 LTS)
# Este script debe ejecutarse como root (sudo) en el servidor.

set -e # Terminar ejecución inmediatamente si algún comando falla

echo "============================================="
echo "  Contalink - Configuración Inicial de EC2"
echo "============================================="

# 1. Actualizar el sistema
echo -e "\n[1/5] Actualizando paquetes del sistema..."
apt-get update -y
apt-get upgrade -y
apt-get install -y curl git apt-transport-https ca-certificates gnupg lsb-release certbot python3-certbot-nginx

# 2. Instalar Docker Engine y Docker Compose
echo -e "\n[2/5] Instalando Docker y Docker Compose..."
if ! command -v docker &> /dev/null; then
    # Añadir clave GPG oficial de Docker
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes

    # Configurar el repositorio estable
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Instalar Docker
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Añadir el usuario actual (normalmente 'ubuntu') al grupo docker
    if [ -n "$SUDO_USER" ]; then
        usermod -aG docker "$SUDO_USER"
        echo "Usuario '$SUDO_USER' añadido al grupo docker. Requiere re-iniciar sesión para aplicar cambios."
    fi
else
    echo "Docker ya está instalado."
fi

# Iniciar y habilitar Docker
systemctl start docker
systemctl enable docker

# 3. Configurar Firewall (UFW)
echo -e "\n[3/5] Configurando el Firewall (UFW)..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
echo "y" | ufw enable
ufw status verbose

# 4. Crear estructura del directorio de la app
echo -e "\n[4/5] Creando directorio para la aplicación..."
APP_DIR="/var/www/contalink"
mkdir -p "$APP_DIR"
if [ -n "$SUDO_USER" ]; then
    chown -R "$SUDO_USER":"$SUDO_USER" "$APP_DIR"
fi

echo -e "\n[5/5] Instalación básica finalizada con éxito."
echo "============================================="
echo "Siguientes pasos sugeridos:"
echo "1. Clona tu repositorio git en: $APP_DIR"
echo "   git clone <URL_REPOSITORIO> $APP_DIR"
echo "2. Crea tu archivo de producción .env basándote en .env.production.example"
echo "3. Levanta la aplicación con: docker compose up -d"
echo "4. (Opcional) Si cuentas con dominio apuntando a este servidor, obtén tu certificado SSL con:"
echo "   sudo certbot certonly --standalone -d tu-dominio.com"
echo "============================================="
