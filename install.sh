#!/bin/bash

# ============================================
# VINCULO BRASIL - SCRIPT DE INSTALACAO
# Debian 12 / Ubuntu 22.04+
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ██╗   ██╗██╗███╗   ██╗ ██████╗██╗   ██╗██╗      ██████╗ ║"
echo "║   ██║   ██║██║████╗  ██║██╔════╝██║   ██║██║     ██╔═══██╗║"
echo "║   ██║   ██║██║██╔██╗ ██║██║     ██║   ██║██║     ██║   ██║║"
echo "║   ╚██╗ ██╔╝██║██║╚██╗██║██║     ██║   ██║██║     ██║   ██║║"
echo "║    ╚████╔╝ ██║██║ ╚████║╚██████╗╚██████╔╝███████╗╚██████╔╝║"
echo "║     ╚═══╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝ ║"
echo "║                                                           ║"
echo "║           INSTALADOR AUTOMATICO v2.0                      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================
# VERIFICACOES INICIAIS
# ============================================

echo -e "${YELLOW}[1/8] Verificando sistema...${NC}"

# Verificar se eh root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Por favor, execute como root (sudo ./install.sh)${NC}"
    exit 1
fi

# Verificar distribuicao
if [ -f /etc/debian_version ]; then
    echo -e "${GREEN}Sistema detectado: Debian/Ubuntu${NC}"
else
    echo -e "${RED}Este script foi feito para Debian/Ubuntu${NC}"
    exit 1
fi

# ============================================
# ATUALIZACAO DO SISTEMA
# ============================================

echo -e "${YELLOW}[2/8] Atualizando sistema...${NC}"

apt-get update -qq
apt-get upgrade -y -qq

# ============================================
# INSTALACAO DE DEPENDENCIAS
# ============================================

echo -e "${YELLOW}[3/8] Instalando dependencias...${NC}"

apt-get install -y -qq \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    unzip

# ============================================
# INSTALACAO DO DOCKER
# ============================================

echo -e "${YELLOW}[4/8] Instalando Docker...${NC}"

# Remover versoes antigas
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Adicionar repositorio oficial
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Iniciar Docker
systemctl enable docker
systemctl start docker

echo -e "${GREEN}Docker instalado: $(docker --version)${NC}"

# ============================================
# INSTALACAO DO NODE.JS (Opcional para PM2)
# ============================================

echo -e "${YELLOW}[5/8] Instalando Node.js...${NC}"

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y -qq nodejs

echo -e "${GREEN}Node.js instalado: $(node --version)${NC}"

# Instalar PM2 globalmente
npm install -g pm2

# ============================================
# CRIAR USUARIO E ESTRUTURA
# ============================================

echo -e "${YELLOW}[6/8] Criando estrutura de diretorios...${NC}"

# Criar usuario vinculo se nao existir
if ! id "vinculo" &>/dev/null; then
    useradd -m -s /bin/bash vinculo
    usermod -aG docker vinculo
    echo -e "${GREEN}Usuario 'vinculo' criado${NC}"
fi

# Criar diretorios
INSTALL_DIR="/var/www/vinculo"
mkdir -p $INSTALL_DIR
mkdir -p $INSTALL_DIR/uploads
mkdir -p $INSTALL_DIR/whatsapp-sessions
mkdir -p $INSTALL_DIR/logs
mkdir -p $INSTALL_DIR/nginx/ssl
mkdir -p $INSTALL_DIR/certbot/www
mkdir -p $INSTALL_DIR/certbot/conf

# ============================================
# BAIXAR CODIGO
# ============================================

echo -e "${YELLOW}[7/8] Baixando codigo do Vinculo Brasil...${NC}"

cd $INSTALL_DIR

# Se ja existe, fazer pull. Senao, clonar
if [ -d ".git" ]; then
    git pull origin main
else
    # Copiar arquivos locais (em producao seria git clone)
    echo -e "${YELLOW}Copiando arquivos...${NC}"
    # cp -r /path/to/source/* .
fi

# Criar arquivo .env se nao existir
if [ ! -f ".env" ]; then
    cp .env.example .env

    # Gerar secrets automaticamente
    JWT_SECRET=$(openssl rand -hex 32)
    ENCRYPTION_KEY=$(openssl rand -hex 16)
    DB_PASSWORD=$(openssl rand -hex 16)

    sed -i "s/GERE_UMA_CHAVE_SEGURA_COM_64_CARACTERES_AQUI/$JWT_SECRET/" .env
    sed -i "s/GERE_UMA_CHAVE_DE_32_CARACTERES/$ENCRYPTION_KEY/" .env
    sed -i "s/SUA_SENHA_FORTE/$DB_PASSWORD/g" .env

    echo -e "${GREEN}Arquivo .env criado com secrets aleatorios${NC}"
fi

# Ajustar permissoes
chown -R vinculo:vinculo $INSTALL_DIR
chmod 600 $INSTALL_DIR/.env

# ============================================
# CONFIGURAR FIREWALL
# ============================================

echo -e "${YELLOW}[8/8] Configurando firewall...${NC}"

ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo -e "${GREEN}Firewall configurado${NC}"

# ============================================
# INICIAR APLICACAO
# ============================================

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║                  INSTALACAO CONCLUIDA!                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo -e "${GREEN}Proximos passos:${NC}"
echo ""
echo "1. Edite o arquivo de configuracao:"
echo -e "   ${YELLOW}nano $INSTALL_DIR/.env${NC}"
echo ""
echo "2. Inicie os containers:"
echo -e "   ${YELLOW}cd $INSTALL_DIR && docker compose up -d${NC}"
echo ""
echo "3. Aguarde o banco de dados inicializar e execute as migrations:"
echo -e "   ${YELLOW}docker compose exec app npx prisma db push${NC}"
echo ""
echo "4. Acesse o Wizard de Configuracao:"
echo -e "   ${YELLOW}http://$(hostname -I | awk '{print $1}')/setup${NC}"
echo ""
echo -e "${BLUE}Para logs em tempo real: docker compose logs -f${NC}"
echo ""
echo -e "${GREEN}Obrigado por escolher o Vinculo Brasil!${NC}"
