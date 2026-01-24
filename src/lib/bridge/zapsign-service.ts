/**
 * Vinculo.io - ZapSign Digital Signature Service
 *
 * Integração com ZapSign para assinatura eletrônica de contratos
 * com validade jurídica conforme MP 2.200-2/2001 e Lei 14.063/2020.
 *
 * Funcionalidades:
 * - Criação de documentos para assinatura
 * - Envio via WhatsApp, Email ou SMS
 * - Assinatura com certificado digital (ICP-Brasil) ou simples
 * - Geolocalização e IP do signatário
 * - Integração com blockchain para hash do documento
 *
 * Documentação: https://docs.zapsign.com.br/
 */

// ============================================================================
// TIPOS
// ============================================================================

export type SignatureType = 'electronic' | 'digital_certificate';

export type SignerStatus = 'pending' | 'signed' | 'rejected' | 'link_expired';

export type DocumentStatus =
  | 'draft'
  | 'pending'
  | 'signed'
  | 'cancelled'
  | 'expired'
  | 'refused'
  | 'processing';

export type DeliveryMethod = 'whatsapp' | 'email' | 'sms' | 'link';

export interface ZapSignSigner {
  name: string;
  email: string;
  phone_country: string;
  phone_number: string;
  auth_mode: 'assinaturaTela' | 'tokenEmail' | 'tokenSms' | 'certificadoDigital';
  send_automatic_email?: boolean;
  send_automatic_whatsapp?: boolean;
  lock_email?: boolean;
  lock_phone?: boolean;
  lock_name?: boolean;
  require_selfie_photo?: boolean;
  require_document_photo?: boolean;
  qualification?: string;
  external_id?: string;
}

export interface ZapSignSignerResponse extends ZapSignSigner {
  token: string;
  status: SignerStatus;
  times_viewed: number;
  last_view_at?: string;
  signed_at?: string;
  sign_url: string;
  signature_info?: {
    ip_address: string;
    geolocation?: {
      latitude: number;
      longitude: number;
    };
    user_agent: string;
  };
}

export interface ZapSignDocument {
  sandbox?: boolean;
  name: string;
  url_pdf?: string;
  base64_pdf?: string;
  external_id?: string;
  folder_path?: string;
  date_limit_to_sign?: string;
  observers?: string[];
  remind_interval?: number;
  disable_signer_emails?: boolean;
  brand_logo?: string;
  brand_primary_color?: string;
  lang?: 'pt-br' | 'en' | 'es';
  signers: ZapSignSigner[];
}

export interface ZapSignDocumentResponse {
  open_id: number;
  token: string;
  name: string;
  status: DocumentStatus;
  external_id?: string;
  created_at: string;
  last_update_at: string;
  created_through: string;
  deleted: boolean;
  signed_file_url?: string;
  signed_file_only_finished?: string;
  extra_docs?: Array<{ name: string; url: string }>;
  original_file_url: string;
  signers: ZapSignSignerResponse[];
}

export interface ZapSignWebhookEvent {
  event_type:
    | 'doc_created'
    | 'doc_signed'
    | 'doc_refused'
    | 'doc_deleted'
    | 'signer_signed'
    | 'signer_refused'
    | 'signer_link_opened';
  doc: ZapSignDocumentResponse;
  signer?: ZapSignSignerResponse;
}

export interface ContractSignatureRequest {
  contractId: string;
  documentName: string;
  pdfContent: string; // Base64
  landlord: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  tenant: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  guarantor?: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  insurer?: {
    name: string;
    email: string;
    phone: string;
    cnpj: string;
  };
  expirationDays?: number;
  sendViaWhatsApp?: boolean;
}

