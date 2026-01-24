#!/bin/bash

# ============================================
# Script de Setup Mobile - Vinculo App
# ============================================
# Este script configura o ambiente para
# desenvolvimento de apps Android e iOS
# usando Capacitor.
# ============================================

set -e

echo "=========================================="
echo "  Vinculo - Setup Mobile (Capacitor)     "
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funcao para imprimir status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretorio correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto (onde esta o package.json)"
    exit 1
fi

# Menu de opcoes
echo "O que voce deseja fazer?"
echo ""
echo "1) Instalar dependencias do Capacitor"
echo "2) Adicionar plataforma Android"
echo "3) Adicionar plataforma iOS"
echo "4) Build e Sync"
echo "5) Abrir Android Studio"
echo "6) Abrir Xcode (requer Mac)"
echo "7) Setup completo (1 + 2 + 3 + 4)"
echo "8) Gerar icones e splash screens"
echo "9) Sair"
echo ""
read -p "Escolha uma opcao [1-9]: " choice

case $choice in
    1)
        print_status "Instalando dependencias do Capacitor..."
        npm install @capacitor/core @capacitor/cli
        npm install @capacitor/android @capacitor/ios
        npm install @capacitor/app @capacitor/splash-screen @capacitor/status-bar
        npm install @capacitor/keyboard @capacitor/browser @capacitor/share
        npm install @capacitor/camera @capacitor/geolocation
        npm install @capacitor/push-notifications @capacitor/local-notifications
        print_success "Dependencias instaladas!"
        ;;

    2)
        print_status "Adicionando plataforma Android..."
        npx cap add android
        print_success "Android adicionado! Use 'npx cap open android' para abrir no Android Studio."
        ;;

    3)
        print_status "Adicionando plataforma iOS..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            npx cap add ios
            print_success "iOS adicionado! Use 'npx cap open ios' para abrir no Xcode."
        else
            print_warning "iOS so pode ser adicionado em um Mac."
            print_status "Voce pode usar CI/CD (como Codemagic ou Bitrise) para builds iOS."
        fi
        ;;

    4)
        print_status "Executando build do projeto..."
        npm run build
        print_status "Sincronizando com plataformas nativas..."
        npx cap sync
        print_success "Build e sync completos!"
        ;;

    5)
        print_status "Abrindo Android Studio..."
        if [ -d "android" ]; then
            npx cap open android
        else
            print_error "Plataforma Android nao encontrada. Execute a opcao 2 primeiro."
        fi
        ;;

    6)
        print_status "Abrindo Xcode..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if [ -d "ios" ]; then
                npx cap open ios
            else
                print_error "Plataforma iOS nao encontrada. Execute a opcao 3 primeiro."
            fi
        else
            print_error "Xcode so esta disponivel em Mac."
        fi
        ;;

    7)
        print_status "Executando setup completo..."

        # Instalar dependencias
        print_status "1/4 - Instalando dependencias..."
        npm install @capacitor/core @capacitor/cli
        npm install @capacitor/android @capacitor/ios
        npm install @capacitor/app @capacitor/splash-screen @capacitor/status-bar
        npm install @capacitor/keyboard @capacitor/browser @capacitor/share
        npm install @capacitor/camera @capacitor/geolocation
        npm install @capacitor/push-notifications @capacitor/local-notifications

        # Build
        print_status "2/4 - Executando build..."
        npm run build

        # Android
        print_status "3/4 - Adicionando Android..."
        npx cap add android

        # iOS (apenas em Mac)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            print_status "4/4 - Adicionando iOS..."
            npx cap add ios
        else
            print_warning "4/4 - iOS ignorado (nao e um Mac)"
        fi

        # Sync
        print_status "Sincronizando..."
        npx cap sync

        print_success "Setup completo!"
        echo ""
        echo "Proximos passos:"
        echo "  - Android: npx cap open android"
        echo "  - iOS: npx cap open ios (apenas Mac)"
        ;;

    8)
        print_status "Gerando icones e splash screens..."
        echo ""
        echo "Para gerar icones automaticamente, recomendamos:"
        echo ""
        echo "1. Usar o site: https://www.pwabuilder.com/imageGenerator"
        echo "   - Faca upload de uma imagem 1024x1024"
        echo "   - Baixe o pacote de icones"
        echo "   - Extraia em public/icons/"
        echo ""
        echo "2. Ou usar o pacote @capacitor/assets:"
        echo "   npm install @capacitor/assets"
        echo "   Crie assets/icon.png (1024x1024) e assets/splash.png (2732x2732)"
        echo "   npx capacitor-assets generate"
        echo ""
        print_warning "Lembre-se de criar os icones antes de publicar nas lojas!"
        ;;

    9)
        print_status "Saindo..."
        exit 0
        ;;

    *)
        print_error "Opcao invalida!"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "  Concluido!                             "
echo "=========================================="
