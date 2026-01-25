// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * =====================================================================
 *  __     ___            _       ____               _            _     _
 *  \ \   / (_)_ __   ___| |_   |  _ \ ___  ___ ___(_)_   ____ _| |__ | | ___ ___
 *   \ \ / /| | '_ \ / __| | | | |_) / _ \/ __/ _ \ \ \ / / _` | '_ \| |/ _ / __|
 *    \ V / | | | | | (__| | |_| |  _ <  __/ (_|  __/ |\ V / (_| | |_) | |  __\__ \
 *     \_/  |_|_| |_|\___|_|\__,_|_| \_\___|\___\___|_| \_/ \__,_|_.__/|_|\___|___/
 *
 * =====================================================================
 *
 * VINCULO RECEIVABLES - ERC-1155 Token de Recebíveis de Aluguel
 *
 * Este contrato tokeniza os direitos de receber aluguéis futuros.
 * Separado do NFT de propriedade, representa apenas os fluxos de caixa.
 *
 * CONCEITO JURÍDICO:
 * - Cessão de Crédito (Art. 286-298, Código Civil Brasileiro)
 * - Não é valor mobiliário (sem promessa de juros, apenas compra de ativo)
 * - Troca P2P de ativos digitais entre particulares
 *
 * FUNCIONALIDADES:
 * - ERC-1155 Multi-Token (cada contrato = 1 token ID)
 * - Cada token representa X meses de recebíveis
 * - Metadados on-chain: contrato original, meses, valor total
 * - Apenas operador autorizado pode mintar
 *
 * @author Vinculo.io
 * @notice Este contrato é para tokenização de recebíveis de aluguel
 */

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract VinculoReceivables is ERC1155, ERC1155Supply, AccessControl, ReentrancyGuard, Pausable {

    // ============================================
    // ROLES
    // ============================================

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // ============================================
    // ESTRUTURAS
    // ============================================

    struct ReceivableToken {
        uint256 tokenId;              // ID único do token
        string contractRef;           // Referência do contrato de aluguel (off-chain ID)
        address originalOwner;        // Proprietário original (cedente)
        uint256 totalMonths;          // Total de meses de recebíveis
        uint256 totalValue;           // Valor total dos recebíveis (em wei, BRL * 1e18)
        uint256 monthlyValue;         // Valor mensal do aluguel
        uint256 startTimestamp;       // Início do período de recebíveis
        uint256 endTimestamp;         // Fim do período de recebíveis
        bool active;                  // Se o token ainda está ativo
        string metadataUri;           // URI dos metadados IPFS
    }

    // ============================================
    // ESTADO
    // ============================================

    uint256 private _tokenIdCounter;

    // tokenId => ReceivableToken
    mapping(uint256 => ReceivableToken) public receivables;

    // contractRef => tokenId (para lookup reverso)
    mapping(string => uint256) public contractToToken;

    // tokenId => currentOwner (quem tem direito aos recebíveis)
    mapping(uint256 => address) public currentReceiver;

    // Nome e símbolo para exibição
    string public name = "Vinculo Receivables";
    string public symbol = "VRCV";

    // ============================================
    // EVENTOS
    // ============================================

    event ReceivableMinted(
        uint256 indexed tokenId,
        string contractRef,
        address indexed originalOwner,
        uint256 totalMonths,
        uint256 totalValue
    );

    event ReceivableTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );

    event ReceivableRedeemed(
        uint256 indexed tokenId,
        address indexed redeemer,
        uint256 monthsRedeemed
    );

    event ReceiverUpdated(
        uint256 indexed tokenId,
        address indexed oldReceiver,
        address indexed newReceiver
    );

    // ============================================
    // CONSTRUTOR
    // ============================================

    constructor(string memory baseUri) ERC1155(baseUri) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    // ============================================
    // FUNÇÕES PÚBLICAS - CONSULTA
    // ============================================

    /**
     * @notice Retorna os dados completos de um token de recebível
     * @param tokenId ID do token
     */
    function getReceivable(uint256 tokenId) external view returns (ReceivableToken memory) {
        require(receivables[tokenId].active, "Token nao existe ou inativo");
        return receivables[tokenId];
    }

    /**
     * @notice Retorna quem é o atual recebedor dos pagamentos
     * @param tokenId ID do token
     */
    function getPaymentReceiver(uint256 tokenId) external view returns (address) {
        return currentReceiver[tokenId];
    }

    /**
     * @notice Verifica se um contrato já foi tokenizado
     * @param contractRef Referência do contrato
     */
    function isContractTokenized(string memory contractRef) external view returns (bool) {
        return contractToToken[contractRef] != 0;
    }

    /**
     * @notice Retorna o tokenId de um contrato
     * @param contractRef Referência do contrato
     */
    function getTokenByContract(string memory contractRef) external view returns (uint256) {
        return contractToToken[contractRef];
    }

    /**
     * @notice URI dos metadados do token
     * @param tokenId ID do token
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(receivables[tokenId].active, "Token nao existe");
        return receivables[tokenId].metadataUri;
    }

    // ============================================
    // FUNÇÕES DE OPERADOR - MINTING
    // ============================================

    /**
     * @notice Cria um novo token de recebíveis
     * @dev Apenas MINTER_ROLE pode chamar
     * @param to Endereço do proprietário original
     * @param contractRef Referência do contrato de aluguel
     * @param totalMonths Número de meses de recebíveis
     * @param monthlyValue Valor mensal do aluguel (em wei)
     * @param startTimestamp Início do período
     * @param endTimestamp Fim do período
     * @param metadataUri URI do IPFS com metadados
     */
    function mintReceivable(
        address to,
        string memory contractRef,
        uint256 totalMonths,
        uint256 monthlyValue,
        uint256 startTimestamp,
        uint256 endTimestamp,
        string memory metadataUri
    ) external onlyRole(MINTER_ROLE) nonReentrant whenNotPaused returns (uint256) {
        require(to != address(0), "Endereco invalido");
        require(bytes(contractRef).length > 0, "Referencia do contrato vazia");
        require(totalMonths > 0, "Meses deve ser maior que zero");
        require(monthlyValue > 0, "Valor mensal deve ser maior que zero");
        require(contractToToken[contractRef] == 0, "Contrato ja tokenizado");
        require(endTimestamp > startTimestamp, "Periodo invalido");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        uint256 totalValue = totalMonths * monthlyValue;

        // Cria o registro do recebível
        receivables[newTokenId] = ReceivableToken({
            tokenId: newTokenId,
            contractRef: contractRef,
            originalOwner: to,
            totalMonths: totalMonths,
            totalValue: totalValue,
            monthlyValue: monthlyValue,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp,
            active: true,
            metadataUri: metadataUri
        });

        // Registra o mapeamento reverso
        contractToToken[contractRef] = newTokenId;

        // Define o recebedor inicial
        currentReceiver[newTokenId] = to;

        // Minta o token ERC-1155 (quantidade 1)
        _mint(to, newTokenId, 1, "");

        emit ReceivableMinted(
            newTokenId,
            contractRef,
            to,
            totalMonths,
            totalValue
        );

        return newTokenId;
    }

    /**
     * @notice Atualiza manualmente o recebedor de pagamentos
     * @dev Usado quando há transferência fora do marketplace
     */
    function updateReceiver(uint256 tokenId, address newReceiver)
        external
        onlyRole(OPERATOR_ROLE)
        nonReentrant
    {
        require(receivables[tokenId].active, "Token inativo");
        require(newReceiver != address(0), "Endereco invalido");

        address oldReceiver = currentReceiver[tokenId];
        currentReceiver[tokenId] = newReceiver;

        emit ReceiverUpdated(tokenId, oldReceiver, newReceiver);
    }

    /**
     * @notice Desativa um token após todos os pagamentos serem feitos
     */
    function deactivateReceivable(uint256 tokenId)
        external
        onlyRole(OPERATOR_ROLE)
    {
        require(receivables[tokenId].active, "Ja inativo");
        receivables[tokenId].active = false;
    }

    // ============================================
    // HOOKS DE TRANSFERÊNCIA
    // ============================================

    /**
     * @notice Hook executado antes de qualquer transferência
     * @dev Atualiza o currentReceiver quando o token é transferido
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);

        // Atualiza o recebedor de pagamentos para cada token transferido
        for (uint256 i = 0; i < ids.length; i++) {
            if (to != address(0) && receivables[ids[i]].active) {
                address oldReceiver = currentReceiver[ids[i]];
                currentReceiver[ids[i]] = to;
                emit ReceiverUpdated(ids[i], oldReceiver, to);
            }
        }
    }

    // ============================================
    // FUNÇÕES ADMINISTRATIVAS
    // ============================================

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setURI(string memory newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    // ============================================
    // SUPORTE A INTERFACES
    // ============================================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
