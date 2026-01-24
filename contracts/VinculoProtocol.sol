// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * =====================================================================
 *  __     ___            _       ____            _                  _
 *  \ \   / (_)_ __   ___| |_   _|  _ \ _ __ ___ | |_ ___   ___ ___ | |
 *   \ \ / /| | '_ \ / __| | | | | |_) | '__/ _ \| __/ _ \ / __/ _ \| |
 *    \ V / | | | | | (__| | |_| | ___/| | | (_) | || (_) | (_| (_) | |
 *     \_/  |_|_| |_|\___|_|\__,_|_|   |_|  \___/ \__\___/ \___\___/|_|
 *
 * =====================================================================
 *
 * VINCULO PROTOCOL - Smart Contract Unificado para Remix IDE
 *
 * Deploy na Polygon Amoy Testnet:
 * - Network: Polygon Amoy Testnet
 * - RPC: https://rpc-amoy.polygon.technology/
 * - Chain ID: 80002
 * - Currency: MATIC
 * - Explorer: https://amoy.polygonscan.com/
 *
 * INSTRUCOES DE DEPLOY NO REMIX:
 *
 * 1. Abra remix.ethereum.org
 * 2. Crie um novo arquivo: VinculoProtocol.sol
 * 3. Cole este codigo
 * 4. Compile com Solidity 0.8.20+
 * 5. Deploy & Run:
 *    - Environment: Injected Provider (MetaMask)
 *    - Configure MetaMask para Polygon Amoy
 *    - Obtenha MATIC de teste: https://faucet.polygon.technology/
 *    - Deploy ordem:
 *      a) VinculoToken (BRZ mockado) - Opcional, pode usar token existente
 *      b) VinculoProtocol (platformWallet, brzTokenAddress)
 *
 * FUNCIONALIDADES:
 * - ERC-721: Contratos de aluguel como NFTs
 * - Split 85/5/5/5: Locador/Seguradora/Plataforma/Garantidor
 * - Colateral: Imoveis tokenizados como garantia
 * - Disputas: Sistema de arbitragem on-chain
 * - Pausable: Kill switch para emergencias
 * - DIMOB: Eventos para relatorios fiscais
 *
 * @author Vinculo.io
 * @notice Este contrato e para fins de teste e demonstracao
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

// ============================================================
// INTERFACE PARA TOKEN BRZ
// ============================================================

