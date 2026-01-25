# ============================================
# VINCULO BRASIL - DOCKERFILE
# Multi-stage build: Frontend + Backend
# Using Debian Slim for better DNS/IPv6 compatibility
# ============================================

# ============================================
# STAGE 1: Build Frontend
# ============================================
FROM node:20-slim AS frontend-builder

WORKDIR /app

# Instalar dependencias do sistema para build
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependencias
COPY package*.json ./

# IMPORTANTE: Usar npm install (NAO npm ci) para evitar problemas com package-lock do Windows
RUN npm install --legacy-peer-deps

# Copiar arquivos de configuracao do build
# NOTA: Tailwind CSS v4 usa @tailwindcss/vite plugin, nao precisa de postcss.config.js ou tailwind.config.js
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY index.html ./

# Copiar diretorio de configuracao do vite
COPY config/ ./config/

# Copiar codigo fonte
COPY src/ ./src/
COPY public/ ./public/

# Build do frontend usando npx diretamente (mais rapido, evita scripts complexos)
RUN npx vite build

# ============================================
# STAGE 2: Build Backend
# ============================================
FROM node:20-slim AS backend-builder

WORKDIR /app/server

# Instalar dependencias do sistema para Prisma
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    openssl \
    libssl-dev \
    git \
    openssh-client \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependencias do server
COPY server/package*.json ./

# Configurar Git para usar HTTPS em vez de SSH (evita erro de autenticacao)
RUN git config --global url.'https://github.com/'.insteadOf ssh://git@github.com/ && \
    git config --global url.'https://'.insteadOf git://

# IMPORTANTE: Usar npm install (NAO npm ci) para evitar problemas com package-lock do Windows
RUN npm install

# Copiar codigo fonte do server
COPY server/ ./

# Gerar Prisma Client (com binaryTargets para Debian)
RUN npx prisma generate

# Build do TypeScript
RUN npm run build

# ============================================
# STAGE 3: Production Image
# ============================================
FROM node:20-slim AS production

WORKDIR /app

# Instalar dependencias do sistema (OpenSSL para Prisma, curl para healthcheck)
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    curl \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Criar usuario nao-root
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m vinculo

# Copiar frontend build
COPY --from=frontend-builder /app/dist ./public

# Copiar backend build
COPY --from=backend-builder /app/server/dist ./dist
COPY --from=backend-builder /app/server/node_modules ./node_modules
COPY --from=backend-builder /app/server/package.json ./
COPY --from=backend-builder /app/server/prisma ./prisma

# Criar diretorios necessarios com permissoes corretas
RUN mkdir -p uploads whatsapp-sessions logs && \
    chown -R vinculo:nodejs /app && \
    chmod -R 755 /app

# Mudar para usuario nao-root
USER vinculo

# Expor porta
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Variaveis de ambiente padrao
ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0

# Comando de inicializacao
CMD ["node", "dist/index.js"]