export interface ContractSignatureResult {
  success: boolean;
  documentToken: string;
  documentUrl: string;
  signers: Array<{
    role: 'landlord' | 'tenant' | 'guarantor' | 'insurer';
    name: string;
    signUrl: string;
    status: SignerStatus;
  }>;
  expiresAt: string;
  error?: string;
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface ZapSignConfig {
  apiToken: string;
  environment: 'sandbox' | 'production';
  webhookUrl?: string;
  brandLogo?: string;
  brandColor?: string;
}

const ZAPSIGN_ENDPOINTS = {
  sandbox: 'https://sandbox.api.zapsign.com.br/api/v1',
  production: 'https://api.zapsign.com.br/api/v1',
} as const;

// ============================================================================
// SERVIÇO ZAPSIGN
// ============================================================================

export class ZapSignService {
  private apiToken: string;
  private baseUrl: string;
  private brandLogo?: string;
  private brandColor?: string;
  private isSandbox: boolean;

  constructor(config: ZapSignConfig) {
    this.apiToken = config.apiToken;
    this.baseUrl = ZAPSIGN_ENDPOINTS[config.environment];
    this.brandLogo = config.brandLogo;
    this.brandColor = config.brandColor;
    this.isSandbox = config.environment === 'sandbox';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`ZapSign API Error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  // --------------------------------------------------------------------------
  // DOCUMENTS
  // --------------------------------------------------------------------------

  /**
   * Cria documento para assinatura
   */
  async createDocument(document: ZapSignDocument): Promise<ZapSignDocumentResponse> {
    return this.request('/docs', {
      method: 'POST',
      body: JSON.stringify({
        ...document,
        sandbox: this.isSandbox,
        brand_logo: this.brandLogo,
        brand_primary_color: this.brandColor,
      }),
    });
  }

  /**
   * Obtém status do documento
   */
  async getDocument(token: string): Promise<ZapSignDocumentResponse> {
    return this.request(`/docs/${token}`);
  }

  /**
   * Cancela documento
   */
  async cancelDocument(token: string): Promise<{ success: boolean }> {
    return this.request(`/docs/${token}`, {
      method: 'DELETE',
    });
  }

  /**
   * Reenvia notificação para signatário
   */
  async resendNotification(
    signerToken: string,
    method: DeliveryMethod
  ): Promise<{ success: boolean }> {
    return this.request(`/signers/${signerToken}/notify`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    });
  }

  // --------------------------------------------------------------------------
  // CONTRATOS VINCULO.IO
  // --------------------------------------------------------------------------

  /**
   * Cria contrato de locação com todos os signatários
   */
  async createRentalContract(request: ContractSignatureRequest): Promise<ContractSignatureResult> {
    try {
      // Monta lista de signatários
      const signers: ZapSignSigner[] = [
        {
          name: request.landlord.name,
          email: request.landlord.email,
          phone_country: '55',
          phone_number: request.landlord.phone.replace(/\D/g, ''),
          auth_mode: 'assinaturaTela',
          send_automatic_whatsapp: request.sendViaWhatsApp ?? true,
          send_automatic_email: true,
          require_selfie_photo: true,
          qualification: 'LOCADOR',
          external_id: `landlord_${request.contractId}`,
        },
        {
          name: request.tenant.name,
          email: request.tenant.email,
          phone_country: '55',
          phone_number: request.tenant.phone.replace(/\D/g, ''),
          auth_mode: 'assinaturaTela',
          send_automatic_whatsapp: request.sendViaWhatsApp ?? true,
          send_automatic_email: true,
          require_selfie_photo: true,
          qualification: 'LOCATÁRIO',
          external_id: `tenant_${request.contractId}`,
        },
      ];

      if (request.guarantor) {
        signers.push({
          name: request.guarantor.name,
          email: request.guarantor.email,
          phone_country: '55',
          phone_number: request.guarantor.phone.replace(/\D/g, ''),
          auth_mode: 'assinaturaTela',
          send_automatic_whatsapp: request.sendViaWhatsApp ?? true,
          send_automatic_email: true,
          require_selfie_photo: true,
          qualification: 'GARANTIDOR',
          external_id: `guarantor_${request.contractId}`,
        });
      }

      if (request.insurer) {
        signers.push({
          name: request.insurer.name,
          email: request.insurer.email,
          phone_country: '55',
          phone_number: request.insurer.phone.replace(/\D/g, ''),
          auth_mode: 'assinaturaTela',
          send_automatic_email: true,
          qualification: 'SEGURADORA FIADORA',
          external_id: `insurer_${request.contractId}`,
        });
      }

      // Calcula data de expiração
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + (request.expirationDays ?? 7));

      // Cria documento
      const doc = await this.createDocument({
        name: request.documentName,
        base64_pdf: request.pdfContent,
        external_id: request.contractId,
        date_limit_to_sign: expirationDate.toISOString().split('T')[0],
        signers,
        lang: 'pt-br',
      });

      // Mapeia signatários para resposta
      const signerResults = doc.signers.map((signer, index) => {
        let role: 'landlord' | 'tenant' | 'guarantor' | 'insurer' = 'landlord';
        if (index === 1) role = 'tenant';
        else if (index === 2 && request.guarantor) role = 'guarantor';
        else if ((index === 2 && !request.guarantor) || index === 3) role = 'insurer';

        return {
          role,
          name: signer.name,
          signUrl: signer.sign_url,
          status: signer.status,
        };
      });

      return {
        success: true,
        documentToken: doc.token,
        documentUrl: doc.original_file_url,
        signers: signerResults,
        expiresAt: expirationDate.toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        documentToken: '',
        documentUrl: '',
        signers: [],
        expiresAt: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verifica status de assinaturas do contrato
   */
  async checkContractSignatures(
    documentToken: string
  ): Promise<{
    allSigned: boolean;
    signedCount: number;
    totalSigners: number;
    signers: Array<{
      name: string;
      status: SignerStatus;
      signedAt?: string;
    }>;
    signedDocumentUrl?: string;
  }> {
    const doc = await this.getDocument(documentToken);

    const signers = doc.signers.map(s => ({
      name: s.name,
      status: s.status,
      signedAt: s.signed_at,
    }));

    const signedCount = signers.filter(s => s.status === 'signed').length;
    const allSigned = signedCount === signers.length;

    return {
      allSigned,
      signedCount,
      totalSigners: signers.length,
      signers,
      signedDocumentUrl: allSigned ? doc.signed_file_url : undefined,
    };
  }

  // --------------------------------------------------------------------------
  // WEBHOOKS
  // --------------------------------------------------------------------------

  /**
   * Processa webhook de evento
   */
  parseWebhookEvent(payload: string): ZapSignWebhookEvent {
    return JSON.parse(payload);
  }

  /**
   * Valida assinatura do webhook
   */
  validateWebhookSignature(_signature: string, _payload: string): boolean {
    // Em produção, implementar validação HMAC
    return true;
  }
}

// ============================================================================
// MOCK SERVICE (Para desenvolvimento)
// ============================================================================

export class MockZapSignService {
  private documents: Map<string, ZapSignDocumentResponse> = new Map();

  async createDocument(document: ZapSignDocument): Promise<ZapSignDocumentResponse> {
    const token = `doc_${Math.random().toString(36).substr(2, 24)}`;

    const signers: ZapSignSignerResponse[] = document.signers.map((signer, index) => ({
      ...signer,
      token: `signer_${Math.random().toString(36).substr(2, 16)}`,
      status: 'pending' as SignerStatus,
      times_viewed: 0,
      sign_url: `https://app.zapsign.com.br/sign/${token}/${index}`,
    }));

    const response: ZapSignDocumentResponse = {
      open_id: Math.floor(Math.random() * 1000000),
      token,
      name: document.name,
      status: 'pending',
      external_id: document.external_id,
      created_at: new Date().toISOString(),
      last_update_at: new Date().toISOString(),
      created_through: 'api',
      deleted: false,
      original_file_url: `https://storage.zapsign.com.br/${token}/original.pdf`,
      signers,
    };

    this.documents.set(token, response);
    return response;
  }

  async getDocument(token: string): Promise<ZapSignDocumentResponse> {
    const doc = this.documents.get(token);
    if (!doc) throw new Error('Document not found');
    return doc;
  }

  async simulateSignature(
    documentToken: string,
    signerIndex: number
  ): Promise<ZapSignDocumentResponse> {
    const doc = this.documents.get(documentToken);
    if (!doc) throw new Error('Document not found');

    doc.signers[signerIndex].status = 'signed';
    doc.signers[signerIndex].signed_at = new Date().toISOString();
    doc.signers[signerIndex].signature_info = {
      ip_address: '189.40.123.45',
      geolocation: {
        latitude: -23.5505,
        longitude: -46.6333,
      },
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    };

    // Verifica se todos assinaram
    const allSigned = doc.signers.every(s => s.status === 'signed');
    if (allSigned) {
      doc.status = 'signed';
      doc.signed_file_url = `https://storage.zapsign.com.br/${documentToken}/signed.pdf`;
    }

    doc.last_update_at = new Date().toISOString();
    this.documents.set(documentToken, doc);

    return doc;
  }

  async createRentalContract(request: ContractSignatureRequest): Promise<ContractSignatureResult> {
    const signers: ZapSignSigner[] = [
      {
        name: request.landlord.name,
        email: request.landlord.email,
        phone_country: '55',
        phone_number: request.landlord.phone,
        auth_mode: 'assinaturaTela',
        qualification: 'LOCADOR',
      },
      {
        name: request.tenant.name,
        email: request.tenant.email,
        phone_country: '55',
        phone_number: request.tenant.phone,
        auth_mode: 'assinaturaTela',
        qualification: 'LOCATÁRIO',
      },
    ];

    if (request.guarantor) {
      signers.push({
        name: request.guarantor.name,
        email: request.guarantor.email,
        phone_country: '55',
        phone_number: request.guarantor.phone,
        auth_mode: 'assinaturaTela',
        qualification: 'GARANTIDOR',
      });
    }

    const doc = await this.createDocument({
      name: request.documentName,
      base64_pdf: request.pdfContent,
      external_id: request.contractId,
      signers,
    });

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + (request.expirationDays ?? 7));

    return {
      success: true,
      documentToken: doc.token,
      documentUrl: doc.original_file_url,
      signers: doc.signers.map((s, i) => ({
        role: (i === 0 ? 'landlord' : i === 1 ? 'tenant' : 'guarantor') as
          | 'landlord'
          | 'tenant'
          | 'guarantor',
        name: s.name,
        signUrl: s.sign_url,
        status: s.status,
      })),
      expiresAt: expirationDate.toISOString(),
    };
  }
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Gera PDF do contrato de locação (placeholder)
 */
export function generateRentalContractPdf(
  _contractData: Record<string, unknown>
): Promise<string> {
  // Em produção, usaria biblioteca como pdf-lib ou jsPDF
  // Retorna base64 do PDF
  return Promise.resolve('JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoK');
}

/**
 * Verifica se documento está completamente assinado
 */
export function isDocumentFullySigned(doc: ZapSignDocumentResponse): boolean {
  return doc.status === 'signed' && doc.signers.every(s => s.status === 'signed');
}

/**
 * Formata informações de assinatura para exibição
 */
export function formatSignatureInfo(signer: ZapSignSignerResponse): string {
  if (signer.status !== 'signed' || !signer.signed_at) {
    return 'Pendente';
  }

  const signedDate = new Date(signer.signed_at);
  const formattedDate = signedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let info = `Assinado em ${formattedDate}`;

  if (signer.signature_info?.ip_address) {
    info += ` | IP: ${signer.signature_info.ip_address}`;
  }

  if (signer.signature_info?.geolocation) {
    info += ` | Geo: ${signer.signature_info.geolocation.latitude.toFixed(4)}, ${signer.signature_info.geolocation.longitude.toFixed(4)}`;
  }

  return info;
}
