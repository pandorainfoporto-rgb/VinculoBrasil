#!/bin/bash
# ============================================================
# Vinculo.io - Script de Setup Web3
# ============================================================
# Execute este script apos sair do sandbox E2B para instalar
# todas as dependencias Web3 necessarias.
#
# Uso:
#   chmod +x scripts/setup-web3.sh
#   ./scripts/setup-web3.sh
# ============================================================

set -e

echo "======================================================"
echo "  VINCULO.IO - Setup Web3 Dependencies"
echo "======================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funcao para log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica se esta no diretorio correto
if [ ! -f "package.json" ]; then
    log_error "Execute este script na raiz do projeto (onde esta o package.json)"
    exit 1
fi

# Verifica se npm esta instalado
if ! command -v npm &> /dev/null; then
    log_error "npm nao encontrado. Instale Node.js primeiro."
    exit 1
fi

echo ""
log_info "1. Instalando dependencias Web3 principais..."
npm install viem@^2.21.0 @wagmi/core@^2.15.0 @wagmi/connectors@^5.0.0

echo ""
log_info "2. Instalando dependencias de criptografia..."
npm install @noble/hashes @noble/curves @scure/bip32 @scure/bip39

echo ""
log_info "3. Instalando utilidades..."
npm install abitype@^1.0.0

echo ""
log_info "4. Verificando instalacao..."

# Verifica se os pacotes foram instalados
if npm list viem > /dev/null 2>&1; then
    log_info "  - viem instalado corretamente"
else
    log_error "  - Falha ao instalar viem"
fi

if npm list @wagmi/core > /dev/null 2>&1; then
    log_info "  - @wagmi/core instalado corretamente"
else
    log_error "  - Falha ao instalar @wagmi/core"
fi

if npm list @wagmi/connectors > /dev/null 2>&1; then
    log_info "  - @wagmi/connectors instalado corretamente"
else
    log_error "  - Falha ao instalar @wagmi/connectors"
fi

echo ""
log_info "5. Copiando arquivo .env.example para .env.local..."

if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    log_info "  - .env.local criado. Configure as variaveis!"
else
    log_warn "  - .env.local ja existe, nao foi sobrescrito"
fi

echo ""
echo "======================================================"
echo "  Setup concluido!"
echo "======================================================"
echo ""
echo "Proximos passos:"
echo ""
echo "  1. Configure o .env.local com os enderecos dos contratos:"
echo "     VITE_VINCULO_CONTRACT_ADDRESS=0x..."
echo "     VITE_BRZ_TOKEN_ADDRESS=0x..."
echo ""
echo "  2. Inicie o servidor de desenvolvimento:"
echo "     npm run dev"
echo ""
echo "  3. Conecte sua carteira MetaMask (Polygon Amoy)"
echo ""
echo "======================================================"
