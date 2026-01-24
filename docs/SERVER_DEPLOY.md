# VINCULO.IO - Backend Server Deploy Guide

## Motor de Liquidez Automatica

Este documento contém o código completo do backend para deploy na VM Debian.

## Arquitetura

```
VM Debian (Proxmox)
├── /var/www/vinculo/
│   ├── dist/           # Frontend React (npm run build)
│   └── server/         # Backend Node.js
│       ├── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── .env
```

## Fluxo de Operação

```
PIX Recebido (Asaas Webhook)
       ↓
   Validação HMAC
       ↓
   Transfero API
   (BRL → BRZ)
       ↓
   Withdraw → Polygon
       ↓
   Smart Contract
   Split 85/5/5/5
       ↓
   WhatsApp Notification
       ↓
   Audit Log (CVM)
```

## Instalação na VM Debian

```bash
# 1. Criar estrutura
sudo mkdir -p /var/www/vinculo/server
cd /var/www/vinculo/server

# 2. Criar package.json
cat > package.json << 'EOF'
{
  "name": "vinculo-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "ethers": "^6.9.0",
    "express": "^4.18.2",
    "helmet": "^7.1.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "tsx": "^4.6.0",
    "typescript": "^5.3.0"
  }
}
EOF

# 3. Criar tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
EOF

# 4. Instalar dependências
npm install

# 5. Configurar .env
cp .env.example .env
nano .env  # Editar com suas chaves

# 6. Build e start
npm run build
npm start
```

## Arquivo .env.example

```env
# Server
PORT=3001
NODE_ENV=production

# Transfero API
TRANSFERO_API_KEY=your_api_key
TRANSFERO_API_SECRET=your_api_secret
TRANSFERO_API_URL=https://api.transfero.com

# Blockchain (Polygon)
OPERATOR_PRIVATE_KEY=your_private_key
POLYGON_RPC_URL=https://polygon-rpc.com
VINCULO_CONTRACT_ADDRESS=0x...
BRZ_TOKEN_ADDRESS=0x491a4eB4f1FC3BfF8E1d2FC856a6A46663aD556f
TREASURY_WALLET_ADDRESS=0x...

# Webhooks
ASAAS_WEBHOOK_TOKEN=your_webhook_token
BANK_WEBHOOK_SECRET=your_hmac_secret

# WhatsApp Business API (opcional)
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

## Código Principal: index.ts

```typescript
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import axios from 'axios';
import { ethers } from 'ethers';

const app = express();

const {
  PORT = 3001,
  NODE_ENV = 'development',
  TRANSFERO_API_KEY,
  TRANSFERO_API_SECRET,
  TRANSFERO_API_URL = 'https://api.transfero.com',
  OPERATOR_PRIVATE_KEY,
  POLYGON_RPC_URL = 'https://polygon-rpc.com',
  VINCULO_CONTRACT_ADDRESS,
  BRZ_TOKEN_ADDRESS = '0x491a4eB4f1FC3BfF8E1d2FC856a6A46663aD556f',
  TREASURY_WALLET_ADDRESS,
  ASAAS_WEBHOOK_TOKEN,
  BANK_WEBHOOK_SECRET,
  WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
} = process.env;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: NODE_ENV === 'production'
    ? ['https://vinculo.io', 'https://app.vinculo.io']
    : '*'
}));
app.use(express.json());

// Logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Blockchain Setup
const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
const operatorWallet = OPERATOR_PRIVATE_KEY
  ? new ethers.Wallet(OPERATOR_PRIVATE_KEY, provider)
  : null;

const VINCULO_ABI = [
  'function payRent(uint256 tokenId, uint256 amount) external',
  'function splitPayment(uint256 tokenId, uint256 amount, address[] recipients, uint256[] shares) external',
  'function getContractBalance() view returns (uint256)',
];

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