interface IBRZ {
    function decimals() external view returns (uint8);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

// ============================================================
// CONTRATO PRINCIPAL: VINCULO PROTOCOL
// ============================================================

contract VinculoProtocol is
    ERC721,
    ERC721URIStorage,
    ERC721Enumerable,
    Ownable,
    AccessControl,
    ReentrancyGuard,
    Pausable
{
    using SafeERC20 for IERC20;

    // ============================================
    // ROLES
    // ============================================

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    // ============================================
    // CONSTANTS - Split Imutavel 85/5/5/5
    // ============================================

    uint8 public constant LANDLORD_SPLIT = 85;
    uint8 public constant INSURER_SPLIT = 5;
    uint8 public constant PLATFORM_SPLIT = 5;
    uint8 public constant GUARANTOR_SPLIT = 5;
    uint8 public constant TOTAL_SPLIT = 100;

    // LTV para Yield Stacking
    uint8 public constant COLLATERAL_LTV = 80;

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

    enum DisputeType {
        PaymentDefault,      // Inadimplencia
        PropertyDamage,      // Danos ao imovel
        ContractBreach,      // Quebra de contrato
        DepositDispute,      // Disputa de caucao
        Other                // Outros
    }

    enum DisputeStatus {
        Opened,
        UnderReview,
        Voting,
        Resolved,
        Closed
    }

    // ============================================
    // STRUCTS
    // ============================================

    struct Rental {
        // Participantes
        address landlord;
        address tenant;
        address guarantor;
        address insurer;

        // Valores em BRZ (6 decimais)
        uint256 rentAmount;
        uint256 securityDeposit;
        uint256 collateralValue;

        // Datas
        uint256 startDate;
        uint256 endDate;
        uint8 paymentDueDay;

        // Status
        RentalStatus status;
        uint256 totalPayments;
        uint256 missedPayments;
        uint256 lastPaymentDate;

        // Metadata
        string propertyId;
        string collateralPropertyId;
        string ipfsHash;
    }

    struct Payment {
        uint256 rentalId;
        uint256 amount;
        uint256 timestamp;
        uint256 dueDate;
        PaymentStatus status;
        uint256 landlordAmount;
        uint256 insurerAmount;
        uint256 platformAmount;
        uint256 guarantorAmount;
    }

    struct PropertyCollateral {
        string propertyId;
        string registrationNumber;
        address owner;
        uint256 valueBRL;
        string city;
        string state;
        bool isLocked;
        uint256 lockedForRental;
        bool isVerified;
        bool yieldStackingEnabled;
        uint256 yieldEarned;
    }

    struct Dispute {
        uint256 rentalId;
        address initiator;
        DisputeType disputeType;
        DisputeStatus status;
        string description;
        uint256 amountInDispute;
        uint256 createdAt;
        uint256 resolvedAt;
        bool inFavorOfLandlord;
    }

    struct ProtocolStats {
        uint256 totalVolume;
        uint256 totalActiveRentals;
        uint256 totalPaymentsProcessed;
        uint256 totalContracts;
        uint256 totalLockedCollateral;
        uint256 totalYieldPaid;
        uint256 totalDisputes;
        uint256 totalDisputesResolved;
    }

    // ============================================
    // STATE VARIABLES
    // ============================================

    // Token counter
    uint256 private _rentalIdCounter;
    uint256 private _propertyIdCounter;
    uint256 private _disputeIdCounter;

    // Wallets
    address public platformWallet;
    address public insuranceWallet;

    // Token BRZ
    IBRZ public brzToken;

    // Mappings - Rentals
    mapping(uint256 => Rental) public rentals;
    mapping(uint256 => Payment[]) public paymentHistory;
    mapping(uint256 => bool) public collateralLocked;
    mapping(address => uint256[]) public landlordRentals;
    mapping(address => uint256[]) public tenantRentals;
    mapping(address => uint256[]) public guarantorRentals;

    // Mappings - Properties
    mapping(uint256 => PropertyCollateral) public properties;
    mapping(string => uint256) public propertyIdToToken;
    mapping(address => uint256[]) public ownerProperties;

    // Mappings - Disputes
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => uint256[]) public rentalDisputes;

    // Stats
    ProtocolStats public stats;

    // ============================================
    // EVENTS
    // ============================================

    // Rental Events
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

    event RentalTerminated(
        uint256 indexed tokenId,
        RentalStatus finalStatus
    );

    // Payment Events - DIMOB Compatible
    event PaymentReceived(
        uint256 indexed tokenId,
        address indexed payer,
        uint256 amount,
        uint256 landlordAmount,
        uint256 insurerAmount,
        uint256 platformAmount,
        uint256 guarantorAmount,
        uint256 timestamp
    );

    event PaymentMissed(
        uint256 indexed tokenId,
        uint256 dueDate,
        uint256 amount
    );

    // Collateral Events
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

    // Property Events
    event PropertyRegistered(
        uint256 indexed propertyTokenId,
        address indexed owner,
        string propertyId,
        uint256 valueBRL
    );

    event PropertyVerified(
        uint256 indexed propertyTokenId,
        address indexed verifier
    );

    event YieldStackingEnabled(
        uint256 indexed propertyTokenId,
        address indexed owner,
        uint256 maxGuaranteeCapacity
    );

    event YieldPaid(
        uint256 indexed propertyTokenId,
        address indexed owner,
        uint256 amount
    );

    // Dispute Events
    event DisputeOpened(
        uint256 indexed disputeId,
        uint256 indexed rentalId,
        address indexed initiator,
        DisputeType disputeType
    );

    event DisputeResolved(
        uint256 indexed disputeId,
        bool inFavorOfLandlord
    );

