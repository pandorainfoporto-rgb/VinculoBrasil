// =============================================================================
// Smart Access - Servico de Fechaduras Inteligentes (IoT)
// =============================================================================
// Integracao com APIs de fechaduras inteligentes (Tuya/TTLock) para:
// - Geracao de senhas temporarias (OTP)
// - Controle de acesso remoto
// - Log de acessos
// =============================================================================

import {
  type SmartLock,
  type TemporaryAccessCode,
  type AccessLog,
  type SmartLockType,
  type SmartLockStatus,
} from '../marketplace-types';

// -----------------------------------------------------------------------------
// Constantes de Configuracao
// -----------------------------------------------------------------------------

const DEFAULT_OTP_DURATION_MINUTES = 45;
const OTP_CODE_LENGTH = 6;

// -----------------------------------------------------------------------------
// Tipos de Integracao
// -----------------------------------------------------------------------------

interface TuyaApiConfig {
  clientId: string;
  clientSecret: string;
  region: 'us' | 'eu' | 'cn';
  baseUrl: string;
}

interface TTLockApiConfig {
  appId: string;
  appSecret: string;
  baseUrl: string;
}

interface GenerateCodeParams {
  lockId: string;
  propertyId: string;
  startTime: Date;
  endTime: Date;
  purpose: 'visita' | 'manutencao' | 'entrega' | 'mudanca' | 'emergencia';
  guestName?: string;
  guestPhone?: string;
  scheduledVisitId?: string;
  createdById: string;
  createdByRole: 'tenant' | 'landlord' | 'platform' | 'provider';
}

interface GenerateCodeResult {
  success: boolean;
  code?: TemporaryAccessCode;
  message: string;
}

interface LockOperationResult {
  success: boolean;
  message: string;
  timestamp: Date;
}

// -----------------------------------------------------------------------------
// Dados vazios para producao - fechaduras virao do backend
// -----------------------------------------------------------------------------

const EMPTY_LOCKS: SmartLock[] = [];

// -----------------------------------------------------------------------------
// Classe Principal do Servico
// -----------------------------------------------------------------------------

export class SmartLockService {
  private locks: Map<string, SmartLock> = new Map(
    EMPTY_LOCKS.map((lock: SmartLock) => [lock.id, lock])
  );
  private codes: Map<string, TemporaryAccessCode> = new Map();
  private accessLogs: AccessLog[] = [];

  // Configuracoes de API (em producao viria de env vars)
  private tuyaConfig: TuyaApiConfig = {
    clientId: process.env.TUYA_CLIENT_ID || 'mock_client_id',
    clientSecret: process.env.TUYA_CLIENT_SECRET || 'mock_client_secret',
    region: 'us',
    baseUrl: 'https://openapi.tuyaus.com',
  };

  private ttlockConfig: TTLockApiConfig = {
    appId: process.env.TTLOCK_APP_ID || 'mock_app_id',
    appSecret: process.env.TTLOCK_APP_SECRET || 'mock_app_secret',
    baseUrl: 'https://euapi.ttlock.com',
  };

