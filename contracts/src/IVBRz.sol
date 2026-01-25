// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IVBRz - Interface do Token Vinculo (VBRz)
 * @author Vinculo Brasil
 * @notice Interface para integracao facil com o token VBRz
 * @dev Use esta interface para interagir com o contrato VinculoToken
 */
interface IVBRz {
    // =========================================================================
    // EVENTOS
    // =========================================================================

    event CashbackDistributed(
        address indexed recipient,
        uint256 amount,
        uint8 indexed cashbackType,
        string referenceId
    );

    event TokensRedeemed(
        address indexed user,
        uint256 amount,
        string serviceId,
        string description
    );

    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    // =========================================================================
    // FUNCOES DE LEITURA - ERC20
    // =========================================================================

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);

    // =========================================================================
    // FUNCOES DE ESCRITA - ERC20
    // =========================================================================

    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    // =========================================================================
    // FUNCOES DE BURN
    // =========================================================================

    /**
     * @notice Queima tokens do proprio saldo
     * @param amount Quantidade a queimar
     */
    function burn(uint256 amount) external;

    /**
     * @notice Queima tokens de outro endereco (requer allowance)
     * @param account Endereco do qual queimar
     * @param amount Quantidade a queimar
     */
    function burnFrom(address account, uint256 amount) external;

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
    ) external;

    // =========================================================================
    // FUNCOES DE CASHBACK (APENAS OPERADORES)
    // =========================================================================

    /**
     * @notice Distribui cashback para um usuario
     * @param recipient Endereco do usuario
     * @param amount Quantidade de VBRz
     * @param cashbackType Tipo do cashback (enum index)
     * @param referenceId ID de referencia
     */
    function distributeCashback(
        address recipient,
        uint256 amount,
        uint8 cashbackType,
        string calldata referenceId
    ) external;

    /**
     * @notice Processa cashback de pagamento de aluguel
     * @param tenantWallet Carteira do inquilino
     * @param rentAmountBRL Valor do aluguel em centavos
     * @param contractId ID do contrato
     * @param txHash Hash unico para evitar duplicatas
     */
    function processRentCashback(
        address tenantWallet,
        uint256 rentAmountBRL,
        string calldata contractId,
        bytes32 txHash
    ) external;

    /**
     * @notice Processa bonus de indicacao
     * @param referrerWallet Carteira de quem indicou
     * @param referredUserId ID do usuario indicado
     * @param txHash Hash unico para evitar duplicatas
     */
    function processReferralBonus(
        address referrerWallet,
        string calldata referredUserId,
        bytes32 txHash
    ) external;

    // =========================================================================
    // FUNCOES DE VISUALIZACAO
    // =========================================================================

    /**
     * @notice Retorna constantes do token
     */
    function MAX_SUPPLY() external view returns (uint256);
    function FIXED_PEG_CENTAVOS() external view returns (uint256);

    /**
     * @notice Retorna endereco da Treasury
     */
    function treasuryWallet() external view returns (address);

    /**
     * @notice Retorna saldo do usuario em VBRz e valor em BRL
     */
    function getBalanceWithValue(address user)
        external
        view
        returns (uint256 balanceVBRz, uint256 valueBRL);

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
        );

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
        );

    /**
     * @notice Calcula cashback de aluguel
     */
    function calculateRentCashback(uint256 rentAmountBRL)
        external
        pure
        returns (uint256 cashbackVBRz);

    /**
     * @notice Calcula valor em BRL
     */
    function calculateBRLValue(uint256 amountVBRz)
        external
        pure
        returns (uint256 valueBRL);

    // =========================================================================
    // FUNCOES ADMINISTRATIVAS
    // =========================================================================

    function pause() external;
    function unpause() external;
    function setTreasuryWallet(address newTreasury) external;
}
