// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VinculoGovernance
 * @author Vinculo.io
 * @notice Sistema de governanca para resolucao de disputas e gestao da plataforma
 * @dev Implementa um sistema de votacao para arbitragem de conflitos
 *
 * Tipos de Disputas:
 * - Inadimplencia do locatario
 * - Problemas no imovel
 * - Quebra de contrato
 * - Disputa sobre caucao/deposito
 * - Danos ao imovel
 */
contract VinculoGovernance is AccessControl, ReentrancyGuard, Pausable {

    // ============================================
    // ROLES
    // ============================================

    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // ============================================
    // ENUMS
    // ============================================

    enum DisputeType {
        PaymentDefault,      // Inadimplencia
        PropertyDamage,      // Danos ao imovel
        ContractBreach,      // Quebra de contrato
        DepositDispute,      // Disputa de caucao
        MaintenanceIssue,    // Problemas de manutencao
        EarlyTermination,    // Rescisao antecipada
        Other                // Outros
    }

    enum DisputeStatus {
        Opened,              // Aberta
        UnderReview,         // Em analise
        AwaitingEvidence,    // Aguardando evidencias
        Voting,              // Em votacao
        Resolved,            // Resolvida
        Appealed,            // Em recurso
        Closed               // Fechada
    }

    enum Resolution {
        None,
        InFavorOfLandlord,
        InFavorOfTenant,
        PartialBoth,
        Dismissed
    }

    // ============================================
    // STRUCTS
    // ============================================

    struct Dispute {
        uint256 id;
        uint256 rentalContractId;

        // Partes
        address initiator;
        address landlord;
        address tenant;

        // Detalhes
        DisputeType disputeType;
        DisputeStatus status;
        string description;
        string[] evidenceHashes;    // IPFS hashes

        // Valores
        uint256 amountInDispute;    // Valor em disputa (wei)
        uint256 amountToLandlord;   // Valor decidido para landlord
        uint256 amountToTenant;     // Valor decidido para tenant

        // Timestamps
        uint256 createdAt;
        uint256 deadlineForEvidence;
        uint256 resolvedAt;

        // Votacao
        Resolution resolution;
        address[] arbitrators;
        uint256 votesForLandlord;
        uint256 votesForTenant;
        mapping(address => bool) hasVoted;

        // Recurso
        bool canAppeal;
        uint256 appealDeadline;
    }

    struct DisputeView {
        uint256 id;
        uint256 rentalContractId;
        address initiator;
        address landlord;
        address tenant;
        DisputeType disputeType;
        DisputeStatus status;
        string description;
        uint256 amountInDispute;
        uint256 createdAt;
        uint256 resolvedAt;
        Resolution resolution;
        uint256 votesForLandlord;
        uint256 votesForTenant;
    }

    struct ArbitratorInfo {
        address arbitrator;
        uint256 casesHandled;
        uint256 casesResolved;
        uint256 reputation;
        bool isActive;
        uint256 joinedAt;
    }

    // ============================================
    // STATE VARIABLES
    // ============================================

    uint256 private _disputeIdCounter;

    // Configuracoes
    uint256 public evidenceDeadlineDays = 7;
    uint256 public appealDeadlineDays = 3;
    uint256 public minArbitratorsForVoting = 3;

    // Mappings
    mapping(uint256 => Dispute) private disputes;
    mapping(uint256 => uint256[]) public rentalDisputes;  // rentalId => disputeIds
    mapping(address => uint256[]) public userDisputes;    // user => disputeIds
    mapping(address => ArbitratorInfo) public arbitrators;

    // Listas
    address[] public activeArbitrators;

    // Stats
    uint256 public totalDisputes;
    uint256 public totalResolved;
    uint256 public totalValueDisputed;

    // ============================================
    // EVENTS
    // ============================================

    event DisputeOpened(
        uint256 indexed disputeId,
        uint256 indexed rentalContractId,
        address indexed initiator,
        DisputeType disputeType,
        uint256 amountInDispute
    );

    event EvidenceSubmitted(
        uint256 indexed disputeId,
        address indexed submitter,
        string ipfsHash
    );

    event DisputeStatusChanged(
        uint256 indexed disputeId,
        DisputeStatus oldStatus,
        DisputeStatus newStatus
    );

    event ArbitratorVoted(
        uint256 indexed disputeId,
        address indexed arbitrator,
        bool inFavorOfLandlord
    );

    event DisputeResolved(
        uint256 indexed disputeId,
        Resolution resolution,
        uint256 amountToLandlord,
        uint256 amountToTenant
    );

    event DisputeAppealed(
        uint256 indexed disputeId,
        address indexed appellant
    );

    event ArbitratorAdded(address indexed arbitrator);
    event ArbitratorRemoved(address indexed arbitrator);

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    // ============================================
    // DISPUTE MANAGEMENT
    // ============================================

    /**
     * @notice Abre uma nova disputa
     * @param rentalContractId ID do contrato de aluguel
     * @param landlord Endereco do locador
     * @param tenant Endereco do locatario
     * @param disputeType Tipo da disputa
     * @param description Descricao da disputa
     * @param amountInDispute Valor em disputa
     */
    function openDispute(
        uint256 rentalContractId,
        address landlord,
        address tenant,
        DisputeType disputeType,
        string memory description,
        uint256 amountInDispute
    ) external whenNotPaused returns (uint256) {
        require(
            msg.sender == landlord || msg.sender == tenant,
            "Governance: only contract parties can open dispute"
        );
        require(bytes(description).length > 0, "Governance: description required");

        uint256 disputeId = ++_disputeIdCounter;

        Dispute storage dispute = disputes[disputeId];
        dispute.id = disputeId;
        dispute.rentalContractId = rentalContractId;
        dispute.initiator = msg.sender;
        dispute.landlord = landlord;
        dispute.tenant = tenant;
        dispute.disputeType = disputeType;
        dispute.status = DisputeStatus.Opened;
        dispute.description = description;
        dispute.amountInDispute = amountInDispute;
        dispute.createdAt = block.timestamp;
        dispute.deadlineForEvidence = block.timestamp + (evidenceDeadlineDays * 1 days);
        dispute.canAppeal = true;

        rentalDisputes[rentalContractId].push(disputeId);
        userDisputes[landlord].push(disputeId);
        userDisputes[tenant].push(disputeId);

        totalDisputes++;
        totalValueDisputed += amountInDispute;

        emit DisputeOpened(disputeId, rentalContractId, msg.sender, disputeType, amountInDispute);

        return disputeId;
    }

    /**
     * @notice Submete evidencia para uma disputa
     * @param disputeId ID da disputa
     * @param ipfsHash Hash IPFS da evidencia
     */
    function submitEvidence(
        uint256 disputeId,
        string memory ipfsHash
    ) external {
        Dispute storage dispute = disputes[disputeId];

        require(dispute.id != 0, "Governance: dispute not exists");
        require(
            msg.sender == dispute.landlord || msg.sender == dispute.tenant,
            "Governance: only parties can submit evidence"
        );
        require(
            dispute.status == DisputeStatus.Opened ||
            dispute.status == DisputeStatus.AwaitingEvidence,
            "Governance: cannot submit evidence now"
        );
        require(
            block.timestamp <= dispute.deadlineForEvidence,
            "Governance: evidence deadline passed"
        );

        dispute.evidenceHashes.push(ipfsHash);

        emit EvidenceSubmitted(disputeId, msg.sender, ipfsHash);
    }

    /**
     * @notice Move disputa para revisao
     * @param disputeId ID da disputa
     */
    function startReview(uint256 disputeId) external onlyRole(OPERATOR_ROLE) {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.id != 0, "Governance: dispute not exists");
        require(dispute.status == DisputeStatus.Opened, "Governance: wrong status");

        DisputeStatus oldStatus = dispute.status;
        dispute.status = DisputeStatus.UnderReview;

        emit DisputeStatusChanged(disputeId, oldStatus, DisputeStatus.UnderReview);
    }

    /**
     * @notice Inicia votacao dos arbitradores
     * @param disputeId ID da disputa
     */
    function startVoting(uint256 disputeId) external onlyRole(OPERATOR_ROLE) {
        Dispute storage dispute = disputes[disputeId];
        require(dispute.id != 0, "Governance: dispute not exists");
        require(
            dispute.status == DisputeStatus.UnderReview ||
            dispute.status == DisputeStatus.AwaitingEvidence,
            "Governance: wrong status"
        );
        require(
            activeArbitrators.length >= minArbitratorsForVoting,
            "Governance: not enough arbitrators"
        );

        DisputeStatus oldStatus = dispute.status;
        dispute.status = DisputeStatus.Voting;

        // Seleciona arbitradores (simplificado - pega os primeiros disponiveis)
        for (uint256 i = 0; i < minArbitratorsForVoting && i < activeArbitrators.length; i++) {
            dispute.arbitrators.push(activeArbitrators[i]);
        }

        emit DisputeStatusChanged(disputeId, oldStatus, DisputeStatus.Voting);
    }

    /**
     * @notice Arbitrador vota na disputa
     * @param disputeId ID da disputa
     * @param inFavorOfLandlord Se vota a favor do locador
     */
    function vote(
        uint256 disputeId,
        bool inFavorOfLandlord
    ) external onlyRole(ARBITRATOR_ROLE) {
        Dispute storage dispute = disputes[disputeId];

        require(dispute.id != 0, "Governance: dispute not exists");
        require(dispute.status == DisputeStatus.Voting, "Governance: not in voting");
        require(!dispute.hasVoted[msg.sender], "Governance: already voted");

        // Verifica se e um arbitrador designado
        bool isDesignated = false;
        for (uint256 i = 0; i < dispute.arbitrators.length; i++) {
            if (dispute.arbitrators[i] == msg.sender) {
                isDesignated = true;
                break;
            }
        }
        require(isDesignated, "Governance: not designated arbitrator");

        dispute.hasVoted[msg.sender] = true;

        if (inFavorOfLandlord) {
            dispute.votesForLandlord++;
        } else {
            dispute.votesForTenant++;
        }

        // Atualiza stats do arbitrador
        arbitrators[msg.sender].casesHandled++;

        emit ArbitratorVoted(disputeId, msg.sender, inFavorOfLandlord);

        // Verifica se todos votaram
        uint256 totalVotes = dispute.votesForLandlord + dispute.votesForTenant;
        if (totalVotes >= dispute.arbitrators.length) {
            _resolveDispute(disputeId);
        }
    }

    /**
     * @notice Resolve a disputa baseado nos votos
     */
    function _resolveDispute(uint256 disputeId) internal {
        Dispute storage dispute = disputes[disputeId];

        DisputeStatus oldStatus = dispute.status;
        dispute.status = DisputeStatus.Resolved;
        dispute.resolvedAt = block.timestamp;
        dispute.appealDeadline = block.timestamp + (appealDeadlineDays * 1 days);

        // Determina resolucao
        if (dispute.votesForLandlord > dispute.votesForTenant) {
            dispute.resolution = Resolution.InFavorOfLandlord;
            dispute.amountToLandlord = dispute.amountInDispute;
            dispute.amountToTenant = 0;
        } else if (dispute.votesForTenant > dispute.votesForLandlord) {
            dispute.resolution = Resolution.InFavorOfTenant;
            dispute.amountToLandlord = 0;
            dispute.amountToTenant = dispute.amountInDispute;
        } else {
            // Empate - divide
            dispute.resolution = Resolution.PartialBoth;
            dispute.amountToLandlord = dispute.amountInDispute / 2;
            dispute.amountToTenant = dispute.amountInDispute - dispute.amountToLandlord;
        }

        totalResolved++;

        // Atualiza reputacao dos arbitradores
        for (uint256 i = 0; i < dispute.arbitrators.length; i++) {
            arbitrators[dispute.arbitrators[i]].casesResolved++;
            arbitrators[dispute.arbitrators[i]].reputation += 10;
        }

        emit DisputeStatusChanged(disputeId, oldStatus, DisputeStatus.Resolved);
        emit DisputeResolved(
            disputeId,
            dispute.resolution,
            dispute.amountToLandlord,
            dispute.amountToTenant
        );
    }

    /**
     * @notice Entra com recurso contra decisao
     * @param disputeId ID da disputa
     */
    function appeal(uint256 disputeId) external payable {
        Dispute storage dispute = disputes[disputeId];

        require(dispute.id != 0, "Governance: dispute not exists");
        require(dispute.status == DisputeStatus.Resolved, "Governance: not resolved");
        require(dispute.canAppeal, "Governance: cannot appeal");
        require(
            block.timestamp <= dispute.appealDeadline,
            "Governance: appeal deadline passed"
        );
        require(
            msg.sender == dispute.landlord || msg.sender == dispute.tenant,
            "Governance: only parties can appeal"
        );

        // Recurso requer taxa (pode ser implementado)
        // require(msg.value >= appealFee, "Governance: insufficient fee");

        DisputeStatus oldStatus = dispute.status;
        dispute.status = DisputeStatus.Appealed;
        dispute.canAppeal = false;

        // Reset votos
        dispute.votesForLandlord = 0;
        dispute.votesForTenant = 0;

        // Limpa votos anteriores (nova rodada)
        for (uint256 i = 0; i < dispute.arbitrators.length; i++) {
            dispute.hasVoted[dispute.arbitrators[i]] = false;
        }

        emit DisputeStatusChanged(disputeId, oldStatus, DisputeStatus.Appealed);
        emit DisputeAppealed(disputeId, msg.sender);
    }

    /**
     * @notice Fecha disputa definitivamente
     * @param disputeId ID da disputa
     */
    function closeDispute(uint256 disputeId) external onlyRole(OPERATOR_ROLE) {
        Dispute storage dispute = disputes[disputeId];

        require(dispute.id != 0, "Governance: dispute not exists");
        require(
            dispute.status == DisputeStatus.Resolved,
            "Governance: must be resolved first"
        );
        require(
            block.timestamp > dispute.appealDeadline || !dispute.canAppeal,
            "Governance: appeal period not over"
        );

        DisputeStatus oldStatus = dispute.status;
        dispute.status = DisputeStatus.Closed;

        emit DisputeStatusChanged(disputeId, oldStatus, DisputeStatus.Closed);
    }

    /**
     * @notice Rejeita disputa sem merito
     * @param disputeId ID da disputa
     */
    function dismissDispute(uint256 disputeId) external onlyRole(OPERATOR_ROLE) {
        Dispute storage dispute = disputes[disputeId];

        require(dispute.id != 0, "Governance: dispute not exists");
        require(
            dispute.status == DisputeStatus.Opened ||
            dispute.status == DisputeStatus.UnderReview,
            "Governance: cannot dismiss"
        );

        DisputeStatus oldStatus = dispute.status;
        dispute.status = DisputeStatus.Closed;
        dispute.resolution = Resolution.Dismissed;
        dispute.resolvedAt = block.timestamp;

        emit DisputeStatusChanged(disputeId, oldStatus, DisputeStatus.Closed);
        emit DisputeResolved(disputeId, Resolution.Dismissed, 0, 0);
    }

    // ============================================
    // ARBITRATOR MANAGEMENT
    // ============================================

    /**
     * @notice Adiciona um arbitrador
     * @param arbitrator Endereco do arbitrador
     */
    function addArbitrator(address arbitrator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(arbitrator != address(0), "Governance: invalid address");
        require(!arbitrators[arbitrator].isActive, "Governance: already arbitrator");

        _grantRole(ARBITRATOR_ROLE, arbitrator);

        arbitrators[arbitrator] = ArbitratorInfo({
            arbitrator: arbitrator,
            casesHandled: 0,
            casesResolved: 0,
            reputation: 100,
            isActive: true,
            joinedAt: block.timestamp
        });

        activeArbitrators.push(arbitrator);

        emit ArbitratorAdded(arbitrator);
    }

    /**
     * @notice Remove um arbitrador
     * @param arbitrator Endereco do arbitrador
     */
    function removeArbitrator(address arbitrator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(arbitrators[arbitrator].isActive, "Governance: not an arbitrator");

        _revokeRole(ARBITRATOR_ROLE, arbitrator);
        arbitrators[arbitrator].isActive = false;

        // Remove do array
        for (uint256 i = 0; i < activeArbitrators.length; i++) {
            if (activeArbitrators[i] == arbitrator) {
                activeArbitrators[i] = activeArbitrators[activeArbitrators.length - 1];
                activeArbitrators.pop();
                break;
            }
        }

        emit ArbitratorRemoved(arbitrator);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Retorna detalhes de uma disputa
     */
    function getDispute(uint256 disputeId) external view returns (DisputeView memory) {
        Dispute storage dispute = disputes[disputeId];

        return DisputeView({
            id: dispute.id,
            rentalContractId: dispute.rentalContractId,
            initiator: dispute.initiator,
            landlord: dispute.landlord,
            tenant: dispute.tenant,
            disputeType: dispute.disputeType,
            status: dispute.status,
            description: dispute.description,
            amountInDispute: dispute.amountInDispute,
            createdAt: dispute.createdAt,
            resolvedAt: dispute.resolvedAt,
            resolution: dispute.resolution,
            votesForLandlord: dispute.votesForLandlord,
            votesForTenant: dispute.votesForTenant
        });
    }

    /**
     * @notice Retorna evidencias de uma disputa
     */
    function getDisputeEvidence(uint256 disputeId) external view returns (string[] memory) {
        return disputes[disputeId].evidenceHashes;
    }

    /**
     * @notice Retorna arbitradores de uma disputa
     */
    function getDisputeArbitrators(uint256 disputeId) external view returns (address[] memory) {
        return disputes[disputeId].arbitrators;
    }

    /**
     * @notice Retorna disputas de um contrato
     */
    function getRentalDisputes(uint256 rentalContractId) external view returns (uint256[] memory) {
        return rentalDisputes[rentalContractId];
    }

    /**
     * @notice Retorna disputas de um usuario
     */
    function getUserDisputes(address user) external view returns (uint256[] memory) {
        return userDisputes[user];
    }

    /**
     * @notice Retorna lista de arbitradores ativos
     */
    function getActiveArbitrators() external view returns (address[] memory) {
        return activeArbitrators;
    }

    /**
     * @notice Retorna estatisticas
     */
    function getStats() external view returns (
        uint256 _totalDisputes,
        uint256 _totalResolved,
        uint256 _totalValueDisputed,
        uint256 _activeArbitratorsCount
    ) {
        return (totalDisputes, totalResolved, totalValueDisputed, activeArbitrators.length);
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================

    /**
     * @notice Atualiza deadline para evidencias
     */
    function setEvidenceDeadlineDays(uint256 days_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        evidenceDeadlineDays = days_;
    }

    /**
     * @notice Atualiza deadline para recurso
     */
    function setAppealDeadlineDays(uint256 days_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        appealDeadlineDays = days_;
    }

    /**
     * @notice Atualiza minimo de arbitradores
     */
    function setMinArbitratorsForVoting(uint256 min_) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minArbitratorsForVoting = min_;
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
}
