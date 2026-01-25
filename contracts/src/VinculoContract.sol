// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VinculoContract
 * @author Vinculo.io
 * @notice Smart Contract para gestao de contratos de aluguel como NFTs
 * @dev Implementa ERC-721 com split automatico de pagamentos 85/5/5/5
 *
 * O split e imutavel e distribuido automaticamente:
 * - 85% Locador (proprietario do imovel)
 * - 5% Seguradora (protecao do contrato)
 * - 5% Plataforma (Vinculo.io)
 * - 5% Garantidor (fiador com colateral)
 */
contract VinculoContract is
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable,
    ReentrancyGuard,
    Pausable
{
    // ============================================
    // CONSTANTS - Split Imutavel 85/5/5/5
    // ============================================

    uint8 public constant LANDLORD_SPLIT = 85;
    uint8 public constant INSURER_SPLIT = 5;
    uint8 public constant PLATFORM_SPLIT = 5;
    uint8 public constant GUARANTOR_SPLIT = 5;
    uint8 public constant TOTAL_SPLIT = 100;

    // Endereco da plataforma para receber fees
    address public platformWallet;

    // ============================================
    // ENUMS
    // ============================================

    enum RentalStatus {
        Pending,        // Aguardando assinaturas
        Active,         // Contrato ativo
        Disputed,       // Em disputa
        Terminated,     // Encerrado normalmente
        Defaulted       // Inadimplente
    }

    enum PaymentStatus {
        Pending,
        Paid,
        Late,
        Disputed
    }

    // ============================================
    // STRUCTS
    // ============================================

    struct Rental {
        // Participantes
        address landlord;           // Locador
        address tenant;             // Locatario
        address guarantor;          // Garantidor/Fiador
        address insurer;            // Seguradora

        // Valores
        uint256 rentAmount;         // Valor do aluguel em wei
        uint256 securityDeposit;    // Caucao (se houver)
        uint256 collateralValue;    // Valor do colateral do garantidor

        // Datas
        uint256 startDate;          // Inicio do contrato
        uint256 endDate;            // Fim do contrato
        uint256 paymentDueDay;      // Dia de vencimento (1-28)

        // Status
        RentalStatus status;
        uint256 totalPayments;      // Total de pagamentos realizados
        uint256 missedPayments;     // Pagamentos em atraso

        // Metadata
        string propertyId;          // ID do imovel na plataforma
        string collateralPropertyId; // ID do imovel colateral
        string ipfsHash;            // Hash IPFS do documento completo
    }

    struct Payment {
        uint256 rentalId;
        uint256 amount;
        uint256 timestamp;
        uint256 dueDate;
        PaymentStatus status;

        // Split breakdown
        uint256 landlordAmount;
        uint256 insurerAmount;
        uint256 platformAmount;
        uint256 guarantorAmount;
    }

    // ============================================
    // STATE VARIABLES
    // ============================================

    // Token counter
    uint256 private _tokenIdCounter;

    // Mappings
    mapping(uint256 => Rental) public rentals;
    mapping(uint256 => Payment[]) public paymentHistory;
    mapping(uint256 => bool) public collateralLocked;
    mapping(address => uint256[]) public landlordRentals;
    mapping(address => uint256[]) public tenantRentals;
    mapping(address => uint256[]) public guarantorRentals;

    // Stats
    uint256 public totalVolume;
    uint256 public totalActiveRentals;
    uint256 public totalPaymentsProcessed;

    // ============================================
    // EVENTS
    // ============================================

    event RentalCreated(
        uint256 indexed tokenId,
        address indexed landlord,
        address indexed tenant,
        uint256 rentAmount,
        string propertyId
    );

    event RentalActivated(
        uint256 indexed tokenId,
        uint256 startDate,
        uint256 endDate
    );

    event PaymentReceived(
        uint256 indexed tokenId,
        address indexed payer,
        uint256 amount,
        uint256 landlordAmount,
        uint256 insurerAmount,
        uint256 platformAmount,
        uint256 guarantorAmount
    );

    event CollateralLocked(
        uint256 indexed tokenId,
        address indexed guarantor,
        string collateralPropertyId,
        uint256 value
    );

    event CollateralUnlocked(
        uint256 indexed tokenId,
        address indexed guarantor
    );

    event CollateralSeized(
        uint256 indexed tokenId,
        address indexed guarantor,
        uint256 amountClaimed
    );

    event RentalTerminated(
        uint256 indexed tokenId,
        RentalStatus finalStatus
    );

    event DisputeOpened(
        uint256 indexed tokenId,
        address indexed initiator,
        string reason
    );

    event DisputeResolved(
        uint256 indexed tokenId,
        bool inFavorOfLandlord
    );

    // ============================================
    // MODIFIERS
    // ============================================

    modifier onlyRentalParticipant(uint256 tokenId) {
        Rental storage rental = rentals[tokenId];
        require(
            msg.sender == rental.landlord ||
            msg.sender == rental.tenant ||
            msg.sender == rental.guarantor ||
            msg.sender == rental.insurer ||
            msg.sender == owner(),
            "Vinculo: caller is not a rental participant"
        );
        _;
    }

    modifier onlyLandlord(uint256 tokenId) {
        require(
            msg.sender == rentals[tokenId].landlord,
            "Vinculo: caller is not the landlord"
        );
        _;
    }

    modifier onlyTenant(uint256 tokenId) {
        require(
            msg.sender == rentals[tokenId].tenant,
            "Vinculo: caller is not the tenant"
        );
        _;
    }

    modifier rentalExists(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Vinculo: rental does not exist");
        _;
    }

    modifier rentalActive(uint256 tokenId) {
        require(
            rentals[tokenId].status == RentalStatus.Active,
            "Vinculo: rental is not active"
        );
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor(
        address _platformWallet
    ) ERC721("Vinculo Rental Contract", "VINCULO") Ownable(msg.sender) {
        require(_platformWallet != address(0), "Vinculo: invalid platform wallet");
        platformWallet = _platformWallet;
    }

    // ============================================
    // MAIN FUNCTIONS
    // ============================================

    /**
     * @notice Cria um novo contrato de aluguel como NFT
     * @param landlord Endereco do locador
     * @param tenant Endereco do locatario
     * @param guarantor Endereco do garantidor
     * @param insurer Endereco da seguradora
     * @param rentAmount Valor mensal do aluguel em wei
     * @param securityDeposit Valor da caucao em wei
     * @param startDate Timestamp de inicio do contrato
     * @param endDate Timestamp de fim do contrato
     * @param paymentDueDay Dia do mes para pagamento (1-28)
     * @param propertyId ID do imovel na plataforma
     * @param ipfsHash Hash IPFS do documento do contrato
     */
    function createRental(
        address landlord,
        address tenant,
        address guarantor,
        address insurer,
        uint256 rentAmount,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate,
        uint8 paymentDueDay,
        string memory propertyId,
        string memory ipfsHash
    ) external whenNotPaused returns (uint256) {
        // Validacoes
        require(landlord != address(0), "Vinculo: invalid landlord");
        require(tenant != address(0), "Vinculo: invalid tenant");
        require(guarantor != address(0), "Vinculo: invalid guarantor");
        require(insurer != address(0), "Vinculo: invalid insurer");
        require(rentAmount > 0, "Vinculo: rent must be greater than 0");
        require(startDate < endDate, "Vinculo: invalid date range");
        require(paymentDueDay >= 1 && paymentDueDay <= 28, "Vinculo: invalid due day");
        require(bytes(propertyId).length > 0, "Vinculo: invalid property ID");

        // Todos os enderecos devem ser diferentes
        require(
            landlord != tenant &&
            landlord != guarantor &&
            tenant != guarantor,
            "Vinculo: participants must be different"
        );

        // Incrementa counter e minta NFT
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(landlord, tokenId);
        _setTokenURI(tokenId, ipfsHash);

        // Cria o rental
        rentals[tokenId] = Rental({
            landlord: landlord,
            tenant: tenant,
            guarantor: guarantor,
            insurer: insurer,
            rentAmount: rentAmount,
            securityDeposit: securityDeposit,
            collateralValue: 0,
            startDate: startDate,
            endDate: endDate,
            paymentDueDay: paymentDueDay,
            status: RentalStatus.Pending,
            totalPayments: 0,
            missedPayments: 0,
            propertyId: propertyId,
            collateralPropertyId: "",
            ipfsHash: ipfsHash
        });

        // Registra nos mappings de participantes
        landlordRentals[landlord].push(tokenId);
        tenantRentals[tenant].push(tokenId);
        guarantorRentals[guarantor].push(tokenId);

        emit RentalCreated(tokenId, landlord, tenant, rentAmount, propertyId);

        return tokenId;
    }

    /**
     * @notice Bloqueia colateral do garantidor
     * @param tokenId ID do contrato NFT
     * @param collateralPropertyId ID do imovel colateral
     */
    function lockCollateral(
        uint256 tokenId,
        string memory collateralPropertyId,
        uint256 collateralValue
    ) external payable rentalExists(tokenId) {
        Rental storage rental = rentals[tokenId];

        require(msg.sender == rental.guarantor, "Vinculo: only guarantor can lock collateral");
        require(!collateralLocked[tokenId], "Vinculo: collateral already locked");
        require(bytes(collateralPropertyId).length > 0, "Vinculo: invalid collateral property");
        require(collateralValue > 0, "Vinculo: collateral value must be positive");

        // Atualiza rental
        rental.collateralPropertyId = collateralPropertyId;
        rental.collateralValue = collateralValue;
        collateralLocked[tokenId] = true;

        emit CollateralLocked(tokenId, msg.sender, collateralPropertyId, collateralValue);
    }

    /**
     * @notice Ativa o contrato apos todas as assinaturas
     * @param tokenId ID do contrato NFT
     */
    function activateRental(uint256 tokenId) external rentalExists(tokenId) {
        Rental storage rental = rentals[tokenId];

        require(
            msg.sender == rental.landlord || msg.sender == owner(),
            "Vinculo: only landlord or admin can activate"
        );
        require(rental.status == RentalStatus.Pending, "Vinculo: rental not pending");
        require(collateralLocked[tokenId], "Vinculo: collateral must be locked first");

        rental.status = RentalStatus.Active;
        totalActiveRentals++;

        emit RentalActivated(tokenId, rental.startDate, rental.endDate);
    }

    /**
     * @notice Paga o aluguel com split automatico 85/5/5/5
     * @param tokenId ID do contrato NFT
     */
    function payRent(uint256 tokenId)
        external
        payable
        nonReentrant
        rentalExists(tokenId)
        rentalActive(tokenId)
    {
        Rental storage rental = rentals[tokenId];

        require(
            msg.sender == rental.tenant || msg.sender == rental.guarantor,
            "Vinculo: only tenant or guarantor can pay"
        );
        require(msg.value >= rental.rentAmount, "Vinculo: insufficient payment");

        // Calcula split 85/5/5/5
        uint256 landlordAmount = (msg.value * LANDLORD_SPLIT) / TOTAL_SPLIT;
        uint256 insurerAmount = (msg.value * INSURER_SPLIT) / TOTAL_SPLIT;
        uint256 platformAmount = (msg.value * PLATFORM_SPLIT) / TOTAL_SPLIT;
        uint256 guarantorAmount = (msg.value * GUARANTOR_SPLIT) / TOTAL_SPLIT;

        // Ajusta rounding errors no landlord
        uint256 totalDistributed = landlordAmount + insurerAmount + platformAmount + guarantorAmount;
        if (totalDistributed < msg.value) {
            landlordAmount += msg.value - totalDistributed;
        }

        // Executa transferencias
        _safeTransfer(rental.landlord, landlordAmount);
        _safeTransfer(rental.insurer, insurerAmount);
        _safeTransfer(platformWallet, platformAmount);
        _safeTransfer(rental.guarantor, guarantorAmount);

        // Registra pagamento
        Payment memory payment = Payment({
            rentalId: tokenId,
            amount: msg.value,
            timestamp: block.timestamp,
            dueDate: _calculateDueDate(rental),
            status: PaymentStatus.Paid,
            landlordAmount: landlordAmount,
            insurerAmount: insurerAmount,
            platformAmount: platformAmount,
            guarantorAmount: guarantorAmount
        });

        paymentHistory[tokenId].push(payment);
        rental.totalPayments++;
        totalPaymentsProcessed++;
        totalVolume += msg.value;

        emit PaymentReceived(
            tokenId,
            msg.sender,
            msg.value,
            landlordAmount,
            insurerAmount,
            platformAmount,
            guarantorAmount
        );
    }

    /**
     * @notice Abre uma disputa no contrato
     * @param tokenId ID do contrato NFT
     * @param reason Motivo da disputa
     */
    function openDispute(
        uint256 tokenId,
        string memory reason
    ) external rentalExists(tokenId) onlyRentalParticipant(tokenId) {
        Rental storage rental = rentals[tokenId];
        require(rental.status == RentalStatus.Active, "Vinculo: rental must be active");

        rental.status = RentalStatus.Disputed;

        emit DisputeOpened(tokenId, msg.sender, reason);
    }

    /**
     * @notice Resolve uma disputa (apenas owner/admin)
     * @param tokenId ID do contrato NFT
     * @param inFavorOfLandlord Se a decisao favorece o locador
     */
    function resolveDispute(
        uint256 tokenId,
        bool inFavorOfLandlord
    ) external onlyOwner rentalExists(tokenId) {
        Rental storage rental = rentals[tokenId];
        require(rental.status == RentalStatus.Disputed, "Vinculo: no active dispute");

        if (inFavorOfLandlord) {
            // Landlord ganha - pode acionar colateral se necessario
            rental.status = RentalStatus.Defaulted;
        } else {
            // Tenant ganha - contrato volta ao normal
            rental.status = RentalStatus.Active;
        }

        emit DisputeResolved(tokenId, inFavorOfLandlord);
    }

    /**
     * @notice Encerra o contrato normalmente
     * @param tokenId ID do contrato NFT
     */
    function terminateRental(uint256 tokenId)
        external
        rentalExists(tokenId)
        onlyRentalParticipant(tokenId)
    {
        Rental storage rental = rentals[tokenId];
        require(
            rental.status == RentalStatus.Active ||
            rental.status == RentalStatus.Disputed,
            "Vinculo: cannot terminate"
        );

        // Apenas landlord pode encerrar, ou apos data de fim
        require(
            msg.sender == rental.landlord ||
            block.timestamp >= rental.endDate ||
            msg.sender == owner(),
            "Vinculo: not authorized to terminate"
        );

        rental.status = RentalStatus.Terminated;
        totalActiveRentals--;

        // Desbloqueia colateral se nao houver dividas
        if (rental.missedPayments == 0 && collateralLocked[tokenId]) {
            collateralLocked[tokenId] = false;
            emit CollateralUnlocked(tokenId, rental.guarantor);
        }

        emit RentalTerminated(tokenId, RentalStatus.Terminated);
    }

    /**
     * @notice Aciona o colateral em caso de inadimplencia
     * @param tokenId ID do contrato NFT
     */
    function seizeCollateral(uint256 tokenId)
        external
        rentalExists(tokenId)
        onlyLandlord(tokenId)
    {
        Rental storage rental = rentals[tokenId];
        require(
            rental.status == RentalStatus.Defaulted,
            "Vinculo: rental not in default"
        );
        require(collateralLocked[tokenId], "Vinculo: no collateral locked");

        // Calcula valor devido
        uint256 amountDue = rental.missedPayments * rental.rentAmount;
        uint256 amountToClaim = amountDue > rental.collateralValue
            ? rental.collateralValue
            : amountDue;

        collateralLocked[tokenId] = false;

        emit CollateralSeized(tokenId, rental.guarantor, amountToClaim);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Retorna detalhes de um rental
     */
    function getRental(uint256 tokenId) external view returns (Rental memory) {
        return rentals[tokenId];
    }

    /**
     * @notice Retorna historico de pagamentos
     */
    function getPaymentHistory(uint256 tokenId) external view returns (Payment[] memory) {
        return paymentHistory[tokenId];
    }

    /**
     * @notice Retorna rentals de um landlord
     */
    function getLandlordRentals(address landlord) external view returns (uint256[] memory) {
        return landlordRentals[landlord];
    }

    /**
     * @notice Retorna rentals de um tenant
     */
    function getTenantRentals(address tenant) external view returns (uint256[] memory) {
        return tenantRentals[tenant];
    }

    /**
     * @notice Retorna rentals de um guarantor
     */
    function getGuarantorRentals(address guarantor) external view returns (uint256[] memory) {
        return guarantorRentals[guarantor];
    }

    /**
     * @notice Calcula o split de um valor
     */
    function calculateSplit(uint256 amount)
        external
        pure
        returns (
            uint256 landlordAmount,
            uint256 insurerAmount,
            uint256 platformAmount,
            uint256 guarantorAmount
        )
    {
        landlordAmount = (amount * LANDLORD_SPLIT) / TOTAL_SPLIT;
        insurerAmount = (amount * INSURER_SPLIT) / TOTAL_SPLIT;
        platformAmount = (amount * PLATFORM_SPLIT) / TOTAL_SPLIT;
        guarantorAmount = (amount * GUARANTOR_SPLIT) / TOTAL_SPLIT;
    }

    /**
     * @notice Retorna estatisticas da plataforma
     */
    function getStats()
        external
        view
        returns (
            uint256 _totalVolume,
            uint256 _totalActiveRentals,
            uint256 _totalPaymentsProcessed,
            uint256 _totalContracts
        )
    {
        return (totalVolume, totalActiveRentals, totalPaymentsProcessed, _tokenIdCounter);
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Atualiza endereco da plataforma
     */
    function setPlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Vinculo: invalid wallet");
        platformWallet = newWallet;
    }

    /**
     * @notice Pausa o contrato
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Despausa o contrato
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    function _safeTransfer(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Vinculo: transfer failed");
    }

    function _calculateDueDate(Rental storage rental) internal view returns (uint256) {
        // Simplificado - retorna timestamp do proximo vencimento
        return block.timestamp;
    }

    // ============================================
    // OVERRIDES (ERC721)
    // ============================================

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
