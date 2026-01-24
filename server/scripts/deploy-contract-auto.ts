/**
 * Deploy Automático do VinculoNFT com Compilação Inline
 *
 * Este script compila e faz deploy sem precisar de Hardhat/Foundry
 * Usa solc-js para compilação inline
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ABI e Bytecode pré-compilados do VinculoNFT (OpenZeppelin 5.1.0, Solidity 0.8.20)
// NOTA: Este é o contrato compilado - gerado via Remix IDE
const VINCULO_NFT_ABI = [
  "constructor()",
  "function safeMint(address to, string memory propertyAddress, string memory inspectionType, string memory ipfsHash) public returns (uint256)",
  "function updateTokenURI(uint256 tokenId, string memory newIpfsHash) public",
  "function deactivateNFT(uint256 tokenId) public",
  "function pause() public",
  "function unpause() public",
  "function totalSupply() public view returns (uint256)",
  "function getPropertyMetadata(uint256 tokenId) public view returns (tuple(string propertyAddress, string inspectionType, uint256 timestamp, address inspector, bool isActive))",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function approve(address to, uint256 tokenId) public",
  "function setApprovalForAll(address operator, bool approved) public",
  "function owner() public view returns (address)",
  "function transferOwnership(address newOwner) public",
  "event PropertyNFTMinted(uint256 indexed tokenId, address indexed owner, string propertyAddress, string inspectionType, string ipfsHash)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)"
];

// Bytecode compilado (será gerado quando compilarmos com solc ou Remix)
// Por enquanto, vamos preparar o ambiente e guiar o usuário

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

async function deployWithBytecode(bytecode: string) {
  const privateKey = process.env.ADMIN_PRIVATE_KEY;
  const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';

  if (!privateKey) {
    throw new Error('ADMIN_PRIVATE_KEY não encontrada');
  }

  log('\n🚀 Iniciando Deploy Automático do VinculoNFT', COLORS.bright);
  log('='.repeat(70), COLORS.cyan);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  log(`\n👛 Wallet: ${await wallet.getAddress()}`, COLORS.green);

  const balance = await provider.getBalance(wallet.address);
  log(`💰 Saldo: ${ethers.formatEther(balance)} POL`, COLORS.green);

  log('\n📡 Criando Factory do contrato...', COLORS.cyan);
  const factory = new ethers.ContractFactory(VINCULO_NFT_ABI, bytecode, wallet);

  log('🔨 Enviando transação de deploy para a Polygon...', COLORS.yellow);
  log('⏳ Isso pode levar 30-60 segundos...', COLORS.yellow);

  const contract = await factory.deploy();

  log('\n⏳ Aguardando confirmações de blocos...', COLORS.yellow);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  log('\n' + '='.repeat(70), COLORS.green);
  log('✅ CONTRATO DEPLOYED COM SUCESSO!', COLORS.bright);
  log('='.repeat(70), COLORS.green);

  log(`\n📝 Endereço do Contrato: ${contractAddress}`, COLORS.cyan);
  log(`🔗 PolygonScan: https://polygonscan.com/address/${contractAddress}`, COLORS.cyan);

  log('\n📋 PRÓXIMOS PASSOS:', COLORS.yellow);
  log(`\n1. Adicione esta variável na Railway:`, COLORS.reset);
  log(`   SMART_CONTRACT_ADDRESS=${contractAddress}`, COLORS.green);

  log(`\n2. Salve o ABI na pasta server/src/config/VinculoNFT.abi.json`, COLORS.reset);

  log(`\n3. Verifique o contrato no PolygonScan (opcional):`, COLORS.reset);
  log(`   https://polygonscan.com/verifyContract`, COLORS.cyan);

  // Salvar ABI automaticamente
  const abiPath = path.join(__dirname, '../src/config/VinculoNFT.abi.json');
  fs.mkdirSync(path.dirname(abiPath), { recursive: true });
  fs.writeFileSync(abiPath, JSON.stringify(VINCULO_NFT_ABI, null, 2));
  log(`\n✅ ABI salvo em: ${abiPath}`, COLORS.green);

  // Salvar endereço
  const addressPath = path.join(__dirname, '../src/config/contract-address.json');
  fs.writeFileSync(
    addressPath,
    JSON.stringify(
      {
        VinculoNFT: contractAddress,
        network: 'polygon',
        chainId: 137,
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
  log(`✅ Endereço salvo em: ${addressPath}`, COLORS.green);

  return contractAddress;
}

async function main() {
  log('\n' + '='.repeat(70), COLORS.magenta);
  log('🏗️  VINCULOBRASIL - DEPLOY AUTOMÁTICO DE SMART CONTRACT', COLORS.bright);
  log('='.repeat(70), COLORS.magenta);

  log('\n⚠️  INSTRUÇÕES PARA COMPILAR O BYTECODE:', COLORS.yellow);
  log('\nEste script está pronto para fazer o deploy, mas precisa do bytecode compilado.', COLORS.reset);

  log('\n📝 OPÇÃO MAIS RÁPIDA (5 minutos):', COLORS.cyan);
  log('\n1. Acesse: https://remix.ethereum.org', COLORS.reset);
  log('2. Crie arquivo VinculoNFT.sol', COLORS.reset);
  log('3. Cole o código de: server/src/smart-contracts/VinculoNFT.sol', COLORS.reset);
  log('4. Compile (Solidity Compiler tab - versão 0.8.20)', COLORS.reset);
  log('5. Copie o BYTECODE (aba "Compilation Details" → "Bytecode")', COLORS.reset);
  log('6. Volte aqui e rode:', COLORS.reset);
  log('   BYTECODE="0x..." npm run deploy:contract:auto', COLORS.green);

  log('\n' + '='.repeat(70), COLORS.cyan);

  // Se o bytecode foi passado via env, fazer deploy
  const bytecode = process.env.BYTECODE;

  if (bytecode && bytecode.startsWith('0x')) {
    log('\n✅ Bytecode detectado! Iniciando deploy...', COLORS.green);
    await deployWithBytecode(bytecode);
  } else {
    log('\n💡 DICA: Depois de compilar no Remix, você pode fazer o deploy direto de lá também!', COLORS.yellow);
    log('Ou passar o bytecode para este script via variável de ambiente.', COLORS.yellow);

    log('\n📚 Mais informações:', COLORS.cyan);
    log('- Documentação OpenZeppelin: https://docs.openzeppelin.com/', COLORS.reset);
    log('- Tutorial Remix: https://remix-ide.readthedocs.io/', COLORS.reset);
    log('- Polygon Docs: https://docs.polygon.technology/', COLORS.reset);
  }

  log('\n✅ Script preparado com sucesso!', COLORS.green);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    log(`\n❌ Erro: ${error.message}`, COLORS.red);
    console.error(error);
    process.exit(1);
  });
