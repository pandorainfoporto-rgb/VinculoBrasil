/**
 * Cláusulas Legais - Lei do Inquilinato (Lei 8.245/91)
 * Sistema automático de geração de contratos com compliance legal
 */

export interface LegalClause {
  id: string;
  article: string;
  title: string;
  content: string;
  mandatory: boolean;
  category: 'direitos' | 'obrigacoes' | 'multas' | 'rescisao' | 'garantias' | 'reajuste';
}

/**
 * Cláusulas obrigatórias segundo a Lei 8.245/91
 * Estas cláusulas são automaticamente inseridas no Smart Contract NFT
 */
export const MANDATORY_CLAUSES: LegalClause[] = [
  {
    id: 'art-3',
    article: 'Art. 3º',
    title: 'Destinação do Imóvel',
    content: 'O imóvel destina-se exclusivamente para fins residenciais, sendo vedado o uso comercial ou industrial sem prévia autorização do LOCADOR.',
    mandatory: true,
    category: 'obrigacoes',
  },
  {
    id: 'art-22',
    article: 'Art. 22',
    title: 'Obrigações do Locador',
    content: 'O LOCADOR obriga-se a: (I) entregar o imóvel em perfeito estado de conservação; (II) garantir o uso pacífico do imóvel durante a vigência contratual; (III) realizar reparos urgentes e necessários na estrutura do imóvel; (IV) pagar tributos e taxas sobre a propriedade (IPTU).',
    mandatory: true,
    category: 'obrigacoes',
  },
  {
    id: 'art-23',
    article: 'Art. 23',
    title: 'Obrigações do Locatário',
    content: 'O LOCATÁRIO obriga-se a: (I) pagar pontualmente o aluguel e encargos; (II) utilizar o imóvel conforme sua destinação; (III) restituir o imóvel ao final do contrato no estado em que o recebeu; (IV) realizar reparos de responsabilidade do locatário; (V) não realizar modificações estruturais sem autorização prévia.',
    mandatory: true,
    category: 'obrigacoes',
  },
  {
    id: 'art-18',
    title: 'Prazo de Locação',
    article: 'Art. 18',
    content: 'O prazo de locação é de [PRAZO_MESES] meses, iniciando em [DATA_INICIO] e terminando em [DATA_FIM]. O contrato poderá ser prorrogado mediante acordo entre as partes.',
    mandatory: true,
    category: 'direitos',
  },
  {
    id: 'art-19',
    article: 'Art. 19',
    title: 'Denúncia Vazia pelo Locatário',
    content: 'Findo o prazo ajustado, se o LOCATÁRIO permanecer no imóvel por mais de 30 dias sem oposição do LOCADOR, presumir-se-á prorrogada a locação por prazo indeterminado.',
    mandatory: true,
    category: 'rescisao',
  },
  {
    id: 'art-4',
    article: 'Art. 4º',
    title: 'Sublocação',
    content: 'É expressamente proibida a sublocação total ou parcial do imóvel, bem como o empréstimo ou cessão a terceiros, salvo com autorização prévia e por escrito do LOCADOR.',
    mandatory: true,
    category: 'obrigacoes',
  },
  {
    id: 'art-9',
    article: 'Art. 9º',
    title: 'Forma de Garantia Locatícia',
    content: 'A presente locação é garantida mediante [TIPO_GARANTIA]: (I) Fiança Locatícia prestada por [NOME_GARANTIDOR]; (II) Seguro Fiança emitido pela seguradora [NOME_SEGURADORA]; (III) Depósito em garantia tokenizado na blockchain no endereço [WALLET_GARANTIA].',
    mandatory: true,
    category: 'garantias',
  },
  {
    id: 'art-37',
    article: 'Art. 37',
    title: 'Responsabilidade Solidária do Fiador',
    content: 'O FIADOR responde solidariamente com o LOCATÁRIO por todas as obrigações contratuais, incluindo pagamento de aluguéis, encargos, multas e indenizações. A fiança se estende até a efetiva entrega das chaves e quitação de todos os débitos.',
    mandatory: true,
    category: 'garantias',
  },
  {
    id: 'art-38',
    article: 'Art. 38',
    title: 'Exoneração do Fiador',
    content: 'O fiador poderá exonerar-se da fiança mediante notificação ao LOCADOR, permanecendo responsável por todos os efeitos da fiança durante 120 dias após a notificação.',
    mandatory: true,
    category: 'garantias',
  },
  {
    id: 'art-67',
    article: 'Art. 67',
    title: 'Reajuste do Aluguel',
    content: 'O valor do aluguel poderá ser reajustado anualmente, utilizando-se o índice [INDICE_REAJUSTE] (IGP-M, IPCA ou INPC), desde que decorridos no mínimo 12 meses do início da locação ou do último reajuste.',
    mandatory: true,
    category: 'reajuste',
  },
  {
    id: 'art-73',
    article: 'Art. 73',
    title: 'Revisão Judicial do Aluguel',
    content: 'Caso o valor do aluguel se torne manifestamente desproporcional em relação ao mercado, qualquer das partes poderá requerer revisão judicial do valor.',
    mandatory: true,
    category: 'reajuste',
  },
  {
    id: 'art-44',
    article: 'Art. 44',
    title: 'Multa por Rescisão Antecipada',
    content: 'Na locação residencial com prazo determinado, se o LOCATÁRIO devolver o imóvel antes do prazo, sem justo motivo, pagará multa equivalente à soma dos aluguéis vincendos até o término do contrato, proporcionalmente ao período faltante.',
    mandatory: true,
    category: 'multas',
  },
  {
    id: 'art-45',
    article: 'Art. 45',
    title: 'Multa Moratória por Atraso',
    content: 'O não pagamento do aluguel e encargos no vencimento sujeitará o LOCATÁRIO a: (I) Multa de 10% sobre o valor devido; (II) Juros de mora de 1% ao mês; (III) Correção monetária pelo índice [INDICE]; (IV) Honorários advocatícios de 20% em caso de cobrança judicial.',
    mandatory: true,
    category: 'multas',
  },
  {
    id: 'art-59',
    article: 'Art. 59',
    title: 'Ação de Despejo',
    content: 'O LOCADOR poderá retomar o imóvel mediante ação de despejo nas seguintes hipóteses: (I) Falta de pagamento de aluguel e encargos; (II) Infração contratual; (III) Término do prazo da locação; (IV) Necessidade de uso próprio ou de descendente.',
    mandatory: true,
    category: 'rescisao',
  },
  {
    id: 'art-5',
    article: 'Art. 5º',
    title: 'Encargos e Despesas',
    content: 'Além do aluguel, o LOCATÁRIO obriga-se a pagar: (I) Condomínio (se houver); (II) IPTU (conforme pactuado); (III) Água, luz, gás e telefone; (IV) Taxa de lixo; (V) Seguro incêndio (se exigido). Total mensal estimado: R$ [VALOR_TOTAL_MENSAL].',
    mandatory: true,
    category: 'obrigacoes',
  },
  {
    id: 'art-35',
    article: 'Art. 35',
    title: 'Benfeitorias',
    content: 'As benfeitorias necessárias introduzidas pelo LOCATÁRIO são indenizáveis. As benfeitorias úteis e voluptuárias somente serão indenizáveis se houver prévia autorização por escrito do LOCADOR. Caso contrário, o LOCATÁRIO poderá levantá-las ao final do contrato, desde que sem danificar o imóvel.',
    mandatory: true,
    category: 'direitos',
  },
];

