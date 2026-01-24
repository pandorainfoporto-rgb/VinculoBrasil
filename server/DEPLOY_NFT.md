# 🚀 Deploy do Smart Contract VinculoNFT

## Guia Completo para Ativar o Sistema de NFTs de Vistoria

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ **Conta Pinata configurada** (IPFS)
- ✅ **Carteira MetaMask** com saldo POL (Polygon)
- ✅ **Variáveis de ambiente** configuradas na Railway

---

## 🔑 Passo 1: Configurar Variáveis de Ambiente (Railway)

Vá em **Railway** → **Seu Projeto** → **Variables** e adicione:

### Variáveis Pinata (IPFS)
```bash
PINATA_API_KEY=68536f8c6d1b4114399d
PINATA_SECRET_KEY=1958e260a6f1c20682f8cfcd14b2ef044da8655ea02770deeef537c107210a79
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24...
```

### Variáveis Blockchain
```bash
ADMIN_PRIVATE_KEY=sua_private_key_da_metamask
POLYGON_RPC_URL=https://polygon-rpc.com
```

**⚠️ IMPORTANTE:**
- A ADMIN_PRIVATE_KEY é a chave privada da sua MetaMask (nunca compartilhe!)
- Para obter: MetaMask → Configurações → Segurança → Revelar chave privada
- Certifique-se de ter pelo menos **0.5 POL** de saldo nessa carteira

---

## 🏗️ Passo 2: Compilar e Fazer Deploy do Contrato

Você tem **3 opções** para fazer o deploy:

### **OPÇÃO 1: Remix IDE (Recomendado - Mais Fácil)** ⭐

1. **Acesse:** https://remix.ethereum.org

2. **Crie um novo arquivo:**
   - File Explorer → Criar arquivo: `VinculoNFT.sol`

3. **Cole o código do contrato:**
   - Copie todo o conteúdo de: `server/src/smart-contracts/VinculoNFT.sol`
   - Cole no Remix

4. **Compile:**
   - Aba **Solidity Compiler**
   - Selecione versão: `0.8.20`
   - Clique em **Compile VinculoNFT.sol**

5. **Deploy:**
   - Aba **Deploy & Run Transactions**
   - Environment: `Injected Provider - MetaMask`
   - Conecte sua MetaMask (selecione a mesma conta com saldo POL)
   - Network: **Polygon Mainnet** (Chain ID 137)
   - Clique em **Deploy**
   - Confirme a transação na MetaMask

6. **Copie o endereço do contrato:**
   - Após o deploy, copie o endereço (ex: `0x1234...5678`)
   - Salve na Railway: `SMART_CONTRACT_ADDRESS=0x1234...5678`

7. **Salve o ABI:**
   - No Remix, aba **Compiler**
   - Clique em **ABI** (copiar)
   - Cole em: `server/src/config/VinculoNFT.abi.json`

---

### **OPÇÃO 2: Script Automático (Railway Shell)**

1. **Abra o Shell da Railway:**
   - Railway Dashboard → Seu projeto → Shell (ícone de terminal)

2. **Rode o comando de deploy:**
   ```bash
   npm run deploy:contract
   ```

3. **Siga as instruções no terminal**

4. **Copie o endereço do contrato** exibido no final

5. **Adicione nas variáveis:**
   ```bash
   SMART_CONTRACT_ADDRESS=0x...
   ```

---

### **OPÇÃO 3: Hardhat (Avançado)**

Se você preferir usar Hardhat:

