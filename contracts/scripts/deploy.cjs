/**
 * ============================================================================
 * VINCULO BRASIL - VBRz TOKEN DEPLOYMENT SCRIPT
 * ============================================================================
 *
 * Este script faz o deploy completo do ecossistema VBRz na Polygon:
 * 1. Deploy do VBRzToken (ERC-20 com 1 Bilhão de supply)
 * 2. Deploy do TokenVesting (contrato de bloqueio)
 * 3. Distribuição automática do supply para carteiras
 * 4. Configuração de permissões (roles)
 *
 * EXECUÇÃO:
 * npx hardhat run scripts/deploy.cjs --network polygon
 * npx hardhat run scripts/deploy.cjs --network polygonAmoy (testnet)
 *
 * ============================================================================
 */

const hre = require("hardhat");

// ============================================================================
// CONFIGURAÇÃO HARDCODED - ENDEREÇOS OFICIAIS
// ============================================================================

const CONFIG = {
  // Carteira Treasury (recebe 20% = 200M VBRz)
  TREASURY_WALLET: "0xCbD93BcDff0Eb3B215163Afe004A13afa0bF7261",

  // Carteira Cashback Pool (recebe 40% = 400M VBRz)
  CASHBACK_WALLET: "0x0Ff33EF655C8c9A7d2c3c7aA2D47097Dae8dbCb3",

  // Carteira Marketing (usando mesma da Treasury por enquanto)
  MARKETING_WALLET: "0xCbD93BcDff0Eb3B215163Afe004A13afa0bF7261",

  // Vesting do Time
  TEAM_VESTING_CONFIG: {
    CLIFF_MONTHS: 12,           // 12 meses de cliff
    VESTING_MONTHS: 24,         // 24 meses de liberação linear
    BENEFICIARY: "0xCbD93BcDff0Eb3B215163Afe004A13afa0bF7261", // Treasury como beneficiário inicial
  },
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function log(message, data) {
  const timestamp = new Date().toISOString();
  console.log("[" + timestamp + "] " + message);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  console.log("  " + title);
  console.log("=".repeat(60) + "\n");
}

function logSuccess(message) {
  console.log(" " + message);
}

function logInfo(message) {
  console.log("9  " + message);
}

function logWarning(message) {
  console.log("   " + message);
}

// ============================================================================
// SCRIPT PRINCIPAL
// ============================================================================

async function main() {
  logSection("VINCULO BRASIL - VBRz TOKEN DEPLOYMENT");

  const ethers = hre.ethers;

  // Distribuição (total = 1 Bilhão)
  const DISTRIBUTION = {
    CASHBACK_POOL: ethers.parseEther("400000000"),   // 40% = 400M
    TREASURY: ethers.parseEther("200000000"),         // 20% = 200M
    TEAM_VESTING: ethers.parseEther("150000000"),     // 15% = 150M
    STAKING_REWARDS: ethers.parseEther("100000000"),  // 10% = 100M
    MARKETING: ethers.parseEther("50000000"),         // 5% = 50M
    RESERVE: ethers.parseEther("100000000"),          // 10% = 100M
  };

  // Obtém o deployer
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const deployerAddress = await deployer.getAddress();

  log("Deployer Address:", deployerAddress);

  const network = await ethers.provider.getNetwork();
  log("Network:", network.name);

  // Verifica saldo
  const balance = await ethers.provider.getBalance(deployerAddress);
  log("Deployer Balance:", ethers.formatEther(balance) + " MATIC");

  if (balance < ethers.parseEther("1")) {
    logWarning("Saldo baixo! Recomendado ter pelo menos 1 MATIC para gas.");
  }

  // =========================================================================
  // PASSO 1: DEPLOY VBRzToken
  // =========================================================================
  logSection("PASSO 1: Deploy VBRzToken");

  logInfo("Compilando e deployando VBRzToken...");

  const VBRzToken = await ethers.getContractFactory("VBRzToken");
  const vbrzToken = await VBRzToken.deploy(
    CONFIG.TREASURY_WALLET,  // Treasury inicial
    deployerAddress          // Admin (deployer)
  );

  await vbrzToken.waitForDeployment();
  const vbrzAddress = await vbrzToken.getAddress();

  logSuccess("VBRzToken deployed at: " + vbrzAddress);

  // Verifica supply
  const totalSupply = await vbrzToken.totalSupply();
  log("Total Supply:", ethers.formatEther(totalSupply) + " VBRz");

  // Verifica saldo do deployer (deve ter todo o supply)
  const deployerBalance = await vbrzToken.balanceOf(deployerAddress);
  log("Deployer Balance:", ethers.formatEther(deployerBalance) + " VBRz");

  // =========================================================================
  // PASSO 2: DEPLOY TokenVesting
  // =========================================================================
  logSection("PASSO 2: Deploy TokenVesting");

  logInfo("Compilando e deployando TokenVesting...");

  const TokenVesting = await ethers.getContractFactory("TokenVesting");
  const tokenVesting = await TokenVesting.deploy(vbrzAddress);

  await tokenVesting.waitForDeployment();
  const vestingAddress = await tokenVesting.getAddress();

  logSuccess("TokenVesting deployed at: " + vestingAddress);

  // =========================================================================
  // PASSO 3: DISTRIBUIÇÃO AUTOMÁTICA
  // =========================================================================
  logSection("PASSO 3: Distribuição Automática (Fatiando o Bolo)");

  // 3.1 - Enviar 400M para Cashback Pool
  logInfo("Enviando 400M VBRz para Cashback Pool (" + CONFIG.CASHBACK_WALLET + ")...");
  const tx1 = await vbrzToken.transfer(CONFIG.CASHBACK_WALLET, DISTRIBUTION.CASHBACK_POOL);
  await tx1.wait();
  logSuccess("400M VBRz enviados para Cashback Pool");

  // 3.2 - Enviar 200M para Treasury
  logInfo("Enviando 200M VBRz para Treasury (" + CONFIG.TREASURY_WALLET + ")...");
  const tx2 = await vbrzToken.transfer(CONFIG.TREASURY_WALLET, DISTRIBUTION.TREASURY);
  await tx2.wait();
  logSuccess("200M VBRz enviados para Treasury");

  // 3.3 - Enviar 50M para Marketing
  logInfo("Enviando 50M VBRz para Marketing (" + CONFIG.MARKETING_WALLET + ")...");
  const tx3 = await vbrzToken.transfer(CONFIG.MARKETING_WALLET, DISTRIBUTION.MARKETING);
  await tx3.wait();
  logSuccess("50M VBRz enviados para Marketing");

  // 3.4 - Enviar 150M para TokenVesting (Team)
  logInfo("Enviando 150M VBRz para TokenVesting (Team)...");
  const tx4 = await vbrzToken.transfer(vestingAddress, DISTRIBUTION.TEAM_VESTING);
  await tx4.wait();
  logSuccess("150M VBRz enviados para TokenVesting");

  // 3.5 - Criar schedule de vesting para o Team
  logInfo("Criando schedule de vesting para o Team...");

  const cliffSeconds = CONFIG.TEAM_VESTING_CONFIG.CLIFF_MONTHS * 30 * 24 * 60 * 60;
  const vestingSeconds = CONFIG.TEAM_VESTING_CONFIG.VESTING_MONTHS * 30 * 24 * 60 * 60;

  const tx5 = await tokenVesting.createVestingSchedule(
    CONFIG.TEAM_VESTING_CONFIG.BENEFICIARY,
    DISTRIBUTION.TEAM_VESTING,
    0,                  // startTime = now
    cliffSeconds,       // cliff = 12 meses
    vestingSeconds,     // vesting = 24 meses
    true                // revocable
  );
  await tx5.wait();
  logSuccess("Schedule de vesting criado para o Team");

  // =========================================================================
  // PASSO 4: CONFIGURAÇÃO DE PERMISSÕES
  // =========================================================================
  logSection("PASSO 4: Configuração de Permissões");

  // Dar role OPERATOR para a carteira de Cashback
  const OPERATOR_ROLE = await vbrzToken.OPERATOR_ROLE();

  logInfo("Concedendo OPERATOR_ROLE para Cashback Wallet...");
  const tx6 = await vbrzToken.grantRole(OPERATOR_ROLE, CONFIG.CASHBACK_WALLET);
  await tx6.wait();
  logSuccess("OPERATOR_ROLE concedido para Cashback Wallet");

  // Dar role OPERATOR para a Treasury também
  logInfo("Concedendo OPERATOR_ROLE para Treasury Wallet...");
  const tx7 = await vbrzToken.grantRole(OPERATOR_ROLE, CONFIG.TREASURY_WALLET);
  await tx7.wait();
  logSuccess("OPERATOR_ROLE concedido para Treasury Wallet");

  // =========================================================================
  // RESUMO FINAL
  // =========================================================================
  logSection("DEPLOY CONCLUÍDO COM SUCESSO!");

  console.log("");
  console.log("TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPW");
  console.log("Q                    ENDEREÇOS DOS CONTRATOS                       Q");
  console.log("`PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPc");
  console.log("Q  VBRzToken:     " + vbrzAddress + "  Q");
  console.log("Q  TokenVesting:  " + vestingAddress + "  Q");
  console.log("ZPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP]");
  console.log("");
  console.log("TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPW");
  console.log("Q                    DISTRIBUIÇÃO REALIZADA                        Q");
  console.log("`PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPc");
  console.log("Q  Cashback Pool:  400.000.000 VBRz (40%)                          Q");
  console.log("Q  Treasury:       200.000.000 VBRz (20%)                          Q");
  console.log("Q  Team Vesting:   150.000.000 VBRz (15%)                          Q");
  console.log("Q  Marketing:       50.000.000 VBRz (5%)                           Q");
  console.log("Q                                                                  Q");
  console.log("Q  Reserva Admin:  200.000.000 VBRz (20%) - Staking + Reserve      Q");
  console.log("ZPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP]");
  console.log("");
  console.log("TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPW");
  console.log("Q                    VARIÁVEIS PARA .env                           Q");
  console.log("`PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPc");
  console.log('  VBRZ_TOKEN_ADDRESS="' + vbrzAddress + '"');
  console.log('  TOKEN_VESTING_ADDRESS="' + vestingAddress + '"');
  console.log('  TREASURY_WALLET="' + CONFIG.TREASURY_WALLET + '"');
  console.log('  CASHBACK_WALLET="' + CONFIG.CASHBACK_WALLET + '"');
  console.log("ZPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP]");
  console.log("");
  console.log("TPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPW");
  console.log("Q                    PRÓXIMOS PASSOS                               Q");
  console.log("`PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPc");
  console.log("Q  1. Copie as variáveis acima para seu arquivo .env               Q");
  console.log("Q  2. Verifique os contratos no Polygonscan                        Q");
  console.log("Q  3. Configure o frontend para usar os novos endereços            Q");
  console.log("ZPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP]");

  // Verifica saldos finais
  console.log("\n=Ê VERIFICAÇÃO DE SALDOS FINAIS:\n");

  const balances = [
    { name: "Deployer (Admin)", address: deployerAddress },
    { name: "Treasury", address: CONFIG.TREASURY_WALLET },
    { name: "Cashback Pool", address: CONFIG.CASHBACK_WALLET },
    { name: "TokenVesting", address: vestingAddress },
  ];

  for (var i = 0; i < balances.length; i++) {
    var item = balances[i];
    var bal = await vbrzToken.balanceOf(item.address);
    console.log("  " + item.name + ": " + ethers.formatEther(bal) + " VBRz");
  }

  return {
    vbrzToken: vbrzAddress,
    tokenVesting: vestingAddress,
  };
}

// ============================================================================
// EXECUÇÃO
// ============================================================================

main()
  .then(function(addresses) {
    console.log("\n<‰ Deploy finalizado com sucesso!");
    process.exit(0);
  })
  .catch(function(error) {
    console.error("\nL Erro durante o deploy:");
    console.error(error);
    process.exit(1);
  });