/**
 * Cláusulas opcionais - podem ser adicionadas conforme necessidade
 */
export const OPTIONAL_CLAUSES: LegalClause[] = [
  {
    id: 'opt-animais',
    article: 'Cláusula Adicional',
    title: 'Permissão para Animais Domésticos',
    content: 'É permitida a manutenção de animais domésticos de pequeno porte no imóvel, desde que não causem danos ou perturbação aos vizinhos.',
    mandatory: false,
    category: 'direitos',
  },
  {
    id: 'opt-pintura',
    article: 'Cláusula Adicional',
    title: 'Obrigação de Pintura',
    content: 'O LOCATÁRIO obriga-se a realizar pintura completa do imóvel ao final do contrato, utilizando cores neutras (branco ou similar).',
    mandatory: false,
    category: 'obrigacoes',
  },
  {
    id: 'opt-vistoria',
    article: 'Cláusula Adicional',
    title: 'Vistoria Inicial e Final',
    content: 'Será realizada vistoria inicial para documentar o estado do imóvel na entrada, e vistoria final na saída, servindo como base para cobrança de eventuais danos.',
    mandatory: false,
    category: 'obrigacoes',
  },
  {
    id: 'opt-chaves',
    article: 'Cláusula Adicional',
    title: 'Devolução de Chaves',
    content: 'O LOCATÁRIO deverá devolver [NUMERO_CHAVES] chaves do imóvel ao término do contrato. A não devolução sujeitará o locatário ao pagamento de multa de R$ [VALOR_MULTA_CHAVE] por chave não devolvida.',
    mandatory: false,
    category: 'obrigacoes',
  },
];

