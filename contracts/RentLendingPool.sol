// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RentLendingPool
 * @author Vinculo Brasil
 * @notice Pool de liquidez para antecipacao de alugueis usando NFT como garantia
 * @dev Permite que investidores depositem BRZ e locadores antecipem alugueis
 *
 * Fluxo:
 * 1. Investidores depositam BRZ e recebem vBRZ (token de recibo)
 * 2. Locadores bloqueiam NFT do contrato e sacam BRZ do pool
 * 3. Pagamentos mensais do aluguel (85% do locador) repoe o pool automaticamente
 */
contract RentLendingPool is IERC721Receiver, ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    // =========================================================================
    // ESTRUTURAS
    // =========================================================================

    struct Loan {
        address borrower;           // Locador que pegou emprestimo
        uint256 nftTokenId;         // ID do NFT do contrato
        address nftContract;        // Endereco do contrato NFT
        uint256 monthlyRent;        // Valor mensal do aluguel
        uint256 monthsAnticipated;  // Meses antecipados
        uint256 totalDebt;          // Divida total
        uint256 repaidAmount;       // Valor ja pago
        uint256 startTime;          // Timestamp do emprestimo
        uint256 nextPaymentDue;     // Proximo pagamento esperado
        bool isActive;              // Se o emprestimo esta ativo
        bool isDefaulted;           // Se esta inadimplente
    }

    struct PoolStats {
        uint256 totalDeposited;     // Total depositado no pool
        uint256 totalBorrowed;      // Total emprestado
        uint256 totalRepaid;        // Total ja pago
        uint256 totalFees;          // Total de taxas coletadas
    }

    // =========================================================================
    // VARIAVEIS DE ESTADO
    // =========================================================================

    /// @notice Token BRZ (stablecoin brasileira)
    IERC20 public immutable brzToken;

    /// @notice Token vBRZ (recibo de deposito)
    IERC20 public vBRZToken;

    /// @notice Mapeamento de emprestimos por ID
    mapping(uint256 => Loan) public loans;

    /// @notice Contador de emprestimos
    uint256 public loanCounter;

    /// @notice Mapeamento de depositos por investidor
    mapping(address => uint256) public deposits;

    /// @notice Mapeamento de shares vBRZ por investidor
    mapping(address => uint256) public shares;

    /// @notice Total de shares emitidas
    uint256 public totalShares;

    /// @notice Estatisticas do pool
    PoolStats public poolStats;

    /// @notice Taxa de desconto por mes (em basis points, 150 = 1.5%)
    uint256 public discountRatePerMonth = 150;

    /// @notice Taxa de originacao (em basis points, 200 = 2%)
    uint256 public originationFee = 200;

    /// @notice Taxa da plataforma (em basis points, 50 = 0.5%)
    uint256 public platformFee = 50;

    /// @notice Fator de reserva (em basis points, 1000 = 10%)
    uint256 public reserveFactor = 1000;

    /// @notice Maximo de meses para antecipacao
    uint256 public constant MAX_MONTHS = 12;

    /// @notice Periodo de graca para pagamento (7 dias)
    uint256 public constant GRACE_PERIOD = 7 days;

    /// @notice Periodo para considerar default (30 dias)
    uint256 public constant DEFAULT_PERIOD = 30 days;

    /// @notice Endereco do split de pagamentos
    address public paymentSplitter;

    /// @notice Mapeamento de contratos NFT autorizados
    mapping(address => bool) public authorizedNFTContracts;

    // =========================================================================
    // EVENTOS
    // =========================================================================

    event LiquidityDeposited(address indexed investor, uint256 amount, uint256 shares);
    event LiquidityWithdrawn(address indexed investor, uint256 amount, uint256 shares);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 months);
    event LoanRepayment(uint256 indexed loanId, uint256 amount, uint256 remainingDebt);
    event LoanCompleted(uint256 indexed loanId);
    event LoanDefaulted(uint256 indexed loanId);
    event NFTLiquidated(uint256 indexed loanId, address indexed newOwner);
    event FeesCollected(uint256 amount);
    event NFTContractAuthorized(address indexed nftContract, bool authorized);

    // =========================================================================
    // MODIFICADORES
    // =========================================================================

    modifier onlyPaymentSplitter() {
        require(msg.sender == paymentSplitter, "Only payment splitter");
        _;
    }

    modifier loanExists(uint256 loanId) {
        require(loans[loanId].borrower != address(0), "Loan does not exist");
        _;
    }

    modifier loanActive(uint256 loanId) {
        require(loans[loanId].isActive, "Loan is not active");
        _;
    }

    // =========================================================================
    // CONSTRUTOR
    // =========================================================================

    constructor(
        address _brzToken,
        address _paymentSplitter
    ) Ownable(msg.sender) {
        require(_brzToken != address(0), "Invalid BRZ token");
        require(_paymentSplitter != address(0), "Invalid payment splitter");

        brzToken = IERC20(_brzToken);
        paymentSplitter = _paymentSplitter;
    }

    // =========================================================================
    // FUNCOES DE LIQUIDEZ (INVESTIDORES)
    // =========================================================================

    /**
     * @notice Deposita BRZ no pool e recebe vBRZ
     * @param amount Quantidade de BRZ a depositar
     * @return sharesIssued Quantidade de vBRZ emitidos
     */
    function depositLiquidity(uint256 amount)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 sharesIssued)
    {
        require(amount > 0, "Amount must be > 0");

        // Transfere BRZ do investidor
        brzToken.safeTransferFrom(msg.sender, address(this), amount);

        // Calcula shares a emitir (primeira vez: 1:1)
        if (totalShares == 0) {
            sharesIssued = amount;
        } else {
            // Shares proporcionais ao valor atual do pool
            uint256 poolValue = getPoolValue();
            sharesIssued = (amount * totalShares) / poolValue;
        }

        // Atualiza estado
        shares[msg.sender] += sharesIssued;
        totalShares += sharesIssued;
        deposits[msg.sender] += amount;
        poolStats.totalDeposited += amount;

        emit LiquidityDeposited(msg.sender, amount, sharesIssued);
    }

    /**
     * @notice Retira liquidez do pool queimando vBRZ
     * @param sharesToBurn Quantidade de vBRZ a queimar
     * @return amountWithdrawn Quantidade de BRZ retirada
     */
    function withdrawLiquidity(uint256 sharesToBurn)
        external
        nonReentrant
        returns (uint256 amountWithdrawn)
    {
        require(sharesToBurn > 0, "Shares must be > 0");
        require(shares[msg.sender] >= sharesToBurn, "Insufficient shares");

        // Calcula valor proporcional
        uint256 poolValue = getPoolValue();
        amountWithdrawn = (sharesToBurn * poolValue) / totalShares;

        // Verifica liquidez disponivel
        uint256 availableLiquidity = getAvailableLiquidity();
        require(amountWithdrawn <= availableLiquidity, "Insufficient liquidity");

        // Atualiza estado
        shares[msg.sender] -= sharesToBurn;
        totalShares -= sharesToBurn;

        // Transfere BRZ para investidor
        brzToken.safeTransfer(msg.sender, amountWithdrawn);

        emit LiquidityWithdrawn(msg.sender, amountWithdrawn, sharesToBurn);
    }

    // =========================================================================
    // FUNCOES DE EMPRESTIMO (LOCADORES)
    // =========================================================================

    /**
     * @notice Antecipa alugueis bloqueando NFT como garantia
     * @param nftContract Endereco do contrato NFT
     * @param nftTokenId ID do token NFT
     * @param monthlyRent Valor do aluguel mensal (em BRZ, 18 decimais)
     * @param months Quantidade de meses a antecipar (1-12)
     * @return loanId ID do emprestimo criado
     */
    function anticipateRent(
        address nftContract,
        uint256 nftTokenId,
        uint256 monthlyRent,
        uint256 months
    )
        external
        nonReentrant
        whenNotPaused
        returns (uint256 loanId)
    {
        require(authorizedNFTContracts[nftContract], "NFT contract not authorized");
        require(months > 0 && months <= MAX_MONTHS, "Invalid months");
        require(monthlyRent > 0, "Invalid rent amount");

        // Verifica propriedade do NFT
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(nftTokenId) == msg.sender, "Not NFT owner");

        // Calcula valores
        uint256 grossAmount = monthlyRent * months;
        uint256 discountAmount = (grossAmount * discountRatePerMonth * months) / 10000;
        uint256 originationAmount = (grossAmount * originationFee) / 10000;
        uint256 platformAmount = (grossAmount * platformFee) / 10000;
        uint256 netAmount = grossAmount - discountAmount - originationAmount - platformAmount;

        // Verifica liquidez
        require(netAmount <= getAvailableLiquidity(), "Insufficient pool liquidity");

        // Transfere NFT para o contrato (bloqueia)
        nft.safeTransferFrom(msg.sender, address(this), nftTokenId);

        // Cria emprestimo
        loanId = ++loanCounter;
        loans[loanId] = Loan({
            borrower: msg.sender,
            nftTokenId: nftTokenId,
            nftContract: nftContract,
            monthlyRent: monthlyRent,
            monthsAnticipated: months,
            totalDebt: grossAmount,
            repaidAmount: 0,
            startTime: block.timestamp,
            nextPaymentDue: block.timestamp + 30 days,
            isActive: true,
            isDefaulted: false
        });

        // Atualiza estatisticas
        poolStats.totalBorrowed += netAmount;
        poolStats.totalFees += originationAmount + platformAmount;

        // Transfere BRZ para o locador
        brzToken.safeTransfer(msg.sender, netAmount);

        emit LoanCreated(loanId, msg.sender, netAmount, months);
    }

    /**
     * @notice Processa pagamento mensal do aluguel (chamado pelo split)
     * @param loanId ID do emprestimo
     * @param amount Valor do pagamento (85% do aluguel)
     */
    function repayStream(uint256 loanId, uint256 amount)
        external
        onlyPaymentSplitter
        nonReentrant
        loanExists(loanId)
        loanActive(loanId)
    {
        Loan storage loan = loans[loanId];

        // Transfere BRZ do splitter
        brzToken.safeTransferFrom(msg.sender, address(this), amount);

        // Atualiza emprestimo
        loan.repaidAmount += amount;
        loan.nextPaymentDue = block.timestamp + 30 days;
        poolStats.totalRepaid += amount;

        emit LoanRepayment(loanId, amount, getRemainingDebt(loanId));

        // Verifica se emprestimo foi quitado
        if (loan.repaidAmount >= loan.totalDebt) {
            _completeLoan(loanId);
        }
    }

    /**
     * @notice Permite locador quitar emprestimo antecipadamente
     * @param loanId ID do emprestimo
     */
    function repayFull(uint256 loanId)
        external
        nonReentrant
        loanExists(loanId)
        loanActive(loanId)
    {
        Loan storage loan = loans[loanId];
        require(msg.sender == loan.borrower, "Not borrower");

        uint256 remaining = getRemainingDebt(loanId);
        require(remaining > 0, "Already paid");

        // Transfere valor restante
        brzToken.safeTransferFrom(msg.sender, address(this), remaining);

        loan.repaidAmount = loan.totalDebt;
        poolStats.totalRepaid += remaining;

        _completeLoan(loanId);
    }

    /**
     * @notice Completa emprestimo e libera NFT
     */
    function _completeLoan(uint256 loanId) internal {
        Loan storage loan = loans[loanId];
        loan.isActive = false;

        // Devolve NFT ao locador
        IERC721(loan.nftContract).safeTransferFrom(
            address(this),
            loan.borrower,
            loan.nftTokenId
        );

        emit LoanCompleted(loanId);
    }

    /**
     * @notice Marca emprestimo como inadimplente e permite liquidacao
     * @param loanId ID do emprestimo
     */
    function markDefaulted(uint256 loanId)
        external
        onlyOwner
        loanExists(loanId)
        loanActive(loanId)
    {
        Loan storage loan = loans[loanId];

        require(
            block.timestamp > loan.nextPaymentDue + DEFAULT_PERIOD,
            "Not yet defaulted"
        );

        loan.isDefaulted = true;
        emit LoanDefaulted(loanId);
    }

    /**
     * @notice Liquida NFT de emprestimo inadimplente
     * @param loanId ID do emprestimo
     * @param newOwner Endereco que recebera o NFT
     */
    function liquidateNFT(uint256 loanId, address newOwner)
        external
        onlyOwner
        loanExists(loanId)
    {
        Loan storage loan = loans[loanId];
        require(loan.isDefaulted, "Loan not defaulted");
        require(loan.isActive, "Loan not active");
        require(newOwner != address(0), "Invalid new owner");

        loan.isActive = false;

        // Transfere NFT para novo dono (leilao off-chain)
        IERC721(loan.nftContract).safeTransferFrom(
            address(this),
            newOwner,
            loan.nftTokenId
        );

        emit NFTLiquidated(loanId, newOwner);
    }

    // =========================================================================
    // FUNCOES DE VISUALIZACAO
    // =========================================================================

    /**
     * @notice Retorna valor total do pool (depositos + juros - emprestados)
     */
    function getPoolValue() public view returns (uint256) {
        return brzToken.balanceOf(address(this));
    }

    /**
     * @notice Retorna liquidez disponivel para emprestimos
     */
    function getAvailableLiquidity() public view returns (uint256) {
        uint256 total = getPoolValue();
        uint256 reserved = (total * reserveFactor) / 10000;
        return total > reserved ? total - reserved : 0;
    }

    /**
     * @notice Retorna taxa de utilizacao do pool
     */
    function getUtilizationRate() external view returns (uint256) {
        if (poolStats.totalDeposited == 0) return 0;
        return (poolStats.totalBorrowed * 10000) / poolStats.totalDeposited;
    }

    /**
     * @notice Retorna divida restante de um emprestimo
     */
    function getRemainingDebt(uint256 loanId) public view returns (uint256) {
        Loan storage loan = loans[loanId];
        if (loan.repaidAmount >= loan.totalDebt) return 0;
        return loan.totalDebt - loan.repaidAmount;
    }

    /**
     * @notice Retorna valor das shares de um investidor
     */
    function getShareValue(address investor) external view returns (uint256) {
        if (totalShares == 0 || shares[investor] == 0) return 0;
        return (shares[investor] * getPoolValue()) / totalShares;
    }

    /**
     * @notice Simula antecipacao de aluguel
     */
    function simulateAnticipation(uint256 monthlyRent, uint256 months)
        external
        view
        returns (
            uint256 grossAmount,
            uint256 discountAmount,
            uint256 fees,
            uint256 netAmount
        )
    {
        require(months > 0 && months <= MAX_MONTHS, "Invalid months");

        grossAmount = monthlyRent * months;
        discountAmount = (grossAmount * discountRatePerMonth * months) / 10000;
        fees = (grossAmount * (originationFee + platformFee)) / 10000;
        netAmount = grossAmount - discountAmount - fees;
    }

    // =========================================================================
    // FUNCOES ADMINISTRATIVAS
    // =========================================================================

    /**
     * @notice Autoriza ou revoga contrato NFT
     */
    function setAuthorizedNFTContract(address nftContract, bool authorized)
        external
        onlyOwner
    {
        authorizedNFTContracts[nftContract] = authorized;
        emit NFTContractAuthorized(nftContract, authorized);
    }

    /**
     * @notice Atualiza endereco do payment splitter
     */
    function setPaymentSplitter(address _paymentSplitter) external onlyOwner {
        require(_paymentSplitter != address(0), "Invalid address");
        paymentSplitter = _paymentSplitter;
    }

    /**
     * @notice Atualiza taxas (apenas owner)
     */
    function updateFees(
        uint256 _discountRate,
        uint256 _originationFee,
        uint256 _platformFee,
        uint256 _reserveFactor
    ) external onlyOwner {
        require(_discountRate <= 500, "Discount rate too high"); // Max 5%
        require(_originationFee <= 500, "Origination fee too high"); // Max 5%
        require(_platformFee <= 200, "Platform fee too high"); // Max 2%
        require(_reserveFactor <= 2000, "Reserve factor too high"); // Max 20%

        discountRatePerMonth = _discountRate;
        originationFee = _originationFee;
        platformFee = _platformFee;
        reserveFactor = _reserveFactor;
    }

    /**
     * @notice Retira taxas acumuladas
     */
    function withdrawFees(address recipient) external onlyOwner {
        uint256 fees = poolStats.totalFees;
        require(fees > 0, "No fees to withdraw");

        poolStats.totalFees = 0;
        brzToken.safeTransfer(recipient, fees);

        emit FeesCollected(fees);
    }

    /**
     * @notice Pausa o contrato em emergencia
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

    // =========================================================================
    // ERC721 RECEIVER
    // =========================================================================

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
