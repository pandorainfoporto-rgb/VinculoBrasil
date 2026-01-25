// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PropertyCollateral
 * @author Vinculo.io
 * @notice NFT que representa imoveis usados como colateral por garantidores
 * @dev Cada NFT representa um imovel tokenizado que pode ser bloqueado como garantia
 *
 * Fluxo:
 * 1. Garantidor registra seu imovel (minta NFT)
 * 2. Ao garantir um contrato, o NFT e bloqueado
 * 3. Se o contrato terminar sem problemas, NFT e desbloqueado
 * 4. Se houver inadimplencia, NFT pode ser liquidado
 */
contract PropertyCollateral is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {

    // ============================================
    // STRUCTS
    // ============================================

    struct Property {
        string propertyId;          // ID externo do imovel
        string registrationNumber;  // Matricula do imovel
        address owner;              // Proprietario
        uint256 valueBRL;           // Valor em BRL (centavos)
        uint256 valueWei;           // Valor equivalente em wei
        string ipfsHash;            // Documentos no IPFS
        string city;                // Cidade
        string state;               // Estado
        bool isLocked;              // Se esta bloqueado como colateral
        uint256 lockedForRental;    // ID do rental (se bloqueado)
        uint256 registeredAt;       // Timestamp de registro
        bool isVerified;            // Se foi verificado pela plataforma
    }

    struct LockRecord {
        uint256 propertyTokenId;
        uint256 rentalContractId;
        address lockedBy;
        uint256 lockedAt;
        uint256 unlockedAt;
        bool isActive;
    }

    // ============================================
    // STATE VARIABLES
    // ============================================

    uint256 private _tokenIdCounter;

    // Endereco do contrato VinculoContract
    address public vinculoContract;

    // Mappings
    mapping(uint256 => Property) public properties;
    mapping(string => uint256) public propertyIdToToken;
    mapping(address => uint256[]) public ownerProperties;
    mapping(uint256 => LockRecord[]) public lockHistory;

    // Stats
    uint256 public totalLockedValue;
    uint256 public totalProperties;

    // ============================================
    // EVENTS
    // ============================================

    event PropertyRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string propertyId,
        uint256 valueBRL
    );

    event PropertyVerified(
        uint256 indexed tokenId,
        address indexed verifier
    );

    event PropertyLocked(
        uint256 indexed tokenId,
        uint256 indexed rentalContractId,
        address indexed lockedBy
    );

    event PropertyUnlocked(
        uint256 indexed tokenId,
        uint256 indexed rentalContractId
    );

    event PropertyLiquidated(
        uint256 indexed tokenId,
        address indexed previousOwner,
        address indexed newOwner,
        uint256 amount
    );

    event PropertyValueUpdated(
        uint256 indexed tokenId,
        uint256 oldValue,
        uint256 newValue
    );

    // ============================================
    // MODIFIERS
    // ============================================

    modifier onlyPropertyOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "PropertyCollateral: not owner");
        _;
    }

    modifier propertyNotLocked(uint256 tokenId) {
        require(!properties[tokenId].isLocked, "PropertyCollateral: property is locked");
        _;
    }

    modifier propertyLocked(uint256 tokenId) {
        require(properties[tokenId].isLocked, "PropertyCollateral: property not locked");
        _;
    }

    modifier onlyVinculoContract() {
        require(msg.sender == vinculoContract, "PropertyCollateral: only Vinculo contract");
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor() ERC721("Vinculo Property Collateral", "VPROP") Ownable(msg.sender) {}

    // ============================================
    // MAIN FUNCTIONS
    // ============================================

    /**
     * @notice Registra um novo imovel como NFT
     * @param propertyId ID externo do imovel
     * @param registrationNumber Matricula do imovel
     * @param valueBRL Valor em BRL (em centavos, ex: R$ 500.000,00 = 50000000)
     * @param valueWei Valor equivalente em wei
     * @param city Cidade
     * @param state Estado (UF)
     * @param ipfsHash Hash IPFS dos documentos
     */
    function registerProperty(
        string memory propertyId,
        string memory registrationNumber,
        uint256 valueBRL,
        uint256 valueWei,
        string memory city,
        string memory state,
        string memory ipfsHash
    ) external returns (uint256) {
        require(bytes(propertyId).length > 0, "PropertyCollateral: invalid propertyId");
        require(bytes(registrationNumber).length > 0, "PropertyCollateral: invalid registration");
        require(valueBRL > 0, "PropertyCollateral: value must be positive");
        require(propertyIdToToken[propertyId] == 0, "PropertyCollateral: property already registered");

        uint256 tokenId = ++_tokenIdCounter;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, ipfsHash);

        properties[tokenId] = Property({
            propertyId: propertyId,
            registrationNumber: registrationNumber,
            owner: msg.sender,
            valueBRL: valueBRL,
            valueWei: valueWei,
            ipfsHash: ipfsHash,
            city: city,
            state: state,
            isLocked: false,
            lockedForRental: 0,
            registeredAt: block.timestamp,
            isVerified: false
        });

        propertyIdToToken[propertyId] = tokenId;
        ownerProperties[msg.sender].push(tokenId);
        totalProperties++;

        emit PropertyRegistered(tokenId, msg.sender, propertyId, valueBRL);

        return tokenId;
    }

    /**
     * @notice Verifica um imovel (apenas admin)
     * @param tokenId ID do NFT do imovel
     */
    function verifyProperty(uint256 tokenId) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "PropertyCollateral: property not exists");
        require(!properties[tokenId].isVerified, "PropertyCollateral: already verified");

        properties[tokenId].isVerified = true;

        emit PropertyVerified(tokenId, msg.sender);
    }

    /**
     * @notice Bloqueia imovel como colateral para um contrato
     * @param tokenId ID do NFT do imovel
     * @param rentalContractId ID do contrato de aluguel
     */
    function lockAsCollateral(
        uint256 tokenId,
        uint256 rentalContractId
    ) external onlyPropertyOwner(tokenId) propertyNotLocked(tokenId) {
        Property storage prop = properties[tokenId];
        require(prop.isVerified, "PropertyCollateral: property not verified");

        prop.isLocked = true;
        prop.lockedForRental = rentalContractId;
        totalLockedValue += prop.valueBRL;

        LockRecord memory record = LockRecord({
            propertyTokenId: tokenId,
            rentalContractId: rentalContractId,
            lockedBy: msg.sender,
            lockedAt: block.timestamp,
            unlockedAt: 0,
            isActive: true
        });

        lockHistory[tokenId].push(record);

        emit PropertyLocked(tokenId, rentalContractId, msg.sender);
    }

    /**
     * @notice Desbloqueia imovel apos fim do contrato
     * @param tokenId ID do NFT do imovel
     * @param rentalContractId ID do contrato de aluguel
     */
    function unlockCollateral(
        uint256 tokenId,
        uint256 rentalContractId
    ) external propertyLocked(tokenId) {
        Property storage prop = properties[tokenId];

        // Pode ser desbloqueado pelo owner, pelo contrato Vinculo, ou admin
        require(
            msg.sender == prop.owner ||
            msg.sender == vinculoContract ||
            msg.sender == owner(),
            "PropertyCollateral: not authorized"
        );

        require(
            prop.lockedForRental == rentalContractId,
            "PropertyCollateral: wrong rental contract"
        );

        prop.isLocked = false;
        prop.lockedForRental = 0;
        totalLockedValue -= prop.valueBRL;

        // Atualiza ultimo lock record
        LockRecord[] storage history = lockHistory[tokenId];
        if (history.length > 0) {
            history[history.length - 1].unlockedAt = block.timestamp;
            history[history.length - 1].isActive = false;
        }

        emit PropertyUnlocked(tokenId, rentalContractId);
    }

    /**
     * @notice Liquida imovel em caso de inadimplencia
     * @param tokenId ID do NFT do imovel
     * @param newOwner Novo proprietario (quem recebe o imovel)
     * @param amount Valor da liquidacao
     */
    function liquidateProperty(
        uint256 tokenId,
        address newOwner,
        uint256 amount
    ) external nonReentrant propertyLocked(tokenId) {
        // Apenas o contrato Vinculo ou admin pode liquidar
        require(
            msg.sender == vinculoContract || msg.sender == owner(),
            "PropertyCollateral: not authorized to liquidate"
        );

        Property storage prop = properties[tokenId];
        address previousOwner = prop.owner;

        // Transfere NFT
        _transfer(previousOwner, newOwner, tokenId);

        // Atualiza property
        prop.owner = newOwner;
        prop.isLocked = false;
        prop.lockedForRental = 0;
        totalLockedValue -= prop.valueBRL;

        // Remove do array do owner anterior e adiciona ao novo
        _removeFromOwnerProperties(previousOwner, tokenId);
        ownerProperties[newOwner].push(tokenId);

        emit PropertyLiquidated(tokenId, previousOwner, newOwner, amount);
    }

    /**
     * @notice Atualiza o valor de um imovel
     * @param tokenId ID do NFT
     * @param newValueBRL Novo valor em BRL (centavos)
     * @param newValueWei Novo valor em wei
     */
    function updatePropertyValue(
        uint256 tokenId,
        uint256 newValueBRL,
        uint256 newValueWei
    ) external onlyOwner {
        Property storage prop = properties[tokenId];
        require(prop.registeredAt > 0, "PropertyCollateral: property not exists");

        uint256 oldValue = prop.valueBRL;

        // Atualiza totalLockedValue se estiver bloqueado
        if (prop.isLocked) {
            totalLockedValue = totalLockedValue - oldValue + newValueBRL;
        }

        prop.valueBRL = newValueBRL;
        prop.valueWei = newValueWei;

        emit PropertyValueUpdated(tokenId, oldValue, newValueBRL);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Retorna detalhes de um imovel
     */
    function getProperty(uint256 tokenId) external view returns (Property memory) {
        return properties[tokenId];
    }

    /**
     * @notice Retorna imoveis de um owner
     */
    function getOwnerProperties(address owner_) external view returns (uint256[] memory) {
        return ownerProperties[owner_];
    }

    /**
     * @notice Retorna historico de locks de um imovel
     */
    function getLockHistory(uint256 tokenId) external view returns (LockRecord[] memory) {
        return lockHistory[tokenId];
    }

    /**
     * @notice Verifica se imovel pode ser usado como colateral
     */
    function canBeUsedAsCollateral(uint256 tokenId) external view returns (bool) {
        Property memory prop = properties[tokenId];
        return prop.isVerified && !prop.isLocked;
    }

    /**
     * @notice Retorna estatisticas
     */
    function getStats() external view returns (
        uint256 _totalProperties,
        uint256 _totalLockedValue,
        uint256 _tokenCounter
    ) {
        return (totalProperties, totalLockedValue, _tokenIdCounter);
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Define o endereco do contrato Vinculo
     */
    function setVinculoContract(address _vinculoContract) external onlyOwner {
        require(_vinculoContract != address(0), "PropertyCollateral: invalid address");
        vinculoContract = _vinculoContract;
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    function _removeFromOwnerProperties(address owner_, uint256 tokenId) internal {
        uint256[] storage props = ownerProperties[owner_];
        for (uint256 i = 0; i < props.length; i++) {
            if (props[i] == tokenId) {
                props[i] = props[props.length - 1];
                props.pop();
                break;
            }
        }
    }

    // ============================================
    // OVERRIDES (ERC721)
    // ============================================

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
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @notice Override para prevenir transferencia de imoveis bloqueados
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        // Permite mint (from == 0) e liquidacao (chamado internamente)
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            require(!properties[tokenId].isLocked, "PropertyCollateral: cannot transfer locked property");
        }
        return super._update(to, tokenId, auth);
    }
}
