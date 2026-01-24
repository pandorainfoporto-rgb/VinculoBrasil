// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VBRzToken (Vinculo Token)
 * @author Vinculo Brasil - FATTO Tecnologia LTDA
 * @notice Token de fidelidade e cashback do ecossistema Vinculo Brasil
 *
 * @dev Token ERC-20 com funcionalidades de:
 *      - Burnable: Queima publica para deflacao
 *      - AccessControl: Roles para operadores
 *      - Pausable: Pausa de emergencia
 *
 * Tokenomics (1 Bilhao):
 * ┌─────────────────────────────────────────────┐
 * │ Alocacao           │ %    │ Quantidade     │
 * ├─────────────────────────────────────────────┤
 * │ Treasury           │ 20%  │ 200.000.000    │
 * │ Cashback Pool      │ 40%  │ 400.000.000    │
 * │ Team (Vesting)     │ 15%  │ 150.000.000    │
 * │ Staking Rewards    │ 10%  │ 100.000.000    │
 * │ Marketing          │  5%  │  50.000.000    │
 * │ Reserve            │ 10%  │ 100.000.000    │
 * └─────────────────────────────────────────────┘
 *
 * Valor Interno: 1 VBRz = R$ 0,10 (Fixed Peg Fase 1)
 */
contract VBRzToken is ERC20, ERC20Burnable, AccessControl, Pausable {
    // =========================================================================
    // CONSTANTES
    // =========================================================================

    /// @notice Supply maximo fixo: 1 Bilhao de tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    /// @notice Valor fixo: 1 VBRz = 10 centavos de Real
    uint256 public constant FIXED_PEG_CENTAVOS = 10;

    // =========================================================================
    // ROLES
    // =========================================================================

    /// @notice Role para operadores que podem distribuir cashback
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    /// @notice Role para operadores que podem queimar em nome de usuarios
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // =========================================================================
    // VARIAVEIS DE ESTADO
    // =========================================================================

    /// @notice Endereco da Treasury Wallet
    address public treasuryWallet;

    /// @notice Total de tokens distribuidos como cashback
    uint256 public totalCashbackDistributed;

    /// @notice Total de tokens queimados (deflationary)
    uint256 public totalBurnedTokens;

    // =========================================================================
    // EVENTOS
    // =========================================================================

    event CashbackDistributed(
        address indexed recipient,
        uint256 amount,
        string indexed category,
        string referenceId
    );

    event TokensBurned(
        address indexed from,
        uint256 amount,
        string reason
    );

    event TreasuryUpdated(
        address indexed oldTreasury,
        address indexed newTreasury
    );

    // =========================================================================
    // CONSTRUTOR
    // =========================================================================

    /**
     * @notice Inicializa o token VBRz com 1 Bilhao de supply
     * @param _treasuryWallet Carteira que recebe todo o supply inicial
     * @param _admin Endereco do administrador (recebe todas as roles)
     *
     * @dev O deployer (_admin) recebe todo o supply para distribuir conforme Tokenomics:
     *      - 20% para Treasury
     *      - 40% para Cashback Pool (contrato separado)
     *      - 15% para Team Vesting (TokenVesting.sol)
     *      - 10% para Staking Rewards
     *      - 5% para Marketing
     *      - 10% para Reserve
     */
    constructor(
        address _treasuryWallet,
        address _admin
    ) ERC20("Vinculo Token", "VBRz") {
        require(_treasuryWallet != address(0), "VBRz: invalid treasury");
        require(_admin != address(0), "VBRz: invalid admin");

        treasuryWallet = _treasuryWallet;

        // Configura roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _admin);
        _grantRole(BURNER_ROLE, _admin);

        // Mint 1 Bilhao para o admin distribuir
        _mint(_admin, MAX_SUPPLY);
    }

    // =========================================================================
    // FUNCOES DE BURN (PUBLICAS)
    // =========================================================================

    /**
     * @notice Queima tokens do proprio saldo (herdado de ERC20Burnable)
     * @dev Qualquer holder pode queimar seus proprios tokens
     * @param amount Quantidade a queimar
     */
    function burn(uint256 amount) public virtual override whenNotPaused {
        super.burn(amount);
        totalBurnedTokens += amount;
        emit TokensBurned(msg.sender, amount, "self-burn");
    }

    /**
     * @notice Queima tokens de outro endereco (requer allowance)
     * @param account Endereco do qual queimar
     * @param amount Quantidade a queimar
     */
    function burnFrom(address account, uint256 amount) public virtual override whenNotPaused {
        super.burnFrom(account, amount);
        totalBurnedTokens += amount;
        emit TokensBurned(account, amount, "approved-burn");
    }

    /**
     * @notice Operador queima tokens em nome de usuario (para resgates)
     * @param user Endereco do usuario
     * @param amount Quantidade a queimar
     * @param reason Motivo do burn
     */
    function burnForUser(
        address user,
        uint256 amount,
        string calldata reason
    ) external onlyRole(BURNER_ROLE) whenNotPaused {
        require(balanceOf(user) >= amount, "VBRz: insufficient balance");

        _burn(user, amount);
        totalBurnedTokens += amount;

        emit TokensBurned(user, amount, reason);
    }

    // =========================================================================
    // FUNCOES DE CASHBACK (OPERADORES)
    // =========================================================================

    /**
     * @notice Distribui cashback para um usuario
     * @param recipient Endereco do usuario
     * @param amount Quantidade de VBRz
     * @param category Categoria do cashback (ex: "rent", "referral", "insurance")
     * @param referenceId ID de referencia
     */
    function distributeCashback(
        address recipient,
        uint256 amount,
        string calldata category,
        string calldata referenceId
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(recipient != address(0), "VBRz: invalid recipient");
        require(amount > 0, "VBRz: amount must be > 0");
        require(balanceOf(treasuryWallet) >= amount, "VBRz: insufficient treasury");

        _transfer(treasuryWallet, recipient, amount);
        totalCashbackDistributed += amount;

        emit CashbackDistributed(recipient, amount, category, referenceId);
    }

    /**
     * @notice Distribui cashback em lote
     * @param recipients Array de enderecos
     * @param amounts Array de quantidades
     * @param category Categoria do cashback
     * @param referenceIds Array de IDs de referencia
     */
    function batchDistributeCashback(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string calldata category,
        string[] calldata referenceIds
    ) external onlyRole(OPERATOR_ROLE) whenNotPaused {
        require(recipients.length == amounts.length, "VBRz: length mismatch");
        require(recipients.length == referenceIds.length, "VBRz: length mismatch");
        require(recipients.length <= 100, "VBRz: batch too large");

        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        require(balanceOf(treasuryWallet) >= total, "VBRz: insufficient treasury");

        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0) && amounts[i] > 0) {
                _transfer(treasuryWallet, recipients[i], amounts[i]);
                totalCashbackDistributed += amounts[i];
                emit CashbackDistributed(recipients[i], amounts[i], category, referenceIds[i]);
            }
        }
    }

    // =========================================================================
    // FUNCOES DE VISUALIZACAO
    // =========================================================================

    /**
     * @notice Retorna saldo do usuario e valor em BRL
     */
    function getBalanceWithValue(address user)
        external
        view
        returns (uint256 balanceVBRz, uint256 valueBRL)
    {
        balanceVBRz = balanceOf(user);
        valueBRL = (balanceVBRz * FIXED_PEG_CENTAVOS) / 10**18;
    }

    /**
     * @notice Retorna estatisticas do token
     */
    function getTokenStats()
        external
        view
        returns (
            uint256 totalSupply_,
            uint256 circulatingSupply,
            uint256 treasuryBalance,
            uint256 totalDistributed,
            uint256 totalBurned_
        )
    {
        totalSupply_ = totalSupply();
        treasuryBalance = balanceOf(treasuryWallet);
        circulatingSupply = totalSupply_ - treasuryBalance;
        totalDistributed = totalCashbackDistributed;
        totalBurned_ = totalBurnedTokens;
    }

    /**
     * @notice Calcula valor em BRL de uma quantidade de VBRz
     */
    function calculateBRLValue(uint256 amountVBRz)
        external
        pure
        returns (uint256 valueCentavos)
    {
        return (amountVBRz * FIXED_PEG_CENTAVOS) / 10**18;
    }

    // =========================================================================
    // FUNCOES ADMINISTRATIVAS
    // =========================================================================

    /**
     * @notice Atualiza endereco da Treasury
     */
    function setTreasuryWallet(address newTreasury)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(newTreasury != address(0), "VBRz: invalid treasury");
        address oldTreasury = treasuryWallet;
        treasuryWallet = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @notice Pausa o contrato
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Despausa o contrato
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // =========================================================================
    // OVERRIDES
    // =========================================================================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
