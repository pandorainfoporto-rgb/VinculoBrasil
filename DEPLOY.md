# Vinculo.io - Guia de Deploy

## Resumo Rapido

```bash
# 1. Build para producao
npm run build

# 2. Pasta de output
ls dist/
```

A pasta `dist/` contem todos os arquivos estaticos prontos para deploy.

---

## Opcoes de Hospedagem

### 1. Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd /path/to/vite-template
vercel

# Para producao
vercel --prod
```

**Variaveis de Ambiente no Vercel:**
1. Acesse o projeto em vercel.com
2. Va em Settings > Environment Variables
3. Adicione as variaveis do `.env.example`

### 2. Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --dir=dist

# Para producao
netlify deploy --dir=dist --prod
```

**netlify.toml** (criar na raiz se nao existir):
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Cloudflare Pages

1. Conecte seu repositorio no Cloudflare Dashboard
2. Configure:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Adicione variaveis de ambiente

### 4. AWS S3 + CloudFront

```bash
# Sync para S3
aws s3 sync dist/ s3://seu-bucket-vinculo-io --delete

# Invalidar cache CloudFront (opcional)
aws cloudfront create-invalidation --distribution-id XXXX --paths "/*"
```

### 5. Servidor Proprio (Nginx)

```nginx
server {
    listen 80;
    server_name vinculo.io www.vinculo.io;
    root /var/www/vinculo.io/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estaticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

---

## Configuracao de Producao

### Variaveis de Ambiente Criticas

```bash
# .env.production (criar antes do build)

# Network: Producao
VITE_BLOCKCHAIN_NETWORK=polygon

# Seu contrato deployado na mainnet
VITE_VINCULO_CONTRACT_ADDRESS=0xSeuContratoProdução

# RPC URL (use Alchemy/Infura para producao)
VITE_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/SEU_API_KEY

# BRZ Token (mainnet)
VITE_BRZ_TOKEN_ADDRESS=0x4eD141110F6EEeaba9A1df36d8c26f684d2475Dc

# WalletConnect (obrigatorio para producao)
VITE_WALLETCONNECT_PROJECT_ID=seu_project_id

# Modo Demo OFF
VITE_DEMO_MODE=false
VITE_APP_ENV=production
```

### Build de Producao

```bash
# Com variaveis de producao
cp .env.production .env.local
npm run build

# Verificar tamanho do bundle
npx vite-bundle-visualizer
```

---

## Deploy do Smart Contract

### Pre-requisitos

1. Conta com MATIC (Polygon)
2. Hardhat ou Foundry instalado
3. Chave privada da wallet de deploy

### Deploy para Mumbai Testnet

```bash
# 1. Obter MATIC de teste
# https://faucet.polygon.technology/

# 2. Configurar hardhat.config.js
module.exports = {
  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001
    }
  }
};

# 3. Deploy
npx hardhat run scripts/deploy.js --network mumbai
```

### Deploy para Polygon Mainnet

```bash
# 1. Garantir MATIC suficiente para gas

# 2. Configurar para mainnet
module.exports = {
  networks: {
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 137
    }
  }
};

# 3. Deploy
npx hardhat run scripts/deploy.js --network polygon
```

### Apos Deploy

1. Copie o endereco do contrato
2. Verifique no Polygonscan
3. Atualize `VITE_VINCULO_CONTRACT_ADDRESS` no .env

---

## Checklist Pre-Deploy

### Codigo
- [ ] `npm run check:safe` passa sem erros
- [ ] `npm run build` completa com sucesso
- [ ] Testar localmente: `npm run preview`

### Blockchain
- [ ] Smart Contract deployado na rede alvo
- [ ] Endereco do contrato atualizado no .env
- [ ] Wallets operacionais configuradas (platform, insurance)
- [ ] MATIC suficiente nas wallets

### Seguranca
- [ ] Variaveis sensiveis so em .env (nunca no codigo)
- [ ] HTTPS configurado
- [ ] CORS configurado corretamente
- [ ] Rate limiting no RPC

### Monitoramento
- [ ] Analytics configurado (Google Analytics, Mixpanel)
- [ ] Error tracking (Sentry)
- [ ] Logs de transacoes blockchain

---

## Arquitetura de Producao

```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │   (CDN/WAF)     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Vercel/  │  │  API     │  │ Polygon  │
        │ Netlify  │  │  Server  │  │ Network  │
        │ (Static) │  │  (opt)   │  │ (RPC)    │
        └──────────┘  └──────────┘  └──────────┘
              │              │              │
              └──────────────┴──────────────┘
                             │
                    ┌────────┴────────┐
                    │  Vinculo.io     │
                    │  Frontend       │
                    └─────────────────┘
```

---

## Troubleshooting

### Erro: "Module not found"
```bash
rm -rf node_modules
npm install
npm run build
```

### Erro: "Wallet connection failed"
- Verifique `VITE_WALLETCONNECT_PROJECT_ID`
- Confirme que a rede esta correta (Polygon vs Mumbai)

### Erro: "Transaction failed"
- Verifique saldo de MATIC para gas
- Confirme endereco do contrato
- Verifique se contrato esta deployado na rede correta

### Performance lenta
- Use Alchemy/Infura ao inves de RPC publico
- Configure CDN para assets estaticos
- Habilite gzip compression

---

## Contatos

- **Suporte Tecnico:** dev@vinculo.io
- **Documentacao:** https://docs.vinculo.io
- **Status:** https://status.vinculo.io
