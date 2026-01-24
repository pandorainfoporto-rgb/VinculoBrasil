/**
 * Base de dados geográficos do Brasil
 * Estados, Cidades e CEPs
 */

export interface Estado {
  sigla: string;
  nome: string;
}

export interface Cidade {
  nome: string;
  estado: string;
  cepInicio: string;
  cepFim: string;
}

export interface CepInfo {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

// Lista de todos os estados brasileiros
export const ESTADOS_BRASIL: Estado[] = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapa' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceara' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espirito Santo' },
  { sigla: 'GO', nome: 'Goias' },
  { sigla: 'MA', nome: 'Maranhao' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Para' },
  { sigla: 'PB', nome: 'Paraiba' },
  { sigla: 'PR', nome: 'Parana' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piaui' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondonia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'Sao Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' },
];

// Mapeamento de faixas de CEP por estado
export const CEP_FAIXAS: Record<string, { inicio: string; fim: string }> = {
  SP: { inicio: '01000000', fim: '19999999' },
  RJ: { inicio: '20000000', fim: '28999999' },
  ES: { inicio: '29000000', fim: '29999999' },
  MG: { inicio: '30000000', fim: '39999999' },
  BA: { inicio: '40000000', fim: '48999999' },
  SE: { inicio: '49000000', fim: '49999999' },
  PE: { inicio: '50000000', fim: '56999999' },
  AL: { inicio: '57000000', fim: '57999999' },
  PB: { inicio: '58000000', fim: '58999999' },
  RN: { inicio: '59000000', fim: '59999999' },
  CE: { inicio: '60000000', fim: '63999999' },
  PI: { inicio: '64000000', fim: '64999999' },
  MA: { inicio: '65000000', fim: '65999999' },
  PA: { inicio: '66000000', fim: '68899999' },
  AP: { inicio: '68900000', fim: '68999999' },
  AM: { inicio: '69000000', fim: '69299999' },
  RR: { inicio: '69300000', fim: '69399999' },
  AC: { inicio: '69900000', fim: '69999999' },
  DF: { inicio: '70000000', fim: '72799999' },
  GO: { inicio: '72800000', fim: '76799999' },
  TO: { inicio: '77000000', fim: '77999999' },
  MT: { inicio: '78000000', fim: '78899999' },
  RO: { inicio: '76800000', fim: '76999999' },
  MS: { inicio: '79000000', fim: '79999999' },
  PR: { inicio: '80000000', fim: '87999999' },
  SC: { inicio: '88000000', fim: '89999999' },
  RS: { inicio: '90000000', fim: '99999999' },
};

// Principais cidades por estado com faixas de CEP
export const CIDADES_PRINCIPAIS: Cidade[] = [
  // Sao Paulo
  { nome: 'Sao Paulo', estado: 'SP', cepInicio: '01000000', cepFim: '05999999' },
  { nome: 'Campinas', estado: 'SP', cepInicio: '13000000', cepFim: '13139999' },
  { nome: 'Santos', estado: 'SP', cepInicio: '11000000', cepFim: '11999999' },
  { nome: 'Guarulhos', estado: 'SP', cepInicio: '07000000', cepFim: '07399999' },
  { nome: 'Osasco', estado: 'SP', cepInicio: '06000000', cepFim: '06299999' },
  { nome: 'Santo Andre', estado: 'SP', cepInicio: '09000000', cepFim: '09299999' },
  { nome: 'Sao Bernardo do Campo', estado: 'SP', cepInicio: '09600000', cepFim: '09899999' },
  { nome: 'Ribeirao Preto', estado: 'SP', cepInicio: '14000000', cepFim: '14114999' },
  { nome: 'Sorocaba', estado: 'SP', cepInicio: '18000000', cepFim: '18109999' },

  // Rio de Janeiro
  { nome: 'Rio de Janeiro', estado: 'RJ', cepInicio: '20000000', cepFim: '23799999' },
  { nome: 'Niteroi', estado: 'RJ', cepInicio: '24000000', cepFim: '24399999' },
  { nome: 'Petropolis', estado: 'RJ', cepInicio: '25600000', cepFim: '25779999' },
  { nome: 'Duque de Caxias', estado: 'RJ', cepInicio: '25000000', cepFim: '25599999' },
  { nome: 'Nova Iguacu', estado: 'RJ', cepInicio: '26000000', cepFim: '26299999' },

  // Minas Gerais
  { nome: 'Belo Horizonte', estado: 'MG', cepInicio: '30000000', cepFim: '31999999' },
  { nome: 'Uberlandia', estado: 'MG', cepInicio: '38400000', cepFim: '38444999' },
  { nome: 'Contagem', estado: 'MG', cepInicio: '32000000', cepFim: '32399999' },
  { nome: 'Juiz de Fora', estado: 'MG', cepInicio: '36000000', cepFim: '36099999' },
  { nome: 'Betim', estado: 'MG', cepInicio: '32600000', cepFim: '32699999' },

  // Bahia
  { nome: 'Salvador', estado: 'BA', cepInicio: '40000000', cepFim: '42599999' },
  { nome: 'Feira de Santana', estado: 'BA', cepInicio: '44000000', cepFim: '44099999' },
  { nome: 'Vitoria da Conquista', estado: 'BA', cepInicio: '45000000', cepFim: '45114999' },

  // Parana
  { nome: 'Curitiba', estado: 'PR', cepInicio: '80000000', cepFim: '82999999' },
  { nome: 'Londrina', estado: 'PR', cepInicio: '86000000', cepFim: '86199999' },
  { nome: 'Maringa', estado: 'PR', cepInicio: '87000000', cepFim: '87099999' },
  { nome: 'Ponta Grossa', estado: 'PR', cepInicio: '84000000', cepFim: '84099999' },

  // Rio Grande do Sul
  { nome: 'Porto Alegre', estado: 'RS', cepInicio: '90000000', cepFim: '91999999' },
  { nome: 'Caxias do Sul', estado: 'RS', cepInicio: '95000000', cepFim: '95124999' },
  { nome: 'Pelotas', estado: 'RS', cepInicio: '96000000', cepFim: '96099999' },
  { nome: 'Canoas', estado: 'RS', cepInicio: '92000000', cepFim: '92499999' },

  // Santa Catarina
  { nome: 'Florianopolis', estado: 'SC', cepInicio: '88000000', cepFim: '88099999' },
  { nome: 'Joinville', estado: 'SC', cepInicio: '89200000', cepFim: '89239999' },
  { nome: 'Blumenau', estado: 'SC', cepInicio: '89000000', cepFim: '89099999' },

  // Goias
  { nome: 'Goiania', estado: 'GO', cepInicio: '74000000', cepFim: '74899999' },
  { nome: 'Aparecida de Goiania', estado: 'GO', cepInicio: '74900000', cepFim: '74999999' },
  { nome: 'Anapolis', estado: 'GO', cepInicio: '75000000', cepFim: '75139999' },

  // Distrito Federal
  { nome: 'Brasilia', estado: 'DF', cepInicio: '70000000', cepFim: '72799999' },

  // Pernambuco
  { nome: 'Recife', estado: 'PE', cepInicio: '50000000', cepFim: '52999999' },
  { nome: 'Olinda', estado: 'PE', cepInicio: '53000000', cepFim: '53999999' },
  { nome: 'Jaboatao dos Guararapes', estado: 'PE', cepInicio: '54000000', cepFim: '54599999' },

  // Ceara
  { nome: 'Fortaleza', estado: 'CE', cepInicio: '60000000', cepFim: '61699999' },
  { nome: 'Caucaia', estado: 'CE', cepInicio: '61600000', cepFim: '61699999' },

  // Para
  { nome: 'Belem', estado: 'PA', cepInicio: '66000000', cepFim: '66999999' },
  { nome: 'Ananindeua', estado: 'PA', cepInicio: '67000000', cepFim: '67199999' },

  // Amazonas
  { nome: 'Manaus', estado: 'AM', cepInicio: '69000000', cepFim: '69199999' },

  // Espirito Santo
  { nome: 'Vitoria', estado: 'ES', cepInicio: '29000000', cepFim: '29099999' },
  { nome: 'Vila Velha', estado: 'ES', cepInicio: '29100000', cepFim: '29199999' },
  { nome: 'Serra', estado: 'ES', cepInicio: '29160000', cepFim: '29179999' },

  // Maranhao
  { nome: 'Sao Luis', estado: 'MA', cepInicio: '65000000', cepFim: '65199999' },

  // Rio Grande do Norte
  { nome: 'Natal', estado: 'RN', cepInicio: '59000000', cepFim: '59199999' },

  // Paraiba
  { nome: 'Joao Pessoa', estado: 'PB', cepInicio: '58000000', cepFim: '58099999' },
  { nome: 'Campina Grande', estado: 'PB', cepInicio: '58100000', cepFim: '58199999' },

  // Alagoas
  { nome: 'Maceio', estado: 'AL', cepInicio: '57000000', cepFim: '57099999' },

  // Sergipe
  { nome: 'Aracaju', estado: 'SE', cepInicio: '49000000', cepFim: '49099999' },

  // Piaui
  { nome: 'Teresina', estado: 'PI', cepInicio: '64000000', cepFim: '64099999' },

  // Mato Grosso
  { nome: 'Cuiaba', estado: 'MT', cepInicio: '78000000', cepFim: '78099999' },

  // Mato Grosso do Sul
  { nome: 'Campo Grande', estado: 'MS', cepInicio: '79000000', cepFim: '79129999' },

  // Rondonia
  { nome: 'Porto Velho', estado: 'RO', cepInicio: '76800000', cepFim: '76899999' },

  // Tocantins
  { nome: 'Palmas', estado: 'TO', cepInicio: '77000000', cepFim: '77199999' },

  // Acre
  { nome: 'Rio Branco', estado: 'AC', cepInicio: '69900000', cepFim: '69999999' },

  // Amapa
  { nome: 'Macapa', estado: 'AP', cepInicio: '68900000', cepFim: '68999999' },

  // Roraima
  { nome: 'Boa Vista', estado: 'RR', cepInicio: '69300000', cepFim: '69399999' },
];

// Base de CEPs mockada para demonstracao (em producao, usar API ViaCEP)
export const CEPS_MOCK: Record<string, CepInfo> = {
  '01310100': {
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    bairro: 'Bela Vista',
    cidade: 'Sao Paulo',
    estado: 'SP',
  },
  '01310200': {
    cep: '01310-200',
    logradouro: 'Avenida Paulista',
    bairro: 'Cerqueira Cesar',
    cidade: 'Sao Paulo',
    estado: 'SP',
  },
  '01414001': {
    cep: '01414-001',
    logradouro: 'Rua Oscar Freire',
    bairro: 'Jardim Paulista',
    cidade: 'Sao Paulo',
    estado: 'SP',
  },
  '05424020': {
    cep: '05424-020',
    logradouro: 'Rua Harmonia',
    bairro: 'Vila Madalena',
    cidade: 'Sao Paulo',
    estado: 'SP',
  },
  '22041080': {
    cep: '22041-080',
    logradouro: 'Avenida Atlantica',
    bairro: 'Copacabana',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
  },
  '22070002': {
    cep: '22070-002',
    logradouro: 'Avenida Vieira Souto',
    bairro: 'Ipanema',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
  },
  '22410003': {
    cep: '22410-003',
    logradouro: 'Rua Voluntarios da Patria',
    bairro: 'Botafogo',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
  },
  '30130000': {
    cep: '30130-000',
    logradouro: 'Praca Sete de Setembro',
    bairro: 'Centro',
    cidade: 'Belo Horizonte',
    estado: 'MG',
  },
  '30140071': {
    cep: '30140-071',
    logradouro: 'Avenida Afonso Pena',
    bairro: 'Centro',
    cidade: 'Belo Horizonte',
    estado: 'MG',
  },
  '80010000': {
    cep: '80010-000',
    logradouro: 'Praca Tiradentes',
    bairro: 'Centro',
    cidade: 'Curitiba',
    estado: 'PR',
  },
  '90010000': {
    cep: '90010-000',
    logradouro: 'Praca da Alfandega',
    bairro: 'Centro Historico',
    cidade: 'Porto Alegre',
    estado: 'RS',
  },
  '40010000': {
    cep: '40010-000',
    logradouro: 'Praca da Se',
    bairro: 'Se',
    cidade: 'Salvador',
    estado: 'BA',
  },
  '70040010': {
    cep: '70040-010',
    logradouro: 'Praca dos Tres Poderes',
    bairro: 'Zona Civico-Administrativa',
    cidade: 'Brasilia',
    estado: 'DF',
  },
  '50010000': {
    cep: '50010-000',
    logradouro: 'Praca da Republica',
    bairro: 'Santo Antonio',
    cidade: 'Recife',
    estado: 'PE',
  },
  '60060440': {
    cep: '60060-440',
    logradouro: 'Avenida Beira Mar',
    bairro: 'Meireles',
    cidade: 'Fortaleza',
    estado: 'CE',
  },
};

/**
 * Busca informacoes de CEP
 * Em producao, integrar com API ViaCEP: https://viacep.com.br/ws/{cep}/json/
 */
export async function buscarCep(cep: string): Promise<CepInfo | null> {
  // Remove caracteres nao numericos
  const cepLimpo = cep.replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    return null;
  }

  // Primeiro verifica no mock
  if (CEPS_MOCK[cepLimpo]) {
    return CEPS_MOCK[cepLimpo];
  }

  // Em producao, usar API ViaCEP
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) {
      return null;
    }

