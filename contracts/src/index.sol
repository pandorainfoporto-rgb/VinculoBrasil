// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Vinculo Brasil - Smart Contracts Index
 * @author FATTO Tecnologia LTDA
 * @notice Arquivo de referencia para todos os contratos do ecossistema VBRz
 *
 * CONTRATOS PRINCIPAIS:
 * =====================
 *
 * 1. VBRzToken.sol
 *    - Token ERC-20 principal (1 Bilhao de supply)
 *    - Features: Burnable, AccessControl, Pausable
 *    - Deploy recebe todo supply para distribuicao
 *
 * 2. TokenVesting.sol
 *    - Contrato de vesting com suporte a multiplos schedules
 *    - Suporta Cliff (carencia) e Duration (liberacao linear)
 *    - Permite criar agendas para Team, Advisors, etc.
 *
 * 3. IVBRz.sol
 *    - Interface para integracao com o token
 *    - Use para interagir com VBRzToken de outros contratos
 *
 * DEPLOY ORDER:
 * =============
 * 1. Deploy VBRzToken(treasury, admin)
 * 2. Deploy TokenVesting(vbrzTokenAddress)
 * 3. Transfer 150M VBRz para TokenVesting (Team allocation)
 * 4. Criar schedules de vesting para team members
 *
 * ENDERECOS DE PRODUCAO (Polygon Mainnet):
 * ========================================
 * Treasury: 0x... (sera definido no deploy)
 * Team Vesting: 0x... (sera definido no deploy)
 *
 * TESTNET (Polygon Amoy):
 * =======================
 * VBRz Token: 0x... (sera definido apos deploy)
 * TokenVesting: 0x... (sera definido apos deploy)
 */

// Importacoes para compilacao
import "./VBRzToken.sol";
import "./TokenVesting.sol";
import "./IVBRz.sol";
