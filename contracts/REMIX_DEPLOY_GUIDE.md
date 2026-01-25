# Guia de Deploy - Vinculo Protocol no Remix IDE

## Pre-requisitos

1. **MetaMask** instalado no navegador
2. **MATIC de teste** da Polygon Amoy (https://faucet.polygon.technology/)
3. Acesso ao **Remix IDE** (https://remix.ethereum.org)

---

## Passo 1: Configurar MetaMask para Polygon Amoy

Adicione a rede manualmente:

| Campo | Valor |
|-------|-------|
| Network Name | Polygon Amoy Testnet |
| RPC URL | https://rpc-amoy.polygon.technology/ |
| Chain ID | 80002 |
| Currency Symbol | MATIC |
| Block Explorer | https://amoy.polygonscan.com/ |

---

## Passo 2: Obter MATIC de Teste

1. Acesse https://faucet.polygon.technology/
2. Selecione "Amoy" network
3. Cole seu endereco MetaMask
4. Clique "Submit"
5. Aguarde ~30 segundos

---

## Passo 3: Abrir Remix IDE

1. Acesse https://remix.ethereum.org
2. Na aba "File Explorer" (icone de pasta)
3. Clique em "Create New File"
4. Nome: `VinculoProtocol.sol`
5. Cole o conteudo do arquivo `contracts/VinculoProtocol.sol`

---

## Passo 4: Compilar

1. Clique na aba "Solidity Compiler" (icone de S)
2. Selecione versao: **0.8.20**
3. Marque "Enable optimization" (200 runs)
4. Clique em **Compile VinculoProtocol.sol**
5. Aguarde - deve mostrar check verde

Se houver erro de imports OpenZeppelin:
- O Remix baixa automaticamente do npm
- Aguarde alguns segundos e recompile

---

## Passo 5: Deploy do Token BRZ (Teste)

1. Clique na aba "Deploy & Run Transactions" (icone de seta)
2. Environment: **Injected Provider - MetaMask**
3. MetaMask vai pedir conexao - aceite
4. No dropdown "CONTRACT", selecione: **VinculoTestBRZ**
5. Clique em **Deploy**
6. MetaMask abre - confirme a transacao
7. Aguarde confirmacao (~10 segundos)

**IMPORTANTE**: Copie o endereco do contrato BRZ deployado!
(Aparece em "Deployed Contracts" como `0x...`)

---

## Passo 6: Deploy do Vinculo Protocol

1. No dropdown "CONTRACT", selecione: **VinculoProtocol**
2. Ao lado de "Deploy", expanda os campos:
   - `_platformWallet`: Seu endereco MetaMask (para receber fees)
   - `_brzToken`: Endereco do VinculoTestBRZ (copiado acima)

Exemplo:
```
_platformWallet: 0xSeuEnderecoMetaMask
_brzToken: 0xEnderecoDoTestBRZ
```

3. Clique em **Deploy**
4. MetaMask abre - confirme (gas ~0.05 MATIC)
5. Aguarde confirmacao

---

## Passo 7: Verificar Deploy

Em "Deployed Contracts", clique no contrato VinculoProtocol:

### Funcoes de Leitura (azul):
- `getStats` - Deve retornar todos zeros inicialmente
- `platformWallet` - Seu endereco
- `brzToken` - Endereco do token

### Funcoes de Escrita (laranja):
- `createRental` - Criar contrato de aluguel
- `payRentBRZ` - Pagar aluguel
- `registerProperty` - Registrar imovel
- `pause` - Kill switch

---

## Passo 8: Teste Basico

### 8.1 Obter BRZ de Teste
1. Expanda o contrato **VinculoTestBRZ**
2. Clique em `faucet`
3. Confirme no MetaMask
4. Verifique com `balanceOf` (seu endereco) - deve mostrar 100000000 (10.000 BRZ)

### 8.2 Registrar um Imovel
1. No contrato **VinculoProtocol**
2. Expanda `registerProperty`:
   - propertyId: "PROP-001"
   - registrationNumber: "123456"
   - valueBRL: 5000000000 (R$ 500.000,00 em centavos)
   - city: "Sao Paulo"
   - state: "SP"
3. Clique em "transact"
4. Confirme no MetaMask

### 8.3 Criar um Contrato de Aluguel
1. Expanda `createRental`:
   - landlord: Seu endereco
   - tenant: Outro endereco (ou o mesmo para teste)
   - guarantor: Outro endereco (ou o mesmo)
   - insurer: 0x0000000000000000000000000000000000000000 (usa platform)
   - rentAmount: 30000000 (R$ 3.000,00 em centavos)
   - securityDeposit: 0
   - startDate: 1704067200 (timestamp)
   - endDate: 1735689600 (timestamp)
   - paymentDueDay: 10
   - propertyId: "PROP-001"
   - ipfsHash: "QmTest123"
2. Clique em "transact"
3. Confirme

---

## Passo 9: Verificar no Explorer

1. Acesse https://amoy.polygonscan.com/
2. Cole o endereco do contrato
3. Verifique transacoes e eventos

---

## Enderecos Importantes para Configurar no Frontend

Apos o deploy, atualize `src/lib/web3/config.ts`:

```typescript
export const contractAddresses = {
  amoy: {
    vinculoProtocol: "0x...", // Endereco do VinculoProtocol
    brzToken: "0x...",        // Endereco do VinculoTestBRZ
  },
};
```

---

## Troubleshooting

### Erro "insufficient funds"
- Obtenha mais MATIC do faucet

### Erro "execution reverted"
- Verifique os parametros da funcao
- Veja o erro detalhado no console do Remix

### MetaMask nao conecta
- Verifique se esta na rede Polygon Amoy
- Refresh da pagina do Remix

### Imports nao funcionam
- Remix baixa automaticamente do npm
- Aguarde ou recarregue a pagina

---

## Verificacao de Contrato (Opcional)

Para verificar o contrato no PolygonScan:

1. Acesse https://amoy.polygonscan.com/verifyContract
2. Endereco: Cole o endereco do contrato
3. Compiler Type: Solidity (Single file)
4. Compiler Version: v0.8.20+commit.a1b79de6
5. License: MIT
6. Cole o codigo fonte
7. Clique "Verify"

---

## Proximos Passos

1. Configure os enderecos no frontend
2. Teste as funcoes via interface
3. Integre com wagmi/viem (proximo passo)
