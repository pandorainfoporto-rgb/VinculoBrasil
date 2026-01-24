// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VinculoToken (VBRz)
 * @author Vinculo Brasil
 * @notice Token de fidelidade e cashback do ecossistema Vinculo Brasil
 * @dev Token ERC-20 com funcionalidades de:
 *      - Burnable: Usuarios podem queimar tokens para resgatar servicos
 *      - AccessControl: Apenas operadores autorizados podem distribuir cashback
 *      - Pausable: Pausa de emergencia
 *
 * Tokenomics:
 * - Supply Maximo: 1.000.000.000 VBRz (1 bilhao)
 * - Distribuicao: Treasury 20%, Cashback Pool 40%, Team 15%, Staking 10%, Marketing 5%, Reserve 10%
 * - Valor Interno (Fase 1): 1 VBRz = R$ 0,10 (Fixed Peg)
 * - Utilidade: Pagar taxas, comprar servicos, desconto em seguros
 *
 * Regras de Cashback:
 * - Pagou aluguel em dia: 1% do valor em VBRz
 * - Garantidor ativo: Parte da comissao em VBRz
 * - Indicou amigo: 500 VBRz
 * - Contratou seguro: 2% do premio em VBRz
 */
contract VinculoToken is ERC20, ERC20Burnable, AccessControl, Pausable {
    // =========================================================================
    // CONSTANTES E ROLES
    // =========================================================================

    /// @notice Role para operadores que podem distribuir cashback
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice Role para operadores que podem queimar tokens em nome de usuarios
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /// @notice Role para operadores do sistema
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    /// @notice Supply maximo do token (1 bilhao com 18 decimais)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;

    /// @notice Taxa de conversao interna: 1 VBRz = R$ 0,10 (em centavos = 10)
    uint256 public constant FIXED_PEG_CENTAVOS = 10;

    // =========================================================================
    // VARIAVEIS DE ESTADO
    // =========================================================================

    /// @notice Endereco da Treasury Wallet
    address public treasuryWallet;

    /// @notice Total de tokens distribuidos como cashback
    uint256 public totalCashbackDistributed;

    /// @notice Total de tokens queimados (para servicos resgatados)
    uint256 public totalBurned;

    /// @notice Mapeamento de cashback por usuario
    mapping(address => uint256) public userCashbackReceived;

    /// @notice Mapeamento de tokens queimados por usuario
    mapping(address => uint256) public userTokensBurned;

    /// @notice Mapeamento de transacoes de cashback
    mapping(bytes32 => bool) public processedTransactions;

    // =========================================================================
    // ESTRUTURAS
    // =========================================================================

    struct CashbackRecord {
        address recipient;
        uint256 amount;
        CashbackType cashbackType;
        string referenceId;
        uint256 timestamp;
    }

    enum CashbackType {
        RENT_PAYMENT,      // Pagamento de aluguel em dia
        GUARANTOR_BONUS,   // Bonus de garantidor
        REFERRAL,          // Indicacao de amigo
        INSURANCE_BONUS,   // Bonus por contratar seguro
        SERVICE_BONUS,     // Bonus por usar servico
        LOYALTY_REWARD,    // Recompensa de fidelidade
        PROMOTIONAL        // Promocao especial
    }

    // =========================================================================
    // EVENTOS
    // =========================================================================

    event CashbackDistributed(
        address indexed recipient,
        uint256 amount,
        CashbackType indexed cashbackType,
        string referenceId
    );

    event TokensRedeemed(
        address indexed user,
        uint256 amount,
        string serviceId,
        string description
    );

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    event EmergencyWithdraw(address indexed recipient, uint256 amount);

    // =========================================================================
    // MODIFICADORES
    // =========================================================================

    modifier onlyTreasury() {
        require(msg.sender == treasuryWallet, "VBRz: caller is not treasury");
        _;
    }

    modifier validRecipient(address recipient) {
        require(recipient != address(0), "VBRz: invalid recipient");
        require(recipient != address(this), "VBRz: cannot send to contract");
        _;
    }

    modifier notProcessed(bytes32 txHash) {
        require(!processedTransactions[txHash], "VBRz: transaction already processed");
        _;
    }

    // =========================================================================
    // CONSTRUTOR
    // =========================================================================

    /**
     * @notice Inicializa o token VBRz
     * @param _treasuryWallet Endereco da carteira que recebera o supply inicial
     * @param _admin Endereco do administrador do contrato
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
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(BURNER_ROLE, _admin);
        _grantRole(OPERATOR_ROLE, _admin);

        // Mint todo o supply para a Treasury
        _mint(_treasuryWallet, MAX_SUPPLY);
    }

    // =========================================================================
    // FUNCOES DE CASHBACK (OPERADORES)
    // =========================================================================

    /**
     * @notice Distribui cashback para um usuario
     * @param recipient Endereco do usuario que recebera o cashback
     * @param amount Quantidade de VBRz a enviar
     * @param cashbackType Tipo do cashback (enum)
     * @param referenceId ID de referencia (ex: contractId, paymentId)
     */
    function distributeCashback(
        address recipient,
        uint256 amount,
        CashbackType cashbackType,
        string calldata referenceId
    )
        external
        onlyRole(MINTER_ROLE)
        whenNotPaused
        validRecipient(recipient)
    {
        require(amount > 0, "VBRz: amount must be > 0");
        require(balanceOf(treasuryWallet) >= amount, "VBRz: insufficient treasury balance");

        // Gera hash unico para evitar duplicatas
        bytes32 txHash = keccak256(abi.encodePacked(
            recipient,
            amount,
            cashbackType,
            referenceId,
            block.timestamp
        ));

        // Transfere da Treasury para o usuario
        _transfer(treasuryWallet, recipient, amount);

        // Atualiza estatisticas
        totalCashbackDistributed += amount;
        userCashbackReceived[recipient] += amount;

        emit CashbackDistributed(recipient, amount, cashbackType, referenceId);
    }

    /**
     * @notice Distribui cashback em lote para multiplos usuarios
     * @param recipients Array de enderecos
     * @param amounts Array de quantidades
     * @param cashbackType Tipo do cashback
     * @param referenceIds Array de IDs de referencia
     */
    function batchDistributeCashback(
        address[] calldata recipients,
        uint256[] calldata amounts,
        CashbackType cashbackType,
        string[] calldata referenceIds
    )
        external
        onlyRole(MINTER_ROLE)
        whenNotPaused
    {
        require(recipients.length == amounts.length, "VBRz: arrays length mismatch");
        require(recipients.length == referenceIds.length, "VBRz: arrays length mismatch");
        require(recipients.length <= 100, "VBRz: batch too large");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        require(balanceOf(treasuryWallet) >= totalAmount, "VBRz: insufficient treasury balance");

        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0) && amounts[i] > 0) {
                _transfer(treasuryWallet, recipients[i], amounts[i]);
                totalCashbackDistributed += amounts[i];
                userCashbackReceived[recipients[i]] += amounts[i];

                emit CashbackDistributed(recipients[i], amounts[i], cashbackType, referenceIds[i]);
            }
        }
    }

    /**
     * @notice Processa cashback de pagamento de aluguel
     * @dev Chamado apos confirmacao de pagamento em dia
     * @param tenantWallet Carteira do inquilino
     * @param rentAmountBRL Valor do aluguel em centavos de Real
     * @param contractId ID do contrato de aluguel
     * @param txHash Hash unico da transacao para evitar duplicatas
     */
    function processRentCashback(
        address tenantWallet,
        uint256 rentAmountBRL,
        string calldata contractId,
        bytes32 txHash
    )
        external
        onlyRole(OPERATOR_ROLE)
        whenNotPaused
        validRecipient(tenantWallet)
        notProcessed(txHash)
    {
        require(rentAmountBRL > 0, "VBRz: invalid rent amount");

        // Calcula cashback: 1% do aluguel convertido para VBRz
        // rentAmountBRL esta em centavos, FIXED_PEG = 10 centavos
        // cashbackBRL = rentAmountBRL * 1% = rentAmountBRL / 100
        // cashbackVBRz = cashbackBRL / FIXED_PEG * 10^18
        uint256 cashbackBRL = rentAmountBRL / 100; // 1% do aluguel em centavos
        uint256 cashbackVBRz = (cashbackBRL * 10**18) / FIXED_PEG_CENTAVOS;

        require(balanceOf(treasuryWallet) >= cashbackVBRz, "VBRz: insufficient treasury");

        // Marca como processado
        processedTransactions[txHash] = true;

        // Transfere cashback
        _transfer(treasuryWallet, tenantWallet, cashbackVBRz);

        // Atualiza estatisticas
        totalCashbackDistributed += cashbackVBRz;
        userCashbackReceived[tenantWallet] += cashbackVBRz;

        emit CashbackDistributed(
            tenantWallet,
            cashbackVBRz,
            CashbackType.RENT_PAYMENT,
            contractId
        );
    }

    /**
     * @notice Processa bonus de indicacao
     * @param referrerWallet Carteira de quem indicou
     * @param referredUserId ID do usuario indicado
     */
    function processReferralBonus(
        address referrerWallet,
        string calldata referredUserId,
        bytes32 txHash
    )
        external
        onlyRole(OPERATOR_ROLE)
        whenNotPaused
        validRecipient(referrerWallet)
        notProcessed(txHash)
    {
        // Bonus fixo de 500 VBRz por indicacao
        uint256 referralBonus = 500 * 10**18;

        require(balanceOf(treasuryWallet) >= referralBonus, "VBRz: insufficient treasury");

        processedTransactions[txHash] = true;

        _transfer(treasuryWallet, referrerWallet, referralBonus);

        totalCashbackDistributed += referralBonus;
        userCashbackReceived[referrerWallet] += referralBonus;

        emit CashbackDistributed(
            referrerWallet,
            referralBonus,
            CashbackType.REFERRAL,
            referredUserId
        );
    }

    // =========================================================================
    // FUNCOES DE RESGATE (USUARIOS)
    // =========================================================================

    /**
     * @notice Usuario queima tokens para resgatar servico
     * @param amount Quantidade de VBRz a queimar
     * @param serviceId ID do servico sendo resgatado
     * @param description Descricao do resgate
     */
    function redeemForService(
        uint256 amount,
        string calldata serviceId,
        string calldata description
    )
        external
        whenNotPaused
    {
        require(amount > 0, "VBRz: amount must be > 0");
        require(balanceOf(msg.sender) >= amount, "VBRz: insufficient balance");

        // Queima os tokens
        _burn(msg.sender, amount);

        // Atualiza estatisticas
        totalBurned += amount;
        userTokensBurned[msg.sender] += amount;

        emit TokensRedeemed(msg.sender, amount, serviceId, description);
    }

    /**
     * @notice Operador queima tokens em nome de usuario (para compras no marketplace)
     * @param user Endereco do usuario
     * @param amount Quantidade a queimar
     * @param serviceId ID do servico
     * @param description Descricao
     */
    function burnForUser(
        address user,
        uint256 amount,
        string calldata serviceId,
        string calldata description
    )
        external
        onlyRole(BURNER_ROLE)
        whenNotPaused
    {
        require(amount > 0, "VBRz: amount must be > 0");
        require(balanceOf(user) >= amount, "VBRz: insufficient user balance");

        _burn(user, amount);

        totalBurned += amount;
        userTokensBurned[user] += amount;

        emit TokensRedeemed(user, amount, serviceId, description);
    }

    // =========================================================================
    // FUNCOES DE VISUALIZACAO
    // =========================================================================

    /**
     * @notice Retorna saldo do usuario em VBRz e valor em BRL
     * @param user Endereco do usuario
     * @return balanceVBRz Saldo em VBRz (18 decimais)
     * @return valueBRL Valor em centavos de Real
     */
    function getBalanceWithValue(address user)
        external
        view
        returns (uint256 balanceVBRz, uint256 valueBRL)
    {
        balanceVBRz = balanceOf(user);
        // Converte para centavos: (balanceVBRz / 10^18) * FIXED_PEG_CENTAVOS
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
        totalBurned_ = totalBurned;
    }

    /**
     * @notice Retorna estatisticas de um usuario
     */
    function getUserStats(address user)
        external
        view
        returns (
            uint256 balance,
            uint256 valueBRL,
            uint256 totalReceived,
            uint256 totalBurned_
        )
    {
        balance = balanceOf(user);
        valueBRL = (balance * FIXED_PEG_CENTAVOS) / 10**18;
        totalReceived = userCashbackReceived[user];
        totalBurned_ = userTokensBurned[user];
    }

    /**
     * @notice Calcula quanto VBRz um pagamento de aluguel renderia
     * @param rentAmountBRL Valor do aluguel em centavos
     * @return cashbackVBRz Quantidade de VBRz que seria recebida
     */
    function calculateRentCashback(uint256 rentAmountBRL)
        external
        pure
        returns (uint256 cashbackVBRz)
    {
        uint256 cashbackBRL = rentAmountBRL / 100; // 1%
        cashbackVBRz = (cashbackBRL * 10**18) / FIXED_PEG_CENTAVOS;
    }

    /**
     * @notice Calcula valor em BRL de uma quantidade de VBRz
     * @param amountVBRz Quantidade de VBRz (18 decimais)
     * @return valueBRL Valor em centavos de Real
     */
    function calculateBRLValue(uint256 amountVBRz)
        external
        pure
        returns (uint256 valueBRL)
    {
        valueBRL = (amountVBRz * FIXED_PEG_CENTAVOS) / 10**18;
    }

    // =========================================================================
    // FUNCOES ADMINISTRATIVAS
    // =========================================================================

    /**
     * @notice Atualiza endereco da Treasury
     * @param newTreasury Novo endereco
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
     * @notice Pausa o contrato em emergencia
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

    /**
     * @notice Recupera tokens enviados por engano
     * @param token Endereco do token a recuperar
     * @param amount Quantidade
     */
    function emergencyWithdrawToken(address token, uint256 amount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(token != address(this), "VBRz: cannot withdraw VBRz");
        IERC20(token).transfer(treasuryWallet, amount);
        emit EmergencyWithdraw(treasuryWallet, amount);
    }

    // =========================================================================
    // OVERRIDES OBRIGATORIOS
    // =========================================================================

    /**
     * @notice Verifica se contrato suporta interface
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

// =========================================================================
// INTERFACE PARA INTEGRACAO
// =========================================================================

interface IVinculoToken {
    function distributeCashback(
        address recipient,
        uint256 amount,
        uint8 cashbackType,
        string calldata referenceId
    ) external;

    function processRentCashback(
        address tenantWallet,
        uint256 rentAmountBRL,
        string calldata contractId,
        bytes32 txHash
    ) external;

    function processReferralBonus(
        address referrerWallet,
        string calldata referredUserId,
        bytes32 txHash
    ) external;

    function getBalanceWithValue(address user)
        external
        view
        returns (uint256 balanceVBRz, uint256 valueBRL);

    function calculateRentCashback(uint256 rentAmountBRL)
        external
        pure
        returns (uint256 cashbackVBRz);
}