    return {
      cep: data.cep,
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || '',
    };
  } catch {
    // Fallback para inferencia por faixa de CEP
    return inferirCidadePorCep(cepLimpo);
  }
}

/**
 * Infere cidade com base na faixa de CEP
 */
function inferirCidadePorCep(cep: string): CepInfo | null {
  const cepNum = parseInt(cep, 10);

  for (const cidade of CIDADES_PRINCIPAIS) {
    const inicio = parseInt(cidade.cepInicio, 10);
    const fim = parseInt(cidade.cepFim, 10);

    if (cepNum >= inicio && cepNum <= fim) {
      return {
        cep: `${cep.slice(0, 5)}-${cep.slice(5)}`,
        logradouro: '',
        bairro: '',
        cidade: cidade.nome,
        estado: cidade.estado,
      };
    }
  }

  return null;
}

/**
 * Retorna cidades de um estado
 */
export function getCidadesPorEstado(estadoSigla: string): Cidade[] {
  return CIDADES_PRINCIPAIS.filter(cidade => cidade.estado === estadoSigla);
}

/**
 * Formata CEP para exibicao (XXXXX-XXX)
 */
export function formatarCep(cep: string): string {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length === 8) {
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
  }
  return cep;
}

/**
 * Lista de tipos de logradouro
 */
