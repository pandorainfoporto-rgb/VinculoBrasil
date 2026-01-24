#!/bin/bash
# Script para push seguro usando token do arquivo

# Lê o token do arquivo (ignora linhas com #)
TOKEN=$(grep -v '^#' GITHUB_TOKEN.txt | grep -v '^$' | head -1 | tr -d '[:space:]')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "ghp_SEU_TOKEN_AQUI" ]; then
    echo "ERRO: Edite o arquivo GITHUB_TOKEN.txt e cole seu token!"
    echo "Depois execute: bash push-to-github.sh"
    exit 1
fi

echo "Token detectado. Iniciando push..."

# Inicializa git se necessário
if [ ! -d ".git" ]; then
    echo "Inicializando repositório git..."
    git init
    git branch -m main
fi

# Configura identidade
git config user.email "deploy@vinculo.br"
git config user.name "Vinculo Deploy"

# Adiciona e commita
git add .
git commit -m "feat: complete frontend MVP (wizard, payments, dashboard)" 2>/dev/null || echo "Sem mudanças para commitar"

# Configura remote com token
REPO_URL="https://pandorainfoporto-rgb:${TOKEN}@github.com/pandorainfoporto-rgb/VinculoBrasil.git"
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

# Push
echo "Fazendo push para GitHub..."
git push -u origin main --force

if [ $? -eq 0 ]; then
    echo ""
    echo "================================"
    echo "SUCESSO! Código enviado para:"
    echo "https://github.com/pandorainfoporto-rgb/VinculoBrasil"
    echo "================================"
    # Limpa o token do arquivo por segurança
    echo "# Token usado com sucesso. Cole novo token se precisar." > GITHUB_TOKEN.txt
else
    echo "ERRO no push. Verifique se o token está correto."
fi