  /**
   * Gera senha temporaria (OTP) para acesso
   */
  async generateTemporaryPin(params: GenerateCodeParams): Promise<GenerateCodeResult> {
    const lock = this.locks.get(params.lockId);
    if (!lock) {
      return { success: false, message: 'Fechadura nao encontrada' };
    }

    // Verifica se fechadura esta online
    if (lock.status === 'offline' || lock.status === 'error') {
      return {
        success: false,
        message: 'Fechadura offline. Tente novamente mais tarde.',
      };
    }

    // Gera codigo OTP
    const code = this.generateOTPCode();

    // Calcula duracao
    const durationMinutes = Math.round(
      (params.endTime.getTime() - params.startTime.getTime()) / 60000
    );

    // Chama API da fechadura (simulado)
    const apiResult = await this.callLockAPI(lock.deviceType, 'createTemporaryCode', {
      deviceId: lock.deviceId,
      code,
      startTime: params.startTime.getTime(),
      endTime: params.endTime.getTime(),
    });

    if (!apiResult.success) {
      return { success: false, message: apiResult.message };
    }

    // Cria registro do codigo
    const accessCode: TemporaryAccessCode = {
      id: `code_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      lockId: params.lockId,
      propertyId: params.propertyId,
      code,
      codeType: 'otp',
      validFrom: params.startTime,
      validUntil: params.endTime,
      usageLimit: 1,
      usageCount: 0,
      purpose: params.purpose,
      guestName: params.guestName,
      guestPhone: params.guestPhone,
      scheduledVisitId: params.scheduledVisitId,
      createdById: params.createdById,
      createdByRole: params.createdByRole,
      isActive: true,
      accessLogs: [],
      createdAt: new Date(),
    };

    this.codes.set(accessCode.id, accessCode);

    return {
      success: true,
      code: accessCode,
      message: `Codigo ${code} valido por ${durationMinutes} minutos a partir de ${params.startTime.toLocaleTimeString()}`,
    };
  }

  /**
   * Gera codigo OTP numerico
   */
  private generateOTPCode(): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < OTP_CODE_LENGTH; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }

  /**
   * Simula chamada para API da fechadura
   */
  private async callLockAPI(
    lockType: SmartLockType,
    action: string,
    params: Record<string, unknown>
  ): Promise<{ success: boolean; message: string; data?: unknown }> {
    // Simula latencia de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Em producao, faria chamada real baseada no tipo
    switch (lockType) {
      case 'tuya':
        return this.callTuyaAPI(action, params);
      case 'ttlock':
        return this.callTTLockAPI(action, params);
      default:
        return this.callGenericAPI(action, params);
    }
  }

  /**
   * Simula chamada para Tuya Smart API
   */
  private async callTuyaAPI(
    action: string,
    params: Record<string, unknown>
  ): Promise<{ success: boolean; message: string; data?: unknown }> {
    // Em producao:
    // 1. Obter access token
    // 2. Assinar request com HMAC-SHA256
    // 3. POST para /v1.0/devices/{device_id}/door-lock/temp-password

    console.log(`[Tuya API] ${action}:`, params);

    // Simula resposta de sucesso
    return {
      success: true,
      message: 'Codigo criado com sucesso na Tuya',
      data: { password_id: `tuya_pwd_${Date.now()}` },
    };
  }

  /**
   * Simula chamada para TTLock API
   */
  private async callTTLockAPI(
    action: string,
    params: Record<string, unknown>
  ): Promise<{ success: boolean; message: string; data?: unknown }> {
    // Em producao:
    // 1. Autenticar com OAuth2
    // 2. POST para /v3/keyboardPwd/add

    console.log(`[TTLock API] ${action}:`, params);

    return {
      success: true,
      message: 'Codigo criado com sucesso na TTLock',
      data: { keyboard_pwd_id: `ttlock_pwd_${Date.now()}` },
    };
  }

  /**
   * API generica para outros fabricantes
   */
  private async callGenericAPI(
    action: string,
    params: Record<string, unknown>
  ): Promise<{ success: boolean; message: string; data?: unknown }> {
    console.log(`[Generic Lock API] ${action}:`, params);
    return { success: true, message: 'Operacao realizada' };
  }

  /**
   * Abre fechadura remotamente
   */
  async unlockRemotely(lockId: string, userId: string): Promise<LockOperationResult> {
    const lock = this.locks.get(lockId);
    if (!lock) {
      return { success: false, message: 'Fechadura nao encontrada', timestamp: new Date() };
    }

    if (lock.status !== 'online') {
      return { success: false, message: 'Fechadura offline', timestamp: new Date() };
    }

    // Chama API
    const result = await this.callLockAPI(lock.deviceType, 'unlock', {
      deviceId: lock.deviceId,
    });

    // Registra log
    if (result.success) {
      this.logAccess(lockId, {
        eventType: 'unlock',
        method: 'app',
        success: true,
      });
    }

    return {
      success: result.success,
      message: result.success ? 'Fechadura aberta!' : result.message,
      timestamp: new Date(),
    };
  }

  /**
   * Tranca fechadura remotamente
   */
  async lockRemotely(lockId: string, userId: string): Promise<LockOperationResult> {
    const lock = this.locks.get(lockId);
    if (!lock) {
      return { success: false, message: 'Fechadura nao encontrada', timestamp: new Date() };
    }

    if (lock.status !== 'online') {
      return { success: false, message: 'Fechadura offline', timestamp: new Date() };
    }

    const result = await this.callLockAPI(lock.deviceType, 'lock', {
      deviceId: lock.deviceId,
    });

    if (result.success) {
      this.logAccess(lockId, {
        eventType: 'lock',
        method: 'app',
        success: true,
      });
    }

    return {
      success: result.success,
      message: result.success ? 'Fechadura trancada!' : result.message,
      timestamp: new Date(),
    };
  }

  /**
   * Revoga codigo de acesso
   */
  async revokeAccessCode(codeId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const code = this.codes.get(codeId);
    if (!code) {
      return { success: false, message: 'Codigo nao encontrado' };
    }

    const lock = this.locks.get(code.lockId);
    if (!lock) {
      return { success: false, message: 'Fechadura nao encontrada' };
    }

    // Remove codigo da fechadura
    await this.callLockAPI(lock.deviceType, 'deleteTemporaryCode', {
      deviceId: lock.deviceId,
      code: code.code,
    });

    // Atualiza registro
    code.isActive = false;
    code.revokedAt = new Date();
    code.revokedReason = reason;
    this.codes.set(codeId, code);

    return { success: true, message: 'Codigo revogado com sucesso' };
  }

  /**
   * Registra log de acesso
   */
  private logAccess(
    lockId: string,
    event: {
      eventType: 'unlock' | 'lock' | 'failed_attempt' | 'tamper_alert';
      method: 'code' | 'app' | 'fingerprint' | 'key' | 'auto';
      success: boolean;
      codeId?: string;
      failureReason?: string;
    }
  ): void {
    const log: AccessLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      lockId,
      codeId: event.codeId,
      eventType: event.eventType,
      method: event.method,
      success: event.success,
      failureReason: event.failureReason,
      timestamp: new Date(),
    };

    this.accessLogs.push(log);

    // Atualiza log no codigo se houver
    if (event.codeId) {
      const code = this.codes.get(event.codeId);
      if (code) {
        code.accessLogs.push(log);
        if (event.success && event.eventType === 'unlock') {
          code.usageCount += 1;
        }
        this.codes.set(event.codeId, code);
      }
    }
  }

  /**
   * Processa webhook de evento da fechadura
   */
  processLockWebhook(
    deviceId: string,
    eventType: string,
    eventData: Record<string, unknown>
  ): void {
    // Encontra fechadura pelo deviceId
    const lock = Array.from(this.locks.values()).find(
      (l) => l.deviceId === deviceId
    );

    if (!lock) {
      console.warn(`[SmartLock] Webhook para dispositivo desconhecido: ${deviceId}`);
      return;
    }

    // Processa diferentes tipos de eventos
    switch (eventType) {
      case 'unlock':
      case 'lock':
        this.logAccess(lock.id, {
          eventType: eventType as 'unlock' | 'lock',
          method: (eventData.method as 'code' | 'app' | 'fingerprint' | 'key' | 'auto') || 'code',
          success: true,
          codeId: eventData.codeId as string | undefined,
        });
        break;

      case 'failed_attempt':
        this.logAccess(lock.id, {
          eventType: 'failed_attempt',
          method: 'code',
          success: false,
          failureReason: eventData.reason as string,
        });
        break;

      case 'low_battery':
        lock.batteryLevel = eventData.level as number;
        lock.status = 'low_battery';
        this.locks.set(lock.id, lock);
        break;

      case 'offline':
        lock.status = 'offline';
        this.locks.set(lock.id, lock);
        break;

      case 'online':
        lock.status = 'online';
        lock.lastOnlineAt = new Date();
        this.locks.set(lock.id, lock);
        break;

      case 'tamper_alert':
        this.logAccess(lock.id, {
          eventType: 'tamper_alert',
          method: 'key',
          success: false,
          failureReason: 'Tentativa de violacao detectada',
        });
        // Em producao, enviaria alerta critico
        break;
    }
  }

  /**
   * Gera codigo para visita agendada
   */
  async generateCodeForScheduledVisit(
    visitId: string,
    lockId: string,
    visitTime: Date,
    durationMinutes: number = DEFAULT_OTP_DURATION_MINUTES,
    guestName: string,
    guestPhone: string,
    createdById: string
  ): Promise<GenerateCodeResult> {
    const startTime = visitTime;
    const endTime = new Date(visitTime.getTime() + durationMinutes * 60000);

    const lock = this.locks.get(lockId);
    if (!lock) {
      return { success: false, message: 'Fechadura nao encontrada' };
    }

    return this.generateTemporaryPin({
      lockId,
      propertyId: lock.propertyId,
      startTime,
      endTime,
      purpose: 'visita',
      guestName,
      guestPhone,
      scheduledVisitId: visitId,
      createdById,
      createdByRole: 'platform',
    });
  }

  // -------------------------------------------------------------------------
  // Metodos de Consulta
  // -------------------------------------------------------------------------

  /**
   * Retorna fechadura por ID
   */
  getLockById(lockId: string): SmartLock | undefined {
    return this.locks.get(lockId);
  }

  /**
   * Retorna fechaduras de um imovel
   */
  getLocksByProperty(propertyId: string): SmartLock[] {
    return Array.from(this.locks.values()).filter(
      (lock) => lock.propertyId === propertyId
    );
  }

  /**
   * Retorna codigos ativos de uma fechadura
   */
  getActiveCodesByLock(lockId: string): TemporaryAccessCode[] {
    const now = new Date();
    return Array.from(this.codes.values()).filter(
      (code) =>
        code.lockId === lockId &&
        code.isActive &&
        code.validUntil > now &&
        (code.usageLimit === undefined || code.usageCount < code.usageLimit)
    );
  }

  /**
   * Retorna historico de acessos
   */
  getAccessLogs(lockId: string, limit: number = 50): AccessLog[] {
    return this.accessLogs
      .filter((log) => log.lockId === lockId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Retorna status de todas as fechaduras de um imovel
   */
  getPropertyLockStatus(propertyId: string): {
    total: number;
    online: number;
    offline: number;
    lowBattery: number;
    locks: SmartLock[];
  } {
    const locks = this.getLocksByProperty(propertyId);
    return {
      total: locks.length,
      online: locks.filter((l) => l.status === 'online').length,
      offline: locks.filter((l) => l.status === 'offline').length,
      lowBattery: locks.filter((l) => l.status === 'low_battery').length,
      locks,
    };
  }
}

// Instancia singleton
export const smartLockService = new SmartLockService();