export const TIPOS_LOGRADOURO = [
  'Rua',
  'Avenida',
  'Alameda',
  'Praca',
  'Travessa',
  'Estrada',
  'Rodovia',
  'Via',
  'Largo',
  'Passagem',
  'Beco',
  'Viela',
  'Ladeira',
  'Condominio',
] as const;

/**
 * Lista de tipos de imovel
 */
export const TIPOS_IMOVEL = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'studio', label: 'Studio/Kitnet' },
  { value: 'loft', label: 'Loft' },
  { value: 'penthouse', label: 'Cobertura' },
  { value: 'flat', label: 'Flat' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'office', label: 'Sala Comercial' },
  { value: 'warehouse', label: 'Galpao' },
  { value: 'land', label: 'Terreno' },
  { value: 'rural', label: 'Chacara/Sitio' },
] as const;

/**
 * Lista de comodidades
 */
export const COMODIDADES = [
  { id: 'pool', label: 'Piscina' },
  { id: 'gym', label: 'Academia' },
  { id: 'garage', label: 'Garagem' },
  { id: 'elevator', label: 'Elevador' },
  { id: 'doorman', label: 'Portaria 24h' },
  { id: 'security', label: 'Seguranca' },
  { id: 'playground', label: 'Playground' },
  { id: 'partyroom', label: 'Salao de Festas' },
  { id: 'bbq', label: 'Churrasqueira' },
  { id: 'garden', label: 'Jardim' },
  { id: 'laundry', label: 'Lavanderia' },
  { id: 'furnished', label: 'Mobiliado' },
  { id: 'aircon', label: 'Ar Condicionado' },
  { id: 'balcony', label: 'Varanda' },
  { id: 'closet', label: 'Closet' },
  { id: 'servicearea', label: 'Area de Servico' },
] as const;

