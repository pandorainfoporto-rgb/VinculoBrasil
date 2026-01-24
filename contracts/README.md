# Vinculo.io Smart Contracts

Smart Contracts para a plataforma Vinculo.io - Contratos de Aluguel como NFTs com Split Automatico 85/5/5/5.

## Contratos

### VinculoContract.sol
Contrato principal que implementa:
- **ERC-721**: Cada contrato de aluguel e um NFT
- **Split 85/5/5/5**: Distribuicao automatica e imutavel de pagamentos
  - 85% para o Locador
  - 5% para a Seguradora
  - 5% para a Plataforma
  - 5% para o Garantidor
- Gestao de ciclo de vida do contrato
- Sistema de disputas

### PropertyCollateral.sol
NFT para imoveis usados como colateral:
- Registro de imoveis tokenizados
- Lock/Unlock de colateral
- Liquidacao em caso de inadimplencia

### VinculoGovernance.sol
Sistema de governanca para:
- Abertura e resolucao de disputas
- Votacao por arbitradores
- Sistema de recursos (appeals)

## Setup

```bash
# Instalar dependencias
npm install

# Copiar variaveis de ambiente
cp .env.example .env
# Editar .env com suas chaves
```

## Comandos

```bash
# Compilar contratos
npm run compile

# Rodar testes
npm run test

# Testes com gas report
npm run gas

# Coverage
npm run test:coverage

# Deploy local (requer node rodando)
npm run node          # Terminal 1
npm run deploy:local  # Terminal 2

# Deploy Polygon Amoy (testnet)
npm run deploy:amoy

# Deploy Polygon Mainnet
npm run deploy:polygon
```

## Redes

| Rede | Chain ID | RPC |
|------|----------|-----|
| Polygon Mainnet | 137 | Alchemy |
| Polygon Amoy (Testnet) | 80002 | Alchemy |
| Hardhat Local | 31337 | localhost:8545 |

## Verificacao no PolygonScan

Apos deploy, verifique os contratos:

```bash
npx hardhat verify --network polygon <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Arquitetura

```
contracts/
├── src/
│   ├── VinculoContract.sol      # Contrato principal (ERC-721 + Split)
│   ├── PropertyCollateral.sol   # NFT de imoveis colaterais
│   └── VinculoGovernance.sol    # Sistema de disputas
├── test/
│   └── VinculoContract.test.cjs # Testes unitarios
├── scripts/
│   └── deploy.cjs               # Script de deploy
├── hardhat.config.cjs           # Configuracao Hardhat
└── package.json
```

## Fluxo do Contrato

```
1. createRental()     -> Cria NFT do contrato (status: Pending)
2. lockCollateral()   -> Garantidor bloqueia imovel
3. activateRental()   -> Locador ativa contrato (status: Active)
4. payRent()          -> Locatario paga, split automatico 85/5/5/5
5. terminateRental()  -> Encerra contrato, libera colateral
```

## Seguranca

- Contratos usam OpenZeppelin 5.0
- ReentrancyGuard em funcoes de pagamento
- Pausable para emergencias
- Modificadores de acesso por papel

## Licenca

MIT
