// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TreasuryVesting
 * @author Vinculo Brasil
 * @notice Contrato de vesting para liberacao gradual de tokens VBRz da Treasury
 * @dev Implementa:
 *      - Cliff de 365 dias (12 meses) antes de qualquer liberacao
 *      - Liberacao linear de 5% por mes apos o cliff
 *      - Funcao release() para retirar tokens liberados
 *
 * Parametros:
 * - Cliff: 365 dias
 * - Vesting: 20 meses apos cliff (5% por mes = 100% em 20 meses)
 * - Total: 365 dias de cliff + 600 dias de vesting = 965 dias (~32 meses)
 */
contract TreasuryVesting is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // =========================================================================
    // CONSTANTES E ROLES
    // =========================================================================

    /// @notice Role para administradores que podem configurar o vesting
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @notice Periodo de cliff em segundos (365 dias)
    uint256 public constant CLIFF_PERIOD = 365 days;

    /// @notice Periodo entre liberacoes (30 dias = 1 mes)
    uint256 public constant RELEASE_PERIOD = 30 days;

    /// @notice Porcentagem liberada por periodo (5% = 500 basis points)
    uint256 public constant RELEASE_PERCENT_BPS = 500;

    /// @notice Base para calculo de porcentagem (10000 = 100%)
    uint256 public constant BPS_BASE = 10000;

    // =========================================================================
    // VARIAVEIS DE ESTADO
    // =========================================================================

    /// @notice Token VBRz sendo liberado
    IERC20 public immutable token;

    /// @notice Endereco beneficiario (Treasury Wallet)
    address public beneficiary;

    /// @notice Timestamp de inicio do vesting
    uint256 public startTime;

    /// @notice Total de tokens depositados para vesting
    uint256 public totalVested;

    /// @notice Total de tokens ja liberados
    uint256 public totalReleased;

    /// @notice Indica se o vesting foi iniciado
    bool public vestingStarted;

    /// @notice Indica se o vesting foi revogado
    bool public revoked;

    // =========================================================================
    // EVENTOS
    // =========================================================================

    event VestingStarted(address indexed beneficiary, uint256 totalAmount, uint256 startTime);
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event BeneficiaryChanged(address indexed oldBeneficiary, address indexed newBeneficiary);
    event VestingRevoked(address indexed admin, uint256 remainingTokens);
    event TokensDeposited(address indexed depositor, uint256 amount);

    // =========================================================================
    // MODIFICADORES
    // =========================================================================

    modifier onlyAfterCliff() {
        require(block.timestamp >= startTime + CLIFF_PERIOD, "Vesting: still in cliff period");
        _;
    }

    modifier vestingActive() {
        require(vestingStarted, "Vesting: not started");
        require(!revoked, "Vesting: has been revoked");
        _;
    }

    // =========================================================================
    // CONSTRUTOR
    // =========================================================================

    /**
     * @notice Inicializa o contrato de vesting
     * @param _token Endereco do token VBRz
     * @param _beneficiary Endereco da Treasury Wallet
     * @param _admin Endereco do administrador
     */
    constructor(
        address _token,
        address _beneficiary,
        address _admin
    ) {
        require(_token != address(0), "Vesting: invalid token");
        require(_beneficiary != address(0), "Vesting: invalid beneficiary");
        require(_admin != address(0), "Vesting: invalid admin");

        token = IERC20(_token);
        beneficiary = _beneficiary;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
    }

    // =========================================================================
    // FUNCOES DE ADMINISTRACAO
    // =========================================================================

    /**
     * @notice Deposita tokens e inicia o vesting
     * @dev Tokens devem ser aprovados antes de chamar esta funcao
     * @param amount Quantidade de tokens a depositar
     */
    function depositAndStart(uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(!vestingStarted, "Vesting: already started");
        require(amount > 0, "Vesting: amount must be > 0");

        // Transfere tokens para o contrato
        token.safeTransferFrom(msg.sender, address(this), amount);

        totalVested = amount;
        startTime = block.timestamp;
        vestingStarted = true;

        emit TokensDeposited(msg.sender, amount);
        emit VestingStarted(beneficiary, amount, startTime);
    }

    /**
     * @notice Adiciona mais tokens ao vesting
     * @param amount Quantidade adicional de tokens
     */
    function addTokens(uint256 amount) external onlyRole(ADMIN_ROLE) vestingActive {
        require(amount > 0, "Vesting: amount must be > 0");

        token.safeTransferFrom(msg.sender, address(this), amount);
        totalVested += amount;

        emit TokensDeposited(msg.sender, amount);
    }

    /**
     * @notice Altera o beneficiario do vesting
     * @param newBeneficiary Novo endereco beneficiario
     */
    function changeBeneficiary(address newBeneficiary) external onlyRole(ADMIN_ROLE) {
        require(newBeneficiary != address(0), "Vesting: invalid beneficiary");

        address oldBeneficiary = beneficiary;
        beneficiary = newBeneficiary;

        emit BeneficiaryChanged(oldBeneficiary, newBeneficiary);
    }

    /**
     * @notice Revoga o vesting e devolve tokens restantes ao admin
     * @dev Apenas tokens nao liberados sao devolvidos
     */
    function revoke() external onlyRole(DEFAULT_ADMIN_ROLE) vestingActive {
        revoked = true;

        uint256 remaining = token.balanceOf(address(this));
        if (remaining > 0) {
            token.safeTransfer(msg.sender, remaining);
        }

        emit VestingRevoked(msg.sender, remaining);
    }

    // =========================================================================
    // FUNCOES DE LIBERACAO
    // =========================================================================

    /**
     * @notice Libera tokens disponíveis para o beneficiario
     * @return released Quantidade de tokens liberados
     */
    function release() external nonReentrant vestingActive onlyAfterCliff returns (uint256 released) {
        uint256 releasable = vestedAmount() - totalReleased;
        require(releasable > 0, "Vesting: no tokens to release");

        totalReleased += releasable;
        token.safeTransfer(beneficiary, releasable);

        emit TokensReleased(beneficiary, releasable);
        return releasable;
    }

    // =========================================================================
    // FUNCOES DE VISUALIZACAO
    // =========================================================================

    /**
     * @notice Calcula total de tokens liberados ate o momento
     * @return vested Quantidade total de tokens que ja passaram pelo vesting
     */
    function vestedAmount() public view returns (uint256 vested) {
        if (!vestingStarted || block.timestamp < startTime) {
            return 0;
        }

        // Se ainda esta no cliff, nada foi liberado
        if (block.timestamp < startTime + CLIFF_PERIOD) {
            return 0;
        }

        // Tempo desde o fim do cliff
        uint256 timeFromCliff = block.timestamp - (startTime + CLIFF_PERIOD);

        // Numero de periodos completos (meses)
        uint256 periodsElapsed = timeFromCliff / RELEASE_PERIOD;

        // Calcula porcentagem liberada (5% por periodo)
        uint256 percentVested = periodsElapsed * RELEASE_PERCENT_BPS;

        // Limita a 100%
        if (percentVested >= BPS_BASE) {
            return totalVested;
        }

        // Calcula tokens liberados
        return (totalVested * percentVested) / BPS_BASE;
    }

    /**
     * @notice Retorna quantidade de tokens disponiveis para liberacao
     * @return releasable Tokens que podem ser liberados agora
     */
    function releasableAmount() external view returns (uint256 releasable) {
        if (!vestingStarted || revoked) {
            return 0;
        }
        return vestedAmount() - totalReleased;
    }

    /**
     * @notice Retorna quantidade de tokens ainda bloqueados
     * @return locked Tokens que ainda estao em vesting
     */
    function lockedAmount() external view returns (uint256 locked) {
        if (!vestingStarted) {
            return 0;
        }
        return totalVested - vestedAmount();
    }

    /**
     * @notice Retorna informacoes completas do vesting
     */
    function getVestingInfo()
        external
        view
        returns (
            address beneficiary_,
            uint256 totalVested_,
            uint256 totalReleased_,
            uint256 releasable,
            uint256 locked,
            uint256 startTime_,
            uint256 cliffEndTime,
            uint256 vestingEndTime,
            bool isInCliff,
            bool isFullyVested,
            uint256 nextReleaseTime,
            uint256 nextReleaseAmount
        )
    {
        beneficiary_ = beneficiary;
        totalVested_ = totalVested;
        totalReleased_ = totalReleased;
        releasable = vestingStarted && !revoked ? vestedAmount() - totalReleased_ : 0;
        locked = vestingStarted ? totalVested_ - vestedAmount() : 0;
        startTime_ = startTime;
        cliffEndTime = startTime + CLIFF_PERIOD;
        vestingEndTime = startTime + CLIFF_PERIOD + (20 * RELEASE_PERIOD); // 20 meses apos cliff
        isInCliff = vestingStarted && block.timestamp < cliffEndTime;
        isFullyVested = vestingStarted && vestedAmount() >= totalVested_;

        // Calcula proximo release
        if (vestingStarted && !isFullyVested) {
            if (block.timestamp < cliffEndTime) {
                nextReleaseTime = cliffEndTime;
                nextReleaseAmount = (totalVested_ * RELEASE_PERCENT_BPS) / BPS_BASE;
            } else {
                uint256 timeFromCliff = block.timestamp - cliffEndTime;
                uint256 periodsElapsed = timeFromCliff / RELEASE_PERIOD;
                nextReleaseTime = cliffEndTime + ((periodsElapsed + 1) * RELEASE_PERIOD);
                nextReleaseAmount = (totalVested_ * RELEASE_PERCENT_BPS) / BPS_BASE;
            }
        }
    }

    /**
     * @notice Calcula status do vesting em porcentagem
     * @return vestingProgress Progresso do vesting (0-10000 = 0-100%)
     * @return cliffProgress Progresso do cliff (0-10000 = 0-100%)
     */
    function getProgress()
        external
        view
        returns (uint256 vestingProgress, uint256 cliffProgress)
    {
        if (!vestingStarted) {
            return (0, 0);
        }

        // Progresso do cliff
        if (block.timestamp >= startTime + CLIFF_PERIOD) {
            cliffProgress = BPS_BASE; // 100%
        } else {
            uint256 timeInCliff = block.timestamp - startTime;
            cliffProgress = (timeInCliff * BPS_BASE) / CLIFF_PERIOD;
        }

        // Progresso do vesting
        vestingProgress = (vestedAmount() * BPS_BASE) / totalVested;
    }
}
