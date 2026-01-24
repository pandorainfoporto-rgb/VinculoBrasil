#!/bin/bash
# ============================================================
# Vinculo.io - Setup Cron Job para Automacao Noturna
# ============================================================
# Este script configura o cron job para executar a verificacao
# de inadimplencia automaticamente.
#
# Uso:
#   chmod +x scripts/setup-cron.sh
#   sudo ./scripts/setup-cron.sh
#
# O cron executara diariamente as 02:00 (horario do servidor)
# ============================================================

set -e

echo "======================================================"
echo "  VINCULO.IO - Setup Cron Job"
echo "======================================================"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Detecta o diretorio do projeto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

log_info "Diretorio do projeto: $PROJECT_DIR"

# Verifica se o script de automacao existe
if [ ! -f "$PROJECT_DIR/scripts/check-defaulted-rentals.ts" ]; then
    log_error "Script de automacao nao encontrado!"
    log_error "Esperado: $PROJECT_DIR/scripts/check-defaulted-rentals.ts"
    exit 1
fi

# Verifica se tsx esta instalado
if ! command -v npx &> /dev/null; then
    log_error "npx nao encontrado. Instale Node.js primeiro."
    exit 1
fi

# Cria o arquivo de log
LOG_DIR="/var/log/vinculo"
LOG_FILE="$LOG_DIR/automation.log"

if [ ! -d "$LOG_DIR" ]; then
    log_info "Criando diretorio de logs: $LOG_DIR"
    sudo mkdir -p "$LOG_DIR"
    sudo chmod 755 "$LOG_DIR"
fi

# Cria o wrapper script que sera executado pelo cron
WRAPPER_SCRIPT="/usr/local/bin/vinculo-automation"

log_info "Criando wrapper script: $WRAPPER_SCRIPT"

sudo tee "$WRAPPER_SCRIPT" > /dev/null << EOF
#!/bin/bash
# Vinculo.io - Automation Wrapper
# Executado pelo cron diariamente

# Carrega variaveis de ambiente
if [ -f "$PROJECT_DIR/.env.local" ]; then
    export \$(grep -v '^#' "$PROJECT_DIR/.env.local" | xargs)
fi

# Configura PATH para Node
export PATH="/usr/local/bin:/usr/bin:\$PATH"
export NODE_ENV=production
export DRY_RUN=false

# Navega para o diretorio do projeto
cd "$PROJECT_DIR"

# Executa o script
echo ""
echo "==============================================="
echo "Vinculo Automation - \$(date)"
echo "==============================================="

npx tsx scripts/check-defaulted-rentals.ts

echo ""
echo "Concluido em: \$(date)"
echo "==============================================="
EOF

sudo chmod +x "$WRAPPER_SCRIPT"
log_info "Wrapper script criado com sucesso"

# Adiciona entrada no crontab
CRON_ENTRY="0 2 * * * $WRAPPER_SCRIPT >> $LOG_FILE 2>&1"

log_info "Configurando crontab..."

# Verifica se ja existe
if crontab -l 2>/dev/null | grep -q "vinculo-automation"; then
    log_warn "Entrada cron ja existe. Atualizando..."
    (crontab -l 2>/dev/null | grep -v "vinculo-automation"; echo "$CRON_ENTRY") | crontab -
else
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
fi

log_info "Crontab configurado"

# Mostra configuracao atual
echo ""
echo "======================================================"
echo "  Configuracao Concluida!"
echo "======================================================"
echo ""
echo "Cron job configurado para executar diariamente as 02:00"
echo ""
echo "Arquivos criados:"
echo "  - Wrapper: $WRAPPER_SCRIPT"
echo "  - Logs: $LOG_FILE"
echo ""
echo "Comandos uteis:"
echo ""
echo "  # Ver crontab atual"
echo "  crontab -l"
echo ""
echo "  # Executar manualmente (modo teste)"
echo "  DRY_RUN=true npx tsx scripts/check-defaulted-rentals.ts"
echo ""
echo "  # Executar manualmente (modo producao)"
echo "  $WRAPPER_SCRIPT"
echo ""
echo "  # Ver logs"
echo "  tail -f $LOG_FILE"
echo ""
echo "  # Remover cron job"
echo "  crontab -l | grep -v 'vinculo-automation' | crontab -"
echo ""
echo "======================================================"