1. **Instale dependências:**
   ```bash
   cd server
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Configure Hardhat:**
   ```bash
   npx hardhat init
   ```

3. **Crie `hardhat.config.ts`:**
   ```typescript
   import { HardhatUserConfig } from "hardhat/config";
   import "@nomicfoundation/hardhat-toolbox";
   import * as dotenv from "dotenv";

   dotenv.config();

   const config: HardhatUserConfig = {
     solidity: "0.8.20",
     networks: {
       polygon: {
         url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
         accounts: [process.env.ADMIN_PRIVATE_KEY!],
       },
     },
   };

   export default config;
   ```

4. **Deploy:**
   ```bash
   npx hardhat run scripts/deploy.ts --network polygon
   ```

---

## ✅ Passo 3: Verificar se Funcionou

1. **Teste a API de health:**
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

2. **Verifique no PolygonScan:**
   - Acesse: https://polygonscan.com/address/SEU_ENDERECO_DO_CONTRATO
   - Você deve ver o contrato criado

---

## 🎯 Passo 4: Testar o Minting de NFT

### Via API (Postman/Thunder Client):

**Endpoint:** `POST https://seu-app.railway.app/api/nft/mint`

**Body (JSON):**
```json
{
  "ownerAddress": "0xSuaCarteiraMetaMask",
  "propertyAddress": "Rua Exemplo, 123 - Cuiabá/MT",
  "inspectionType": "ENTRADA",
  "photos": [
    {
      "path": "/tmp/vistoria/sala.jpg",
      "description": "Sala de estar"
    },
    {
      "path": "/tmp/vistoria/cozinha.jpg",
      "description": "Cozinha"
    }
  ],
  "inspector": "João Silva",
  "notes": "Vistoria de entrada - imóvel em bom estado"
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "NFT minted successfully",
  "data": {
    "tokenId": 1,
    "transactionHash": "0xabc123...",
    "ipfsHash": "QmXyz...",
    "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmXyz...",
    "polygonScanUrl": "https://polygonscan.com/tx/0xabc123..."
  }
}
```

---

## 🔧 Troubleshooting

### Erro: "ADMIN_PRIVATE_KEY not configured"
- ✅ Certifique-se de ter adicionado a variável na Railway
- ✅ Faça um redeploy após adicionar variáveis

### Erro: "insufficient funds"
- ✅ Verifique se sua carteira tem saldo POL
- ✅ Mínimo recomendado: 0.5 POL

### Erro: "Contract not initialized"
- ✅ Verifique se `SMART_CONTRACT_ADDRESS` está configurado
- ✅ Verifique se o endereço é válido (começa com 0x)

### Erro: "Pinata authentication failed"
- ✅ Verifique as chaves do Pinata
- ✅ Teste: `curl -X GET "https://api.pinata.cloud/data/testAuthentication" -H "Authorization: Bearer SEU_JWT"`

---

## 📚 Próximos Passos

Após o deploy bem-sucedido:

1. **Integre com o Frontend:**
   - Adicione botão "Gerar NFT" no componente de vistoria
   - Chame a API `/api/nft/mint`

2. **Adicione Webhook de Vistoria:**
   - Quando vistoria for finalizada → Mintar NFT automaticamente
   - Armazenar `tokenId` no banco de dados

3. **Exiba NFT no Dashboard:**
   - Mostre o PolygonScan link
   - Mostre as fotos do IPFS
   - Permita download do laudo

---

## 🎓 Links Úteis

- **Remix IDE:** https://remix.ethereum.org
- **PolygonScan:** https://polygonscan.com
- **Pinata:** https://app.pinata.cloud
- **OpenZeppelin Docs:** https://docs.openzeppelin.com/contracts/5.x/
- **Polygon Docs:** https://docs.polygon.technology

---

## ✅ Checklist Final

- [ ] Variáveis Pinata configuradas na Railway
- [ ] ADMIN_PRIVATE_KEY configurada na Railway
- [ ] Carteira com saldo POL (>= 0.5)
- [ ] Contrato deployado via Remix
- [ ] SMART_CONTRACT_ADDRESS salvo na Railway
- [ ] ABI salvo em `server/src/config/VinculoNFT.abi.json`
- [ ] API `/api/nft/health` retorna `configured: true`
- [ ] Teste de mint funcionou
- [ ] PolygonScan mostra o contrato

---

**🎉 Parabéns! Seu sistema de NFTs de Vistoria está pronto!**

Agora cada vistoria criará um NFT permanente na Polygon com todas as fotos armazenadas no IPFS.
