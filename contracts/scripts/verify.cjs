/**
 * ============================================================================
 * VINCULO BRASIL - CONTRACT VERIFICATION SCRIPT
 * ============================================================================
 *
 * Este script verifica os contratos no Polygonscan após o deploy.
 *
 * EXECUÇÃO:
 * npx hardhat run scripts/verify.cjs --network polygon
 * npx hardhat run scripts/verify.cjs --network polygonAmoy
 *
 * IMPORTANTE: Antes de rodar, preencha os endereços abaixo ou use variáveis de ambiente.
 *
 * ============================================================================
 */

const hre = require("hardhat");

// ============================================================================
// CONFIGURAÇÃO - PREENCHA APÓS O DEPLOY
// ============================================================================

const CONTRACTS = {
  // Endereço do VBRzToken (preencha após deploy)
  VBRZ_TOKEN: process.env.VBRZ_TOKEN_ADDRESS || "",

  // Endereço do TokenVesting (preencha após deploy)
  TOKEN_VESTING: process.env.TOKEN_VESTING_ADDRESS || "",
};

// Argumentos usados no deploy
const CONSTRUCTOR_ARGS = {
  // VBRzToken(treasuryWallet, admin)
  VBRZ_TOKEN: [
    "0xCbD93BcDff0Eb3B215163Afe004A13afa0bF7261", // Treasury
    "", // Admin (será preenchido com o deployer)
  ],

  // TokenVesting(tokenAddress)
  TOKEN_VESTING: [
    CONTRACTS.VBRZ_TOKEN, // VBRz Token address
  ],
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  console.log("  " + title);
  console.log("=".repeat(60) + "\n");
}

function logSuccess(message) {
  console.log(" " + message);
}

function logError(message) {
  console.log("L " + message);
}

function logInfo(message) {
  console.log("9  " + message);
}

async function verifyContract(name, address, constructorArgs) {
  if (!address) {
    logError(name + ": Endereço não fornecido. Pulando...");
    return false;
  }

  logInfo("Verificando " + name + " em " + address + "...");

  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });
    logSuccess(name + " verificado com sucesso!");
    return true;
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      logSuccess(name + " já estava verificado.");
      return true;
    }
    logError(name + ": " + error.message);
    return false;
  }
}

// ============================================================================
// SCRIPT PRINCIPAL
// ============================================================================

async function main() {
  logSection("VINCULO BRASIL - CONTRACT VERIFICATION");

  const network = await hre.ethers.provider.getNetwork();
  console.log("Network: " + network.name);
  console.log("Chain ID: " + network.chainId);

  // Obtém o deployer para usar como argumento do construtor
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  const deployerAddress = await deployer.getAddress();

  // Atualiza o argumento do admin com o deployer
  CONSTRUCTOR_ARGS.VBRZ_TOKEN[1] = deployerAddress;

  console.log("\nContratos a verificar:");
  console.log("  VBRzToken:     " + (CONTRACTS.VBRZ_TOKEN || "(não configurado)"));
  console.log("  TokenVesting:  " + (CONTRACTS.TOKEN_VESTING || "(não configurado)"));

  // Verifica VBRzToken
  logSection("1. Verificando VBRzToken");
  await verifyContract(
    "VBRzToken",
    CONTRACTS.VBRZ_TOKEN,
    CONSTRUCTOR_ARGS.VBRZ_TOKEN
  );

  // Verifica TokenVesting
  logSection("2. Verificando TokenVesting");
  CONSTRUCTOR_ARGS.TOKEN_VESTING[0] = CONTRACTS.VBRZ_TOKEN;
  await verifyContract(
    "TokenVesting",
    CONTRACTS.TOKEN_VESTING,
    CONSTRUCTOR_ARGS.TOKEN_VESTING
  );

  logSection("VERIFICAÇÃO CONCLUÍDA");

  console.log("\nLinks para verificar no Polygonscan:");

  if (network.chainId === 137n) {
    // Mainnet
    if (CONTRACTS.VBRZ_TOKEN) {
      console.log("  VBRzToken:     https://polygonscan.com/address/" + CONTRACTS.VBRZ_TOKEN);
    }
    if (CONTRACTS.TOKEN_VESTING) {
      console.log("  TokenVesting:  https://polygonscan.com/address/" + CONTRACTS.TOKEN_VESTING);
    }
  } else if (network.chainId === 80002n) {
    // Amoy Testnet
    if (CONTRACTS.VBRZ_TOKEN) {
      console.log("  VBRzToken:     https://amoy.polygonscan.com/address/" + CONTRACTS.VBRZ_TOKEN);
    }
    if (CONTRACTS.TOKEN_VESTING) {
      console.log("  TokenVesting:  https://amoy.polygonscan.com/address/" + CONTRACTS.TOKEN_VESTING);
    }
  }
}

// ============================================================================
// EXECUÇÃO
// ============================================================================

main()
  .then(function() {
    console.log("\n<‰ Verificação finalizada!");
    process.exit(0);
  })
  .catch(function(error) {
    console.error("\nL Erro durante a verificação:");
    console.error(error);
    process.exit(1);
  });
