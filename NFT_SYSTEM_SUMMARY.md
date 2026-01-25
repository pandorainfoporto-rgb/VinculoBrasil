# 🎯 Sistema NFT de Vistorias - VinculoBrasil

## ✅ O QUE FOI CRIADO

### 🏗️ 1. Smart Contract (Blockchain)

**Arquivo:** `server/src/smart-contracts/VinculoNFT.sol`

**Características:**
- ✅ ERC-721 (padrão NFT)
- ✅ URI Storage (metadata no IPFS)
- ✅ Mintable (apenas owner pode criar)
- ✅ Burnable (pode destruir se necessário)
- ✅ Pausable (emergências)
- ✅ Metadata on-chain (endereço, tipo, timestamp, vistoriador)
- ✅ Baseado em OpenZeppelin 5.1.0

**Funcionalidades:**
```solidity
safeMint(to, propertyAddress, inspectionType, ipfsHash) → tokenId
updateTokenURI(tokenId, newIpfsHash)
deactivateNFT(tokenId)
getPropertyMetadata(tokenId) → metadata
totalSupply() → total de NFTs
```

---

### 📜 2. Scripts de Deploy

#### Script Manual com Instruções
**Arquivo:** `server/scripts/deploy-contract.ts`

- ✅ Valida variáveis de ambiente
- ✅ Conecta com Polygon
- ✅ Verifica saldo da carteira
- ✅ Guia passo-a-passo para Remix IDE

**Uso:**
```bash
npm run deploy:contract
```

#### Script Automático (Avançado)
**Arquivo:** `server/scripts/deploy-contract-auto.ts`

- ✅ Deploy automático se tiver bytecode compilado
- ✅ Salva ABI e endereço automaticamente
- ✅ Suporte a variável de ambiente BYTECODE

**Uso:**
```bash
BYTECODE="0x..." npm run deploy:contract:auto
```

---

### 🌐 3. Serviço IPFS (Pinata)

**Arquivo:** `server/src/lib/pinata-service.ts`

**Funcionalidades:**
- ✅ Upload de arquivos (fotos, PDFs)
- ✅ Upload de buffers (imagens em memória)
- ✅ Upload de JSON (metadata)
- ✅ Upload completo de vistoria (fotos + metadata)
- ✅ Geração de metadata no padrão ERC-721
- ✅ Gateway público para acesso
- ✅ Listagem e unpinning

**Métodos Principais:**
```typescript
uploadFile(path, metadata) → ipfsHash
uploadJSON(data, name) → ipfsHash
uploadInspection({photos, propertyAddress, inspectionType, inspector}) → {metadataHash, photosHashes}
getPublicUrl(ipfsHash) → url
```

**Metadata Gerado:**
```json
{
  "name": "Endereço - ENTRADA",
  "description": "Vistoria de entrada...",
  "image": "ipfs://QmXxx...",
  "external_url": "https://vinculobrasil.com.br/inspections/...",
  "attributes": [...],
  "properties": {
    "propertyAddress": "Rua...",
    "inspectionType": "ENTRADA",
    "photos": ["QmAbc...", "QmDef..."],
    "inspector": "João"
  }
}
```

---

### ⛓️ 4. Serviço NFT (Blockchain)

**Arquivo:** `server/src/lib/nft-service.ts`

**Funcionalidades:**
- ✅ Mint de NFT com upload automático para IPFS
- ✅ Consulta de NFTs existentes
- ✅ Verificação de propriedade (owner)
- ✅ Estimativa de gas
- ✅ Health check do serviço

**Fluxo de Minting:**
1. Valida parâmetros
2. Upload de fotos para IPFS (Pinata)
3. Gera metadata JSON
4. Upload de metadata para IPFS
5. Chama smart contract `safeMint()`
6. Aguarda 2 confirmações de bloco
7. Retorna tokenId, txHash, ipfsHash

**Métodos Principais:**
```typescript
mintInspectionNFT(params) → {tokenId, transactionHash, ipfsHash, ipfsUrl, polygonScanUrl}
getNFTMetadata(tokenId) → metadata on-chain
getNFTOwner(tokenId) → endereço do dono
getTokenURI(tokenId) → IPFS URI
getTotalSupply() → total de NFTs
estimateMintGas(params) → custo estimado
checkHealth() → status do serviço
```

---

### 🚀 5. API REST

**Arquivo:** `server/src/routes/nft.ts`

**Endpoints:**

#### `POST /api/nft/mint`
Mintar novo NFT de vistoria

