// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * =====================================================================
 *  __     ___            _       ____  ____  ____
 *  \ \   / (_)_ __   ___| |_   |  _ \|___ \|  _ \
 *   \ \ / /| | '_ \ / __| | | | |_) | __) | |_) |
 *    \ V / | | | | | (__| | |_| |  __/ / __/|  __/
 *     \_/  |_|_| |_|\___|_|\__,_|_|   |_____|_|
 *
 * =====================================================================
 *
 * VINCULO P2P MARKETPLACE - Escrow para Cessão de Crédito Digital
 *
 * CONCEITO JURÍDICO (Sem CVM):
 * - Cessão de Crédito (Art. 286-298, Código Civil Brasileiro)
 * - Compra e venda de ativo digital (não é valor mobiliário)
 * - Não prometemos juros, negociamos preço (Deságio)
 * - P2P puro: dinheiro sai do comprador direto para o vendedor
 *
 * FLUXO:
 * 1. LISTING: Proprietário deposita token de recebíveis + define preço
 * 2. BUYING: Investidor paga em MATIC/Stable e recebe token atomicamente
 * 3. FEES: Plataforma cobra taxa de sucesso (2% configurável)
 * 4. CANCEL: Vendedor pode cancelar antes da venda
 *
 * SEGURANÇA:
 * - ReentrancyGuard para prevenir ataques de reentrada
 * - Escrow: tokens ficam no contrato até venda ou cancelamento
 * - Swap Atômico: pagamento e entrega acontecem na mesma transação
 *
 * @author Vinculo.io
 * @notice Marketplace P2P para recebíveis de aluguel tokenizados
 */

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract VinculoP2P is ERC1155Holder, Ownable, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============================================
    // ROLES
    // ============================================

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // ============================================
    // ESTRUTURAS
    // ============================================

    enum ListingStatus {
        ACTIVE,     // Disponível para compra
        SOLD,       // Vendido
        CANCELLED   // Cancelado pelo vendedor
    }

    enum PaymentMethod {
        NATIVE,     // MATIC
        STABLE      // USDT/USDC
    }

    struct Listing {
        uint256 listingId;           // ID único da oferta
        address seller;              // Endereço do vendedor (proprietário)
        address nftContract;         // Contrato ERC-1155 dos recebíveis
        uint256 tokenId;             // ID do token de recebíveis
        uint256 amount;              // Quantidade de tokens (geralmente 1)
        uint256 priceNative;         // Preço em MATIC (wei)
        uint256 priceStable;         // Preço em Stablecoin (6 decimais USDT/USDC)
        bool acceptsNative;          // Aceita pagamento em MATIC
        bool acceptsStable;          // Aceita pagamento em Stablecoin
        ListingStatus status;        // Status da oferta
        uint256 createdAt;           // Timestamp de criação
        uint256 soldAt;              // Timestamp da venda
        address buyer;               // Comprador (se vendido)
        string contractRef;          // Referência do contrato original (off-chain)
    }

    // ============================================
    // ESTADO
    // ============================================

    uint256 private _listingIdCounter;

    // listingId => Listing
    mapping(uint256 => Listing) public listings;

    // Mapeamento de ofertas ativas por vendedor
    mapping(address => uint256[]) public sellerListings;

    // Mapeamento de compras por comprador
    mapping(address => uint256[]) public buyerPurchases;

    // Taxa da plataforma (base 10000 = 100%)
    uint256 public platformFeePercent = 200; // 2.00%

    // Endereço do tesouro da plataforma
    address public treasury;

    // Stablecoin aceita (USDT ou USDC na Polygon)
    IERC20 public stablecoin;

    // Estatísticas
    uint256 public totalListings;
    uint256 public totalSales;
    uint256 public totalVolumeNative;
    uint256 public totalVolumeStable;

    // ============================================
    // EVENTOS
    // ============================================

    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 priceNative,
        uint256 priceStable,
        string contractRef
    );

    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller
    );

    event Sale(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        PaymentMethod paymentMethod,
        uint256 platformFee
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event StablecoinUpdated(address oldToken, address newToken);

    // ============================================
    // CONSTRUTOR
    // ============================================

    constructor(
        address _treasury,
        address _stablecoin
    ) Ownable(msg.sender) {
        require(_treasury != address(0), "Treasury invalido");
        treasury = _treasury;
        stablecoin = IERC20(_stablecoin);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // ============================================
    // FUNÇÕES PÚBLICAS - CONSULTA
    // ============================================

    /**
     * @notice Retorna os dados completos de uma oferta
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /**
     * @notice Retorna todas as ofertas de um vendedor
     */
    function getSellerListings(address seller) external view returns (uint256[] memory) {
        return sellerListings[seller];
    }

    /**
     * @notice Retorna todas as compras de um comprador
     */
    function getBuyerPurchases(address buyer) external view returns (uint256[] memory) {
        return buyerPurchases[buyer];
    }

    /**
     * @notice Retorna estatísticas do marketplace
     */
    function getStats() external view returns (
        uint256 _totalListings,
        uint256 _totalSales,
        uint256 _totalVolumeNative,
        uint256 _totalVolumeStable,
        uint256 _platformFeePercent
    ) {
        return (
            totalListings,
            totalSales,
            totalVolumeNative,
            totalVolumeStable,
            platformFeePercent
        );
    }

    // ============================================
    // FUNÇÕES DE VENDEDOR
    // ============================================

    /**
     * @notice Cria uma nova oferta de venda
     * @dev O vendedor deve ter aprovado o contrato ERC-1155 antes
     * @param _nftContract Endereço do contrato de recebíveis (VinculoReceivables)
     * @param _tokenId ID do token de recebíveis
     * @param _amount Quantidade (geralmente 1)
     * @param _priceNative Preço em MATIC (0 se não aceita)
     * @param _priceStable Preço em Stablecoin (0 se não aceita)
     * @param _contractRef Referência do contrato original
     */
    function createListing(
        address _nftContract,
        uint256 _tokenId,
        uint256 _amount,
        uint256 _priceNative,
        uint256 _priceStable,
        string memory _contractRef
    ) external nonReentrant whenNotPaused returns (uint256) {
        require(_amount > 0, "Quantidade deve ser maior que zero");
        require(_priceNative > 0 || _priceStable > 0, "Defina pelo menos um preco");
        require(bytes(_contractRef).length > 0, "Referencia do contrato vazia");

        // Verifica se o vendedor tem o token
        require(
            IERC1155(_nftContract).balanceOf(msg.sender, _tokenId) >= _amount,
            "Saldo insuficiente do token"
        );

        // Transfere o token para este contrato (Escrow)
        IERC1155(_nftContract).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId,
            _amount,
            ""
        );

        _listingIdCounter++;
        uint256 newListingId = _listingIdCounter;

        listings[newListingId] = Listing({
            listingId: newListingId,
            seller: msg.sender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            amount: _amount,
            priceNative: _priceNative,
            priceStable: _priceStable,
            acceptsNative: _priceNative > 0,
            acceptsStable: _priceStable > 0,
            status: ListingStatus.ACTIVE,
            createdAt: block.timestamp,
            soldAt: 0,
            buyer: address(0),
            contractRef: _contractRef
        });

        sellerListings[msg.sender].push(newListingId);
        totalListings++;

        emit ListingCreated(
            newListingId,
            msg.sender,
            _nftContract,
            _tokenId,
            _priceNative,
            _priceStable,
            _contractRef
        );

        return newListingId;
    }

    /**
     * @notice Cancela uma oferta e devolve o token
     */
    function cancelListing(uint256 _listingId) external nonReentrant {
        Listing storage item = listings[_listingId];

        require(
            item.seller == msg.sender || hasRole(OPERATOR_ROLE, msg.sender),
            "Nao autorizado"
        );
        require(item.status == ListingStatus.ACTIVE, "Oferta nao esta ativa");

        item.status = ListingStatus.CANCELLED;

        // Devolve o token ao vendedor
        IERC1155(item.nftContract).safeTransferFrom(
            address(this),
            item.seller,
            item.tokenId,
            item.amount,
            ""
        );

        emit ListingCancelled(_listingId, item.seller);
    }

    // ============================================
    // FUNÇÕES DE COMPRADOR
    // ============================================

    /**
     * @notice Compra uma oferta pagando em MATIC (moeda nativa)
     * @dev Swap Atômico: pagamento e entrega na mesma transação
     */
    function buyWithNative(uint256 _listingId) external payable nonReentrant whenNotPaused {
        Listing storage item = listings[_listingId];

        require(item.status == ListingStatus.ACTIVE, "Oferta inativa ou ja vendida");
        require(item.acceptsNative, "Oferta nao aceita MATIC");
        require(msg.value >= item.priceNative, "Valor insuficiente");
        require(msg.sender != item.seller, "Vendedor nao pode comprar propria oferta");

        // Marca como vendido
        item.status = ListingStatus.SOLD;
        item.soldAt = block.timestamp;
        item.buyer = msg.sender;

        // Calcula taxas
        uint256 feeAmount = (item.priceNative * platformFeePercent) / 10000;
        uint256 sellerAmount = item.priceNative - feeAmount;

        // Paga a plataforma
        (bool feeSent, ) = treasury.call{value: feeAmount}("");
        require(feeSent, "Falha ao enviar taxa");

        // Paga o vendedor
        (bool sellerSent, ) = item.seller.call{value: sellerAmount}("");
        require(sellerSent, "Falha ao pagar vendedor");

        // Entrega o token ao comprador
        IERC1155(item.nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            item.tokenId,
            item.amount,
            ""
        );

        // Devolve troco
        if (msg.value > item.priceNative) {
            (bool refundSent, ) = msg.sender.call{value: msg.value - item.priceNative}("");
            require(refundSent, "Falha ao devolver troco");
        }

        // Registra a compra
        buyerPurchases[msg.sender].push(_listingId);
        totalSales++;
        totalVolumeNative += item.priceNative;

        emit Sale(
            _listingId,
            item.seller,
            msg.sender,
            item.priceNative,
            PaymentMethod.NATIVE,
            feeAmount
        );
    }

    /**
     * @notice Compra uma oferta pagando em Stablecoin (USDT/USDC)
     * @dev O comprador deve ter aprovado o contrato antes
     */
    function buyWithStable(uint256 _listingId) external nonReentrant whenNotPaused {
        Listing storage item = listings[_listingId];

        require(item.status == ListingStatus.ACTIVE, "Oferta inativa ou ja vendida");
        require(item.acceptsStable, "Oferta nao aceita Stablecoin");
        require(address(stablecoin) != address(0), "Stablecoin nao configurada");
        require(msg.sender != item.seller, "Vendedor nao pode comprar propria oferta");

        // Verifica saldo do comprador
        require(
            stablecoin.balanceOf(msg.sender) >= item.priceStable,
            "Saldo insuficiente de Stablecoin"
        );

        // Marca como vendido
        item.status = ListingStatus.SOLD;
        item.soldAt = block.timestamp;
        item.buyer = msg.sender;

        // Calcula taxas
        uint256 feeAmount = (item.priceStable * platformFeePercent) / 10000;
        uint256 sellerAmount = item.priceStable - feeAmount;

        // Transfere do comprador para a plataforma
        stablecoin.safeTransferFrom(msg.sender, treasury, feeAmount);

        // Transfere do comprador para o vendedor
        stablecoin.safeTransferFrom(msg.sender, item.seller, sellerAmount);

        // Entrega o token ao comprador
        IERC1155(item.nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            item.tokenId,
            item.amount,
            ""
        );

        // Registra a compra
        buyerPurchases[msg.sender].push(_listingId);
        totalSales++;
        totalVolumeStable += item.priceStable;

        emit Sale(
            _listingId,
            item.seller,
            msg.sender,
            item.priceStable,
            PaymentMethod.STABLE,
            feeAmount
        );
    }

    // ============================================
    // FUNÇÕES ADMINISTRATIVAS
    // ============================================

    /**
     * @notice Atualiza a taxa da plataforma
     * @param _fee Nova taxa (base 10000, max 1000 = 10%)
     */
    function setPlatformFee(uint256 _fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_fee <= 1000, "Taxa maxima 10%");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = _fee;
        emit PlatformFeeUpdated(oldFee, _fee);
    }

    /**
     * @notice Atualiza o endereço do tesouro
     */
    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_treasury != address(0), "Endereco invalido");
        address oldTreasury = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(oldTreasury, _treasury);
    }

    /**
     * @notice Atualiza a stablecoin aceita
     */
    function setStablecoin(address _stablecoin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        address oldToken = address(stablecoin);
        stablecoin = IERC20(_stablecoin);
        emit StablecoinUpdated(oldToken, _stablecoin);
    }

    /**
     * @notice Pausa o marketplace em caso de emergência
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Despausa o marketplace
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Recupera tokens ERC-20 enviados por engano
     */
    function rescueTokens(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    /**
     * @notice Recupera MATIC enviado por engano
     */
    function rescueNative() external onlyRole(DEFAULT_ADMIN_ROLE) {
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Falha ao enviar");
    }

    // ============================================
    // SUPORTE A INTERFACES
    // ============================================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Holder, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Permite receber MATIC
    receive() external payable {}
}
