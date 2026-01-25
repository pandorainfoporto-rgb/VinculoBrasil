// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TokenVesting
 * @author Vinculo Brasil
 * @notice Contrato de vesting com suporte a multiplos schedules (agendas de liberacao)
 * @dev Permite criar agendas de vesting para diferentes beneficiarios com:
 *      - Cliff (Carencia): Periodo antes de qualquer liberacao
 *      - Duration (Duracao): Periodo de liberacao linear apos o cliff
 *      - Revogavel: O admin pode revogar schedules nao liberados
 *
 * Baseado no padrao OpenZeppelin VestingWallet, mas com suporte a multiplos beneficiarios.
 */
contract TokenVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // =========================================================================
    // ESTRUTURAS
    // =========================================================================

    /**
     * @notice Estrutura de um schedule de vesting
     * @param beneficiary Endereco que recebera os tokens
     * @param totalAmount Total de tokens no schedule
     * @param released Tokens ja liberados
     * @param startTime Timestamp de inicio do vesting
     * @param cliffDuration Duracao do cliff em segundos
     * @param vestingDuration Duracao total do vesting em segundos (apos cliff)
     * @param revocable Se o schedule pode ser revogado
     * @param revoked Se o schedule foi revogado
     */
    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 released;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        bool revocable;
        bool revoked;
    }

    // =========================================================================
    // VARIAVEIS DE ESTADO
    // =========================================================================

    /// @notice Token sendo liberado (VBRz)
    IERC20 public immutable token;

    /// @notice Mapeamento de scheduleId para VestingSchedule
    mapping(bytes32 => VestingSchedule) public vestingSchedules;

    /// @notice Array de IDs de schedules de um beneficiario
    mapping(address => bytes32[]) public beneficiarySchedules;

    /// @notice Total de tokens bloqueados em todos os schedules
    uint256 public totalVestingAmount;

    /// @notice Contador para gerar IDs unicos
    uint256 private scheduleCounter;

    // =========================================================================
    // EVENTOS
    // =========================================================================

    event ScheduleCreated(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    );

    event TokensReleased(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount
    );

    event ScheduleRevoked(
        bytes32 indexed scheduleId,
        address indexed beneficiary,
        uint256 unvestedAmount
    );

    event TokensWithdrawn(address indexed to, uint256 amount);

    // =========================================================================
    // CONSTRUTOR
    // =========================================================================

    /**
     * @notice Inicializa o contrato de vesting
     * @param _token Endereco do token VBRz
     */
    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "TokenVesting: invalid token");
        token = IERC20(_token);
    }

    // =========================================================================
    // FUNCOES DE ADMINISTRACAO
    // =========================================================================

    /**
     * @notice Cria um novo schedule de vesting
     * @param _beneficiary Endereco do beneficiario
     * @param _amount Quantidade total de tokens
     * @param _startTime Timestamp de inicio (0 = agora)
     * @param _cliffDuration Duracao do cliff em segundos
     * @param _vestingDuration Duracao do vesting apos cliff em segundos
     * @param _revocable Se o schedule pode ser revogado
     * @return scheduleId ID unico do schedule criado
     */
    function createVestingSchedule(
        address _beneficiary,
        uint256 _amount,
        uint256 _startTime,
        uint256 _cliffDuration,
        uint256 _vestingDuration,
        bool _revocable
    ) external onlyOwner returns (bytes32 scheduleId) {
        require(_beneficiary != address(0), "TokenVesting: invalid beneficiary");
        require(_amount > 0, "TokenVesting: amount must be > 0");
        require(_vestingDuration > 0, "TokenVesting: duration must be > 0");
        require(
            token.balanceOf(address(this)) >= totalVestingAmount + _amount,
            "TokenVesting: insufficient tokens"
        );

        // Gera ID unico
        scheduleId = _computeScheduleId(_beneficiary, scheduleCounter);
        scheduleCounter++;

        // Define startTime
        uint256 startTime = _startTime == 0 ? block.timestamp : _startTime;

        // Cria schedule
        vestingSchedules[scheduleId] = VestingSchedule({
            beneficiary: _beneficiary,
            totalAmount: _amount,
            released: 0,
            startTime: startTime,
            cliffDuration: _cliffDuration,
            vestingDuration: _vestingDuration,
            revocable: _revocable,
            revoked: false
        });

        // Registra para o beneficiario
        beneficiarySchedules[_beneficiary].push(scheduleId);

        // Atualiza total bloqueado
        totalVestingAmount += _amount;

        emit ScheduleCreated(
            scheduleId,
            _beneficiary,
            _amount,
            startTime,
            _cliffDuration,
            _vestingDuration,
            _revocable
        );
    }

    /**
     * @notice Revoga um schedule de vesting
     * @dev Apenas schedules marcados como revocable podem ser revogados
     * @param scheduleId ID do schedule a revogar
     */
    function revokeSchedule(bytes32 scheduleId) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];

        require(schedule.beneficiary != address(0), "TokenVesting: schedule not found");
        require(schedule.revocable, "TokenVesting: schedule not revocable");
        require(!schedule.revoked, "TokenVesting: already revoked");

        // Calcula tokens nao liberados
        uint256 vested = _computeVestedAmount(schedule);
        uint256 unreleased = vested - schedule.released;
        uint256 unvested = schedule.totalAmount - vested;

        // Libera tokens vested pendentes para o beneficiario
        if (unreleased > 0) {
            schedule.released += unreleased;
            token.safeTransfer(schedule.beneficiary, unreleased);
            emit TokensReleased(scheduleId, schedule.beneficiary, unreleased);
        }

        // Marca como revogado
        schedule.revoked = true;

        // Atualiza total bloqueado
        totalVestingAmount -= unvested;

        emit ScheduleRevoked(scheduleId, schedule.beneficiary, unvested);
    }

    /**
     * @notice Retira tokens nao alocados do contrato
     * @param amount Quantidade a retirar
     */
    function withdrawUnallocated(uint256 amount) external onlyOwner {
        uint256 unallocated = token.balanceOf(address(this)) - totalVestingAmount;
        require(amount <= unallocated, "TokenVesting: insufficient unallocated");

        token.safeTransfer(owner(), amount);
        emit TokensWithdrawn(owner(), amount);
    }

    // =========================================================================
    // FUNCOES DE LIBERACAO
    // =========================================================================

    /**
     * @notice Libera tokens disponiveis de um schedule
     * @param scheduleId ID do schedule
     * @return released Quantidade de tokens liberados
     */
    function release(bytes32 scheduleId) external nonReentrant returns (uint256 released) {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];

        require(schedule.beneficiary != address(0), "TokenVesting: schedule not found");
        require(!schedule.revoked, "TokenVesting: schedule revoked");

        uint256 vested = _computeVestedAmount(schedule);
        uint256 releasable = vested - schedule.released;

        require(releasable > 0, "TokenVesting: no tokens to release");

        schedule.released += releasable;
        totalVestingAmount -= releasable;

        token.safeTransfer(schedule.beneficiary, releasable);

        emit TokensReleased(scheduleId, schedule.beneficiary, releasable);
        return releasable;
    }

    /**
     * @notice Libera tokens de todos os schedules de um beneficiario
     * @param beneficiary Endereco do beneficiario
     * @return totalReleased Total de tokens liberados
     */
    function releaseAll(address beneficiary) external nonReentrant returns (uint256 totalReleased) {
        bytes32[] storage schedules = beneficiarySchedules[beneficiary];

        for (uint256 i = 0; i < schedules.length; i++) {
            VestingSchedule storage schedule = vestingSchedules[schedules[i]];

            if (schedule.revoked) continue;

            uint256 vested = _computeVestedAmount(schedule);
            uint256 releasable = vested - schedule.released;

            if (releasable > 0) {
                schedule.released += releasable;
                totalVestingAmount -= releasable;
                totalReleased += releasable;

                emit TokensReleased(schedules[i], beneficiary, releasable);
            }
        }

        if (totalReleased > 0) {
            token.safeTransfer(beneficiary, totalReleased);
        }
    }

    // =========================================================================
    // FUNCOES DE VISUALIZACAO
    // =========================================================================

    /**
     * @notice Retorna quantidade de tokens liberaveis de um schedule
     */
    function releasableAmount(bytes32 scheduleId) external view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        if (schedule.revoked) return 0;
        return _computeVestedAmount(schedule) - schedule.released;
    }

    /**
     * @notice Retorna quantidade de tokens ja liberados (vested) de um schedule
     */
    function vestedAmount(bytes32 scheduleId) external view returns (uint256) {
        return _computeVestedAmount(vestingSchedules[scheduleId]);
    }

    /**
     * @notice Retorna informacoes completas de um schedule
     */
    function getScheduleInfo(bytes32 scheduleId)
        external
        view
        returns (
            address beneficiary,
            uint256 totalAmount,
            uint256 released,
            uint256 releasable,
            uint256 startTime,
            uint256 cliffEnd,
            uint256 vestingEnd,
            bool isInCliff,
            bool isFullyVested,
            bool revocable,
            bool revoked
        )
    {
        VestingSchedule storage s = vestingSchedules[scheduleId];

        beneficiary = s.beneficiary;
        totalAmount = s.totalAmount;
        released = s.released;
        startTime = s.startTime;
        cliffEnd = s.startTime + s.cliffDuration;
        vestingEnd = s.startTime + s.cliffDuration + s.vestingDuration;
        revocable = s.revocable;
        revoked = s.revoked;

        uint256 vested = _computeVestedAmount(s);
        releasable = s.revoked ? 0 : vested - s.released;
        isInCliff = block.timestamp < cliffEnd;
        isFullyVested = vested >= s.totalAmount;
    }

    /**
     * @notice Retorna IDs de todos os schedules de um beneficiario
     */
    function getSchedulesByBeneficiary(address beneficiary)
        external
        view
        returns (bytes32[] memory)
    {
        return beneficiarySchedules[beneficiary];
    }

    /**
     * @notice Retorna saldo total (liberavel + bloqueado) de um beneficiario
     */
    function getBeneficiaryBalance(address beneficiary)
        external
        view
        returns (uint256 totalBalance, uint256 releasableBalance, uint256 lockedBalance)
    {
        bytes32[] storage schedules = beneficiarySchedules[beneficiary];

        for (uint256 i = 0; i < schedules.length; i++) {
            VestingSchedule storage s = vestingSchedules[schedules[i]];
            if (s.revoked) continue;

            uint256 remaining = s.totalAmount - s.released;
            totalBalance += remaining;

            uint256 vested = _computeVestedAmount(s);
            uint256 releasable = vested - s.released;
            releasableBalance += releasable;
            lockedBalance += remaining - releasable;
        }
    }

    // =========================================================================
    // FUNCOES INTERNAS
    // =========================================================================

    /**
     * @notice Calcula quantidade de tokens vested de um schedule
     */
    function _computeVestedAmount(VestingSchedule storage schedule)
        internal
        view
        returns (uint256)
    {
        if (block.timestamp < schedule.startTime) {
            return 0;
        }

        uint256 cliffEnd = schedule.startTime + schedule.cliffDuration;

        // Ainda no cliff
        if (block.timestamp < cliffEnd) {
            return 0;
        }

        uint256 vestingEnd = cliffEnd + schedule.vestingDuration;

        // Vesting completo
        if (block.timestamp >= vestingEnd) {
            return schedule.totalAmount;
        }

        // Liberacao linear
        uint256 timeFromCliff = block.timestamp - cliffEnd;
        return (schedule.totalAmount * timeFromCliff) / schedule.vestingDuration;
    }

    /**
     * @notice Gera ID unico para um schedule
     */
    function _computeScheduleId(address beneficiary, uint256 index)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(beneficiary, index));
    }
}
