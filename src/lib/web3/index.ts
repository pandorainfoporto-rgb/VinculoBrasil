/**
 * Vinculo.io - Web3 Module Index
 *
 * Central export for all Web3 related functionality
 */

// Contract ABI and configuration
export {
  VINCULO_CONTRACT_ABI,
  VINCULO_CONTRACT_ADDRESSES,
  PAYMENT_SPLIT,
  SUPPORTED_NETWORKS,
  calculatePaymentSplit,
  type RentalStruct,
  type RentalCreatedEvent,
  type PaymentReceivedEvent,
  type CollateralLockedEvent,
} from './vinculo-contract-abi';

// Types
export {
  type WalletConnectionStatus,
  type TransactionStatus,
  type WalletInfo,
  type TransactionResult,
  type CreateRentalParams,
  type PayRentParams,
  type OnChainRental,
  type PaymentSplitResult,
  type StablecoinConfig,
  type WalletConnectorType,
  type Web3ProviderConfig,
  BRZ_TOKEN,
  DEFAULT_WEB3_CONFIG,
  brlToTokenAmount,
  tokenAmountToBrl,
} from './types';

// Configuration
export {
  web3Config,
  activeNetwork,
  isProduction,
  isDemoMode,
  isDebugMode,
  getNetworkConfig,
  getContractAddress,
  getRpcUrl,
  getBrzTokenConfig,
  getPlatformWallets,
  getWalletConnectConfig,
  getWeb3Config,
  getBlockExplorerUrl,
  getConfigSummary,
  web3Log,
  type NetworkName,
} from './config';

// Contract Service
export {
  contractService,
  type ProtocolStats,
  type PropertyInfo,
} from './contract-service';

// Viem/Wagmi Integration
export {
  viemClient,
  createViemPublicClient,
  createViemWalletClient,
  connectWallet,
  disconnectWallet,
  getWalletState,
  subscribeToWallet,
  switchNetwork,
  readVinculoContract,
  writeVinculoContract,
  formatAddress,
  formatWeiToBRL,
  brlToWei,
  isCorrectNetwork,
  waitForTransaction,
  type WalletState,
  type TransactionResult as ViemTransactionResult,
  type ContractCallOptions,
} from './wagmi-config';