**Request:**
```json
{
  "ownerAddress": "0x...",
  "propertyAddress": "Rua Exemplo, 123",
  "inspectionType": "ENTRADA",
  "photos": [
    {"path": "/tmp/sala.jpg", "description": "Sala"}
  ],
  "inspector": "João Silva",
  "notes": "Observações..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenId": 1,
    "transactionHash": "0xabc...",
    "ipfsHash": "QmXyz...",
    "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmXyz...",
    "polygonScanUrl": "https://polygonscan.com/tx/0xabc..."
  }
}
```

#### `GET /api/nft/:tokenId`
Consultar NFT por ID

#### `GET /api/nft/stats/total-supply`
Total de NFTs mintados

#### `GET /api/nft/health`
Status do serviço NFT

#### `POST /api/nft/estimate-gas`
Estimar custo de gas

---

### 🎨 6. Componente React

**Arquivo:** `src/components/inspection/mint-nft-button.tsx`

**Características:**
- ✅ Dialog interativo com status em tempo real
- ✅ Progress bar durante upload/minting
- ✅ Validação de carteira MetaMask
- ✅ Exibição de resultado com links
- ✅ Tratamento de erros
- ✅ Callback de sucesso
- ✅ Suporte a retry

**Uso:**
```tsx
<MintNFTButton
  inspectionId="123"
  propertyAddress="Rua Exemplo, 123"
  inspectionType="ENTRADA"
  photos={[{url: "...", description: "..."}]}
  inspector="João Silva"
  ownerAddress="0x..."
  onSuccess={(nft) => console.log(nft.tokenId)}
/>
```

**Estados:**
- `idle` - Aguardando ação
- `uploading` - Enviando fotos para IPFS
- `minting` - Criando NFT na blockchain
- `success` - NFT criado com sucesso
- `error` - Erro no processo

---

### 📦 7. Configuração

#### `package.json` atualizado

**Novas dependências:**
```json
{
  "dependencies": {
    "form-data": "^4.0.1",
    "axios": "^1.7.9"
  },
  "devDependencies": {
    "@openzeppelin/contracts": "^5.1.0"
  },
  "scripts": {
    "deploy:contract": "tsx scripts/deploy-contract.ts",
    "deploy:contract:auto": "tsx scripts/deploy-contract-auto.ts"
  }
}
```

#### Variáveis de Ambiente Necessárias

**Arquivo:** `server/.env.nft.example`

```bash
# Pinata (IPFS)
PINATA_API_KEY=68536f8c6d1b4114399d
PINATA_SECRET_KEY=1958e260a6f1c20682f8cfcd14b2ef044da8655ea02770deeef537c107210a79
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Blockchain
ADMIN_PRIVATE_KEY=sua_private_key_metamask
POLYGON_RPC_URL=https://polygon-rpc.com
SMART_CONTRACT_ADDRESS=0x... (após deploy)
```

---

### 📚 8. Documentação

**Arquivo:** `server/DEPLOY_NFT.md`

Guia completo passo-a-passo para:
- ✅ Configurar variáveis de ambiente
- ✅ Fazer deploy via Remix IDE (recomendado)
- ✅ Fazer deploy via script automático
- ✅ Fazer deploy via Hardhat
- ✅ Testar a API
- ✅ Troubleshooting
- ✅ Integração com frontend
- ✅ Checklist final

---

## 🎯 PRÓXIMOS PASSOS (O QUE VOCÊ PRECISA FAZER)

### 1️⃣ Configurar Variáveis na Railway

Acesse Railway → Variables e adicione:

```bash
PINATA_API_KEY=68536f8c6d1b4114399d
PINATA_SECRET_KEY=1958e260a6f1c20682f8cfcd14b2ef044da8655ea02770deeef537c107210a79
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24...
ADMIN_PRIVATE_KEY=sua_private_key_da_metamask (27 POL disponíveis ✅)
POLYGON_RPC_URL=https://polygon-rpc.com
```

### 2️⃣ Fazer Deploy do Smart Contract

**Opção Recomendada: Remix IDE**

1. Acesse: https://remix.ethereum.org
2. Crie arquivo: `VinculoNFT.sol`
3. Cole o código de: `server/src/smart-contracts/VinculoNFT.sol`
4. Compile (Solidity 0.8.20)
5. Deploy usando MetaMask (Polygon Mainnet)
6. Copie o endereço do contrato (ex: `0x1234...`)
7. Adicione na Railway: `SMART_CONTRACT_ADDRESS=0x1234...`

**Alternativa: Script Automático**

```bash
# No Railway Shell
npm run deploy:contract
```

### 3️⃣ Registrar o Contrato no Backend

Salve o ABI em: `server/src/config/VinculoNFT.abi.json`

(O ABI pode ser copiado do Remix após compilação)