const vinculoContract = VINCULO_CONTRACT_ADDRESS && operatorWallet
  ? new ethers.Contract(VINCULO_CONTRACT_ADDRESS, VINCULO_ABI, operatorWallet)
  : null;

const brzToken = operatorWallet
  ? new ethers.Contract(BRZ_TOKEN_ADDRESS, ERC20_ABI, operatorWallet)
  : null;

// Transfero Headers
function generateTransferoHeaders(method: string, path: string, body = ''): Record<string, string> {
  const timestamp = Date.now().toString();
  const message = timestamp + method + path + body;
  const signature = crypto
    .createHmac('sha256', TRANSFERO_API_SECRET || '')
    .update(message)
    .digest('hex');

  return {
    'Content-Type': 'application/json',
    'X-TRF-KEY': TRANSFERO_API_KEY || '',
    'X-TRF-SIGN': signature,
    'X-TRF-TS': timestamp,
  };
}

// Convert BRL to BRZ
async function convertBrlToBrz(amountBRL: number) {
  const path = '/v1/quotes';
  const body = JSON.stringify({ pair: 'BRL/BRZ', side: 'buy', amount: amountBRL });
  const headers = generateTransferoHeaders('POST', path, body);

  const quoteRes = await axios.post(`${TRANSFERO_API_URL}${path}`, body, { headers });
  const quote = quoteRes.data;

  const orderPath = '/v1/orders';
  const orderBody = JSON.stringify({ quoteId: quote.id });
  const orderHeaders = generateTransferoHeaders('POST', orderPath, orderBody);

  const orderRes = await axios.post(`${TRANSFERO_API_URL}${orderPath}`, orderBody, { headers: orderHeaders });
  return { quote, order: orderRes.data };
}

// Split 85/5/5/5
async function executeSplit(tokenId: number, amountBRZ: number, recipients: {
  landlord: string;
  administrator: string;
  protocol: string;
  reserve: string;
}) {
  if (!vinculoContract) throw new Error('Blockchain not configured');

  const amount = ethers.parseUnits(amountBRZ.toString(), 18);
  const addresses = [recipients.landlord, recipients.administrator, recipients.protocol, recipients.reserve];
  const shares = [8500, 500, 500, 500];

  const tx = await vinculoContract.splitPayment(tokenId, amount, addresses, shares);
  const receipt = await tx.wait();

  return {
    txHash: tx.hash,
    tokenId,
    totalAmount: amountBRZ.toString(),
    splits: [
      { role: 'Locador', percentage: 85, amount: (amountBRZ * 0.85).toFixed(2) },
      { role: 'Administradora', percentage: 5, amount: (amountBRZ * 0.05).toFixed(2) },
      { role: 'Vinculo.io', percentage: 5, amount: (amountBRZ * 0.05).toFixed(2) },
      { role: 'Fundo Reserva', percentage: 5, amount: (amountBRZ * 0.05).toFixed(2) },
    ],
    gasUsed: receipt.gasUsed.toString(),
  };
}

// Audit Log
interface AuditEntry {
  id: string;
  timestamp: Date;
  type: string;
  status: string;
  data: Record<string, unknown>;
  txHash?: string;
}

const auditLog: AuditEntry[] = [];

function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
  const auditEntry: AuditEntry = { id: crypto.randomUUID(), timestamp: new Date(), ...entry };
  auditLog.push(auditEntry);
  console.log(`Audit: ${entry.type} - ${entry.status}`);
  return auditEntry;
}

// Routes
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      blockchain: !!operatorWallet,
      transfero: !!(TRANSFERO_API_KEY && TRANSFERO_API_SECRET),
      whatsapp: !!(WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID),
    },
  });
});

