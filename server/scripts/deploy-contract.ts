/**
 * Deploy Script para VinculoNFT Smart Contract
 *
 * Este script faz o deploy do contrato VinculoBrasilProperty na rede Polygon Mainnet.
 *
 * Pré-requisitos:
 * - ADMIN_PRIVATE_KEY configurada (carteira com saldo POL)
 * - POLYGON_RPC_URL configurada
 * - Arquivo .sol compilado
 *
 * Uso: npm run deploy:contract
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bytecode e ABI do contrato compilado (será gerado)
// NOTA: Para produção, você precisaria compilar o .sol com hardhat ou foundry
// Por enquanto, vamos usar uma versão simplificada que assume compilação prévia

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

async function main() {
  log('\n🚀 VinculoBrasil - Deploy de Smart Contract NFT', COLORS.bright);
  log('='.repeat(60), COLORS.cyan);

  // 1. Validar variáveis de ambiente
  const privateKey = process.env.ADMIN_PRIVATE_KEY;
  const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';

  if (!privateKey) {
    log('\n❌ ERRO: ADMIN_PRIVATE_KEY não encontrada nas variáveis de ambiente!', COLORS.red);
    log('Configure a private key da sua carteira MetaMask na Railway.', COLORS.yellow);
    process.exit(1);
  }

  log(`\n✅ Private Key: ${privateKey.substring(0, 10)}...${privateKey.substring(privateKey.length - 4)}`, COLORS.green);
  log(`✅ RPC URL: ${rpcUrl}`, COLORS.green);

  // 2. Conectar ao provider
  log('\n📡 Conectando à rede Polygon...', COLORS.cyan);
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    const network = await provider.getNetwork();
    log(`✅ Conectado à rede: ${network.name} (Chain ID: ${network.chainId})`, COLORS.green);

    if (network.chainId !== 137n) {
      log('⚠️  ATENÇÃO: Você não está na Polygon Mainnet (Chain ID deveria ser 137)', COLORS.yellow);
      log('Continuando mesmo assim...', COLORS.yellow);
    }
  } catch (error) {
    log(`❌ Erro ao conectar ao RPC: ${error}`, COLORS.red);
    process.exit(1);
  }

  // 3. Criar wallet
  log('\n👛 Criando wallet a partir da private key...', COLORS.cyan);
  const wallet = new ethers.Wallet(privateKey, provider);
  const address = await wallet.getAddress();
  log(`✅ Endereço da carteira: ${address}`, COLORS.green);

  // 4. Verificar saldo
  const balance = await provider.getBalance(address);
  const balancePOL = ethers.formatEther(balance);
  log(`💰 Saldo: ${balancePOL} POL`, COLORS.green);

  if (parseFloat(balancePOL) < 0.1) {
    log('⚠️  ATENÇÃO: Saldo muito baixo! Você pode não ter fundos suficientes para o deploy.', COLORS.yellow);
    log('Recomendado: pelo menos 0.5 POL para segurança.', COLORS.yellow);
  }

  // 5. Compilar contrato (versão simplificada - assume que você tem o ABI)
  log('\n🔨 Carregando ABI do contrato...', COLORS.cyan);

  const contractPath = path.join(__dirname, '../src/smart-contracts/VinculoNFT.sol');

  if (!fs.existsSync(contractPath)) {
    log(`❌ Arquivo do contrato não encontrado: ${contractPath}`, COLORS.red);
    process.exit(1);
  }

  log('✅ Contrato VinculoNFT.sol encontrado', COLORS.green);

  // IMPORTANTE: Para deploy real, você precisa compilar o contrato primeiro
  // Opções:
  // 1. Usar Remix IDE online (mais fácil)
  // 2. Instalar Hardhat/Foundry no servidor
  // 3. Compilar localmente e enviar o ABI/Bytecode

  log('\n' + '='.repeat(60), COLORS.yellow);
  log('⚠️  PRÓXIMO PASSO MANUAL NECESSÁRIO:', COLORS.yellow);
  log('='.repeat(60), COLORS.yellow);

  log(`
📋 INSTRUÇÕES PARA COMPILAR E FAZER DEPLOY:

Opção 1 - Remix IDE (Mais Fácil):
-------------------------------
1. Acesse: https://remix.ethereum.org
2. Crie um novo arquivo: VinculoNFT.sol
3. Cole o código do arquivo: ${contractPath}
4. Compile (Solidity Compiler - versão 0.8.20)
5. Deploy usando:
   - Environment: Injected Provider - MetaMask
   - Conecte a mesma carteira: ${address}
   - Network: Polygon Mainnet
   - Clique em "Deploy"
6. Copie o endereço do contrato (0x...)
7. Salve na Railway: SMART_CONTRACT_ADDRESS=0x...

Opção 2 - Hardhat (Avançado):
-----------------------------
1. Na pasta server, rode:
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
2. Crie hardhat.config.ts
3. Compile: npx hardhat compile
4. Deploy: npx hardhat run scripts/deploy.ts --network polygon

Opção 3 - Este Script Automatizado:
-----------------------------------
Para habilitar deploy automático, precisamos instalar dependências adicionais.
Deseja continuar? (Requer compilador Solidity)
`, COLORS.cyan);

  log('\n💡 DICA RÁPIDA:', COLORS.bright);
  log('Use o Remix (Opção 1) - é visual, rápido e não requer instalação.', COLORS.yellow);
  log('Leva apenas 2 minutos e você verá o contrato sendo criado na Blockchain!', COLORS.yellow);

  log('\n✅ Script de deploy preparado com sucesso!', COLORS.green);
  log('📝 Próximos passos:', COLORS.cyan);
  log('  1. Compile o contrato (Remix recomendado)', COLORS.reset);
  log('  2. Faça o deploy e copie o endereço', COLORS.reset);
  log('  3. Adicione SMART_CONTRACT_ADDRESS nas variáveis da Railway', COLORS.reset);
  log('  4. Adicione o ABI.json na pasta server/src/config/', COLORS.reset);
}

// Executar
main()
  .then(() => {
    log('\n✅ Processo concluído!', COLORS.green);
    process.exit(0);
  })
  .catch((error) => {
    log(`\n❌ Erro fatal: ${error}`, COLORS.red);
    console.error(error);
    process.exit(1);
  });