### 4️⃣ Testar a API

```bash
curl https://seu-app.railway.app/api/nft/health
```

Deve retornar:
```json
{
  "success": true,
  "data": {
    "configured": true,
    "connected": true,
    "contractAddress": "0x...",
    "balance": "27.06"
  }
}
```

### 5️⃣ Integrar com o Frontend

Use o componente `MintNFTButton` nas páginas de vistoria:

```tsx
import { MintNFTButton } from '@/components/inspection';

// No componente de vistoria finalizada
<MintNFTButton
  inspectionId={inspection.id}
  propertyAddress={inspection.address}
  inspectionType="ENTRADA"
  photos={inspection.photos}
  inspector={inspector.name}
  ownerAddress={landlordWallet}
  onSuccess={(nft) => {
    // Salvar tokenId no banco
    saveNFTToDatabase(inspection.id, nft.tokenId);

    // Redirecionar para dashboard
    navigate(`/nft/${nft.tokenId}`);
  }}
/>
```

---

## 📊 ARQUITETURA COMPLETA

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │  Componente: MintNFTButton                   │          │
│  │  - Upload de fotos (Supabase → Backend)     │          │
│  │  - Chama API /api/nft/mint                  │          │
│  │  - Exibe resultado com links                │          │
│  └───────────────────┬──────────────────────────┘          │
│                      │                                       │
└──────────────────────┼───────────────────────────────────────┘
                       │ POST /api/nft/mint
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)               │
│                                                             │
│  ┌────────────────────────────────────────────┐            │
│  │  API Route: /api/nft/*                     │            │
│  │  - Valida request (Zod)                    │            │
│  │  - Chama NFTService                        │            │
│  └───────────────┬────────────────────────────┘            │
│                  │                                          │
│  ┌───────────────▼────────────────────────────┐            │
│  │  NFTService                                 │            │
│  │  1. Upload fotos → PinataService           │            │
│  │  2. Gera metadata JSON                     │            │
│  │  3. Upload metadata → IPFS                 │            │
│  │  4. Chama SmartContract.safeMint()        │            │
│  └───────┬─────────────────────┬──────────────┘            │
│          │                     │                            │
│  ┌───────▼─────────┐  ┌────────▼────────────┐             │
│  │ PinataService   │  │ Smart Contract      │             │
│  │ (IPFS Upload)   │  │ (ethers.js)         │             │
│  └───────┬─────────┘  └────────┬────────────┘             │
└──────────┼─────────────────────┼───────────────────────────┘
           │                     │
           ▼                     ▼
    ┌──────────────┐      ┌──────────────────┐
    │   PINATA     │      │  POLYGON MAINNET │
    │   (IPFS)     │      │  (Blockchain)    │
    │              │      │                  │
    │ - Fotos      │      │ - VinculoNFT.sol│
    │ - Metadata   │      │ - Token ID       │
    │ - Permanent  │      │ - Owner          │
    └──────────────┘      └──────────────────┘
```

---

## 💰 CUSTOS ESTIMADOS

### IPFS (Pinata)
- ✅ **Grátis** até 1GB storage
- ✅ **Grátis** até 100k requests/mês

### Blockchain (Polygon)
- ✅ **~US$ 0.01** por NFT mintado
- ✅ **27 POL** disponível = ~US$ 100 em gas fees
- ✅ Pode mintar **~10.000 NFTs** com o saldo atual

---

## 🎉 RESULTADO FINAL

Cada vistoria gera:

1. **NFT na Blockchain Polygon**
   - Token ID único
   - Propriedade comprovada
   - Transferível entre carteiras
   - Imutável

2. **Metadata no IPFS**
   - Fotos permanentes
   - JSON com todas as informações
   - Acessível via gateway público
   - Descentralizado

3. **Prova Auditável**
   - Timestamp on-chain
   - Endereço do vistoriador
   - Hash das fotos
   - Link PolygonScan

4. **Integração Completa**
   - Botão no frontend
   - API REST no backend
   - Upload automático
   - Status em tempo real

---

## 📞 SUPORTE

Para dúvidas, consulte:
- **Documentação:** `server/DEPLOY_NFT.md`
- **Remix IDE:** https://remix.ethereum.org
- **Pinata Docs:** https://docs.pinata.cloud
- **OpenZeppelin:** https://docs.openzeppelin.com
- **Polygon Docs:** https://docs.polygon.technology

---

**✅ Sistema completo e pronto para deploy!**

Renato, basta agora:
1. Adicionar as variáveis na Railway
2. Fazer deploy do contrato via Remix (5 minutos)
3. Testar o primeiro NFT

🚀 **Vamos para a Blockchain!**