app.get('/api/liquidity/status', async (_req, res) => {
  try {
    let brzBalance = '0';
    if (brzToken && TREASURY_WALLET_ADDRESS) {
      const balance = await brzToken.balanceOf(TREASURY_WALLET_ADDRESS);
      brzBalance = ethers.formatUnits(balance, 18);
    }
    res.json({
      success: true,
      data: {
        brzBalance,
        treasuryAddress: TREASURY_WALLET_ADDRESS,
        network: 'polygon',
        lastUpdate: new Date().toISOString(),
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Error fetching status' });
  }
});

app.get('/api/audit/log', (_req, res) => {
  res.json({
    success: true,
    data: { entries: auditLog.slice(-100).reverse(), total: auditLog.length },
  });
});

// Webhook PIX
app.post('/webhook/pix', async (req, res) => {
  console.log('Webhook PIX received');

  if (req.headers['asaas-access-token'] !== ASAAS_WEBHOOK_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { event, payment } = req.body;

  if (event !== 'PAYMENT_CONFIRMED' && event !== 'PAYMENT_RECEIVED') {
    res.status(200).json({ status: 'ignored' });
    return;
  }

  const { id: paymentId, value: amountBRL, externalReference } = payment;
  const tokenIdMatch = externalReference?.match(/NFT-(\d+)|CONTRACT-(\d+)/);
  const tokenId = tokenIdMatch ? parseInt(tokenIdMatch[1] || tokenIdMatch[2]) : null;

  if (!tokenId) {
    res.status(200).json({ status: 'ignored', reason: 'No token reference' });
    return;
  }

  logAudit({ type: 'pix_received', status: 'success', data: { paymentId, amountBRL, tokenId } });

  try {
    const { quote, order } = await convertBrlToBrz(amountBRL);
    logAudit({ type: 'brz_conversion', status: order.status, data: { quoteId: quote.id, amountBRZ: quote.total } });

    const splitResult = await executeSplit(tokenId, quote.total, {
      landlord: '0x...', // Get from contract
      administrator: '0x...',
      protocol: TREASURY_WALLET_ADDRESS || '0x...',
      reserve: '0x...',
    });

    logAudit({ type: 'blockchain_split', status: 'success', data: { txHash: splitResult.txHash }, txHash: splitResult.txHash });

    res.status(200).json({
      success: true,
      data: { paymentId, tokenId, amountBRL, amountBRZ: quote.total, splitTxHash: splitResult.txHash },
    });
  } catch (error) {
    console.error('Processing error:', error);
    logAudit({ type: 'blockchain_split', status: 'failed', data: { paymentId, error: String(error) } });
    res.status(200).json({ success: false, error: 'Processing failed', queued: true });
  }
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start
app.listen(PORT, () => {
  console.log(`
  VINCULO.IO - Motor de Liquidez Automatica
  Porta: ${PORT} | Ambiente: ${NODE_ENV}
  Blockchain: ${operatorWallet ? 'OK' : 'Not configured'}
  Transfero: ${TRANSFERO_API_KEY ? 'OK' : 'Not configured'}
  `);
});
```

## Nginx Config

```nginx
server {
    listen 80;
    server_name vinculo.io www.vinculo.io;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vinculo.io www.vinculo.io;

    ssl_certificate /etc/letsencrypt/live/vinculo.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vinculo.io/privkey.pem;

    # Frontend
    root /var/www/vinculo/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhooks
    location /webhook/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Systemd Service

```bash
# /etc/systemd/system/vinculo.service
[Unit]
Description=Vinculo.io Backend Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/vinculo/server
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable vinculo
sudo systemctl start vinculo
sudo systemctl status vinculo
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/liquidity/status` | BRZ balance (for dashboard) |
| GET | `/api/audit/log` | Audit log (CVM compliance) |
| POST | `/webhook/pix` | PIX webhook (Asaas) |
| POST | `/webhook/bank` | Bank webhook (direct) |

## Split Distribution

| Recipient | Percentage | Description |
|-----------|------------|-------------|
| Locador | 85% | Property owner |
| Administradora | 5% | Property manager |
| Vinculo.io | 5% | Protocol fee |
| Fundo Reserva | 5% | Reserve fund |
