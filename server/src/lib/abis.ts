// ============================================
// VÍNCULO BRASIL - SMART CONTRACT ABIs (Backend)
// Polygon Mainnet - Contratos Implantados
// ============================================

/**
 * VinculoProtocol ABI (ERC-721)
 * Contrato principal para NFTs de contratos de aluguel
 * Address: 0x6748Cf729dc62bef157b40ABBd44365c2f12702a
 */
export const VINCULO_PROTOCOL_ABI = [
  // ERC-721 Standard
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function approve(address to, uint256 tokenId)',
  'function setApprovalForAll(address operator, bool approved)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function totalSupply() view returns (uint256)',

  // Vinculo Specific
  'function mintContract(address to, string memory tokenURI) returns (uint256)',
  'function burnContract(uint256 tokenId)',
  'function getContract(uint256 tokenId) view returns (tuple(uint256 tokenId, address owner, string status, uint256 rentValue, uint256 startDate, uint256 endDate))',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ContractMinted(uint256 indexed tokenId, address indexed owner, string metadataUri)',
];

/**
 * VinculoReceivables ABI (ERC-1155)
 * Tokenização de recebíveis de aluguel
 * Address: 0x4081D8c80bae80aB36AaE3e83082BE1083C32F9A
 */
export const RECEIVABLES_ABI = [
  // ERC-1155 Standard
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) view returns (uint256[] memory)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data)',
  'function uri(uint256 id) view returns (string)',

  // Vinculo Receivables Specific
  'function mintReceivable(address to, string contractRef, uint256 totalMonths, uint256 monthlyValue, uint256 startTimestamp, uint256 endTimestamp, string metadataUri) returns (uint256)',
  'function getReceivable(uint256 tokenId) view returns (tuple(uint256 tokenId, string contractRef, address originalOwner, uint256 totalMonths, uint256 totalValue, uint256 monthlyValue, uint256 startTimestamp, uint256 endTimestamp, bool active, string metadataUri))',
  'function getPaymentReceiver(uint256 tokenId) view returns (address)',
  'function isContractTokenized(string contractRef) view returns (bool)',
  'function getTokenByContract(string contractRef) view returns (uint256)',
  'function updateReceiver(uint256 tokenId, address newReceiver)',
  'function deactivateReceivable(uint256 tokenId)',

  // Admin
  'function pause()',
  'function unpause()',

  // Events
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
  'event ReceivableMinted(uint256 indexed tokenId, string contractRef, address indexed originalOwner, uint256 totalMonths, uint256 totalValue)',
  'event ReceiverUpdated(uint256 indexed tokenId, address indexed oldReceiver, address indexed newReceiver)',
];

/**
 * VinculoP2P Marketplace ABI
 * Escrow atômico para cessão de crédito P2P
 * Address: 0x8641445fD7079Bd439F137Aaec5D3b534bB608a0
 */
export const P2P_MARKETPLACE_ABI = [
  // Read Functions
  'function getListing(uint256 listingId) view returns (tuple(uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 amount, uint256 priceNative, uint256 priceStable, bool acceptsNative, bool acceptsStable, uint8 status, uint256 createdAt, uint256 soldAt, address buyer, string contractRef))',
  'function getSellerListings(address seller) view returns (uint256[])',
  'function getBuyerPurchases(address buyer) view returns (uint256[])',
  'function getStats() view returns (uint256 totalListings, uint256 totalSales, uint256 totalVolumeNative, uint256 totalVolumeStable, uint256 platformFeePercent)',
  'function listings(uint256) view returns (uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 amount, uint256 priceNative, uint256 priceStable, bool acceptsNative, bool acceptsStable, uint8 status, uint256 createdAt, uint256 soldAt, address buyer, string contractRef)',
  'function platformFeePercent() view returns (uint256)',
  'function treasury() view returns (address)',
  'function stablecoin() view returns (address)',

  // Write Functions - Seller
  'function createListing(address _nftContract, uint256 _tokenId, uint256 _amount, uint256 _priceNative, uint256 _priceStable, string _contractRef) returns (uint256)',
  'function cancelListing(uint256 _listingId)',

  // Write Functions - Buyer
  'function buyWithNative(uint256 _listingId) payable',
  'function buyWithStable(uint256 _listingId)',

  // Admin Functions
  'function setPlatformFee(uint256 _fee)',
  'function setTreasury(address _treasury)',
  'function setStablecoin(address _stablecoin)',
  'function pause()',
  'function unpause()',
  'function rescueTokens(address token, uint256 amount)',
  'function rescueNative()',

  // Events
  'event ListingCreated(uint256 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 priceNative, uint256 priceStable, string contractRef)',
  'event ListingCancelled(uint256 indexed listingId, address indexed seller)',
  'event Sale(uint256 indexed listingId, address indexed seller, address indexed buyer, uint256 price, uint8 paymentMethod, uint256 platformFee)',
  'event PlatformFeeUpdated(uint256 oldFee, uint256 newFee)',
  'event TreasuryUpdated(address oldTreasury, address newTreasury)',
];

// ============================================
// CONTRACT ADDRESSES (from environment)
// ============================================

export const CONTRACT_ADDRESSES = {
  // Main NFT Contract (ERC-721)
  VINCULO_PROTOCOL: process.env.SMART_CONTRACT_ADDRESS || '0x6748Cf729dc62bef157b40ABBd44365c2f12702a',

  // Receivables Token (ERC-1155)
  RECEIVABLES: process.env.RECEIVABLES_CONTRACT_ADDRESS || '0x4081D8c80bae80aB36AaE3e83082BE1083C32F9A',

  // P2P Marketplace
  P2P_MARKETPLACE: process.env.P2P_MARKETPLACE_CONTRACT_ADDRESS || '0x8641445fD7079Bd439F137Aaec5D3b534bB608a0',

  // Polygon RPC
  RPC_URL: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
} as const;

// ============================================
// NETWORK CONFIG
// ============================================

export const POLYGON_CONFIG = {
  chainId: 137,
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com', 'https://rpc-mainnet.matic.quiknode.pro'],
  blockExplorerUrls: ['https://polygonscan.com/'],
} as const;

export default {
  VINCULO_PROTOCOL_ABI,
  RECEIVABLES_ABI,
  P2P_MARKETPLACE_ABI,
  CONTRACT_ADDRESSES,
  POLYGON_CONFIG,
};