/**
 * Opcoes de pet-friendly
 */
export const OPCOES_PET = [
  { value: 'allowed', label: 'Pets Permitidos' },
  { value: 'small_only', label: 'Apenas Pets Pequenos' },
  { value: 'negotiable', label: 'Negociavel' },
  { value: 'not_allowed', label: 'Nao Permitido' },
] as const;

/**
 * Lista de bancos brasileiros
 */
export const BANCOS_BRASIL = [
  { codigo: '001', nome: 'Banco do Brasil' },
  { codigo: '033', nome: 'Santander' },
  { codigo: '104', nome: 'Caixa Economica Federal' },
  { codigo: '237', nome: 'Bradesco' },
  { codigo: '341', nome: 'Itau Unibanco' },
  { codigo: '260', nome: 'Nubank' },
  { codigo: '077', nome: 'Inter' },
  { codigo: '336', nome: 'C6 Bank' },
  { codigo: '212', nome: 'Original' },
  { codigo: '756', nome: 'Sicoob' },
  { codigo: '748', nome: 'Sicredi' },
  { codigo: '422', nome: 'Safra' },
  { codigo: '070', nome: 'BRB' },
  { codigo: '208', nome: 'BTG Pactual' },
  { codigo: '290', nome: 'PagSeguro' },
  { codigo: '380', nome: 'PicPay' },
  { codigo: '323', nome: 'Mercado Pago' },
  { codigo: '655', nome: 'Neon' },
  { codigo: '403', nome: 'Cora' },
  { codigo: '085', nome: 'Via Credi' },
] as const;

/**
 * Tipos de conta bancaria
 */
export const TIPOS_CONTA = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Conta Poupanca' },
  { value: 'payment', label: 'Conta de Pagamento' },
] as const;

/**
 * Tipos de chave PIX
 */
export const TIPOS_CHAVE_PIX = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'random', label: 'Chave Aleatoria' },
] as const;