    // Protocol Events
    event ProtocolPaused(address indexed by, uint256 timestamp);
    event ProtocolUnpaused(address indexed by, uint256 timestamp);
    event EmergencyWithdraw(address indexed to, uint256 amount);

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
            "Vinculo: not a rental participant"
        );
        _;
    }

    modifier onlyLandlord(uint256 tokenId) {
        require(msg.sender == rentals[tokenId].landlord, "Vinculo: not landlord");
        _;
    }

    modifier rentalExists(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Vinculo: rental not exists");
        _;
    }

    modifier rentalActive(uint256 tokenId) {
        require(rentals[tokenId].status == RentalStatus.Active, "Vinculo: not active");
        _;
    }

    modifier propertyExists(uint256 propertyTokenId) {
        require(properties[propertyTokenId].owner != address(0), "Vinculo: property not exists");
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor(
        address _platformWallet,
        address _brzToken
    ) ERC721("Vinculo Rental Contract", "VINCULO") Ownable(msg.sender) {
        require(_platformWallet != address(0), "Vinculo: invalid platform wallet");

        platformWallet = _platformWallet;
        insuranceWallet = _platformWallet; // Default to platform, can change later

        if (_brzToken != address(0)) {
            brzToken = IBRZ(_brzToken);
        }

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // ============================================
    // RENTAL FUNCTIONS
    // ============================================

    /**
     * @notice Cria um novo contrato de aluguel como NFT
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
        require(landlord != address(0) && tenant != address(0), "Vinculo: invalid addresses");
        require(guarantor != address(0), "Vinculo: guarantor required");
        require(rentAmount > 0, "Vinculo: rent must be > 0");
        require(startDate < endDate, "Vinculo: invalid dates");
        require(paymentDueDay >= 1 && paymentDueDay <= 28, "Vinculo: invalid due day");

        uint256 tokenId = _rentalIdCounter++;
        _safeMint(landlord, tokenId);
        _setTokenURI(tokenId, ipfsHash);

        // Use insurer or default to platform
        address actualInsurer = insurer != address(0) ? insurer : insuranceWallet;

        rentals[tokenId] = Rental({
            landlord: landlord,
            tenant: tenant,
            guarantor: guarantor,
            insurer: actualInsurer,
            rentAmount: rentAmount,
            securityDeposit: securityDeposit,
            collateralValue: 0,
            startDate: startDate,
            endDate: endDate,
            paymentDueDay: paymentDueDay,
            status: RentalStatus.Pending,
            totalPayments: 0,
            missedPayments: 0,
            lastPaymentDate: 0,
            propertyId: propertyId,
            collateralPropertyId: "",
            ipfsHash: ipfsHash
        });

        landlordRentals[landlord].push(tokenId);
        tenantRentals[tenant].push(tokenId);
        guarantorRentals[guarantor].push(tokenId);

        stats.totalContracts++;

        emit RentalCreated(tokenId, landlord, tenant, rentAmount, propertyId);
        return tokenId;
    }

    /**
     * @notice Bloqueia colateral e ativa o contrato
     */
    function lockCollateralAndActivate(
        uint256 tokenId,
        string memory collateralPropertyId,
        uint256 collateralValue
    ) external rentalExists(tokenId) {
        Rental storage rental = rentals[tokenId];

        require(msg.sender == rental.guarantor, "Vinculo: only guarantor");
        require(rental.status == RentalStatus.Pending, "Vinculo: not pending");
        require(!collateralLocked[tokenId], "Vinculo: already locked");
        require(collateralValue > 0, "Vinculo: invalid collateral");

        rental.collateralPropertyId = collateralPropertyId;
        rental.collateralValue = collateralValue;
        rental.status = RentalStatus.Active;
        collateralLocked[tokenId] = true;

        stats.totalActiveRentals++;
        stats.totalLockedCollateral += collateralValue;

        emit CollateralLocked(tokenId, msg.sender, collateralPropertyId, collateralValue);
        emit RentalActivated(tokenId, rental.startDate, rental.endDate);
    }

    /**
     * @notice Paga o aluguel com split automatico 85/5/5/5 (usando BRZ)
     */
    function payRentBRZ(uint256 tokenId)
        external
        nonReentrant
        rentalExists(tokenId)
        rentalActive(tokenId)
    {
        require(address(brzToken) != address(0), "Vinculo: BRZ not configured");

        Rental storage rental = rentals[tokenId];
        require(
            msg.sender == rental.tenant || msg.sender == rental.guarantor,
            "Vinculo: only tenant or guarantor"
        );

        uint256 amount = rental.rentAmount;

        // Transfer BRZ from payer
        require(
            brzToken.transferFrom(msg.sender, address(this), amount),
            "Vinculo: transfer failed"
        );

        // Calculate split
        uint256 landlordAmount = (amount * LANDLORD_SPLIT) / TOTAL_SPLIT;
        uint256 insurerAmount = (amount * INSURER_SPLIT) / TOTAL_SPLIT;
        uint256 platformAmount = (amount * PLATFORM_SPLIT) / TOTAL_SPLIT;
        uint256 guarantorAmount = (amount * GUARANTOR_SPLIT) / TOTAL_SPLIT;

        // Adjust rounding
        uint256 total = landlordAmount + insurerAmount + platformAmount + guarantorAmount;
        if (total < amount) {
            landlordAmount += amount - total;
        }

        // Distribute
        brzToken.transfer(rental.landlord, landlordAmount);
        brzToken.transfer(rental.insurer, insurerAmount);
        brzToken.transfer(platformWallet, platformAmount);
        brzToken.transfer(rental.guarantor, guarantorAmount);

        // Record payment
        Payment memory payment = Payment({
            rentalId: tokenId,
            amount: amount,
            timestamp: block.timestamp,
            dueDate: block.timestamp,
            status: PaymentStatus.Paid,
            landlordAmount: landlordAmount,
            insurerAmount: insurerAmount,
            platformAmount: platformAmount,
            guarantorAmount: guarantorAmount
        });

        paymentHistory[tokenId].push(payment);
        rental.totalPayments++;
        rental.lastPaymentDate = block.timestamp;

        stats.totalPaymentsProcessed++;
        stats.totalVolume += amount;

        emit PaymentReceived(
            tokenId, msg.sender, amount,
            landlordAmount, insurerAmount, platformAmount, guarantorAmount,
            block.timestamp
        );
    }

    /**
     * @notice Paga o aluguel com MATIC nativo (para testes)
     */
    function payRentMATIC(uint256 tokenId)
        external
        payable
        nonReentrant
        rentalExists(tokenId)
        rentalActive(tokenId)
    {
        Rental storage rental = rentals[tokenId];
        require(
            msg.sender == rental.tenant || msg.sender == rental.guarantor,
            "Vinculo: only tenant or guarantor"
        );
        require(msg.value >= rental.rentAmount, "Vinculo: insufficient payment");

        uint256 amount = msg.value;

        // Calculate split
        uint256 landlordAmount = (amount * LANDLORD_SPLIT) / TOTAL_SPLIT;
        uint256 insurerAmount = (amount * INSURER_SPLIT) / TOTAL_SPLIT;
        uint256 platformAmount = (amount * PLATFORM_SPLIT) / TOTAL_SPLIT;
        uint256 guarantorAmount = (amount * GUARANTOR_SPLIT) / TOTAL_SPLIT;

        // Adjust rounding
        uint256 total = landlordAmount + insurerAmount + platformAmount + guarantorAmount;
        if (total < amount) {
            landlordAmount += amount - total;
        }

        // Distribute MATIC
        _safeTransferMATIC(rental.landlord, landlordAmount);
        _safeTransferMATIC(rental.insurer, insurerAmount);
        _safeTransferMATIC(platformWallet, platformAmount);
        _safeTransferMATIC(rental.guarantor, guarantorAmount);

        // Record payment
        Payment memory payment = Payment({
            rentalId: tokenId,
            amount: amount,
            timestamp: block.timestamp,
            dueDate: block.timestamp,
            status: PaymentStatus.Paid,
            landlordAmount: landlordAmount,
            insurerAmount: insurerAmount,
            platformAmount: platformAmount,
            guarantorAmount: guarantorAmount
        });

        paymentHistory[tokenId].push(payment);
        rental.totalPayments++;
        rental.lastPaymentDate = block.timestamp;

        stats.totalPaymentsProcessed++;
        stats.totalVolume += amount;

        emit PaymentReceived(
            tokenId, msg.sender, amount,
            landlordAmount, insurerAmount, platformAmount, guarantorAmount,
            block.timestamp
        );
    }

    /**
     * @notice Marca pagamento como atrasado (chamado pelo operator/automation)
     */
    function markPaymentMissed(uint256 tokenId, uint256 dueDate)
        external
        onlyRole(OPERATOR_ROLE)
        rentalExists(tokenId)
        rentalActive(tokenId)
    {
        Rental storage rental = rentals[tokenId];
        rental.missedPayments++;

        emit PaymentMissed(tokenId, dueDate, rental.rentAmount);

        // Auto-default after 3 missed payments
        if (rental.missedPayments >= 3) {
            rental.status = RentalStatus.Defaulted;
            stats.totalActiveRentals--;
            emit RentalTerminated(tokenId, RentalStatus.Defaulted);
        }
    }

    /**
     * @notice Encerra contrato normalmente
     */
    function terminateRental(uint256 tokenId)
        external
        rentalExists(tokenId)
        onlyRentalParticipant(tokenId)
    {
        Rental storage rental = rentals[tokenId];
        require(
            rental.status == RentalStatus.Active || rental.status == RentalStatus.Disputed,
            "Vinculo: cannot terminate"
        );

        rental.status = RentalStatus.Terminated;
        stats.totalActiveRentals--;

        // Unlock collateral if no debts
        if (rental.missedPayments == 0 && collateralLocked[tokenId]) {
            collateralLocked[tokenId] = false;
            stats.totalLockedCollateral -= rental.collateralValue;
            emit CollateralUnlocked(tokenId, rental.guarantor);
        }

        emit RentalTerminated(tokenId, RentalStatus.Terminated);
    }

    /**
     * @notice Aciona colateral em caso de default
     */
    function seizeCollateral(uint256 tokenId)
        external
        rentalExists(tokenId)
        onlyLandlord(tokenId)
    {
        Rental storage rental = rentals[tokenId];
        require(rental.status == RentalStatus.Defaulted, "Vinculo: not defaulted");
        require(collateralLocked[tokenId], "Vinculo: no collateral");

        uint256 amountDue = rental.missedPayments * rental.rentAmount;
        uint256 amountToClaim = amountDue > rental.collateralValue ? rental.collateralValue : amountDue;

        collateralLocked[tokenId] = false;
        stats.totalLockedCollateral -= rental.collateralValue;

        emit CollateralSeized(tokenId, rental.guarantor, amountToClaim);
    }

    // ============================================
    // PROPERTY COLLATERAL FUNCTIONS
    // ============================================

    /**
     * @notice Registra um imovel como NFT de colateral
     */
    function registerProperty(
        string memory propertyId,
        string memory registrationNumber,
        uint256 valueBRL,
        string memory city,
        string memory state
    ) external returns (uint256) {
        require(bytes(propertyId).length > 0, "Vinculo: invalid propertyId");
        require(propertyIdToToken[propertyId] == 0, "Vinculo: already registered");
        require(valueBRL > 0, "Vinculo: value must be > 0");

        uint256 propertyTokenId = ++_propertyIdCounter;

        properties[propertyTokenId] = PropertyCollateral({
            propertyId: propertyId,
            registrationNumber: registrationNumber,
            owner: msg.sender,
            valueBRL: valueBRL,
            city: city,
            state: state,
            isLocked: false,
            lockedForRental: 0,
            isVerified: false,
            yieldStackingEnabled: false,
            yieldEarned: 0
        });

        propertyIdToToken[propertyId] = propertyTokenId;
        ownerProperties[msg.sender].push(propertyTokenId);

        emit PropertyRegistered(propertyTokenId, msg.sender, propertyId, valueBRL);
        return propertyTokenId;
    }

    /**
     * @notice Verifica um imovel (admin only)
     */
    function verifyProperty(uint256 propertyTokenId)
        external
        onlyRole(OPERATOR_ROLE)
        propertyExists(propertyTokenId)
    {
        properties[propertyTokenId].isVerified = true;
        emit PropertyVerified(propertyTokenId, msg.sender);
    }

    /**
     * @notice Ativa Yield Stacking para um imovel
     */
    function enableYieldStacking(uint256 propertyTokenId)
        external
        propertyExists(propertyTokenId)
    {
        PropertyCollateral storage prop = properties[propertyTokenId];
        require(msg.sender == prop.owner, "Vinculo: not owner");
        require(prop.isVerified, "Vinculo: not verified");
        require(!prop.yieldStackingEnabled, "Vinculo: already enabled");

        prop.yieldStackingEnabled = true;

        uint256 maxCapacity = (prop.valueBRL * COLLATERAL_LTV) / 100;
        emit YieldStackingEnabled(propertyTokenId, msg.sender, maxCapacity);
    }

    /**
     * @notice Paga yield para garantidor (chamado internamente)
     */
    function _payYield(uint256 propertyTokenId, uint256 amount) internal {
        PropertyCollateral storage prop = properties[propertyTokenId];
        prop.yieldEarned += amount;
        stats.totalYieldPaid += amount;
        emit YieldPaid(propertyTokenId, prop.owner, amount);
    }

    // ============================================
    // DISPUTE FUNCTIONS
    // ============================================

    /**
     * @notice Abre uma disputa
     */
    function openDispute(
        uint256 rentalId,
        DisputeType disputeType,
        string memory description,
        uint256 amountInDispute
    ) external rentalExists(rentalId) returns (uint256) {
        Rental storage rental = rentals[rentalId];
        require(
            msg.sender == rental.landlord || msg.sender == rental.tenant,
            "Vinculo: not a party"
        );
        require(rental.status == RentalStatus.Active, "Vinculo: not active");

        uint256 disputeId = ++_disputeIdCounter;

        disputes[disputeId] = Dispute({
            rentalId: rentalId,
            initiator: msg.sender,
            disputeType: disputeType,
            status: DisputeStatus.Opened,
            description: description,
            amountInDispute: amountInDispute,
            createdAt: block.timestamp,
            resolvedAt: 0,
            inFavorOfLandlord: false
        });

        rental.status = RentalStatus.Disputed;
        rentalDisputes[rentalId].push(disputeId);
        stats.totalDisputes++;

        emit DisputeOpened(disputeId, rentalId, msg.sender, disputeType);
        return disputeId;
    }

    /**
     * @notice Resolve uma disputa (arbitrator/admin only)
     */
    function resolveDispute(uint256 disputeId, bool inFavorOfLandlord)
        external
        onlyRole(ARBITRATOR_ROLE)
    {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.status == DisputeStatus.Opened || dispute.status == DisputeStatus.UnderReview, "Vinculo: invalid status");

        dispute.status = DisputeStatus.Resolved;
        dispute.resolvedAt = block.timestamp;
        dispute.inFavorOfLandlord = inFavorOfLandlord;

        Rental storage rental = rentals[dispute.rentalId];
        if (inFavorOfLandlord) {
            rental.status = RentalStatus.Defaulted;
        } else {
            rental.status = RentalStatus.Active;
        }

        stats.totalDisputesResolved++;
        emit DisputeResolved(disputeId, inFavorOfLandlord);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    function getRental(uint256 tokenId) external view returns (Rental memory) {
        return rentals[tokenId];
    }

    function getPaymentHistory(uint256 tokenId) external view returns (Payment[] memory) {
        return paymentHistory[tokenId];
    }

    function getLandlordRentals(address landlord) external view returns (uint256[] memory) {
        return landlordRentals[landlord];
    }

    function getTenantRentals(address tenant) external view returns (uint256[] memory) {
        return tenantRentals[tenant];
    }

    function getGuarantorRentals(address guarantor) external view returns (uint256[] memory) {
        return guarantorRentals[guarantor];
    }

    function getProperty(uint256 propertyTokenId) external view returns (PropertyCollateral memory) {
        return properties[propertyTokenId];
    }

    function getOwnerProperties(address owner_) external view returns (uint256[] memory) {
        return ownerProperties[owner_];
    }

    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        return disputes[disputeId];
    }

    function getRentalDisputes(uint256 rentalId) external view returns (uint256[] memory) {
        return rentalDisputes[rentalId];
    }

    function getStats() external view returns (ProtocolStats memory) {
        return stats;
    }

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
     * @notice Verifica contratos inadimplentes (para automacao)
     */
    function checkDefaultedRentals(uint256[] calldata tokenIds)
        external
        view
        returns (uint256[] memory defaulted, uint256 count)
    {
        defaulted = new uint256[](tokenIds.length);
        count = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            Rental storage rental = rentals[tokenIds[i]];
            if (rental.status == RentalStatus.Active && rental.missedPayments >= 3) {
                defaulted[count] = tokenIds[i];
                count++;
            }
        }
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    function setPlatformWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Vinculo: invalid address");
        platformWallet = newWallet;
    }

    function setInsuranceWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Vinculo: invalid address");
        insuranceWallet = newWallet;
    }

    function setBRZToken(address brzAddress) external onlyOwner {
        brzToken = IBRZ(brzAddress);
    }

    function addOperator(address operator) external onlyOwner {
        _grantRole(OPERATOR_ROLE, operator);
    }

    function removeOperator(address operator) external onlyOwner {
        _revokeRole(OPERATOR_ROLE, operator);
    }

    function addArbitrator(address arbitrator) external onlyOwner {
        _grantRole(ARBITRATOR_ROLE, arbitrator);
    }

    function removeArbitrator(address arbitrator) external onlyOwner {
        _revokeRole(ARBITRATOR_ROLE, arbitrator);
    }

    /**
     * @notice Pausa o protocolo (Kill Switch)
     */
    function pause() external onlyOwner {
        _pause();
        emit ProtocolPaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Despausa o protocolo
     */
    function unpause() external onlyOwner {
        _unpause();
        emit ProtocolUnpaused(msg.sender, block.timestamp);
    }

    /**
     * @notice Saque de emergencia (apenas owner)
     */
    function emergencyWithdraw(address to) external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            _safeTransferMATIC(to, balance);
            emit EmergencyWithdraw(to, balance);
        }

        if (address(brzToken) != address(0)) {
            uint256 brzBalance = brzToken.balanceOf(address(this));
            if (brzBalance > 0) {
                brzToken.transfer(to, brzBalance);
            }
        }
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    function _safeTransferMATIC(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Vinculo: MATIC transfer failed");
    }

    // ============================================
    // OVERRIDES
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Receive MATIC
    receive() external payable {}
}

// ============================================================
// TOKEN BRZ MOCKADO (para testes)
// ============================================================

/**
 * @title VinculoTestBRZ
 * @notice Token BRZ mockado para testes na testnet
 * @dev Deploy este primeiro, depois use o endereco no VinculoProtocol
 */
contract VinculoTestBRZ {
    string public name = "Brazilian Digital Token (Test)";
    string public symbol = "tBRZ";
    uint8 public decimals = 4; // BRZ usa 4 decimais

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        // Mint inicial de 1 milhao BRZ para deployer
        uint256 initialSupply = 1_000_000 * 10**decimals;
        balanceOf[msg.sender] = initialSupply;
        totalSupply = initialSupply;
        emit Transfer(address(0), msg.sender, initialSupply);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        return _transfer(msg.sender, to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "BRZ: insufficient allowance");
        allowance[from][msg.sender] -= amount;
        return _transfer(from, to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal returns (bool) {
        require(balanceOf[from] >= amount, "BRZ: insufficient balance");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    /**
     * @notice Faucet para testes - qualquer um pode mintar 10.000 BRZ
     */
    function faucet() external {
        uint256 amount = 10_000 * 10**decimals;
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    /**
     * @notice Mint para endereco especifico (owner)
     */
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }
}