/**
 * Variáveis do contrato que devem ser preenchidas dinamicamente
 */
export interface ContractVariables {
  // Partes
  locador_nome: string;
  locador_cpf: string;
  locador_endereco: string;
  locatario_nome: string;
  locatario_cpf: string;
  garantidor_nome?: string;
  garantidor_cpf?: string;
  seguradora_nome?: string;

  // Imóvel
  imovel_endereco: string;
  imovel_registro_cartorio: string;
  imovel_ipfs_hash: string;

  // Valores
  valor_aluguel: number;
  valor_condominio: number;
  valor_iptu_mensal: number;
  valor_total_mensal: number;

  // Prazos
  prazo_meses: number;
  data_inicio: string;
  data_fim: string;

  // Garantias
  tipo_garantia: 'Fiança' | 'Seguro' | 'Caução' | 'Tokenizada';
  wallet_garantia?: string;

  // Reajuste
  indice_reajuste: 'IGP-M' | 'IPCA' | 'INPC';

  // Blockchain
  nft_contract_address: string;
  nft_token_id: string;
  blockchain_network: string;
}

/**
 * Gera o contrato completo com todas as cláusulas e variáveis preenchidas
 */
export function generateSmartContract(variables: ContractVariables): string {
  let contract = `
╔═══════════════════════════════════════════════════════════════════╗
║           CONTRATO DE LOCAÇÃO RESIDENCIAL TOKENIZADO             ║
║              Vínculo.io - Tecnologia Blockchain                   ║
║                Lei 8.245/91 - Lei do Inquilinato                  ║
╚═══════════════════════════════════════════════════════════════════╝

📄 NFT CONTRACT: ${variables.nft_contract_address}
🔗 TOKEN ID: ${variables.nft_token_id}
⛓️  BLOCKCHAIN: ${variables.blockchain_network}
📅 DATA DE EMISSÃO: ${new Date().toLocaleDateString('pt-BR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PARTES CONTRATANTES

LOCADOR: ${variables.locador_nome}
CPF: ${variables.locador_cpf}
Endereço: ${variables.locador_endereco}

LOCATÁRIO: ${variables.locatario_nome}
CPF: ${variables.locatario_cpf}

${variables.garantidor_nome ? `
FIADOR/GARANTIDOR: ${variables.garantidor_nome}
CPF: ${variables.garantidor_cpf}
` : ''}

${variables.seguradora_nome ? `
SEGURADORA: ${variables.seguradora_nome}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. OBJETO DO CONTRATO

IMÓVEL: ${variables.imovel_endereco}
REGISTRO CARTÓRIO: ${variables.imovel_registro_cartorio}
IPFS HASH (Fotos): ${variables.imovel_ipfs_hash}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. VALORES E PAGAMENTO

💰 ALUGUEL: R$ ${variables.valor_aluguel.toFixed(2)}
🏢 CONDOMÍNIO: R$ ${variables.valor_condominio.toFixed(2)}
🏛️  IPTU: R$ ${variables.valor_iptu_mensal.toFixed(2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TOTAL MENSAL: R$ ${variables.valor_total_mensal.toFixed(2)}

💳 SPLIT AUTOMÁTICO DE PAGAMENTO:
   • 90% (R$ ${(variables.valor_total_mensal * 0.90).toFixed(2)}) → Locador
   • 5% (R$ ${(variables.valor_total_mensal * 0.05).toFixed(2)}) → Seguradora
   • 5% (R$ ${(variables.valor_total_mensal * 0.05).toFixed(2)}) → Plataforma

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. PRAZO

Prazo: ${variables.prazo_meses} meses
Início: ${variables.data_inicio}
Término: ${variables.data_fim}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. GARANTIA

Tipo: ${variables.tipo_garantia}
${variables.wallet_garantia ? `🔒 Wallet Garantia (Blockchain): ${variables.wallet_garantia}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. CLÁUSULAS LEGAIS (Lei 8.245/91)

`;

  // Adiciona todas as cláusulas obrigatórias
  MANDATORY_CLAUSES.forEach((clause, index) => {
    let content = clause.content;

    // Substitui variáveis dinâmicas
    content = content.replace('[PRAZO_MESES]', variables.prazo_meses.toString());
    content = content.replace('[DATA_INICIO]', variables.data_inicio);
    content = content.replace('[DATA_FIM]', variables.data_fim);
    content = content.replace('[TIPO_GARANTIA]', variables.tipo_garantia);
    content = content.replace('[NOME_GARANTIDOR]', variables.garantidor_nome || 'N/A');
    content = content.replace('[NOME_SEGURADORA]', variables.seguradora_nome || 'N/A');
    content = content.replace('[WALLET_GARANTIA]', variables.wallet_garantia || 'N/A');
    content = content.replace('[INDICE_REAJUSTE]', variables.indice_reajuste);
    content = content.replace('[VALOR_TOTAL_MENSAL]', `R$ ${variables.valor_total_mensal.toFixed(2)}`);
    content = content.replace('[INDICE]', variables.indice_reajuste);

    contract += `
${index + 1}. ${clause.title} (${clause.article})
${content}

`;
  });

  contract += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. REGISTRO BLOCKCHAIN

Este contrato foi registrado na blockchain como NFT (Non-Fungible Token)
garantindo sua imutabilidade, transparência e rastreabilidade.

🔐 Assinaturas Digitais Coletadas:
   ✓ Locador: [BLOCKCHAIN_SIGNATURE]
   ✓ Locatário: [BLOCKCHAIN_SIGNATURE]
   ${variables.garantidor_nome ? '✓ Garantidor: [BLOCKCHAIN_SIGNATURE]' : ''}
   ${variables.seguradora_nome ? '✓ Seguradora: [BLOCKCHAIN_SIGNATURE]' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. LGPD - PROTEÇÃO DE DADOS

Todas as informações pessoais contidas neste contrato são tratadas
em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018).

Os dados são armazenados de forma criptografada e somente partes
autorizadas têm acesso às informações sensíveis.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. FORO

Fica eleito o foro da comarca de [COMARCA] para dirimir qualquer
questão oriunda do presente contrato, com renúncia expressa a
qualquer outro, por mais privilegiado que seja.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 HASH DO DOCUMENTO: [SHA256_HASH]
⏱️  TIMESTAMP: ${new Date().toISOString()}
🌐 IPFS CID: [IPFS_CID]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vínculo.io - A locação inteligente
Tecnologia que une pessoas com confiança
`;

  return contract;
}

/**
 * Metadata do NFT Contract seguindo padrão ERC-721
 */
export interface NFTContractMetadata {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  legal_clauses: LegalClause[];
  contract_text: string;
  parties: {
    landlord: { name: string; cpf: string; wallet: string };
    tenant: { name: string; cpf: string; wallet: string };
    guarantor?: { name: string; cpf: string; wallet: string };
    insurer?: { name: string; wallet: string };
  };
}

/**
 * Gera metadata completo para o NFT do contrato
 */
export function generateNFTMetadata(variables: ContractVariables): NFTContractMetadata {
  return {
    name: `Contrato de Locação #${variables.nft_token_id}`,
    description: `Contrato de locação residencial tokenizado do imóvel ${variables.imovel_endereco}`,
    image: variables.imovel_ipfs_hash,
    external_url: `https://vinculobrasil.com.br/contracts/${variables.nft_token_id}`,
    attributes: [
      { trait_type: 'Property Address', value: variables.imovel_endereco },
      { trait_type: 'Monthly Rent', value: variables.valor_aluguel },
      { trait_type: 'Contract Duration (months)', value: variables.prazo_meses },
      { trait_type: 'Start Date', value: variables.data_inicio },
      { trait_type: 'End Date', value: variables.data_fim },
      { trait_type: 'Guarantee Type', value: variables.tipo_garantia },
      { trait_type: 'Readjustment Index', value: variables.indice_reajuste },
      { trait_type: 'Total Monthly Value', value: variables.valor_total_mensal },
    ],
    legal_clauses: MANDATORY_CLAUSES,
    contract_text: generateSmartContract(variables),
    parties: {
      landlord: {
        name: variables.locador_nome,
        cpf: variables.locador_cpf,
        wallet: '', // Will be filled from blockchain
      },
      tenant: {
        name: variables.locatario_nome,
        cpf: variables.locatario_cpf,
        wallet: '', // Will be filled from blockchain
      },
      ...(variables.garantidor_nome && {
        guarantor: {
          name: variables.garantidor_nome,
          cpf: variables.garantidor_cpf || '',
          wallet: variables.wallet_garantia || '',
        },
      }),
      ...(variables.seguradora_nome && {
        insurer: {
          name: variables.seguradora_nome,
          wallet: '', // Will be filled from blockchain
        },
      }),
    },
  };
}
